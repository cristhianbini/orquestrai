// ATUALIZADO: 2026-07-11 12:06:48 -03:00 (auto, git pre-commit)
// (sem shebang de proposito: o hook de pre-commit prependeria o header
// ACIMA dele e quebraria o parse; a unit chama /usr/bin/node explicito)
// project-supervisor — daemon que sobe/derruba UM container por projeto.
// Fase B (Rodada 7) do Sprint 2. Ver services/project-supervisor/CONTRATO-B1.md
// e knowledge/metas/RODADA-7-PLANO-CONTAINER-ISOLADO.md.
//
// ATENCAO — ESTE E O 3o PORTAO ROOT (risco R1 do plano):
//  Diferente do project-runner (deliberadamente SEM poder: uid 999, sem
//  docker), este daemon PRECISA falar com o socket do Docker (grupo docker
//  = root-equivalente na pratica). A contencao NAO e' de-privilegiar (nao da
//  pra rodar docker sem docker), e' a API ESTREITA E ALLOWLISTED abaixo:
//   - so 4 rotas; nenhuma aceita comando/flag arbitrario do chamador;
//   - todo `docker` roda via spawn com ARRAY de args (nunca shell);
//   - slug/stack/recursos re-validados aqui (nao confia na api);
//   - NUNCA -p, --privileged, --cap-add, nem montar docker.sock no filho.
//  Auditoria conjunta dos 3 portoes root = rodada futura (ROADMAP #5b).
//
// B2 (este esqueleto): bind 127.0.0.1 SO (app-net fica pro B3), NAO chamado
// pela api ainda. Implementa o stack STATIC fim-a-fim; NODE (build-time
// Dockerfile) chega no B2b -> responde 501 por enquanto.
'use strict';
const http = require('http');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const HOST         = process.env.PS_HOST || '127.0.0.1';   // B2: localhost only
const PORT         = parseInt(process.env.PS_PORT || '7656', 10);
const PROJECTS_DIR = process.env.PS_PROJECTS_DIR || '/var/www/orquestrai/projects';
const NETWORK      = process.env.PS_NETWORK || 'app-net';
const MAX_CONTAINERS = parseInt(process.env.PS_MAX_CONTAINERS || '3', 10);
const JWT_SECRET   = process.env.JWT_SECRET;

if (!JWT_SECRET) { console.error('[project-supervisor] FATAL: JWT_SECRET ausente'); process.exit(1); }

// ---- catalogo de stacks v1 (CONTRATO-B1) ----
// static: nginx servindo projects/{slug}/site/ :ro. node: chega no B2b.
const STACKS = {
  static: {
    image: 'nginx:1.27-alpine',
    internalPort: 80,
    subdir: 'site',                        // projects/{slug}/site
    mount: '/usr/share/nginx/html',
    // VALIDADO no teste real do B2 (2026-07-11): com --cap-drop ALL o nginx
    // como root morre no chown() dos temp dirs (CAP_CHOWN). Rodar como o uid
    // do nginx (101) resolve — nao-root nem tenta o chown — e elimina root
    // do container de brinde. Porta 80 nao-root funciona porque o Docker
    // zera net.ipv4.ip_unprivileged_port_start.
    user: '101:101',
    // nginx com --read-only precisa destes tmpfs (cache, pid). tmpfs do
    // docker nasce root-owned, entao uid/gid=101 para o nginx escrever.
    // /run e nao /var/run: no alpine /var/run e' symlink de /run.
    tmpfs: [
      '/var/cache/nginx:rw,noexec,nosuid,uid=101,gid=101,mode=0755',
      '/run:rw,noexec,nosuid,uid=101,gid=101,mode=0755',
      '/tmp:rw,noexec,nosuid,mode=1777',
    ],
    command: null,                         // usa o entrypoint da imagem
  },
};
const DEFAULT_RES = { memoryMax: '256m', cpus: '0.5', pidsLimit: 128 };

// ---- JWT (HMAC-SHA256 nativo — mesmo padrao do project-runner/oqterm) ----
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

// ---- validacao ----
function validSlug(s){ return typeof s === 'string' && /^[a-z0-9-]{1,60}$/.test(s); }
function containerName(slug){ return 'proj-' + slug; }

// docker via spawnSync com ARRAY (sem shell). Devolve {code, out, err}.
function docker(args, timeoutMs){
  const r = spawnSync('docker', args, { encoding: 'utf8', timeout: timeoutMs || 20000 });
  return { code: r.status, out: (r.stdout||'').trim(), err: (r.stderr||'').trim() };
}

// conta containers de projeto VIVOS (label orquestrai.project). Teto = 3.
function countProjectContainers(){
  const r = docker(['ps', '--filter', 'label=orquestrai.project', '-q']);
  if (r.code !== 0) return { error: r.err || 'docker ps falhou' };
  const n = r.out ? r.out.split('\n').filter(Boolean).length : 0;
  return { count: n };
}

// estado de UM container: { state: 'running'|'stopped'|'absent' } ou { error }.
// `docker inspect` falha TANTO para container inexistente QUANTO para daemon
// fora do ar — distinguir pelo stderr, senao um Docker caido viraria um
// 'absent' enganoso (e o /up tentaria criar por cima).
function containerState(slug){
  const name = containerName(slug);
  const r = docker(['inspect', '-f', '{{.State.Running}}', name]);
  if (r.code !== 0) {
    if (/no such (object|container)/i.test(r.err)) return { state: 'absent' };
    return { error: r.err || 'docker inspect falhou' };
  }
  return { state: r.out === 'true' ? 'running' : 'stopped' };
}

// ---- acoes ----
function doUp(slug, stackName, cb){
  const stack = STACKS[stackName];
  if (!stack) {
    if (stackName === 'node') return cb(501, { ok:false, error:'stack node chega no B2b (build-time Dockerfile)' });
    return cb(400, { ok:false, error:'stack nao suportada na v1 (so static; node no B2b)' });
  }
  const name = containerName(slug);
  // ja existe? nao recria por cima silenciosamente
  const st = containerState(slug);
  if (st.error) return cb(502, { ok:false, error:'docker indisponivel: ' + st.error });
  if (st.state !== 'absent') return cb(409, { ok:false, error:`container ${name} ja existe (${st.state}); use /down antes` });
  // teto de 3
  const c = countProjectContainers();
  if (c.error) return cb(502, { ok:false, error:'docker indisponivel: ' + c.error });
  if (c.count >= MAX_CONTAINERS) return cb(429, { ok:false, error:`teto de ${MAX_CONTAINERS} containers vivos atingido` });
  // conteudo a montar existe?
  const srcDir = path.join(PROJECTS_DIR, slug, stack.subdir);
  if (!fs.existsSync(srcDir)) return cb(422, { ok:false, error:`${stack.subdir}/ nao existe para ${slug}` });

  // monta args allowlisted (CONTRATO-B1). SEM -p, SEM privileged, SEM cap-add.
  const args = ['run', '-d',
    '--name', name,
    '--network', NETWORK,
    '--memory', DEFAULT_RES.memoryMax,
    '--cpus', DEFAULT_RES.cpus,
    '--pids-limit', String(DEFAULT_RES.pidsLimit),
    '--read-only',
    '--cap-drop', 'ALL',
    '--security-opt', 'no-new-privileges',
    '--restart', 'no',                               // sem restart automatico (v1)
    '--user', stack.user,                            // nunca root dentro do container
    '-v', `${srcDir}:${stack.mount}:ro`,
    '--label', `orquestrai.project=${slug}`,
  ];
  for (const t of stack.tmpfs) { args.push('--tmpfs', t); }
  args.push(stack.image);
  if (stack.command) args.push(...stack.command);

  const r = docker(args, 60000);
  if (r.code !== 0) {
    // limpeza best-effort se um container meio-criado ficou pra tras
    docker(['rm', '-f', name]);
    return cb(422, { ok:false, error:'docker run falhou', detail: (r.err||'').slice(-400) });
  }
  // TOCTOU do teto: o pre-check acima nao e' atomico com o `docker run`
  // (dentro do daemon o spawnSync serializa, mas containers com o label
  // podem nascer por fora — docker manual, outro deploy). Re-conta DEPOIS
  // de criar; se estourou, desfaz o proprio container e devolve 429.
  const after = countProjectContainers();
  if (after.error || after.count > MAX_CONTAINERS) {
    docker(['rm', '-f', name]);
    if (after.error) return cb(502, { ok:false, error:'docker indisponivel apos run: ' + after.error });
    return cb(429, { ok:false, error:`teto de ${MAX_CONTAINERS} containers vivos atingido (corrida detectada; container desfeito)` });
  }
  console.log(`[project-supervisor] up slug=${slug} stack=${stackName} id=${r.out.slice(0,12)}`);
  // image na resposta: o api grava no runtime o que RODOU de fato (evita
  // catalogo duplicado no api divergir do daqui) — B4-E2.
  cb(200, { ok:true, slug, stack: stackName, containerName: name, internalPort: stack.internalPort, image: stack.image, state: 'running' });
}

function doDown(slug, cb){
  const name = containerName(slug);
  const st = containerState(slug);
  if (st.error) return cb(502, { ok:false, error:'docker indisponivel: ' + st.error });
  if (st.state === 'absent') return cb(404, { ok:false, error:`container ${name} nao existe` });
  const r = docker(['rm', '-f', name]);
  if (r.code !== 0) return cb(422, { ok:false, error:'docker rm falhou', detail: (r.err||'').slice(-400) });
  console.log(`[project-supervisor] down slug=${slug}`);
  cb(200, { ok:true, slug, state: 'absent' });
}

// ---- HTTP ----
function readBody(req, cb){
  let body = '';
  req.on('data', d => { body += d; if (body.length > 4096) req.destroy(); });
  req.on('end', () => { try { cb(JSON.parse(body || '{}')); } catch(_) { cb(null); } });
}
// NOTA para a auditoria dos 3 portoes (ROADMAP #5b): o MESMO JWT admin
// (mesmo JWT_SECRET, role admin/super_admin, sem claim de escopo/aud por
// servico) abre os 3 portoes root — oqterm, project-runner e este daemon.
// Um token admin vazado compromete os tres de uma vez. Compartimentar
// (aud/scope por portao, ou segredo por servico) e' decisao da #5b.
function requireAdmin(req, send){
  const tok = (req.headers.authorization || '').replace(/^Bearer\s+/, '');
  const payload = verifyJWT(tok);
  if (!payload) { send(401, { ok:false, error:'token invalido' }); return null; }
  if (payload.role !== 'admin' && payload.role !== 'super_admin') { send(403, { ok:false, error:'apenas admin' }); return null; }
  return payload;
}

const server = http.createServer((req, res) => {
  const url = (req.url || '').split('?')[0];
  const send = (code, obj) => { res.writeHead(code, {'content-type':'application/json'}); res.end(JSON.stringify(obj)); };

  if (req.method === 'GET' && url === '/healthz') return send(200, { ok:true, svc:'project-supervisor', ts:Date.now() });

  // GET /status/{slug}
  const mStatus = req.method === 'GET' && /^\/status\/([a-z0-9-]{1,60})$/.exec(url);
  if (mStatus) {
    if (!requireAdmin(req, send)) return;
    const slug = mStatus[1];
    const st = containerState(slug);
    if (st.error) return send(502, { ok:false, slug, error:'docker indisponivel: ' + st.error });
    return send(200, { ok:true, slug, state: st.state });
  }

  if (req.method === 'POST' && url === '/up') {
    if (!requireAdmin(req, send)) return;
    return readBody(req, j => {
      if (!j) return send(400, { ok:false, error:'json invalido' });
      if (!validSlug(j.slug)) return send(400, { ok:false, error:'slug invalido' });
      if (typeof j.stack !== 'string') return send(400, { ok:false, error:'stack obrigatoria' });
      doUp(j.slug, j.stack, send);
    });
  }

  if (req.method === 'POST' && url === '/down') {
    if (!requireAdmin(req, send)) return;
    return readBody(req, j => {
      if (!j || !validSlug(j.slug)) return send(400, { ok:false, error:'slug invalido' });
      doDown(j.slug, send);
    });
  }

  send(404, { ok:false, error:'not found' });
});

server.listen(PORT, HOST, () => console.log(`[project-supervisor] ouvindo ${HOST}:${PORT} network=${NETWORK} teto=${MAX_CONTAINERS}`));
