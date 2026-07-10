// ATUALIZADO: 2026-07-10 00:31:29 -03:00 (auto, git pre-commit)
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
const JWT_SECRET = process.env.JWT_SECRET || 'orquestrai-secret-change-me-2025';
if (!process.env.JWT_SECRET) console.warn('[CTXPREVIEWAUTH01] JWT_SECRET ausente no .env -- usando fallback fraco.');

const router = express.Router();
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

// Le todos os project.json do disco. Arquivo corrompido nao derruba a
// lista: entra como {slug, corrupted:true} p/ o front sinalizar.
function loadAll() {
  let dirs = [];
  try { dirs = fs.readdirSync(PROJ_DIR, { withFileTypes: true }).filter(d => d.isDirectory()); }
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
  try { jwt.verify(tk, JWT_SECRET); return res.status(200).end(); }
  catch(e){ return res.status(401).end(); }
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

module.exports = router;
