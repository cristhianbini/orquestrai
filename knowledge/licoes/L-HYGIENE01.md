# L-HYGIENE01 — blocosRoutes.cjs "duplicado" e mount intencional

**Data:** 2026-07-01
**Contexto:** CTXHYGIENE01

## Esclarecimento (nao e bug)
/app/blocosRoutes.cjs e /app/api/blocosRoutes.cjs sao o MESMO arquivo
fisico (./api/blocosRoutes.cjs no host), montado 2x no docker-compose.yml
de proposito: uma vez como parte da pasta /app/api inteira, outra vez
isolado em /app/blocosRoutes.cjs porque server.js faz
require('./blocosRoutes.cjs') relativo a raiz do container.
Mesmo padrao ja visto hoje com providers.cjs (CTXSECRETS01).

## Decisao
Nao mexer -- funciona corretamente, so estava mal documentado. Registrado
aqui para nunca mais aparecer como "achado suspeito" numa auditoria futura.

## O que foi limpo de verdade
knowledge/agentes/ (auditor/critic/executor/planner/researcher/voice) --
zero referencia no codigo, arquivado em _arquivados/, nao deletado.
