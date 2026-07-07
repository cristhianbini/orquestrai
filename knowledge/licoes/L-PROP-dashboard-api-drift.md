# L-PROP-dashboard-api-drift
PROJETO: orquestrai

_Auto-promovida por Guardian em 2026-06-27T20:35:40.318Z_

ID: L-PROP-dashboard-api-drift
TITULO: Diagnóstico de Drift API entre Frontend (Dashboard) e Backend
CONTEXTO: Ao investigar erros de 404 ou dados ausentes no Frontend (Dashboard), verifica-se que o Back-end está operacional.
REGRA: Auditar chamadas `fetch` ou `axios` no Frontend (`/src/components`) contra as definições de rotas (`router.get/post`) no Back-end (`/routes`) para identificar se o Frontend está tentando acessar endpoints obsoletos ou de versões antigas (ex: `/api/v1/...` vs `/api/metrics/...`).
EVIDENCIA: BLOCO-67
