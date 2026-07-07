# L-MASAUTH01 — CTXMASAUTH01 requer coordenacao com 7+ pontos do frontend
PROJETO: orquestrai

**Data:** 2026-07-01
**Contexto:** CTXMASAUTH01

## Achado
mas/routes.mjs tem 7 rotas sem auth. dashboard.html chama essas rotas
em pelo menos 9 lugares diferentes (2x /models-last, 2x /run, 2x /last,
3x EventSource pra /events/) -- so 1 desses 9 ja manda Authorization.

## Decisao
Revertido o patch de auth. Diferente do CTXAGENTAUTH01 (1 chamador, facil
coordenar), aqui sao 7+ pontos espalhados no dashboard.html -- arquivo
que ja causou 2 incidentes hoje. Corrigir precisa de sessao dedicada,
mapeando TODOS os 9 pontos antes de qualquer patch, nao ir ajustando
um de cada vez em producao.

## Regra permanente
Antes de adicionar auth num endpoint, contar quantos chamadores reais
existem no frontend (nao so 'existe adicao/checagem'). 1 chamador =
seguro corrigir na hora. 3+ chamadores espalhados = merece mapeamento
completo antes de qualquer patch, para nao fazer deploy parcial quebrado.
