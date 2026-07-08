// AgentPanel.jsx — R6-08/09 (reescrito)
// Antes: 245 linhas com card inline, EventSource cru e fetch sem auth.
// Agora: orquestra os 9 agentes usando useMasRun (estado+SSE+auth) e AgentCard
// (visual). A logica de dados saiu daqui pra o hook -- separacao limpa.

import React from 'react';
import AgentCard from './AgentCard.jsx';
import { useMasRun } from '../hooks/useMasRun.js';
import { useState, useEffect } from 'react';

// CTXAGENTSCORE01 FASE 1 (2026-07-07): busca o AgentScore historico e mescla
// no card. Separado do useMasRun (que e' SSE de run ATIVA) porque score e'
// historico agregado -- fetch unico no mount, nao stream. O endpoint devolve
// score 0-1; o ScoreMeter espera 0-100 (por isso *100). Falha silenciosa:
// sem score, o card mostra "sem dados" como antes (degradacao graciosa).
function useAgentScores(){
  const [scores, setScores] = useState({});
  useEffect(function(){
    var tk = localStorage.getItem('oq_token')||localStorage.getItem('token')||'';
    fetch('/api/mas/agent-scores?window=50',{headers:{Authorization:'Bearer '+tk}})
      .then(function(r){ return r.json(); })
      .then(function(j){
        if(!j||!j.ok||!Array.isArray(j.agents)) return;
        var m={};
        j.agents.forEach(function(a){ m[a.agent]={ score: Math.round(a.score*100), dims:a.dims, sinais:a.sinais }; });
        setScores(m);
      })
      .catch(function(){ /* sem score -> card mostra 'sem dados' (ok) */ });
  }, []);
  return scores;
}

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
  const scores = useAgentScores(); // CTXAGENTSCORE01: score historico por agente
  return (
    <div className="grid grid-cols-1 gap-3">
      {AGENTS.map((agent) => (
        <AgentCard key={agent.id} agent={agent}
          live={{ ...(scores[agent.id]||{}), ...(liveData[agent.id]||{}),
                  score: (liveData[agent.id] && liveData[agent.id].score != null)
                         ? liveData[agent.id].score
                         : (scores[agent.id] ? scores[agent.id].score : null) }} />
      ))}
    </div>
  );
}
