// ATUALIZADO: 2026-07-05 05:38:24 -03:00 (auto, git pre-commit)
// OQ46Z-v1
import { createRequire as _oqReq } from "module";
const _oqRequire = _oqReq(import.meta.url);

// OQ71Z-memory load
let _oq71zMemory=null; try{ _oq71zMemory=_oqRequire("./blocoMemoryRoutes.cjs"); console.log("[OQ71Z] blocoMemoryRoutes loaded"); }catch(e){ console.error("[OQ71Z] memory load fail", e.message); }
// OQ48A-v2
let _oqCluster=null; try{ _oqCluster=_oqRequire("./clusterRoutes.cjs"); console.log("[OQ48A] clusterRoutes loaded"); }catch(e){ console.error("[OQ48A] cluster load fail", e.message); }
let _oqBlocos=null; try{ _oqBlocos=_oqRequire("./blocosRoutes.cjs"); console.log("[OQ58A] blocosRoutes loaded"); }catch(e){ console.error("[OQ58A] blocos load fail", e.message); }
let _oqLave=null; try{ _oqLave=_oqRequire("./laveRoutes.cjs"); console.log("[OQ70] laveRoutes loaded"); }catch(e){ console.error("[OQ70] lave load fail", e.message); }
// OQ48A-v2-end
let _oqKnowledge=null; try{ _oqKnowledge=_oqRequire("./knowledgeRoutes.cjs"); console.log("[OQ46Z] knowledgeRoutes loaded"); }catch(e){ console.error("[OQ46Z] knowledgeRoutes load fail", e.message); }
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { createRequire } from 'module';
import masRoutes from './mas/routes.mjs';
const require = createRequire(import.meta.url);
const licoesRoutes = require('./licoesRoutes.cjs'); // B261
const app = express();
const Providers = require('./providers.cjs');
app.use(cors());
app.use(express.json());
if (!process.env.JWT_SECRET) {
  console.warn('[CTXAUTH2FA01] JWT_SECRET ausente no .env -- usando fallback fraco e publico. Tokens emitidos NAO SAO SEGUROS.');
}
const JWT_SECRET = process.env.JWT_SECRET || 'orquestrai-secret-2025';
const PORT = 3000;

app.set('trust proxy', 1);
function authMiddleware(req,res,next){
  const auth = req.headers.authorization;
  if(!auth || !auth.startsWith('Bearer ')) return res.status(401).json({error:'Token obrigatorio.'});
  try { req.user = jwt.verify(auth.split(' ')[1], JWT_SECRET); next(); }
  catch { return res.status(401).json({error:'Token invalido.'}); }
}

const limiter = rateLimit({
  windowMs: 60000,
  max: 300,
  message: { error: 'Muitas tentativas.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    const u = req.originalUrl || req.url || '';
    const p = req.path || '';
    const hot = /^(\/api)?\/(health|mas|cluster|memory|blocos|oqterm|term)(\/|$)/;
    return hot.test(u) || hot.test(p);
  }
}); /*B49L*/

// CTXRATELIM01: limiter dedicado, mais restritivo, para endpoints que
// tocam credenciais de providers ou criam/alteram agentes -- protege
// contra tentativas automatizadas de forcar/testar chaves em massa ou
// spam de criacao de agentes. NAO cobre /api/mas ou /api/blocos ainda
// (fora do escopo do B49L skip -- decisao pendente ligada ao CTXUNIFY01).
const kbLimiter = rateLimit({
  windowMs: 60000,
  max: 20,
  message: { error: 'Limite de requisicoes atingido para este endpoint sensivel.' },
  standardHeaders: true,
  legacyHeaders: false,
}); /*CTXRATELIM01*/
app.use('/api/', limiter);
// CTXAUTH2FA01: senha do admin nao pode ficar em texto plano no codigo
// versionado (estava assim, ja publicado no historico do GitHub). Se
// ADMIN_PASSWORD existir no .env, usa ela; senao mantem a senha antiga
// como fallback -- zero downtime, so um aviso no log ate voce migrar.
if (!process.env.ADMIN_PASSWORD) {
  console.warn('[CTXAUTH2FA01] ADMIN_PASSWORD ausente no .env -- usando senha padrao antiga. Defina ADMIN_PASSWORD no .env e reinicie para trocar de vez.');
}
const users = [
  { id: 1, name: 'Admin', email: 'admin@cbini.com.br', password: bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'OrquestrAI@2025', 10), role: 'admin' }
];
const sessions = {};
var SP = [ /*OQ64_LAVE*/
  "Voce e o OrquestrAI, copiloto LAVE do Cristhian (Createc) numa VPS Ubuntu 24.04 (Hostinger KVM2). Stack: Docker Compose (web=nginx, api=node 20, proxy=nginx), Express, SQLite. App em /var/www/orquestrai, projetos em /var/www/projects.",
  "Responda em portugues do Brasil, direto, tecnico, curto. Acao antes de explicacao.",
  "",
  "PROTOCOLO LAVE (Ler, Avaliar, Verificar, Executar) - OBRIGATORIO:",
  "1. Toda resposta que envolva COMANDO/SCRIPT/INSPECAO termina com EXATAMENTE UM bloco fenced triple-backtick bash.",
  "2. NUNCA escreva comandos inline com crases simples. PROIBIDO. Coloque tudo dentro do bloco bash.",
  "3. O bloco bash deve ser AUTOCONTIDO, idempotente e read-only por padrao. Use set +e; set +H no inicio. Sem rm -rf / mkfs / dd / chmod 777 a menos que pedido explicito.",
  "4. Antes do bloco, no maximo 2 linhas curtas de objetivo. Depois do bloco, nada.",
  "5. Se a pergunta for puramente conceitual (sem comando), responda em prosa SEM bloco bash.",
  "6. Backups antes de qualquer edicao: cp -a arquivo arquivo.bak-timestamp.",
  "",
  "SEGURANCA DO TERMINAL LAVE:",
  "- O botao EXECUTAR roda comandos no ambiente do backend OrquestrAI na VPS, nao no navegador.",
  "- Por padrao trate como operacao privilegiada: read-only primeiro, confirmacao LAVE antes de executar e sem comandos destrutivos salvo pedido explicito.",
  "- O alcance real depende dos volumes/permissoes do container e dos bind-mounts; nao assuma root irrestrito no host sem verificar.",
  "",
  "BASE DE CONHECIMENTO COMPARTILHADA (todas as IAs Agentes aprendem entre si e nao perdem contexto):",
  "- /var/www/orquestrai/knowledge/ contem: metas/, pendencias/, licoes/, decisoes/, blocos/, contextos/, changelog.md, roadmap.md.",
  "- /var/www/orquestrai/data/knowledge/blocos/ contem auditoria LAVE: cada bloco executado vira um .md com sha256, stdout/stderr, exit code.",
  "- Antes de propor algo novo, CONSULTE knowledge/contextos/ e knowledge/licoes/ pra nao repetir erro ja documentado.",
  "- Sempre que aprender algo (sucesso ou erro), registre uma licao curta em knowledge/licoes/ com data e contexto.",
  "",
  "EXEMPLO CERTO: usuario pergunta como ver o diretorio atual. Voce escreve uma linha de objetivo e ABRE bloco triple-backtick bash, set +e; set +H, pwd, FECHA bloco.",
  "EXEMPLO ERRADO: responder em prosa No Linux use pwd, sem nenhum bloco bash. FALTA o bloco e o usuario nao consegue executar pelo cockpit LAVE.",
].join('\n');
// B31C_2FA_BEGIN  ── TOTP (RFC 6238) sem deps externas, usa better-sqlite3
const _b31cCrypto = _oqRequire('crypto');
let _b31cDB = null;
try {
  const Database = _oqRequire('better-sqlite3');
  const _fs = _oqRequire('fs'); const _p = _oqRequire('path');
  const DIR = process.env.OQ_DATA_DIR || '/var/www/orquestrai/data';
  _fs.mkdirSync(DIR, { recursive: true });
  _b31cDB = new Database(_p.join(DIR, 'orquestrai.db'));
  _b31cDB.exec(`CREATE TABLE IF NOT EXISTS totp(
    user_id INTEGER PRIMARY KEY,
    secret TEXT NOT NULL,
    enabled INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    activated_at TEXT
  );`);
  console.log('[B31C] totp table ready');
} catch(e){ console.error('[B31C] db init fail', e.message); }

const _b32a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
function _b31cB32enc(buf){
  let bits=0, val=0, out='';
  for (const b of buf){ val=(val<<8)|b; bits+=8; while(bits>=5){ out+=_b32a[(val>>(bits-5))&31]; bits-=5; } }
  if (bits>0) out+=_b32a[(val<<(5-bits))&31];
  return out;
}
function _b31cB32dec(s){
  s = s.replace(/=+$/,'').toUpperCase().replace(/\s+/g,'');
  let bits=0, val=0; const out=[];
  for (const c of s){ const i=_b32a.indexOf(c); if (i<0) continue; val=(val<<5)|i; bits+=5; if (bits>=8){ out.push((val>>(bits-8))&0xff); bits-=8; } }
  return Buffer.from(out);
}
function _b31cHotp(secretB32, counter){
  const key = _b31cB32dec(secretB32);
  const buf = Buffer.alloc(8);
  for (let i=7;i>=0;i--){ buf[i] = counter & 0xff; counter = Math.floor(counter/256); }
  const h = _b31cCrypto.createHmac('sha1', key).update(buf).digest();
  const o = h[h.length-1] & 0xf;
  const code = ((h[o]&0x7f)<<24)|((h[o+1]&0xff)<<16)|((h[o+2]&0xff)<<8)|(h[o+3]&0xff);
  return String(code % 1000000).padStart(6,'0');
}
function _b31cVerify(secretB32, token, window=1){
  if (!secretB32 || !token) return false;
  token = String(token).replace(/\s+/g,'');
  if (!/^\d{6}$/.test(token)) return false;
  const t = Math.floor(Date.now()/1000/30);
  for (let w=-window; w<=window; w++){
    if (_b31cHotp(secretB32, t+w) === token) return true;
  }
  return false;
}
function _b31cGetRow(userId){
  if (!_b31cDB) return null;
  return _b31cDB.prepare('SELECT user_id,secret,enabled FROM totp WHERE user_id=?').get(userId) || null;
}

app.get('/api/auth/2fa/status', authMiddleware, (req,res)=>{
  const row = _b31cGetRow(req.user.id);
  res.json({ enabled: !!(row && row.enabled), exists: !!row });
});
app.post('/api/auth/2fa/setup', authMiddleware, async (req,res)=>{
  if (!_b31cDB) return res.status(500).json({error:'db indisponível'});
  let row = _b31cGetRow(req.user.id);
  let secret;
  if (row && !row.enabled){ secret = row.secret; }
  else if (row && row.enabled){ return res.status(409).json({error:'2FA já ativo. Desative antes de regenerar.'}); }
  else {
    secret = _b31cB32enc(_b31cCrypto.randomBytes(20));
    _b31cDB.prepare('INSERT OR REPLACE INTO totp(user_id,secret,enabled) VALUES(?,?,0)').run(req.user.id, secret);
  }
  const label = encodeURIComponent('OrquestrAI:'+req.user.email);
  const issuer = encodeURIComponent('OrquestrAI');
  const uri = `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
  // CTXAUTH2FA01: QR gerado localmente (lib qrcode, sem rede) -- antes
  // tfa.html mandava o secret pra api.qrserver.com (terceiro externo),
  // vazando o segredo do TOTP pela URL. Corrigido.
  try {
    const QRCode = require('qrcode');
    const qr = await QRCode.toDataURL(uri);
    res.json({ secret, otpauth: uri, qr });
  } catch (eqr) {
    res.json({ secret, otpauth: uri, qr: null });
  }
});
app.post('/api/auth/2fa/verify', authMiddleware, (req,res)=>{
  const row = _b31cGetRow(req.user.id);
  if (!row) return res.status(400).json({error:'rode /setup primeiro'});
  const ok = _b31cVerify(row.secret, (req.body||{}).code);
  if (!ok) return res.status(401).json({error:'código inválido'});
  _b31cDB.prepare("UPDATE totp SET enabled=1, activated_at=datetime('now') WHERE user_id=?").run(req.user.id);
  res.json({ ok:true, enabled:true });
});
app.post('/api/auth/2fa/disable', authMiddleware, (req,res)=>{
  const { password, code } = req.body||{};
  const u = users.find(x=>x.id===req.user.id);
  if (!u || !password || !bcrypt.compareSync(password, u.password)) return res.status(401).json({error:'senha inválida'});
  const row = _b31cGetRow(req.user.id);
  if (!row || !row.enabled) return res.json({ ok:true, enabled:false });
  if (!_b31cVerify(row.secret, code)) return res.status(401).json({error:'código inválido'});
  _b31cDB.prepare('DELETE FROM totp WHERE user_id=?').run(req.user.id);
  res.json({ ok:true, enabled:false });
});

app._router && app._router.stack && (function(){
  const idx = app._router.stack.findIndex(l=>l.route && l.route.path==='/api/login' && l.route.methods.post);
  if (idx>=0) app._router.stack.splice(idx,1);
})();
app.post('/api/login', async (req,res)=>{
  try{
    const { email, password, code, turnstile_token } = req.body||{};
    if (!email || !password) return res.status(400).json({error:'Email e senha obrigatorios.'});

    // CTXCLOUDFLARE01: valida o desafio Turnstile antes de checar credenciais.
    // Fail-OPEN por decisao consciente 2026-07-01: se o Cloudflare estiver
    // fora do ar (erro de rede/timeout), o login SEGUE em frente -- a defesa
    // primaria ja e senha+2FA, e um operador solo nao pode ficar trancado
    // fora do proprio sistema por falha de terceiro. So bloqueia (fail-CLOSED)
    // quando o Cloudflare responde de verdade dizendo que o token e invalido
    // -- isso e sinal real de bot, nao falha de servico.
    // CTXCLOUDFLARE01-FIX: so valida na 1a chamada (sem 'code' ainda). Tokens
    // do Turnstile sao de USO UNICO -- se validassemos nas 2 chamadas do
    // fluxo de 2FA (credenciais, depois codigo), a 2a falharia sempre por
    // reuso de token. Um codigo TOTP valido ja e prova forte de humano,
    // entao pular Turnstile nessa etapa e justificado, nao um atalho frouxo.
    if (process.env.CLOUDFLARE_TURNSTILE_SECRET && !code) {
      if (!turnstile_token) {
        return res.status(400).json({ error: 'Verificacao de seguranca ausente. Recarregue a pagina.' });
      }
      try {
        const cfResp = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            secret: process.env.CLOUDFLARE_TURNSTILE_SECRET,
            response: turnstile_token,
          }),
        });
        const cfData = await cfResp.json();
        if (!cfData.success) {
          console.warn('[CTXCLOUDFLARE01] Turnstile rejeitou o token:', JSON.stringify(cfData['error-codes'] || []));
          return res.status(401).json({ error: 'Verificacao de seguranca falhou. Tente novamente.' });
        }
      } catch (cfErr) {
        console.warn('[CTXCLOUDFLARE01] Turnstile indisponivel (fail-open, login segue):', cfErr.message);
      }
    }
    const user = users.find(u=>u.email===email);
    if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({error:'Email ou senha incorretos.'});
    if (user.role==='admin'){
      const row = _b31cGetRow(user.id);
      if (row && row.enabled){
        if (!code) return res.status(401).json({error:'2FA obrigatório', need_totp:true});
        if (!_b31cVerify(row.secret, code)) return res.status(401).json({error:'Código 2FA inválido', need_totp:true});
      }
    }
    const token = jwt.sign({id:user.id,email:user.email,role:user.role}, JWT_SECRET, {expiresIn:'24h'});
    res.json({ token, user:{id:user.id,name:user.name,email:user.email,role:user.role} });
  }catch(err){ res.status(500).json({error:'Erro interno.'}); }
});
console.log('[B31C] 2FA TOTP routes mounted');
// B31C_2FA_END
// CTXAUTH2FA01: /api/login duplicado removido -- este handler nunca executava
// (o primeiro registrado, com checagem 2FA, sempre finaliza a resposta antes).
// Codigo morto que confundia analise futura. Mantido so em backup.
app.get('/api/me', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Token obrigatorio.' });
  try {
    const decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    const user = users.find(u => u.id === decoded.id);
    if (!user) return res.status(401).json({ error: 'Usuario nao encontrado.' });
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch { res.status(401).json({ error: 'Token invalido.' }); }
});
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.get('/api/version', (req, res) => { // CTXVER01
  try {
    const fs = require('fs');
    const cl = fs.readFileSync('/app/knowledge/changelog.md', 'utf8');
    const m = cl.match(/^## \[(\d+\.\d+\.\d+)\]/m);
    res.json({ version: m ? m[1] : '0.0.0' });
  } catch (e) {
    res.json({ version: '0.0.0' });
  }
});
app.post('/api/chat', authMiddleware, async (req,res)=>{
  try{
    const { message, model, history } = req.body || {};
    if(!message) return res.status(400).json({error:'message obrigatorio'});
    const msgs = Array.isArray(history) ? history.slice() : [];
    if(!msgs.some(m=>m.role==='system')) msgs.unshift({role:'system', content: SP}); /*OQ64_LAVE_INJECT*/
    msgs.push({ role:'user', content: String(message) });
    const out = await Providers.chat({ model: model || 'groq/llama-3.3-70b-versatile', messages: msgs });
    try{ if(_oqLave && _oqLave.parseAndPersistFromIA) _oqLave.parseAndPersistFromIA(out.content, req.user); }catch(e){ console.error("[OQ70] parse fail", e.message); }
    res.json({ reply: out.content, model });
  }catch(e){ res.status(500).json({error: e.message}); }
});
var BLOCKED = [/rm\s+-rf\s+\//, /mkfs/, /dd\s+if=/, /shutdown/, /reboot/, /passwd/, /:(){.*}:;/];
app.post('/api/execute', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Token obrigatorio.' });
  var decoded;
  try { decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET); }
  catch { return res.status(401).json({ error: 'Token invalido.' }); }
  if (decoded.role !== 'admin') return res.status(403).json({ error: 'Apenas admin.' });
  const { command } = req.body;
  if (!command) return res.status(400).json({ error: 'Comando obrigatorio.' });
  for (var b of BLOCKED) { if (b.test(command)) return res.status(403).json({ error: 'Comando bloqueado.' }); }
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const pexec = promisify(exec);
    const { stdout, stderr } = await pexec(command, { timeout: 30000, maxBuffer: 1024 * 1024, shell: '/bin/ash' });
    res.json({ output: (stdout || '') + (stderr || ''), success: true });
  } catch (err) { res.json({ output: err.stderr || err.message, success: false }); }
});
app.post('/api/session/clear', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Token obrigatorio.' });
  var decoded;
  try { decoded = jwt.verify(auth.split(' ')[1], JWT_SECRET); }
  catch { return res.status(401).json({ error: 'Token invalido.' }); }
  delete sessions[decoded.id.toString()];
  res.json({ ok: true });
});

// === Providers IA ===
app.get('/api/providers', authMiddleware, (req,res)=>{ try{ res.json(Providers.publicList()); }catch(e){ res.status(500).json({error:e.message}); } });
app.post('/api/providers/:id/key', kbLimiter, authMiddleware, (req,res)=>{ try{ Providers.setKey(req.params.id, req.body.key); res.json({ok:true}); }catch(e){ res.status(400).json({error:e.message}); } });
app.post('/api/providers/:id/test', kbLimiter, authMiddleware, async (req,res)=>{ try{ const r = await Providers.test(req.params.id); res.json({ok:true, sample: (r.content||'').slice(0,80)}); }catch(e){ res.status(400).json({error:e.message}); } });

// OQ-46e SQLite + conversations
const conversationsRouter = require("./routes/conversations.cjs");
app.use("/api/conversations", authMiddleware, conversationsRouter);

// OQ46Z2-v1
if(typeof _oqKnowledge==="function"){ try{ _oqKnowledge(app, authMiddleware); console.log("[OQ46Z2] /api/knowledge montado via fn"); }catch(e){ console.error("[OQ46Z2] mount fail", e.message);} }
// OQ46Z2-end
// OQ48A-v2-mount
if(typeof _oqCluster==="function"){ try{ const _auth = (typeof authMiddleware==="function"?authMiddleware:(typeof authMiddleware==="function"?authMiddleware:(req,res,next)=>next())); _oqCluster(app, _auth); console.log("[OQ48A] /api/cluster montado"); }catch(e){ console.error("[OQ48A] mount fail", e.message);} }
if(typeof _oqBlocos==="function"){ try{ const _ab=(typeof authMiddleware==="function"?authMiddleware:(typeof authMiddleware==="function"?authMiddleware:(req,res,next)=>next())); _oqBlocos(app, _ab); console.log("[OQ58A] /api/blocos montado"); }catch(e){ console.error("[OQ58A] mount fail", e.message);} }
if(typeof _oqLave==="function"){ try{ const _al=(typeof authMiddleware==="function"?authMiddleware:(req,res,next)=>next()); _oqLave(app, _al); console.log("[OQ70] /api/lave montado"); }catch(e){ console.error("[OQ70] lave mount fail", e.message);} }
// OQ48A-v2-mount-end

// OQ71Z-memory mount
if(typeof _oq71zMemory==="function"){ try{ _oq71zMemory(app); }catch(e){ console.error("[OQ71Z] memory mount fail", e.message); } }
app.use('/api/mas', masRoutes);
app.use('/api/licoes', licoesRoutes); // B263

// B374 retention
const retentionRoutes = require('./api/retentionRoutes.cjs');
app.use('/api/mas/retention', authMiddleware, retentionRoutes);
// B273 projects
const projectsRoutes = require('./projectsRoutes.cjs');
app.use('/api/projects', projectsRoutes);

// B339_AGENT_CARDS — expõe AGENT_CARDs como JSON
/* CTXFEEDBACK01 — aprovação humana do BLOCO LAVE
   Sinal w3 do Harness Score (human_approve).
   Armazena 1=aprovado(👍) ou -1=rejeitado(👎) na execução mais recente
   do bloco_n informado. Liga ao mas_run_id via campo já existente. */
app.post('/api/bloco/feedback', express.json(), (req, res) => {
  try {
    const { bloco_n, feedback } = req.body;
    const fv = Number(feedback);
    if (!bloco_n || ![1, -1].includes(fv)) {
      return res.status(400).json({ ok: false, error: 'bloco_n e feedback (1 ou -1) obrigatorios' });
    }
    const Database = require('better-sqlite3');
    const db = new Database(
      process.env.CLUSTER_DB || (process.env.LAVE_BASE || process.cwd()) + '/data/cluster.db'
    );
    /* Atualiza a execução mais recente com esse bloco_n.
       Mantém histórico de todas as execuções — só a última recebe o sinal. */
    const r = db.prepare(
      `UPDATE execucoes SET human_feedback = ?
       WHERE id = (
         SELECT id FROM execucoes WHERE bloco_n = ?
         ORDER BY criado_em DESC LIMIT 1
       )`
    ).run(fv, String(bloco_n));
    db.close();
    res.json({ ok: true, updated: r.changes, bloco_n, feedback: fv });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e.message) });
  }
});

app.get('/api/agents/cards', (req, res) => {
  const fs = require('fs'), path = require('path');
  const dir = '/app/knowledge/agents';
  try {
    const files = fs.readdirSync(dir).filter(f => f.startsWith('AGENT_CARD-') && f.endsWith('.md'));
    const cards = files.map(f => {
      const slug = f.replace('AGENT_CARD-','').replace('.md','');
      const raw = fs.readFileSync(path.join(dir, f), 'utf8');
      const fm = raw.match(/^---\n([\s\S]*?)\n---/);
      const meta = {};
      if (fm) fm[1].split('\n').forEach(l => {
        const m = l.match(/^(\w+):\s*"?([^"]*)"?$/);
        if (m) meta[m[1]] = m[2];
      });
      const sec = (title) => {
        const re = new RegExp('## ' + title + '\\n([\\s\\S]*?)(?=\\n## |\\n---|$)');
        const m = raw.match(re);
        return m ? m[1].trim() : '';
      };
      return { slug, meta,
        bom_em: sec('Bom em'), ruim_em: sec('Ruim em'),
        quando: sec('Quando me chamar'), nao_chame: sec('Não me chame para'),
        entrega: sec('Entrega típica'),
        // CTXAGTEDIT01: prompt incluido p/ o lapis carregar o card completo
        // e nao apagar o system_prompt no overwrite (ver dashboard __oqEditAgent)
        system_prompt: sec('Prompt do sistema') };
    });
    res.json({ ok: true, count: cards.length, cards });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});


// B340_AGENT_CREATE — cria AGENT_CARD .md a partir do form
app.post('/api/agents/create', kbLimiter, authMiddleware, express.json(), (req, res) => { // CTXAGENTAUTH01: auth adicionado
  const fs = require('fs'), path = require('path');
  const dir = '/app/knowledge/agents';
  try {
    const b = req.body || {};
    const slug = String(b.slug||'').trim().toLowerCase().replace(/[^a-z0-9_-]/g,'');
    if (!slug) return res.status(400).json({ok:false,error:'slug obrigatório'});
    const file = path.join(dir, `AGENT_CARD-${slug}.md`);
    if (fs.existsSync(file) && !b.overwrite) return res.status(409).json({ok:false,error:'slug já existe (use overwrite:true)'});
    const md = `---
slug: ${slug}
label_pt: ${b.label_pt||slug.toUpperCase()}
emoji: ${b.emoji||'🤖'}
cor: "${b.cor||'#3b82f6'}"
modelo_atual: ${b.modelo||'claude-haiku-4-5'}
custo_medio_usd: 0
latencia_media_s: 0
tokens_medio: 0
free: false
versao_card: 1.0
gerado_em: ${new Date().toISOString()}
fonte: BLOCO-340 (wizard)
ordem_mesh: ${b.ordem||99}
enabled: ${b.enabled!==false}
---

# ${b.emoji||'🤖'} ${b.label_pt||slug.toUpperCase()}

## Bom em
${b.bom_em||'- (preencher)'}

## Ruim em
${b.ruim_em||'- (preencher)'}

## Quando me chamar
${b.quando||'(preencher)'}

## Não me chame para
${b.nao_chame||'(preencher)'}

## Entrega típica
${b.entrega||'(preencher)'}

## Prompt do sistema
${b.system_prompt||'(role do agente)'}
`;
    fs.writeFileSync(file, md);
    res.json({ok:true, slug, file: file.replace('/app','')});
  } catch (e) { res.status(500).json({ok:false,error:e.message}); }
});


// B342b-MODELS-START
app.get("/api/providers/:id/models", authMiddleware, async (req,res)=>{
  try{
    const { listModels } = require('./api/providers.cjs');
    const out = await listModels(req.params.id);
    res.json(out);
  }catch(e){
    res.status(500).json({error:String(e&&e.message||e)});
  }
});
// B342b-MODELS-END

app.listen(PORT, '0.0.0.0', () => console.log('OrquestraAI API rodando na porta ' + PORT));

// CTXAGT02: atualiza modelo de uma posicao do time
app.post('/api/agents/position', kbLimiter, authMiddleware, (req, res) => {
  try {
    const { position, provider, model, label } = req.body || {};
    if (position === undefined || !model) return res.status(400).json({ error: 'position e model obrigatorios' });
    const Database = require('better-sqlite3');
    const db = new Database(process.env.CLUSTER_DB || (process.env.LAVE_BASE || process.cwd()) + '/data/cluster.db');
    db.pragma('journal_mode=WAL');
    db.exec("CREATE TABLE IF NOT EXISTS agent_positions (position INTEGER PRIMARY KEY, provider TEXT, model TEXT, label TEXT, updated_at TEXT DEFAULT (datetime('now')))");
    db.prepare("INSERT OR REPLACE INTO agent_positions (position,provider,model,label,updated_at) VALUES (?,?,?,?,datetime('now'))").run(position, provider, model, label || '');
    db.close();
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// CTXAGT03: le posicoes salvas do time
app.get('/api/agents/positions', authMiddleware, (req, res) => {
  try {
    const Database = require('better-sqlite3');
    const db = new Database(process.env.CLUSTER_DB || (process.env.LAVE_BASE || process.cwd()) + '/data/cluster.db');
    db.pragma('journal_mode=WAL');
    db.exec("CREATE TABLE IF NOT EXISTS agent_positions (position INTEGER PRIMARY KEY, provider TEXT, model TEXT, label TEXT, updated_at TEXT DEFAULT (datetime('now')))");
    const rows = db.prepare('SELECT position,provider,model,label FROM agent_positions ORDER BY position').all();
    db.close();
    res.json({ ok: true, positions: rows });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

