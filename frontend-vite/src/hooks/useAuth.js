// ATUALIZADO: 2026-07-02 19:50:40 -03:00 (auto, git pre-commit)
// useAuth.js — R6-06
// Estado de autenticacao centralizado + tratamento de sessao expirada.
// Resolve na fonte o bug da Rodada 5: token expirava, /api/* voltava 401 em
// loop silencioso, e nada avisava o usuario (dashboard "quebrado" sem motivo
// aparente). Aqui, 401 ou token expirado -> redireciona ao login com aviso.

import { useState, useEffect, useCallback } from 'react';
import { getToken, getPayload, isExpired, clearToken } from '../lib/tokenStore.js';
import { setUnauthorizedHandler } from '../lib/api.js';

// Rota de login do sistema. Centralizada aqui pra um lugar so decidir pra
// onde mandar quando a sessao cai.
const LOGIN_PATH = '/index.html';

export function useAuth() {
  // authed = ha token nao-expirado. user = payload decodificado (id, email, role).
  const [authed, setAuthed] = useState(() => !isExpired());
  const [user, setUser] = useState(() => getPayload());

  // Desloga: limpa token e manda pro login. flag opcional avisa que foi por
  // expiracao (o login pode mostrar "sua sessao expirou").
  const logout = useCallback((expired = false) => {
    clearToken();
    setAuthed(false);
    setUser(null);
    const q = expired ? '?expired=1' : '';
    window.location.href = LOGIN_PATH + q;
  }, []);

  // Liga o handler global de 401 do api.js a este hook. Qualquer apiFetch que
  // receba 401 dispara logout(expired) -- uma vez, sem loop.
  useEffect(() => {
    setUnauthorizedHandler(() => logout(true));
    return () => setUnauthorizedHandler(() => {}); // limpa ao desmontar
  }, [logout]);

  // Checagem proativa: se o token ja nasceu/ficou expirado, nao espera o
  // primeiro 401 -- manda pro login na hora. Revalida a cada 60s pra pegar
  // expiracao durante uso prolongado (o cenario exato de hoje).
  useEffect(() => {
    if (isExpired()) { logout(true); return; }
    const id = setInterval(() => { if (isExpired()) logout(true); }, 60000);
    return () => clearInterval(id);
  }, [logout]);

  return { authed, user, token: getToken(), logout };
}
