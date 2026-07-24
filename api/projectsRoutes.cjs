// ATUALIZADO: 2026-07-24 00:48:34 -03:00 (auto, git pre-commit)
// [B315] /api/projects — Projetos, Modos e Scorecard dos Agentes
// [CTXPROJPERSIST01 2026-07-09] Persistencia em DISCO substitui o Map
// em memoria do B315 original.
// POR QUE: o Map perdia todos os projetos a cada restart do container
// (restart e rotina aqui: todo deploy de agents.mjs/providers.cjs).
// O wizard (B273) prometia "salva project.json" mas a rota nunca
// escrevia nada. Alem disso a rota ignorava stack/db/features que o
// wizard envia, e devolvia {ok,project} enquanto o front le j.slug.
// COMO: cada projeto = /app/projects/{slug}/project.json (volume ja
// montado no compose: ./projects -> /app/projects). GET / varre o
// diretorio a cada chamada (dezenas de projetos, nao milhares --
// leitura direta e mais simples e sempre fresca; otimizar so se doer).
// PROXIMO DEV: container/custo/deploy por projeto chegam em S20/S21;
// o front mostra "-" ate la (nao inventar dado).
const express = require('express');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const http = require('http');
// [CTXCHMODSHARE01] extraido p/ modulo compartilhado (tambem usado pelo
// project-supervisor no Gap 3). No container o arquivo e' montado em
// /app/lib/chmodReadable.cjs (ver docker-compose, volume da api).
const { chmodReadable } = require('./lib/chmodReadable.cjs');
// [A2 2026-07-11] daemon project-runner (fora do Docker, systemd). 172.18.0.1
// e o IP do HOST na bridge app-net — mesmo padrao do oqterm (proxy.conf).
const PR_URL = process.env.PROJECT_RUNNER_URL || 'http://172.18.0.1:7655';
// [B4 2026-07-11] daemon project-supervisor (3o portao root, Fase B). Mesmo
// padrao do project-runner: systemd fora do Docker, gateway da app-net.
const PS_URL = process.env.PROJECT_SUPERVISOR_URL || 'http://172.18.0.1:7656';
// [A2/S2-fix 2026-07-11] lacuna do S2: aqui restava o fallback fraco. Mesmo
// padrao do server.js — ausencia e FATAL (hoje inalcancavel, pois server.js
// ja sai antes; mantido por defesa em profundidade).
if (!process.env.JWT_SECRET) {
  console.error('[S2-fix] FATAL: JWT_SECRET ausente no ambiente -- recusando iniciar para nao emitir tokens inseguros.');
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;

// [CTXPROJAUTH01] factory: recebe authMiddleware do server.js e protege
// todas as rotas EXCETO preview-auth (chamada pelo nginx sem Authorization).
module.exports = function(authMiddleware){
const router = express.Router();
// gate de auth: preview-auth fica ABERTA (seguranca via token interno);
// todo o resto exige Bearer token valido.
router.use(function(req, res, next){
  if (/\/preview-auth$/.test(req.path)) return next();
  return authMiddleware(req, res, next);
});
// __dirname no container = /app (arquivo montado em /app/projectsRoutes.cjs)
const PROJ_DIR = process.env.PROJECTS_DIR || path.join(__dirname, 'projects');

const MODES = [
  {
    id: 'chat',
    label: 'AGENTE ÚNICO',
    command: 'mensagem normal',
    description: 'Resposta rápida com um agente, sem acionar o mesh inteiro.',
    agents: 1,
    humanGate: false,
    output: 'resposta no chat'
  },
  {
    id: 'audit',
    label: 'AUDITOR',
    command: '/audita ou pedido de auditoria',
    description: 'Investiga a VPS/projeto e gera blocos LAVE read-only para o humano executar.',
    agents: '1-8',
    humanGate: true,
    output: 'diagnóstico + BLOCO bash'
  },
  {
    id: 'build',
    label: 'CONSTRUTOR',
    command: '/construir ou projeto ativo',
    description: 'Cria/organiza entregáveis de um projeto: telas, rotas, arquivos, backlog e blocos LAVE.',
    agents: '2-8',
    humanGate: true,
    output: 'plano + patches/blocos + validação'
  },
  {
    id: 'mas',
    label: 'MESH MULTI-AGENTE',
    command: '/mas',
    description: 'Força a execução do pipeline MAS completo com vários agentes especializados.',
    agents: 8,
    humanGate: true,
    output: 'relatório multi-agente + métricas'
  }
];

const SCORECARD = {
  version: 'B315-v1',
  maxScore: 100,
  fields: [
    { id: 'tokens', label: 'Tokens usados', type: 'number', source: 'mas_event/token_usage' },
    { id: 'cost_usd', label: 'Custo USD', type: 'currency', source: 'provider billing estimate', freeLabel: 'FREE' },
    { id: 'latency_ms', label: 'Latência', type: 'number', source: 'mas_event latency' },
    { id: 'kb_refs', label: 'Citações da KB', type: 'number', source: 'resposta do agente' },
    { id: 'deliverable', label: 'Entregável útil', type: 'boolean', source: 'validação do run' },
    { id: 'guardian_status', label: 'Aprovação Guardião', type: 'enum', values: ['approved','warn','blocked'] }
  ],
  formulaDraft: {
    base: 70,
    bonuses: {
      kb_refs: '+2 por referência real, máximo +10',
      deliverable: '+10 se entregou algo aproveitável',
      guardian_approved: '+10 se Guardião aprovou'
    },
    penalties: {
      blocked: '-40 se Guardião bloqueou',
      no_kb_when_needed: '-10 se ignorou KB relevante',
      high_cost: '-5 a -15 se custo alto sem justificativa',
      slow: '-5 se muito lento',
      hallucination: '-30 se inventou arquivo/rota/fato'
    }
  }
};

function slugify(s) {
  return String(s || 'projeto')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'projeto';
}

// [B4] mapeamento project.stack -> runtime.stack (CONTRATO-B1 §3). O
// supervisor RE-valida (allowlist propria); isto e' so fail-fast local.
function runtimeStack(projectStack){
  const s = String(projectStack || '');
  if (s === 'static-html' || s === 'static') return 'static';
  if (s === 'node-express' || s === 'node') return 'node';
  return null;
}

// Detecta a stack de um repo importado olhando SO a raiz de repo/ (v1, sem
// varrer subpastas): package.json -> 'node'; senao index.html -> 'static';
// senao 'unrecognized' (runtimeStack() devolve null -> /deploy responde 422
// claro). NAO adivinha alem disso — Gap 2/3 tratam repo/->site/ e afins.
function detectStack(repoDir){
  try {
    if (fs.existsSync(path.join(repoDir, 'package.json'))) return 'node';
    if (fs.existsSync(path.join(repoDir, 'index.html')))   return 'static';
  } catch(_) {}
  return 'unrecognized';
}

// Le todos os project.json do disco. Arquivo corrompido nao derruba a
// lista: entra como {slug, corrupted:true} p/ o front sinalizar.
function loadAll() {
  let dirs = [];
  // [A2] filtro EXPLICITO de .staging (clone do project-runner) e _arquivados
  // (quarentena do DELETE). Antes era implicito (sem project.json => null).
  try { dirs = fs.readdirSync(PROJ_DIR, { withFileTypes: true }).filter(d => d.isDirectory() && !/^[._]/.test(d.name)); }
  catch (e) { return []; }
  return dirs.map(d => {
    const p = path.join(PROJ_DIR, d.name, 'project.json');
    try { return JSON.parse(fs.readFileSync(p, 'utf8')); }
    catch (e) { return fs.existsSync(p) ? { slug: d.name, name: d.name, corrupted: true } : null; }
  }).filter(Boolean);
}

router.get('/', (req, res) => {
  const projects = loadAll().sort((a, b) => String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
  res.json({ ok: true, count: projects.length, projects });
});

router.post('/', express.json({ limit: '1mb' }), (req, res) => {
  const body = req.body || {};
  const name = String(body.name || '').trim();
  if (!name) return res.status(400).json({ ok: false, error: 'nome obrigatorio' });
  const slug = slugify(body.slug || name);
  const dir = path.join(PROJ_DIR, slug);
  // path traversal guard: slug ja e [a-z0-9-], mas cinto e suspensorio
  if (!dir.startsWith(PROJ_DIR + path.sep)) return res.status(400).json({ ok: false, error: 'slug invalido' });
  if (fs.existsSync(path.join(dir, 'project.json'))) {
    return res.status(409).json({ ok: false, error: 'projeto "' + slug + '" ja existe' });
  }
  const project = {
    slug,
    name,
    stack: String(body.stack || 'node-express'),
    db: String(body.db || 'none'),
    description: String(body.description || ''),
    features: Array.isArray(body.features) ? body.features.map(String) : [],
    mode: String(body.mode || 'build'),
    status: 'draft',
    public: false, // CTXPREVIEWAUTH01: privado por padrao
    // R9-DNA01: seed automatico do DNA a partir do wizard — descricao vira
    // objetivo, features viram criterios de aceite iniciais. Editavel depois
    // via PUT /:slug/dna; runs do projeto recebem isso como contrato.
    dna: {
      objetivo: String(body.description || ''),
      publico: '',
      restricoes: [],
      criterios_aceite: Array.isArray(body.features) ? body.features.map(String) : [],
      decisoes: []
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  try {
    fs.mkdirSync(path.join(dir, 'docs'), { recursive: true });
    // escrita atomica: tmp + rename (evita project.json truncado se o
    // container cair no meio do write)
    const tmp = path.join(dir, '.project.json.tmp');
    fs.writeFileSync(tmp, JSON.stringify(project, null, 2));
    fs.renameSync(tmp, path.join(dir, 'project.json'));
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'falha ao gravar: ' + e.message });
  }
  // slug no topo: o wizard (B273) le j.slug direto
  res.json({ ok: true, slug, project });
});

// [CTXPROJDOCS01 2026-07-09] Fase B: detalhe do projeto + docs gerados
// pelo mesh (CTXPROJRUN01 grava plano-{runid}.md em docs/).
router.get('/:slug', (req, res) => {
  const slug = String(req.params.slug||'');
  if (!/^[a-z0-9-]{1,60}$/.test(slug)) return res.status(400).json({ ok:false, error:'slug invalido' });
  const dir = path.join(PROJ_DIR, slug);
  let project;
  try { project = JSON.parse(fs.readFileSync(path.join(dir,'project.json'),'utf8')); }
  catch(e){ return res.status(404).json({ ok:false, error:'projeto nao encontrado' }); }
  let docs = [];
  try {
    docs = fs.readdirSync(path.join(dir,'docs')).filter(f=>/^[\w.-]+\.md$/.test(f))
      .map(f=>({ file:f, size:fs.statSync(path.join(dir,'docs',f)).size,
                 mtime:fs.statSync(path.join(dir,'docs',f)).mtime.toISOString() }));
  } catch(e){}
  const hasSite = fs.existsSync(path.join(dir,'site','index.html'));
  res.json({ ok:true, project, docs, hasSite });
});

router.get('/:slug/docs/:file', (req, res) => {
  const slug = String(req.params.slug||''), file = String(req.params.file||'');
  if (!/^[a-z0-9-]{1,60}$/.test(slug)) return res.status(400).json({ ok:false, error:'slug invalido' });
  // regex estrita: nome simples .md, sem / nem .. (path traversal impossivel)
  if (!/^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*\.md$/.test(file) || file.includes('..'))
    return res.status(400).json({ ok:false, error:'arquivo invalido' });
  const p = path.join(PROJ_DIR, slug, 'docs', file);
  try { res.json({ ok:true, file, content: fs.readFileSync(p,'utf8').slice(0,200000) }); }
  catch(e){ return res.status(404).json({ ok:false, error:'doc nao encontrado' }); }
});

// [R9-DNA01 2026-07-12] DNA do projeto (MVP aprovado CBini): contrato que o
// mesh recebe como contexto em runs do projeto (injecao no runMas). v1 SEM
// versionamento e SEM validador dedicado. Auth de sessao do router (mesmo
// nivel do POST /); campos sanitizados e com teto de tamanho.
router.get('/:slug/dna', (req, res) => {
  const slug = String(req.params.slug||'');
  if (!/^[a-z0-9-]{1,60}$/.test(slug)) return res.status(400).json({ ok:false, error:'slug invalido' });
  let project;
  try { project = JSON.parse(fs.readFileSync(path.join(PROJ_DIR, slug, 'project.json'),'utf8')); }
  catch(e){ return res.status(404).json({ ok:false, error:'projeto nao encontrado' }); }
  res.json({ ok:true, slug, dna: project.dna || null });
});

router.put('/:slug/dna', express.json({ limit: '32kb' }), (req, res) => {
  const slug = String(req.params.slug||'');
  if (!/^[a-z0-9-]{1,60}$/.test(slug)) return res.status(400).json({ ok:false, error:'slug invalido' });
  const pjPath = path.join(PROJ_DIR, slug, 'project.json');
  let project;
  try { project = JSON.parse(fs.readFileSync(pjPath,'utf8')); }
  catch(e){ return res.status(404).json({ ok:false, error:'projeto nao encontrado' }); }
  const b = req.body || {};
  const arr = v => Array.isArray(v) ? v.map(x => String(x).slice(0,500)).filter(Boolean).slice(0,50) : [];
  project.dna = {
    objetivo: String(b.objetivo||'').slice(0,2000),
    publico: String(b.publico||'').slice(0,500),
    restricoes: arr(b.restricoes),
    criterios_aceite: arr(b.criterios_aceite),
    decisoes: arr(b.decisoes)
  };
  project.updatedAt = new Date().toISOString();
  try {
    // mesma escrita atomica do POST / (tmp + rename)
    const tmp = pjPath + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(project, null, 2));
    fs.renameSync(tmp, pjPath);
  } catch(e){ return res.status(500).json({ ok:false, error:'falha ao gravar: '+e.message }); }
  res.json({ ok:true, slug, dna: project.dna });
});

// [CTXPROJDEL01 2026-07-09] exclusao com quarentena (nunca rm real)
router.delete('/:slug', express.json({ limit: '10kb' }), (req, res) => {
  const slug = String(req.params.slug||'');
  if (!/^[a-z0-9-]{1,60}$/.test(slug)) return res.status(400).json({ ok:false, error:'slug invalido' });
  if (slug === 'orquestrai') return res.status(403).json({ ok:false, error:'o cockpit nao pode se auto-excluir' });
  const confirm = String((req.body&&req.body.confirm)||'');
  if (confirm !== slug) return res.status(400).json({ ok:false, error:'confirmacao invalida: envie {confirm:"'+slug+'"}' });
  const dir = path.join(PROJ_DIR, slug);
  if (!fs.existsSync(path.join(dir,'project.json'))) return res.status(404).json({ ok:false, error:'projeto nao encontrado' });
  try {
    const qdir = path.join(PROJ_DIR, '_arquivados');
    fs.mkdirSync(qdir, { recursive: true });
    const dst = path.join(qdir, slug + '-' + new Date().toISOString().replace(/[:.]/g,'-'));
    fs.renameSync(dir, dst);
    return res.json({ ok:true, archived: dst.replace(PROJ_DIR + path.sep, 'projects/') });
  } catch(e) { return res.status(500).json({ ok:false, error:'falha ao arquivar: '+e.message }); }
});

// [A2 2026-07-11] POST /:slug/import — importa repo GitHub via daemon
// project-runner (systemd fora do Docker, ver services/project-runner/).
// Fluxo: valida -> token interno admin 120s -> daemon clona p/ .staging ->
// re-enraiza o path (daemon devolve path do HOST, nao do container — L-B199)
// -> rename ATOMICO p/ projects/{slug}/repo (.staging e repo/ no mesmo bind
// mount ./projects = mesmo fs) -> project.json: cria se nao existe; se ja
// existe SO adiciona source + updatedAt (decisao CBini 2026-07-11).
router.post('/:slug/import', express.json({ limit: '10kb' }), (req, res) => {
  // daemon exige admin; espelhamos o gate aqui p/ falhar cedo e claro
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super_admin'))
    return res.status(403).json({ ok:false, error:'apenas admin' });
  const slug = String(req.params.slug || '');
  if (!/^[a-z0-9-]{1,60}$/.test(slug)) return res.status(400).json({ ok:false, error:'slug invalido' });
  const repoUrl = String((req.body && req.body.repoUrl) || '');
  // mesma validacao do daemon (fail-fast local antes da chamada interna)
  if (repoUrl.length > 300 || repoUrl.includes('..') ||
      !/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+?(\.git)?$/.test(repoUrl))
    return res.status(400).json({ ok:false, error:'repoUrl invalida (so https://github.com/owner/repo)' });
  const projDir = path.join(PROJ_DIR, slug);
  const repoDir = path.join(projDir, 'repo');
  if (fs.existsSync(repoDir)) return res.status(409).json({ ok:false, error:'projeto "'+slug+'" ja tem repo importado' });

  const itk = jwt.sign({ sub:'api-import', role:'admin', slug }, JWT_SECRET, { expiresIn:'120s' });
  const payload = JSON.stringify({ slug, repoUrl });
  const prReq = http.request(PR_URL + '/clone', {
    method: 'POST',
    // > PR_CLONE_TIMEOUT_MS do daemon (120s): o daemon desiste primeiro
    timeout: 150000,
    headers: { 'content-type': 'application/json', authorization: 'Bearer ' + itk,
               'content-length': Buffer.byteLength(payload) },
  }, prRes => {
    let body = '';
    prRes.on('data', d => { body += d; if (body.length > 65536) prReq.destroy(); });
    prRes.on('end', () => {
      let out; try { out = JSON.parse(body); } catch(_) { out = null; }
      if (!out || prRes.statusCode !== 200 || !out.ok)
        return res.status(422).json({ ok:false, error:'clone falhou',
          detail: (out && out.error) || ('daemon respondeu ' + prRes.statusCode) });
      // basename validado + re-enraizado no PROJ_DIR do container
      const base = path.basename(String(out.stagingPath || ''));
      if (!new RegExp('^' + slug + '-[0-9a-f]{12}\\.tmp$').test(base))
        return res.status(502).json({ ok:false, error:'stagingPath inesperado do daemon' });
      const staging = path.join(PROJ_DIR, '.staging', base);
      try {
        fs.mkdirSync(projDir, { recursive: true });
        fs.renameSync(staging, repoDir);
      } catch(e) {
        // corrida (repo surgiu durante o clone) ou falha real: limpa o tmp
        try { fs.rmSync(staging, { recursive: true, force: true }); } catch(_) {}
        const code = (e.code === 'ENOTEMPTY' || e.code === 'EEXIST') ? 409 : 500;
        return res.status(code).json({ ok:false, error:'mv do staging falhou: ' + e.message });
      }
      const pjPath = path.join(projDir, 'project.json');
      let project = null, created = false;
      try { project = JSON.parse(fs.readFileSync(pjPath, 'utf8')); } catch(_) {}
      if (!project) {
        created = true;
        project = { slug, name: slug, stack: detectStack(repoDir), db: 'none', description: '',
                    features: [], mode: 'build', status: 'imported', public: false,
                    createdAt: new Date().toISOString() };
      }
      project.source = { type: 'github', repoUrl, importedAt: new Date().toISOString(),
                         sizeBytes: out.sizeBytes || 0 };
      project.updatedAt = new Date().toISOString();
      try {
        const tmp = pjPath + '.tmp';
        fs.writeFileSync(tmp, JSON.stringify(project, null, 2));
        fs.renameSync(tmp, pjPath);
      } catch(e) {
        // repo/ ja esta no lugar; o json pode ser regravado numa retentativa
        return res.status(500).json({ ok:false, error:'repo importado mas project.json falhou: ' + e.message });
      }
      // [CTXREPOSITEBRIDGE01 — Gap 2] ponte repo/ -> site/. O container static
      // (project-supervisor) monta projects/{slug}/site :ro, mas o clone caiu
      // em repo/. Symlink RELATIVO site -> repo mantem uma unica fonte de
      // verdade (sem copia, sem drift) e resolve tanto no namespace do api
      // (/app/projects) quanto no host do supervisor (/var/www/.../projects) —
      // symlink absoluto quebraria entre os dois mounts. So para stack static
      // (index.html na raiz); node cai no Gap 3 (Dockerfile). Idempotente: nao
      // sobrescreve site/ real de projeto build-mode. Best-effort: se falhar, o
      // deploy re-checa site/ e devolve 422 claro.
      //
      // 2a dimensao do Gap 2 — LEGIBILIDADE: o project-runner clona com umask
      // 027 (dirs 750, files 640, dono projrunner). O nginx do container static
      // roda como uid 101 -> sem os bits de "outros", da 403. Normalizamos a
      // arvore para a+rX (dirs r-x, files +r) = paridade com o site/ 644 do
      // build-mode. O .git e' PULADO de proposito: fica 750 e o nginx devolve
      // 403 em /.git/ (evita servir .git/config etc).
      try {
        if (detectStack(repoDir) === 'static') {
          chmodReadable(repoDir);
          const siteLink = path.join(projDir, 'site');
          if (!fs.existsSync(siteLink)) fs.symlinkSync('repo', siteLink);
        }
      } catch(_) {}
      res.json({ ok: true, slug, created, sizeBytes: out.sizeBytes || 0, project });
    });
  });
  prReq.on('timeout', () => prReq.destroy(new Error('timeout na chamada ao daemon')));
  prReq.on('error', e => {
    if (!res.headersSent) res.status(502).json({ ok:false, error:'project-runner indisponivel: ' + e.message });
  });
  prReq.end(payload);
});

// [B4-E2] chamada interna ao supervisor (espelha o /import + project-runner):
// token efemero 120s. Timeout 90s DE PROPOSITO > 60s do `docker run` do
// daemon — o daemon desiste primeiro e devolve JSON de erro estruturado,
// em vez de a api abortar a conexao no meio (mesmo desenho do /import,
// 150s > 120s do clone).
function callSupervisor(method, psPath, slug, body, cb){
  const itk = jwt.sign({ sub:'api-deploy', role:'admin', slug }, JWT_SECRET, { expiresIn:'120s' });
  const payload = body ? JSON.stringify(body) : '';
  const headers = { authorization: 'Bearer ' + itk };
  if (body) { headers['content-type'] = 'application/json'; headers['content-length'] = Buffer.byteLength(payload); }
  let done = false;
  const fin = (...a) => { if (!done) { done = true; cb(...a); } };
  const q = http.request(PS_URL + psPath, { method, timeout: 90000, headers }, s => {
    let b = '';
    s.on('data', d => { b += d; if (b.length > 65536) q.destroy(new Error('resposta grande demais')); });
    s.on('end', () => {
      let out; try { out = JSON.parse(b); } catch(_) { out = null; }
      fin(null, s.statusCode, out);
    });
  });
  q.on('timeout', () => q.destroy(new Error('timeout na chamada ao supervisor')));
  q.on('error', e => fin(e));
  if (body) q.write(payload);
  q.end();
}
// repassa o codigo do supervisor se for HTTP valido; senao 502
function passCode(code){ return (code >= 400 && code < 600) ? code : 502; }

// [B4 2026-07-11] POST /:slug/deploy — sobe o container do projeto via
// daemon project-supervisor (services/project-supervisor/, CONTRATO-B1).
// Gate de promocao MANUAL (§2): so status==='producao'. Fail-fasts locais
// espelham a validacao do daemon (mesmo desenho /import + project-runner);
// o daemon RE-valida tudo e so aceita {slug, stack} da allowlist.
router.post('/:slug/deploy', express.json({ limit: '10kb' }), (req, res) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super_admin'))
    return res.status(403).json({ ok:false, error:'apenas admin' });
  const slug = String(req.params.slug || '');
  if (!/^[a-z0-9-]{1,60}$/.test(slug)) return res.status(400).json({ ok:false, error:'slug invalido' });
  const pjPath = path.join(PROJ_DIR, slug, 'project.json');
  let project;
  try { project = JSON.parse(fs.readFileSync(pjPath, 'utf8')); }
  catch(_) { return res.status(404).json({ ok:false, error:'projeto nao encontrado' }); }
  if (project.status !== 'producao')
    return res.status(409).json({ ok:false,
      error:'projeto nao promovido: deploy exige status "producao" (atual: "'+String(project.status||'')+'")' });
  const stack = runtimeStack(project.stack);
  if (!stack)
    return res.status(422).json({ ok:false, error:'stack "'+String(project.stack||'')+'" nao suportada no runtime v1 (so static|node)' });
  if (stack === 'static' && !fs.existsSync(path.join(PROJ_DIR, slug, 'site')))
    return res.status(422).json({ ok:false, error:'site/ nao existe para '+slug });
  callSupervisor('POST', '/up', slug, { slug, stack }, (err, code, out) => {
    if (err) return res.status(502).json({ ok:false, error:'project-supervisor indisponivel: ' + err.message });
    if (code !== 200 || !out || !out.ok)
      // passthrough: 409 ja existe, 429 teto, 422 run falhou, 501 node (B2b), 502 docker
      return res.status(passCode(code)).json({ ok:false,
        error: (out && out.error) || ('supervisor respondeu ' + code),
        detail: out && out.detail });
    const now = new Date().toISOString();
    const prev = project.runtime || {};
    // bloco runtime do CONTRATO-B1 §1; image vem da RESPOSTA do supervisor
    // (o que rodou de fato, nao um catalogo espelhado aqui)
    project.runtime = {
      stack,
      image: out.image || null,
      internalPort: out.internalPort,
      containerName: out.containerName,
      state: 'running',
      promotedAt: prev.promotedAt || now,
      lastDeployAt: now,
      resources: prev.resources || { memoryMax: '256m', cpus: '0.5', pidsLimit: 128 }
    };
    project.updatedAt = now;
    try {
      const tmp = pjPath + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify(project, null, 2));
      fs.renameSync(tmp, pjPath);
    } catch(e) {
      // container ESTA rodando; o json pode ser regravado numa retentativa
      return res.status(500).json({ ok:false, error:'container subiu mas project.json falhou: ' + e.message, runtime: project.runtime });
    }
    res.json({ ok:true, slug, runtime: project.runtime });
  });
});

// [B4] POST /:slug/stop — derruba o container via supervisor. Container ja
// ausente: devolve 404 MAS sincroniza runtime.state='stopped' (self-healing
// sem mascarar o erro — decisao CBini 2026-07-11).
router.post('/:slug/stop', express.json({ limit: '10kb' }), (req, res) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super_admin'))
    return res.status(403).json({ ok:false, error:'apenas admin' });
  const slug = String(req.params.slug || '');
  if (!/^[a-z0-9-]{1,60}$/.test(slug)) return res.status(400).json({ ok:false, error:'slug invalido' });
  const pjPath = path.join(PROJ_DIR, slug, 'project.json');
  let project;
  try { project = JSON.parse(fs.readFileSync(pjPath, 'utf8')); }
  catch(_) { return res.status(404).json({ ok:false, error:'projeto nao encontrado' }); }
  callSupervisor('POST', '/down', slug, { slug }, (err, code, out) => {
    if (err) return res.status(502).json({ ok:false, error:'project-supervisor indisponivel: ' + err.message });
    // sincroniza runtime.state -> stopped (tmp+rename); devolve erro de
    // escrita como string para o chamador decidir
    const syncStopped = () => {
      if (!project.runtime || project.runtime.state === 'stopped') return null;
      const now = new Date().toISOString();
      project.runtime.state = 'stopped';
      project.runtime.lastStoppedAt = now;
      project.updatedAt = now;
      try {
        const tmp = pjPath + '.tmp';
        fs.writeFileSync(tmp, JSON.stringify(project, null, 2));
        fs.renameSync(tmp, pjPath);
        return null;
      } catch(e) { return e.message; }
    };
    if (code === 200 && out && out.ok) {
      const werr = syncStopped();
      if (werr) return res.status(500).json({ ok:false, error:'container parou mas project.json falhou: ' + werr });
      return res.json({ ok:true, slug, runtime: project.runtime || null });
    }
    if (code === 404) {
      // container ja ausente: 404 SEM mascarar, mas com self-healing do
      // estado gravado (decisao CBini 2026-07-11)
      const werr = syncStopped();
      return res.status(404).json({ ok:false, error: (out && out.error) || 'container nao existe',
        runtimeSynced: !werr, ...(werr ? { syncError: werr } : {}) });
    }
    return res.status(passCode(code)).json({ ok:false,
      error: (out && out.error) || ('supervisor respondeu ' + code), detail: out && out.detail });
  });
});

// [B4] GET /:slug/runtime — bloco runtime do project.json + estado VIVO do
// container via supervisor. Read-only (nao grava reconciliacao em GET).
// Auth de SESSAO (nao admin): sem dado sensivel — decisao CBini 2026-07-11.
router.get('/:slug/runtime', (req, res) => {
  const slug = String(req.params.slug || '');
  if (!/^[a-z0-9-]{1,60}$/.test(slug)) return res.status(400).json({ ok:false, error:'slug invalido' });
  let project;
  try { project = JSON.parse(fs.readFileSync(path.join(PROJ_DIR, slug, 'project.json'), 'utf8')); }
  catch(_) { return res.status(404).json({ ok:false, error:'projeto nao encontrado' }); }
  callSupervisor('GET', '/status/' + slug, slug, null, (err, code, out) => {
    // supervisor fora nao quebra o front: live='unknown' + aviso, 200 mesmo
    if (err || code !== 200 || !out || !out.ok)
      return res.json({ ok:true, slug, runtime: project.runtime || null, live: 'unknown',
        supervisorError: err ? err.message : ((out && out.error) || ('status ' + code)) });
    res.json({ ok:true, slug, runtime: project.runtime || null, live: out.state });
  });
});

// [CTXPREVIEWTOKEN02] emite token EFEMERO de preview (30min, escopo unico
// ao slug). Protegida pelo gate de auth do router (exige sessao valida).
router.get('/:slug/preview-token', (req, res) => {
  const slug = String(req.params.slug || '');
  if (!/^[a-z0-9-]{1,60}$/.test(slug)) return res.status(400).json({ok:false,error:'slug invalido'});
  if (!fs.existsSync(path.join(PROJ_DIR, slug, 'project.json'))) return res.status(404).json({ok:false,error:'projeto nao encontrado'});
  const tk = jwt.sign({ scope:'preview', slug }, JWT_SECRET, { expiresIn:'30m' });
  res.json({ ok:true, token: tk, expiresIn: 1800 });
});

// [CTXPREVIEWAUTH01] CONTRATO com o nginx (auth_request subrequest):
// esta rota responde SO com status; o corpo e' ignorado pelo nginx.
//   200 -> libera o preview   |   401 -> nega (sem token / token invalido)
//   400 -> slug malformado     |   404 -> projeto nao existe
// IMPORTANTE: o nginx auth_request so entende 2xx (libera) e 401/403 (nega);
// QUALQUER outro status vira 500 pro cliente. Por isso os returns sao
// estritamente esses 4. O slug vem do PATH e o token do HEADER X-Preview-
// Token (o nginx seta ambos na location de preview -- ver proxy.conf,
// LOCATION 1/2). A query ?_t= fica so como fallback de compatibilidade.
router.get('/:slug/preview-auth', (req, res) => {
  // [CTXPREVIEWAUTHFIX01b] slug sempre do path (nginx manda o real via set).
  const slug = String(req.params.slug || '');
  if (!/^[a-z0-9-]{1,60}$/.test(slug)) return res.status(400).end();
  let project;
  try { project = JSON.parse(fs.readFileSync(path.join(PROJ_DIR, slug, 'project.json'),'utf8')); }
  catch(e){ return res.status(404).end(); }
  if (project.public === true) return res.status(200).end();
  // [CTXPREVIEWAUTHFIX01] token: header tem prioridade, fallback pra query.
  const tk = String(req.headers['x-preview-token'] || req.query._t || '');
  if (!tk) return res.status(401).end();
  try {
    const dec = jwt.verify(tk, JWT_SECRET);
    // [CTXPREVIEWTOKEN02] se o token tem scope, precisa ser 'preview' E do slug certo.
    // Tokens de sessao (sem scope) continuam validos -- fallback mantido.
    if (dec.scope && (dec.scope !== 'preview' || dec.slug !== slug)) return res.status(401).end();
    return res.status(200).end();
  } catch(e){ return res.status(401).end(); }
});

// [CTXPREVIEWAUTH01] alterna publico/privado. SEM auth ainda (ver aviso
// no cabecalho do patch) -- mesma situacao de todas as rotas deste arquivo.
router.patch('/:slug', express.json({ limit: '10kb' }), (req, res) => {
  const slug = String(req.params.slug||'');
  if (!/^[a-z0-9-]{1,60}$/.test(slug)) return res.status(400).json({ ok:false, error:'slug invalido' });
  const pjPath = path.join(PROJ_DIR, slug, 'project.json');
  let project;
  try { project = JSON.parse(fs.readFileSync(pjPath,'utf8')); }
  catch(e){ return res.status(404).json({ ok:false, error:'projeto nao encontrado' }); }
  if (typeof req.body.public === 'boolean') project.public = req.body.public;
  project.updatedAt = new Date().toISOString();
  try {
    const tmp = pjPath + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(project, null, 2));
    fs.renameSync(tmp, pjPath);
  } catch(e){ return res.status(500).json({ ok:false, error:'falha ao gravar: '+e.message }); }
  res.json({ ok:true, project });
});

router.get('/modes', (req, res) => {
  res.json({ ok: true, modes: MODES });
});

router.get('/scorecard', (req, res) => {
  res.json({ ok: true, scorecard: SCORECARD });
});

return router;
};
