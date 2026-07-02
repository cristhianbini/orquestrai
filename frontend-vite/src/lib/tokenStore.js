// ATUALIZADO: 2026-07-02 19:50:40 -03:00 (auto, git pre-commit)
// tokenStore.js — R6-03
// Fonte unica do token JWT. Antes espalhado em ~9 pontos do dashboard.html
// como localStorage.getItem('oq_token') cru. Centralizar aqui evita que um
// ponto esqueca o token (bug de 401 em loop que vivemos na Rodada 5).

const KEY = 'oq_token';

export function getToken() {
  try { return localStorage.getItem(KEY) || ''; } catch { return ''; }
}

export function clearToken() {
  try { localStorage.removeItem(KEY); } catch { /* noop */ }
}

// Decodifica o payload do JWT sem validar assinatura (isso e papel do backend).
// Uso: checar expiracao no front pra redirecionar ao login ANTES de disparar
// requests que voltariam 401. Retorna null se token ausente/malformado.
export function getPayload() {
  const t = getToken();
  if (!t) return null;
  try {
    const base = t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base));
  } catch { return null; }
}

export function isExpired() {
  const p = getPayload();
  if (!p || !p.exp) return true;         // sem exp = trata como invalido
  return p.exp * 1000 <= Date.now();
}
