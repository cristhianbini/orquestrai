// ATUALIZADO: 2026-07-02 19:05:42 -03:00 (auto, git pre-commit)
// CTXMASAUTH01 (2026-07-02): modulo de autenticacao compartilhado para as
// rotas do MAS (mas/routes.mjs). Ate hoje essas 10 rotas nao tinham NENHUMA
// verificacao de identidade -- qualquer pessoa na internet podia disparar
// /run (custo real de API) ou aprovar/rejeitar licoes da KB. Achado durante
// a Rodada 5, ver knowledge/licoes/L-CTXMASAUTH01.md para o historico completo.
//
// Por que um arquivo separado em vez de reusar o authMiddleware do server.js:
// server.js ja tem sua propria copia funcionando em producao (rotas de
// conversations, retention, etc). Consolidar as duas copias numa so e o
// ideal a longo prazo (evita 2 lugares pra manter a mesma logica de
// seguranca), mas decidimos NAO tocar em server.js nesta rodada -- e codigo
// critico que ja funciona, e nao valia o risco extra logo depois do
// incidente do oqterm na mesma sessao. Este arquivo fica dentro de mas/
// (pasta ja montada como volume live no container) para nao precisar mexer
// no docker-compose.yml nem recriar o container.
//
// Usa a MESMA variavel JWT_SECRET do .env que server.js ja usa -- tokens
// emitidos por um sao validos no outro automaticamente, sem sincronizacao manual.

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  // Falha ALTA (loga erro grave), nao falha silenciosa. Diferente do
  // fallback hardcoded que existe em server.js (JWT_SECRET || 'orquestrai-secret-2025')
  // -- aqui preferimos deixar claro no log que a auth do MAS esta comprometida
  // em vez de rodar "funcionando" com um segredo previsivel.
  console.error('[CTXMASAUTH01] FATAL: JWT_SECRET ausente no ambiente -- rotas do MAS nao conseguem validar tokens.');
}

// Auth padrao (header "Authorization: Bearer <token>") -- usar em toda rota
// normal (GET/POST) que NAO seja Server-Sent Events.
export function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token obrigatorio.' });
  }
  try {
    req.user = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalido.' });
  }
}

// Auth via query param (?_t=<token>) COM verificacao real de assinatura.
// Existe separado do authMiddleware acima porque o EventSource nativo do
// navegador NAO permite mandar headers customizados (limitacao do proprio
// browser) -- por isso /events/:id (SSE) precisa do token na URL.
//
// IMPORTANTE: isso e diferente (e mais seguro) que o padrao similar que
// existe hoje em api/blocosRoutes.cjs (/api/blocos/:id/stream), que aceita
// qualquer string nao-vazia como token valido (tem um TODO reconhecendo o
// bug, nunca corrigido -- fora do escopo desta rodada, registrado como item
// futuro). Aqui chamamos jwt.verify de verdade.
export function authMiddlewareSSE(req, res, next) {
  const tk = req.query._t || (req.headers.authorization || '').replace(/^Bearer\s+/, '');
  if (!tk) return res.status(401).end();
  try {
    req.user = jwt.verify(tk, JWT_SECRET);
    next();
  } catch {
    return res.status(401).end();
  }
}
