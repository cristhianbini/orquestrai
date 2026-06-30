// [B315] /api/projects — base inicial para Projetos, Modos e Scorecard dos Agentes
const express = require('express');
const crypto = require('crypto');

const router = express.Router();
const projects = new Map();

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

router.get('/', (req, res) => {
  res.json({ ok: true, projects: [...projects.values()] });
});

router.post('/', express.json({ limit: '1mb' }), (req, res) => {
  const body = req.body || {};
  const name = String(body.name || 'Projeto sem nome').trim();
  const mode = String(body.mode || 'build').trim();
  const id = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(12).toString('hex');

  const project = {
    id,
    name,
    slug: slugify(body.slug || name),
    mode,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  projects.set(id, project);
  res.json({ ok: true, project });
});

router.get('/modes', (req, res) => {
  res.json({ ok: true, modes: MODES });
});

router.get('/scorecard', (req, res) => {
  res.json({ ok: true, scorecard: SCORECARD });
});

module.exports = router;
