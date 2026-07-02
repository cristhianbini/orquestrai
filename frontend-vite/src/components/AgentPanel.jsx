// AgentPanel.jsx — R6-08/09 (reescrito)
// Antes: 245 linhas com card inline, EventSource cru e fetch sem auth.
// Agora: orquestra os 9 agentes usando useMasRun (estado+SSE+auth) e AgentCard
// (visual). A logica de dados saiu daqui pra o hook -- separacao limpa.

import React from 'react';
import AgentCard from './AgentCard.jsx';
import { useMasRun } from '../hooks/useMasRun.js';

// Mapa fixo dos 9 agentes (ordem = execucao real, mas/agents.mjs).
const AGENTS = [
  { id: 'scout',        nome: 'BATEDOR',      funcao: 'Varredura rapida e inicial',  dot: 'bg-cyan' },
  { id: 'auditor',      nome: 'AUDITOR',      funcao: 'Analise detalhada e revisao', dot: 'bg-purple-400' },
  { id: 'detetive',     nome: 'DETETIVE',     funcao: 'Investigacao e correlacao',   dot: 'bg-cyan' },
  { id: 'smith',        nome: 'ARQUITETO',    funcao: 'Arquitetura e estruturacao',  dot: 'bg-amber' },
  { id: 'guardian',     nome: 'GUARDIAO',     funcao: 'Protecao e validacao',        dot: 'bg-green' },
  { id: 'memorialista', nome: 'MEMORIALISTA', funcao: 'Registro de memorias',        dot: 'bg-pink-400' },
  { id: 'rel',          nome: 'RELATOR',      funcao: 'Relatorios e sinteses',       dot: 'bg-cyan' },
  { id: 'metrico',      nome: 'METRICO',      funcao: 'Metricas e monitoramento',    dot: 'bg-gray-400' },
  { id: 'revisor',      nome: 'REVISOR',      funcao: 'Revisao final de qualidade',  dot: 'bg-purple-400' },
];

export default function AgentPanel() {
  const { liveData } = useMasRun();
  return (
    <div className="grid grid-cols-1 gap-3">
      {AGENTS.map((agent) => (
        <AgentCard key={agent.id} agent={agent} live={liveData[agent.id]} />
      ))}
    </div>
  );
}
