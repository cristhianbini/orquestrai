// ATUALIZADO: 2026-07-14 04:37:16 -03:00 (auto, git pre-commit)
// OQ-58a — Executor LAVE remoto
const crypto = require('crypto');
const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const jwt = require('jsonwebtoken');

// OQ-58a-fix (2026-07-11): mesma JWT_SECRET do server.js/mas-auth. Usada so
// na rota SSE de stream, que nao pode passar pelo requireAuth de header
// (EventSource nao manda header custom). Ausente => jwt.verify falha =>
// stream nega 401 (fail-closed), consistente com mas/auth.mjs.
const JWT_SECRET = process.env.JWT_SECRET;

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

// Q2b (R10): gate de sintaxe. Roda `bash -n` (noexec) no script ANTES de
// deixar preparar. Bloco malformado (ex: truncado no teto de tokens, if/aspas
// sem fechar) => reprovado aqui, nunca chega ao terminal. ALCANCE: so pega
// erro ESTRUTURAL de sintaxe; prosa que casa como comando valido (o caso
// BLOCO-215) PASSA no bash -n — contra prosa quem protege e' o Q2a
// (extractBloco exige fence ```bash). Fail-open so se o proprio bash faltar
// (ENOENT), p/ nao travar o fluxo em ambiente sem bash; o gate real de
// seguranca continua sendo a autorizacao explicita no /executar.
function checarSintaxe(script){
  try {
    const r = spawnSync('bash', ['-n'], { input: String(script||''), encoding: 'utf8', timeout: 5000 });
    if (r.error) {
      if (r.error.code === 'ENOENT') return { ok: true, skipped: true }; // bash ausente: nao bloqueia
      return { ok: false, erro: String(r.error.message || 'falha ao checar sintaxe').slice(0, 400) };
    }
    if (r.status === 0) return { ok: true };
    return { ok: false, erro: String(r.stderr || 'sintaxe invalida').trim().slice(0, 400) };
  } catch(e){
    return { ok: true, skipped: true }; // erro inesperado do checador: fail-open (nao e' o gate de seguranca)
  }
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
  (function ensureSchemaCTXPROV01(){ // CTXPROV01: colunas de proveniencia, idempotente
    var cols = ["origem TEXT DEFAULT 'individual'","agente TEXT","mas_run_id TEXT","provider TEXT","modelo TEXT"];
    cols.forEach(function(def){
      try{ db().prepare('ALTER TABLE execucoes ADD COLUMN '+def).run(); }
      catch(e){ if(!/duplicate column/i.test(e.message||'')) throw e; }
    });
  })();

  (function ensureSchemaCTXAUDIT01(){ // CTXAUDIT01: hash-chain append-only, idempotente
    var cols = ["prev_hash TEXT", "chain_hash TEXT"];
    cols.forEach(function(def){
      try{ db().prepare('ALTER TABLE execucoes ADD COLUMN '+def).run(); }
      catch(e){ if(!/duplicate column/i.test(e.message||'')) throw e; }
    });
  })();

  // CTXSCORE01: ranking de desempenho por posicao do MAS (sucesso/falha real, exit_code)
  app.get('/api/agents/score', requireAuth, (req, res) => {
    try {
      const rows = db().prepare(`
        SELECT agente,
               COUNT(*) as total,
               SUM(CASE WHEN exit_code=0 THEN 1 ELSE 0 END) as sucesso,
               SUM(CASE WHEN exit_code IS NOT NULL AND exit_code<>0 THEN 1 ELSE 0 END) as falha
        FROM execucoes
        WHERE origem='mas' AND agente IS NOT NULL AND agente<>''
        GROUP BY agente
      `).all();
      const scores = {};
      rows.forEach(r => {
        const julgadas = r.sucesso + r.falha;
        scores[r.agente] = {
          total: r.total, sucesso: r.sucesso, falha: r.falha,
          taxa: julgadas > 0 ? Math.round((r.sucesso / julgadas) * 100) : null
        };
      });
      res.json({ ok: true, scores });
    } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
  });

  // POST /api/blocos/preparar
  app.post('/api/blocos/preparar', requireAuth, (req, res) => {
    try {
      const { n='?', titulo='', modo='altera', ambiente='teste', script='', origem='individual', agente=null, mas_run_id=null, provider=null, modelo=null } = req.body || {}; // CTXPROV01
      if(!script || typeof script !== 'string') return res.status(400).json({ error: 'script vazio' });
      if(script.length > 100000) return res.status(413).json({ error: 'script > 100KB' });
      const sha = crypto.createHash('sha256').update(script).digest('hex');
      const { avisos, destrutivo } = analisar(script);
      const sintaxe = checarSintaxe(script); // Q2b: gate bash -n
      if(!sintaxe.ok) avisos.push({ nivel:'SINTAXE', padrao: 'bash -n reprovou: ' + sintaxe.erro });
      const bloqueado = (destrutivo && ambiente === 'prod') || !sintaxe.ok; // Q2b: sintaxe invalida sempre bloqueia
      const id = 'x_' + crypto.randomBytes(8).toString('hex');
      const sub = (req.user && req.user.sub) || '?';
      const ip = req.headers['x-forwarded-for'] || req.ip || '?';
      const status = bloqueado ? 'bloqueado' : 'preparado';
      const criadoEm = Date.now();

      // CTXAUDIT01: hash-chain append-only (Escopo V6.0 §11). prev_hash
      // encadeia com a ultima linha gravada; alterar qualquer registro no
      // meio do historico quebra a corrente a partir dali (detectavel via
      // GET /api/execucoes/verify-chain).
      const prevRow = db().prepare('SELECT chain_hash FROM execucoes ORDER BY criado_em DESC, rowid DESC LIMIT 1').get();
      const prevHash = (prevRow && prevRow.chain_hash) || 'GENESIS';
      const chainInput = prevHash + '|' + id + '|' + sha + '|' + status + '|' + sub + '|' + ip + '|' + criadoEm;
      const chainHash = crypto.createHash('sha256').update(chainInput).digest('hex');

      db().prepare(`INSERT INTO execucoes (id,bloco_n,titulo,modo,ambiente,script,script_sha256,avisos,status,usuario_jwt_sub,ip_origem,criado_em,origem,agente,mas_run_id,provider,modelo,prev_hash,chain_hash) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
        id, String(n), titulo, modo, ambiente, script, sha, JSON.stringify(avisos), status, sub, ip, criadoEm, origem, agente, mas_run_id, provider, modelo, prevHash, chainHash
      ); // CTXPROV01 + CTXAUDIT01
      const preview = script.split('\n').slice(0, 10);
      const motivo_bloqueio = bloqueado ? (!sintaxe.ok ? 'sintaxe' : 'destrutivo-prod') : null; // Q2b
      res.json({ id, sha256: sha, preview_linhas: preview, total_linhas: script.split('\n').length, avisos, destrutivo, bloqueado, motivo_bloqueio, sintaxe_ok: sintaxe.ok, sintaxe_erro: sintaxe.ok ? null : sintaxe.erro, status: bloqueado ? 'bloqueado' : 'preparado' });
    } catch(e){ res.status(500).json({ error: e.message }); }
  });

  // POST /api/blocos/executar/:id
  app.post('/api/blocos/executar/:id', requireAuth, (req, res) => {
    try {
      const { sha256, autorizo, motivo, confirmacao } = req.body || {};
      const row = db().prepare('SELECT * FROM execucoes WHERE id=?').get(req.params.id);
      if(!row) return res.status(404).json({ error: 'exec id nao encontrado' });
      if(row.status === 'bloqueado'){ // Q2b: sintaxe invalida OU destrutivo em prod — motivo real nos avisos
        var _mot = 'destrutivo em prod'; try{ var _av = JSON.parse(row.avisos||'[]'); if(_av.some(function(a){return a && a.nivel==='SINTAXE';})) _mot = 'sintaxe invalida (bash -n)'; }catch(_e){}
        return res.status(423).json({ error: 'bloco bloqueado ('+_mot+')' });
      }
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
    // auth via Bearer OU ?_t=<jwt>. EventSource nao manda header custom, por
    // isso o token vem na query -- mas com jwt.verify REAL (OQ-58a-fix,
    // 2026-07-11). Antes aceitava qualquer string nao-vazia (vazava
    // stdout/stderr de execucoes). Mesmo padrao do authMiddlewareSSE (mas/auth.mjs).
    const tk = req.query._t || (req.headers.authorization||'').replace(/^Bearer\s+/,'');
    if(!tk) return res.status(401).end();
    try { jwt.verify(tk, JWT_SECRET); }
    catch { return res.status(401).end(); }
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

  // CTXAUDIT01: verifica a integridade da corrente inteira. Recalcula cada
  // chain_hash a partir do prev_hash gravado; se algum registro foi
  // alterado direto no banco depois de gravado, o hash nao bate mais e a
  // corrente "quebra" exatamente naquele ponto.
  app.get('/api/execucoes/verify-chain', requireAuth, (req, res) => {
    try {
      const rows = db().prepare('SELECT id,script_sha256,status,usuario_jwt_sub,ip_origem,criado_em,prev_hash,chain_hash FROM execucoes ORDER BY criado_em ASC, rowid ASC').all();
      let esperado = 'GENESIS';
      for (const r of rows) {
        if (r.prev_hash === null) continue; // registro anterior ao CTXAUDIT01, fora da cadeia
        if (r.prev_hash !== esperado) {
          return res.json({ ok: false, quebrado_em: r.id, motivo: 'prev_hash nao bate com o chain_hash anterior' });
        }
        const chainInput = r.prev_hash + '|' + r.id + '|' + r.script_sha256 + '|' + r.status + '|' + r.usuario_jwt_sub + '|' + r.ip_origem + '|' + r.criado_em;
        const recalculado = crypto.createHash('sha256').update(chainInput).digest('hex');
        if (recalculado !== r.chain_hash) {
          return res.json({ ok: false, quebrado_em: r.id, motivo: 'chain_hash nao confere -- registro possivelmente alterado' });
        }
        esperado = r.chain_hash;
      }
      res.json({ ok: true, total_verificado: rows.filter(r => r.prev_hash !== null).length });
    } catch(e){ res.status(500).json({ ok: false, error: e.message }); }
  });

  // GET /api/blocos/historico
  app.post('/api/blocos/oqterm-log', requireAuth, (req, res) => {
    try {
      // CTXMASRUNLINK01 (S2, 2026-07-07): oqterm-log agora aceita agente e
      // mas_run_id opcionais. Motivo: no uso real os blocos rodam pelo caminho
      // oqterm (B94), nao pelo execBloco -- e este INSERT gravava null fixo,
      // jogando fora o vinculo com a run MAS (achado A3 da auditoria Fable).
      // origem PERMANECE 'oqterm' (descreve o caminho de execucao); o vinculo
      // MAS vem pelos 2 campos novos. Fallback null = retrocompativel.
      const { hash, tamanho, agente = null, mas_run_id = null } = req.body || {};
      if (!hash) return res.status(400).json({ error: 'hash obrigatorio' });
      const id = 'oq_' + crypto.randomBytes(8).toString('hex');
      const sub = (req.user && req.user.sub) || '?';
      const ip = req.headers['x-forwarded-for'] || req.ip || '?';
      const status = 'registrado';
      const criadoEm = Date.now();
      const prevRow = db().prepare('SELECT chain_hash FROM execucoes ORDER BY criado_em DESC, rowid DESC LIMIT 1').get();
      const prevHash = (prevRow && prevRow.chain_hash) || 'GENESIS';
      const chainInput = prevHash + '|' + id + '|' + hash + '|' + status + '|' + sub + '|' + ip + '|' + criadoEm;
      const chainHash = crypto.createHash('sha256').update(chainInput).digest('hex');
      db().prepare(`INSERT INTO execucoes (id,bloco_n,titulo,modo,ambiente,script,script_sha256,avisos,status,usuario_jwt_sub,ip_origem,criado_em,origem,agente,mas_run_id,provider,modelo,prev_hash,chain_hash) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
        // CTXMASRUNLINK01: agente e mas_run_id propagados; chainInput INTACTO
        // (adicionar campos a formula da cadeia invalidaria o verify-chain antigo).
        id, null, null, null, null, null, hash, JSON.stringify({tamanho: tamanho||null}), status, sub, ip, criadoEm, 'oqterm', agente, mas_run_id, null, null, prevHash, chainHash
      );
      res.json({ ok: true });
    } catch(e){ res.status(500).json({ error: e.message }); }
  });

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
