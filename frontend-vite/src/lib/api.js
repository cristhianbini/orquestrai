// ATUALIZADO: 2026-07-02 19:50:40 -03:00 (auto, git pre-commit)
// api.js — R6-03
// Wrapper unico de acesso ao backend. Todo fetch do front passa por aqui,
// ja com Authorization Bearer e tratamento de 401 centralizado. Substitui o
// padrao repetido {headers:{'Authorization':'Bearer '+localStorage...}} que
// aparecia em multiplos pontos do dashboard.html.

import { getToken, isExpired } from './tokenStore.js';

// Handler de sessao expirada. O R6-06 (useAuth) vai sobrescrever isto pra
// redirecionar ao login com aviso. Por ora, so loga -- nao trava o app.
let onUnauthorized = () => { console.warn('[api] 401 -- sessao possivelmente expirada'); };
export function setUnauthorizedHandler(fn) { onUnauthorized = fn; }

// fetch autenticado. Injeta o Bearer, e em 401 dispara o handler global uma
// vez (nao em loop). Retorna a Response crua -- quem chama decide .json().
export async function apiFetch(path, opts = {}) {
  const headers = { ...(opts.headers || {}), 'Authorization': 'Bearer ' + getToken() };
  const res = await fetch(path, { ...opts, headers });
  if (res.status === 401) onUnauthorized();
  return res;
}

// Atalho pra GET JSON. Lanca em status != ok, pra o chamador tratar no catch.
export async function apiGet(path) {
  const res = await apiFetch(path, { cache: 'no-store' });
  if (!res.ok) throw new Error('HTTP ' + res.status + ' em ' + path);
  return res.json();
}

// URL para EventSource (SSE). EventSource nativo NAO manda header, entao o
// token vai na query (?_t=). Mesmo padrao ja validado no CTXMASAUTH01.
// Centralizado aqui pra o useSSE (R6-07) reusar em vez de reinventar.
export function sseUrl(path) {
  const sep = path.includes('?') ? '&' : '?';
  return path + sep + '_t=' + encodeURIComponent(getToken());
}
