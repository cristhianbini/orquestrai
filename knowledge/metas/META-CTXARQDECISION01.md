# META FUTURA — Memorialista registra decisoes arquiteturais formais (CTXARQDECISION01)

**Status:** backlog, nao iniciado -- prioridade mais alta das 4 desta RFC
**Registrado:** 2026-07-05
**Origem:** RFC de terceira IA (conversa externa do Bini), filtrada e adaptada por Claude

## Problema
Decisoes de arquitetura importantes hoje ficam dispersas em conversas de
chat -- sem registro permanente e pesquisavel. knowledge/licoes/ registra
erros e correcoes; nao existe um formato equivalente pra decisoes
deliberadas (nao motivadas por bug).

## Objetivo
Expandir a saida do agente MEMORIALISTA (hoje registra resumo de
conversa/run) para também produzir registros de decisao arquitetural
formal, no formato:

  Decisao: [o que foi decidido]
  Motivo: [por que]
  Alternativas analisadas: [o que foi descartado e por que]
  Impactos: [o que muda]
  Data / Responsavel

## Por que prioridade alta
Baixo risco -- o agente ja existe, e so uma categoria nova de saida dele,
nao um sistema novo. Complementa knowledge/licoes/ sem substituir.

## Nao depende de nada dos outros 3 itens desta RFC -- pode comecar
independente, quando houver janela.
