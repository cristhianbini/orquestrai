# L-AGENTAUTH01 — Endpoint sem auth encontrado durante CTXRATELIM01, corrigido

**Data:** 2026-07-01
**Contexto:** CTXAGENTAUTH01

## O que foi corrigido
POST /api/agents/create (server.js) nao tinha authMiddleware. Unico
chamador (dashboard.html, tela Novo Agente) tambem nao mandava token no
fetch -- os dois lados precisaram ser corrigidos juntos, senao travar so
o backend quebraria a criacao de agente pela tela normal.

## Verificacao usada
curl sem token -> 401 confirma protecao ativa (antes do patch, teria
passado). Teste real na tela apos hard refresh confirma que o token
(variavel global TOKEN, ja preenchida via oqGetAuthToken()) segue junto
sem quebrar o fluxo visivel.

## Regra permanente
Ao adicionar auth num endpoint que ja tem chamador real no frontend,
sempre checar E corrigir os dois lados na mesma rodada -- nunca travar
so o backend sem confirmar que o frontend ja manda o token esperado.
