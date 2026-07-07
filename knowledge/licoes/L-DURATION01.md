# L-DURATION01 — Banco correto do MAS é blackboard.db
PROJETO: orquestrai

**Data:** 2026-07-01
**Contexto:** CTXDURATION01 — migration de duration_ms em mas_event

## Erro cometido
Rodamos migration em data/cluster.db porque o chat1.md dizia
"Banco: SQLite /var/www/orquestrai/data/cluster.db". A migration
"funcionou" mas a tabela mas_event não existia lá — sistema ficou
quebrado por 2 rodadas.

## Causa raiz
Documentação (chat1.md) desatualizada. O código real diz:
- mas/agents.mjs: DB_PATH='/app/data/blackboard.db'
- mas/routes.mjs: '/app/data/blackboard.db'
- server.js: data/cluster.db (apenas execucoes/2FA)

## Mapa correto dos bancos
| Arquivo        | Tabelas           | Usado por             |
|----------------|-------------------|-----------------------|
| blackboard.db  | mas_event,mas_run | MAS (agents + routes) |
| cluster.db     | execucoes         | server.js (chat/API)  |
| orquestrai.db  | (2FA)             | server.js linha 90    |

## Regra permanente
Antes de qualquer migration:
  grep -rn "new Database|DB_PATH" no arquivo que usa a tabela alvo.
Nunca confiar em documentacao sem checar o codigo.
