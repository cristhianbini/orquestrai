# CLAUDE.md — api/

Módulos `.cjs` do backend. Montados pelo `server.js` da raiz (ESM) via
`createRequire`, cada um passando `(app, requireAuth)`. Ver `../CLAUDE.md` para regras gerais.

## Antes de adicionar/editar uma rota
- **Confirme a ASSINATURA do arquivo** — cada `.cjs` pode ter padrão diferente:
  `module.exports = function(app, requireAuth){...}` (ex: blocosRoutes.cjs) vs router.
  Presumir o padrão de outro arquivo já quebrou produção (L-AUDIT01). grep `module.exports` primeiro.
- `requireAuth` é o `authMiddleware` real do server.js (faz `jwt.verify`). Use-o em toda rota
  que precisa de auth. Conte chamadores no frontend antes de trancar uma rota já usada (L-CTXMASAUTH01).
- Rotas Express: específicas ANTES do fallback 404 (L-router-mount-ordem).

## Órfãos / não confundir
- **`api/server.js` é FANTASMA** — mount removido (commit 50d67f9), arquivo ficou no disco.
  Não é usado. O servidor real é `../server.js`. Não editar este.
- `api/blocosRoutes.cjs` é montado 2x de propósito no compose (mount intencional, L-HYGIENE01).
- Dezenas de `.bak-*` aqui são gitignored — não são código vivo.

## Editar = restart
Estes arquivos são bind-mount `:ro` no container. Após editar: `docker restart orquestrai-api`
+ `node --check` antes. Sem run MAS ativa no momento do restart (checar blackboard.db).

## Segurança recente
`blocosRoutes.cjs` `/api/blocos/:id/stream` foi corrigido em 2026-07-11 (jwt.verify real, OQ-58a).
Padrão de referência para auth via `?_t=` em SSE: `../mas/auth.mjs` (authMiddlewareSSE).
