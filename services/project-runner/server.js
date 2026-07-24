// ATUALIZADO: 2026-07-24 07:21:58 -03:00 (auto, git pre-commit)
// (sem shebang de proposito: o hook de pre-commit prependeria o header ACIMA
// dele e quebraria o parse — mesmo motivo do project-supervisor. A unit chama
// /usr/bin/node explicito, o shebang nunca foi usado.)
// project-runner — daemon MINIMO de clone para o import de projetos (Fase A).
//
// Modelo de seguranca (ver knowledge/decisoes + Sprint 2 plano):
//  - Roda NAO-ROOT (user projrunner). So escreve no STAGING que ele possui.
//  - NUNCA escreve em projects/{slug} direto: o api (root) faz o mv final.
//  - Bind 127.0.0.1 (nunca 0.0.0.0 — L-PORTTEST01). Auth JWT HMAC (padrao oqterm).
//  - git roda via spawn com ARGS (nunca shell), GIT_TERMINAL_PROMPT=0 (sem prompt).
//  - Zero dependencia npm: so modulos nativos.
'use strict';
const http = require('http');
const crypto = require('crypto');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const HOST     = process.env.PR_HOST || '127.0.0.1';       // NUNCA 0.0.0.0
const PORT     = parseInt(process.env.PR_PORT || '7655', 10);
const STAGING  = process.env.PR_STAGING || '/var/www/orquestrai/projects/.staging';
const MAX_MB   = parseInt(process.env.PR_MAX_MB || '100', 10);
const TIMEOUT  = parseInt(process.env.PR_CLONE_TIMEOUT_MS || '120000', 10);
const JWT_SECRET = process.env.JWT_SECRET;
// mapeamento owner/repo -> deploy key privada (repos GitHub privados) + known_hosts
// FIXO com a chave oficial do GitHub (NUNCA ssh-keyscan). Ambos em /etc (read-only
// sob ProtectSystem=strict, mas legiveis pelo processo). Repos fora do mapa clonam
// por HTTPS como sempre — zero regressao.
const PRIVATE_REPOS = process.env.PR_PRIVATE_REPOS || '/etc/project-runner/private-repos.json';
const KNOWN_HOSTS   = process.env.PR_KNOWN_HOSTS   || '/etc/project-runner/known_hosts';

if (!JWT_SECRET) { console.error('[project-runner] FATAL: JWT_SECRET ausente'); process.exit(1); }
try { fs.mkdirSync(STAGING, { recursive: true, mode: 0o700 }); } catch (_) {}

// ---- JWT (HMAC-SHA256, crypto nativo — mesmo padrao do oqterm) ----
function b64urlDecode(s){ s = s.replace(/-/g,'+').replace(/_/g,'/'); while(s.length%4) s+='='; return Buffer.from(s,'base64'); }
function verifyJWT(token){
  try {
    const [h,p,sig] = String(token).split('.');
    if(!h||!p||!sig) return null;
    const expected = crypto.createHmac('sha256', JWT_SECRET).update(h+'.'+p).digest();
    const got = b64urlDecode(sig);
    if(expected.length !== got.length) return null;
    if(!crypto.timingSafeEqual(expected, got)) return null;
    const payload = JSON.parse(b64urlDecode(p).toString('utf8'));
    if(payload.exp && Date.now()/1000 > payload.exp) return null;
    return payload;
  } catch(_) { return null; }
}

// ---- validacao de entrada ----
function validSlug(s){ return typeof s === 'string' && /^[a-z0-9-]{1,60}$/.test(s); }
function parseGithubUrl(u){
  if (typeof u !== 'string' || u.length > 300 || u.includes('..')) return null;
  // SO https://github.com/<owner>/<repo>(.git)? — regex ja barra @ (credenciais), espacos, outros hosts/esquemas
  const m = /^https:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?$/.exec(u);
  if (!m) return null;
  const owner = m[1], repo = m[2];
  if ([owner, repo].some(x => x === '.' || x === '..')) return null;
  return { owner, repo, url: u };
}

function dirSizeBytes(dir){
  // du -sb via spawn (sem shell); fallback 0 se falhar
  try {
    const r = require('child_process').spawnSync('du', ['-sb', dir], { encoding: 'utf8', timeout: 10000 });
    return parseInt((r.stdout || '0').split('\t')[0], 10) || 0;
  } catch(_) { return 0; }
}
function rmrf(p){ try { fs.rmSync(p, { recursive: true, force: true }); } catch(_){} }

// deploy key p/ um repo privado mapeado, ou null (=> clone HTTPS normal). Le o
// mapa fresco a cada clone (arquivo minusculo). NAO passa por parseGithubUrl: a
// URL do usuario continua sendo a HTTPS validada; a SSH e' montada internamente a
// partir do owner/repo JA parseado (respeita a protecao de '@' da regex). Se a
// chave nao existir/ler, retorna null (cai pro HTTPS em vez de quebrar).
function privateKeyFor(owner, repo){
  try {
    const map = JSON.parse(fs.readFileSync(PRIVATE_REPOS, 'utf8'));
    const key = map[`${owner}/${repo}`];
    if (typeof key !== 'string' || !key) return null;
    fs.accessSync(key, fs.constants.R_OK);
    return key;
  } catch(_) { return null; }
}

// ---- clone ----
function doClone(slug, gh, cb){
  const rand = crypto.randomBytes(6).toString('hex');
  const tmp  = path.join(STAGING, `${slug}-${rand}.tmp`);
  const env  = { PATH: process.env.PATH, GIT_TERMINAL_PROMPT: '0', HOME: STAGING };
  let cloneUrl = gh.url;                                  // HTTPS por padrao (inalterado)
  const keyPath = privateKeyFor(gh.owner, gh.repo);
  if (keyPath) {
    // repo privado mapeado -> SSH com deploy key read-only. -F /dev/null ignora
    // config do usuario; IdentitiesOnly+IdentityAgent=none oferecem SO esta chave
    // (sem agente, coerente com RestrictAddressFamilies sem AF_UNIX); known_hosts
    // FIXO + StrictHostKeyChecking=yes exige match (falha em vez de confiar cego);
    // BatchMode=yes nunca prompta. owner/repo ja validados pela regex (sem meta).
    cloneUrl = `git@github.com:${gh.owner}/${gh.repo}.git`;
    env.GIT_SSH_COMMAND = `ssh -i ${keyPath} -F /dev/null`
      + ` -o IdentitiesOnly=yes -o IdentityAgent=none`
      + ` -o PreferredAuthentications=publickey -o BatchMode=yes`
      + ` -o StrictHostKeyChecking=yes`
      + ` -o UserKnownHostsFile=${KNOWN_HOSTS} -o GlobalKnownHostsFile=/dev/null`;
    console.log(`[project-runner] repo privado ${gh.owner}/${gh.repo} -> clone SSH (deploy key)`);
  }
  const args = ['clone', '--depth', '1', '--single-branch', '--no-tags', cloneUrl, tmp];
  const git = spawn('git', args, { env, timeout: TIMEOUT });
  let stderr = '';
  git.stderr.on('data', d => { stderr += d.toString().slice(0, 2000); });
  git.on('error', e => { rmrf(tmp); cb({ ok:false, error:'git spawn falhou: '+e.message }); });
  git.on('close', code => {
    if (code !== 0) { rmrf(tmp); return cb({ ok:false, error:'git clone exit '+code, detail: stderr.slice(-400) }); }
    const bytes = dirSizeBytes(tmp);
    if (bytes > MAX_MB * 1024 * 1024) { rmrf(tmp); return cb({ ok:false, error:`repo excede ${MAX_MB}MB (${Math.round(bytes/1048576)}MB)` }); }
    rmrf(path.join(tmp, '.git')); // nao entregamos o historico .git (depth 1, mas remove de vez)
    cb({ ok:true, stagingPath: tmp, sizeBytes: bytes });
  });
}

// ---- HTTP ----
const server = http.createServer((req, res) => {
  const url = (req.url || '').split('?')[0];
  const send = (code, obj) => { res.writeHead(code, {'content-type':'application/json'}); res.end(JSON.stringify(obj)); };

  if (req.method === 'GET' && url === '/healthz') return send(200, { ok:true, svc:'project-runner', ts:Date.now() });

  if (req.method === 'POST' && url === '/clone') {
    const tok = (req.headers.authorization || '').replace(/^Bearer\s+/, '');
    const payload = verifyJWT(tok);
    if (!payload) return send(401, { ok:false, error:'token invalido' });
    const isAdmin = payload.role === 'admin' || payload.role === 'super_admin';
    if (!isAdmin) return send(403, { ok:false, error:'apenas admin' });

    let body = '';
    req.on('data', d => { body += d; if (body.length > 4096) req.destroy(); });
    req.on('end', () => {
      let j; try { j = JSON.parse(body); } catch(_) { return send(400, { ok:false, error:'json invalido' }); }
      if (!validSlug(j.slug)) return send(400, { ok:false, error:'slug invalido' });
      const gh = parseGithubUrl(j.repoUrl);
      if (!gh) return send(400, { ok:false, error:'repoUrl invalida (so https://github.com/owner/repo)' });
      console.log(`[project-runner] clone slug=${j.slug} repo=${gh.owner}/${gh.repo} by=${payload.sub||payload.email||'?'}`);
      doClone(j.slug, gh, out => send(out.ok ? 200 : 422, out));
    });
    return;
  }
  send(404, { ok:false, error:'not found' });
});

server.listen(PORT, HOST, () => console.log(`[project-runner] ouvindo ${HOST}:${PORT} staging=${STAGING}`));
