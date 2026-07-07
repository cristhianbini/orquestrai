# L-SKILL01 — AGENT_CARD ja existia, faltava so completar os titulares
PROJETO: orquestrai

**Data:** 2026-07-01
**Contexto:** CTXSKILL01

## Achado
Ja existia todo um sistema (server.js: gera card no wizard "Novo Agente",
GET /api/agents/cards: le knowledge/agents/AGENT_CARD-*.md) -- so 3 dos
9 titulares tinham card (scout, detetive, smith). Faltavam 6.

## O que foi feito
Completados os 6 cards restantes (auditor, guardian, memorialista, rel,
metrico, revisor), usando: role real de mas/agents.mjs (nao generalizado),
telemetria real de mas_event (custo/tokens medios por agente), e mesmo
formato/tom dos 3 ja existentes. Nenhum numero inventado -- revisor ficou
com telemetria null (agente novo desde CTXREVISOR01, sem historico ainda).

## Verificacao
GET /api/agents/cards ja retornou os 9 automaticamente, sem restart nem
patch de codigo -- confirma que o endpoint le do disco diretamente.

## Regra permanente (reforça padrao ja visto varias vezes hoje)
Antes de "criar" qualquer feature, buscar se ja existe peça parcial
(grep pelo texto que apareceria na UI, nao so pelo nome tecnico). Achado
de hoje: server.js:378 tinha 'bom_em'/'ruim_em' -- termos da INTERFACE,
nao um nome de funcao obvio de adivinhar.
