# L-RATELIM02 — mas/routes.mjs: rate limit aplicado, achado novo de auth
PROJETO: orquestrai

**Data:** 2026-07-01
**Contexto:** CTXRATELIM02

## O que foi feito
7 rotas do mas/routes.mjs receberam rate limit diferenciado por
sensibilidade: /run (dispara pipeline, custo real) 5/min; leituras
(run/:id, last, models-last, harness-score) 30/min; /events/:id (SSE)
deliberadamente sem limite, pois quebraria o stream de eventos aberto.

## Achado durante a verificacao
Nenhuma das 7 rotas tem authMiddleware -- mesmo padrao do CTXAGENTAUTH01,
mas em escala maior aqui (inclui /run, que dispara custo real de API).
Nao corrigido nesta rodada -- registrado como CTXMASAUTH01 no roadmap,
seguindo disciplina de 1 problema por vez.

## Regra permanente
Ao adicionar rate limit num arquivo de rotas, sempre checar auth junto --
rate limit sem auth so limita QUANTIDADE de abuso, nao IMPEDE abuso.
