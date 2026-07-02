// ATUALIZADO: 2026-07-02 19:53:59 -03:00 (auto, git pre-commit)
// useMasRun.js — R6-09
// Estado de um run do MAS: busca o run mais recente (com auth), conecta ao
// SSE via useSSE, e mantem o estado por agente. Encapsula o que antes vivia
// solto no AgentPanel (fetch sem auth + EventSource cru + setLiveData).
// Preparado p/ multi-user futuro: o estado e local ao hook, varios paineis
// poderiam instanciar runs distintos sem colisao global (o oposto do
// window.__oqMasES unico do legado).

import { useState, useEffect, useCallback } from 'react';
import { apiGet } from '../lib/api.js';
import { useSSE } from './useSSE.js';

export function useMasRun() {
  // { [agentId]: { status, model, tokens_in, tokens_out, cost_usd, score } }
  const [liveData, setLiveData] = useState({});
  const [runId, setRunId] = useState(null);

  // Busca o ultimo run ao montar. Usa apiGet (R6-03) -> ja manda o token e,
  // se der 401, dispara o handler global (useAuth -> login). Resolve o bug
  // do fetch('/api/mas/last') SEM auth que o AgentPanel tinha.
  useEffect(() => {
    let vivo = true;
    apiGet('/api/mas/last')
      .then((j) => {
        if (!vivo) return;
        const id = j && (j.run_id || j.id || j.runId || (j.run && (j.run.id || j.run.run_id)));
        if (id) setRunId(id);
      })
      .catch(() => { /* sem run ativo ou 401 ja tratado pelo api.js */ });
    return () => { vivo = false; };
  }, []);

  // Aplica cada evento SSE ao estado do agente correspondente. Estavel
  // (useCallback) pra nao reconectar o SSE a cada render.
  const onEvent = useCallback((ev) => {
    if (!ev || !ev.agent) return;
    setLiveData((prev) => {
      const cur = prev[ev.agent] || {};
      let status = cur.status || 'idle';
      if (ev.type === 'agent.start') status = 'running';
      if (ev.type === 'agent.done')  status = 'done';
      if (ev.type === 'agent.error') status = 'error';
      return {
        ...prev,
        [ev.agent]: {
          ...cur,
          status,
          model:      ev.model      != null ? ev.model      : cur.model,
          tokens_in:  ev.tokens_in  != null ? ev.tokens_in  : cur.tokens_in,
          tokens_out: ev.tokens_out != null ? ev.tokens_out : cur.tokens_out,
          cost_usd:   ev.cost_usd   != null ? ev.cost_usd   : cur.cost_usd,
          score:      ev.score      != null ? ev.score      : cur.score,
        },
      };
    });
  }, []);

  // So conecta o SSE quando ha runId. useSSE cuida do token (?_t=) e cleanup.
  const { status: sseStatus } = useSSE(
    runId ? '/api/mas/events/' + encodeURIComponent(runId) : null,
    onEvent,
    !!runId
  );

  return { liveData, runId, sseStatus };
}
