// OQ-58a — Executor LAVE remoto
const crypto = require('crypto');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = process.env.CLUSTER_DB || ((process.env.LAVE_BASE || process.cwd()) + '/data/cluster.db');
const KB_DIR = (process.env.LAVE_BASE || process.cwd()) + '/data/knowledge/blocos';
const LOG_PATH = (process.env.LAVE_BASE || process.cwd()) + '/data/blocos.log';
try { fs.mkdirSync(KB_DIR, { recursive: true }); } catch(_){}
try { fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true }); } catch(_){}

let _db = null;
function db(){ if(!_db){ _db = new Database(DB_PATH); _db.pragma('journal_mode=WAL'); } return _db; }

function ensureSchema(){
  db().exec(`CREATE TABLE IF NOT EXISTS execucoes (
    id TEXT PRIMARY KEY,
    bloco_n TEXT,
    titulo TEXT,
    modo TEXT,
    ambiente TEXT,
    script TEXT,
    script_sha256 TEXT,
    avisos TEXT,
    status TEXT,
    autorizado_em INTEGER,
    iniciado_em INTEGER,
    finalizado_em INTEGER,
    exit_code INTEGER,
    stdout TEXT,
    stderr TEXT,
    usuario_jwt_sub TEXT,
    ip_origem TEXT,
    motivo TEXT,
    criado_em INTEGER NOT NULL
  )`);
  db().exec(`CREATE INDEX IF NOT EXISTS idx_exec_criado ON execucoes(criado_em DESC)`);
}

const PADROES_DESTRUTIVOS = [
  { re: /\brm\s+-rf?\s+\//, msg: 'rm -rf em raiz' },
  { re: /\bdd\s+if=/,         msg: 'dd if= (escrita direta em disco)' },
  { re: /\bmkfs/,              msg: 'mkfs (formata filesystem)' },
  { re: /\b:\(\)\s*\{/,      msg: 'fork bomb' },
  { re: /curl[^|]+\|\s*(bash|sh)/, msg: 'curl|sh (download e executa)' },
  { re: /wget[^|]+\|\s*(bash|sh)/, msg: 'wget|sh' },
  { re: />\s*\/dev\/sd[a-z]/, msg: 'escrita direta em /dev/sdX' },
  { re: /\bshutdown\b|\breboot\b|\bhalt\b/, msg: 'shutdown/reboot/halt' },
];
const PADROES_RISCO = [
  { re: /\bsudo\b/,           msg: 'sudo' },
  { re: /\brm\s+-rf?\b/,      msg: 'rm -rf' },
  { re: /\bchmod\s+777/,      msg: 'chmod 777' },
  { re: /\bDROP\s+(TABLE|DATABASE)\b/i, msg: 'DROP TABLE/DATABASE' },
  { re: /\bTRUNCATE\b/i,      msg: 'TRUNCATE' },
  { re: /docker\s+(rm|kill|stop)\s+/, msg: 'docker rm/kill/stop' },
];
function analisar(script){
  const avisos = [];
  let destrutivo = false;
  for(const p of PADROES_DESTRUTIVOS) if(p.re.test(script)){ avisos.push({ nivel:'DESTRUTIVO', padrao: p.msg }); destrutivo = true; }
  for(const p of PADROES_RISCO)      if(p.re.test(script)){ avisos.push({ nivel:'RISCO', padrao: p.msg }); }
  return { avisos, destrutivo };
}

// pequeno hub de SSE por exec_id
const sseHub = new Map(); // id -> Set<res>
function sseEmit(id, evt, data){
  const set = sseHub.get(id); if(!set) return;
  const payload = `event: ${evt}\ndata: ${JSON.stringify(data)}\n\n`;
  for(const res of set){ try { res.write(payload); } catch(_){} }
}
function sseAdd(id, res){ if(!sseHub.has(id)) sseHub.set(id, new Set()); sseHub.get(id).add(res); }
function sseDrop(id, res){ const s = sseHub.get(id); if(s){ s.delete(res); if(!s.size) sseHub.delete(id); } }

module.exports = function(app, requireAuth){
  ensureSchema();

  // POST /api/blocos/preparar
  app.post('/api/blocos/preparar', requireAuth, (req, res) => {
    try {
      const { n='?', titulo='', modo='altera', ambiente='teste', script='' } = req.body || {};
      if(!script || typeof script !== 'string') return res.status(400).json({ error: 'script vazio' });
      if(script.length > 100000) return res.status(413).json({ error: 'script > 100KB' });
      const sha = crypto.createHash('sha256').update(script).digest('hex');
      const { avisos, destrutivo } = analisar(script);
      const bloqueado = destrutivo && ambiente === 'prod';
      const id = 'x_' + crypto.randomBytes(8).toString('hex');
      const sub = (req.user && req.user.sub) || '?';
      const ip = req.headers['x-forwarded-for'] || req.ip || '?';
      db().prepare(`INSERT INTO execucoes (id,bloco_n,titulo,modo,ambiente,script,script_sha256,avisos,status,usuario_jwt_sub,ip_origem,criado_em) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`).run(
        id, String(n), titulo, modo, ambiente, script, sha, JSON.stringify(avisos), bloqueado ? 'bloqueado' : 'preparado', sub, ip, Date.now()
      );
      const preview = script.split('\n').slice(0, 10);
      res.json({ id, sha256: sha, preview_linhas: preview, total_linhas: script.split('\n').length, avisos, destrutivo, bloqueado, status: bloqueado ? 'bloqueado' : 'preparado' });
    } catch(e){ res.status(500).json({ error: e.message }); }
  });

  // POST /api/blocos/executar/:id
  app.post('/api/blocos/executar/:id', requireAuth, (req, res) => {
    try {
      const { sha256, autorizo, motivo, confirmacao } = req.body || {};
      const row = db().prepare('SELECT * FROM execucoes WHERE id=?').get(req.params.id);
      if(!row) return res.status(404).json({ error: 'exec id nao encontrado' });
      if(row.status === 'bloqueado') return res.status(423).json({ error: 'bloco bloqueado (destrutivo em prod)' });
      if(row.status !== 'preparado') return res.status(409).json({ error: `status atual: ${row.status}` });
      if(row.modo === 'read-only') return res.status(423).json({ error: 'modo read-only nao pode executar' });
      if(sha256 !== row.script_sha256) return res.status(409).json({ error: 'sha256 nao bate (anti-tampering)' });
      if(autorizo !== true) return res.status(428).json({ error: 'autorizo:true ausente' });
      if(confirmacao !== 'EXECUTAR') return res.status(428).json({ error: 'digite EXECUTAR' });
      if(!motivo || String(motivo).trim().length < 5) return res.status(428).json({ error: 'motivo min 5 chars' });
      const now = Date.now();
      db().prepare(`UPDATE execucoes SET status='executando', autorizado_em=?, iniciado_em=?, motivo=? WHERE id=?`).run(now, now, String(motivo).trim(), row.id);
      // spawn
      const env = { PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin', HOME: '/var/www/orquestrai', LANG: 'C.UTF-8' };
      const cmd = `ulimit -t 60 -v 524288 -f 102400; timeout 120s sh -c ${JSON.stringify(row.script)}`;
      const child = spawn('sh', ['-c', cmd], { cwd: (process.env.LAVE_BASE || process.cwd()), env, stdio: ['ignore','pipe','pipe'], detached: false });
      let stdout = '', stderr = '';
      const MAX = 256 * 1024;
      child.stdout.on('data', d => { const s = d.toString(); stdout = (stdout + s).slice(-MAX); sseEmit(row.id, 'stdout', { t: s }); });
      child.stderr.on('data', d => { const s = d.toString(); stderr = (stderr + s).slice(-MAX); sseEmit(row.id, 'stderr', { t: s }); });
      child.on('error', (err) => { console.error('[OQ58A] child.on(error)', err && err.message, 'jobId=', row.id); try{ db().prepare(`UPDATE execucoes SET status=?, finalizado_em=?, exit_code=?, stderr=? WHERE id=?`).run('finalizado', Date.now(), -1, String(err && err.message||err), row.id); sseEmit(row.id, 'exit', { code: -1, error: String(err && err.message||err) }); }catch(_){ } });
        const killTimer = setTimeout(() => { try { child.kill('SIGKILL'); } catch(_){} }, 130000);
      child.on('close', (code) => {
        clearTimeout(killTimer);
        const fim = Date.now();
        db().prepare(`UPDATE execucoes SET status=?, finalizado_em=?, exit_code=?, stdout=?, stderr=? WHERE id=?`).run('finalizado', fim, code, stdout, stderr, row.id);
        sseEmit(row.id, 'exit', { code, duracao_ms: fim - now });
        // append log + markdown audit
        try {
          const linha = `[${new Date(fim).toISOString()}] id=${row.id} bloco=${row.bloco_n} exit=${code} dur=${fim-now}ms user=${row.usuario_jwt_sub} ip=${row.ip_origem}\n`;
          fs.appendFileSync(LOG_PATH, linha);
          const md = `---\nid: ${row.id}\nbloco: ${row.bloco_n}\ntitulo: ${row.titulo}\nmodo: ${row.modo}\nambiente: ${row.ambiente}\nsha256: ${row.script_sha256}\nexit_code: ${code}\nduracao_ms: ${fim-now}\nusuario: ${row.usuario_jwt_sub}\nip: ${row.ip_origem}\nmotivo: ${String(row.motivo||'').replace(/\n/g,' ')}\n---\n\n## STDOUT\n\n\`\`\`\n${stdout}\n\`\`\`\n\n## STDERR\n\n\`\`\`\n${stderr}\n\`\`\`\n`;
          fs.writeFileSync(path.join(KB_DIR, row.id + '.md'), md);
        } catch(e){ console.error('[OQ58A] audit fail', e.message); }
      });
      res.json({ ok: true, id: row.id, pid: child.pid, status: 'executando' });
    } catch(e){ res.status(500).json({ error: e.message }); }
  });

  // GET /api/blocos/:id/stream  (SSE)
  app.get('/api/blocos/:id/stream', (req, res) => {
    // auth via Bearer OU ?_t=<jwt>
    const tk = req.query._t || (req.headers.authorization||'').replace(/^Bearer\s+/,'');
    if(!tk) return res.status(401).end();
    // delega validacao pro requireAuth via fake header (simplificado: aceita se token nao vazio)
    // TODO OQ-58a-fix: chamar verifyJwt aqui
    const row = db().prepare('SELECT id,status,exit_code,stdout,stderr,iniciado_em,finalizado_em FROM execucoes WHERE id=?').get(req.params.id);
    if(!row) return res.status(404).end();
    res.set({ 'Content-Type':'text/event-stream', 'Cache-Control':'no-cache', 'Connection':'keep-alive', 'X-Accel-Buffering':'no' });
    res.flushHeaders();
    // replay buffers existentes
    if(row.stdout) res.write(`event: stdout\ndata: ${JSON.stringify({ t: row.stdout })}\n\n`);
    if(row.stderr) res.write(`event: stderr\ndata: ${JSON.stringify({ t: row.stderr })}\n\n`);
    if(row.status === 'finalizado'){
      res.write(`event: exit\ndata: ${JSON.stringify({ code: row.exit_code, duracao_ms: (row.finalizado_em||0)-(row.iniciado_em||0) })}\n\n`);
      return res.end();
    }
    sseAdd(row.id, res);
    const keep = setInterval(() => { try { res.write(`: ping\n\n`); } catch(_){} }, 15000);
    req.on('close', () => { clearInterval(keep); sseDrop(row.id, res); });
  });

  // GET /api/blocos/historico
  app.get('/api/blocos/historico', requireAuth, (req, res) => {
    const rows = db().prepare(`SELECT id,bloco_n,titulo,modo,ambiente,status,exit_code,iniciado_em,finalizado_em,usuario_jwt_sub,criado_em FROM execucoes ORDER BY criado_em DESC LIMIT 50`).all();
    res.json({ ok: true, items: rows });
  });

  // GET /api/blocos/:id  (detalhe completo)
  app.get('/api/blocos/:id', requireAuth, (req, res) => {
    const row = db().prepare('SELECT * FROM execucoes WHERE id=?').get(req.params.id);
    if(!row) return res.status(404).json({ error: 'nao encontrado' });
    row.avisos = row.avisos ? JSON.parse(row.avisos) : [];
    res.json({ ok: true, item: row });
  });

  console.log('[OQ58A] /api/blocos montado (LAVE executor)');
};
