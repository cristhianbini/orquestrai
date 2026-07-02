// ATUALIZADO: 2026-07-02 19:50:40 -03:00 (auto, git pre-commit)
// useSSE.js — R6-07
// Um EventSource gerenciado, substituindo os 3-4 wrappers empilhados que o
// dashboard.html usava (B332, B334, __BLOG_MAS, __masxWrapped -- cada um
// interceptando window.EventSource em camadas, fonte de bugs dificeis).
// Aqui: conexao unica, cleanup garantido, token via query (SSE nao manda header).

import { useEffect, useRef, useState, useCallback } from 'react';
import { sseUrl } from '../lib/api.js';

// Conecta a um endpoint SSE e entrega cada evento parseado ao callback.
// path: caminho do stream (ex: '/api/mas/events/<runId>'). O token e anexado
//   automaticamente via sseUrl() (?_t=), mesmo padrao do CTXMASAUTH01.
// onEvent: recebe o objeto JSON de cada 'data:'. Estavel via useCallback no
//   chamador, senao reconecta a cada render.
// enabled: liga/desliga sem desmontar o componente (ex: so conecta com runId).
export function useSSE(path, onEvent, enabled = true) {
  const esRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle | open | error

  useEffect(() => {
    if (!enabled || !path) { setStatus('idle'); return; }

    const es = new EventSource(sseUrl(path));
    esRef.current = es;

    es.onopen = () => setStatus('open');

    es.onmessage = (msg) => {
      // Ignora heartbeats (linhas ':' que o backend manda a cada 15s -- CTXSSE03).
      if (!msg.data) return;
      try { onEvent(JSON.parse(msg.data)); }
      catch (e) { console.warn('[useSSE] parse falhou:', e.message); }
    };

    es.onerror = () => {
      // EventSource tenta reconectar sozinho; so registramos o estado.
      setStatus('error');
    };

    // Cleanup: fecha a conexao ao desmontar ou trocar de path -- garante que
    // nunca sobra EventSource orfao (causa de leak/duplicacao no legado).
    return () => { es.close(); esRef.current = null; };
  }, [path, enabled, onEvent]);

  // Fecha manualmente quando preciso (ex: run terminou).
  const close = useCallback(() => {
    if (esRef.current) { esRef.current.close(); esRef.current = null; setStatus('idle'); }
  }, []);

  return { status, close };
}
