# META FUTURA — Numeração real nos blocos gerados (CTXBLOCONUM01)

**Status:** backlog, nao iniciado
**Registrado:** 2026-07-04
**Origem:** observacao do Bini durante sessao de seguranca/qualidade

## Problema
O prompt do agente `smith` (mas/agents.mjs) instrui: "terminar com echo
===== fim BLOCO-XXX =====" -- literal, nunca substituido por numero real.
Blocos sem tarefa catalogada previamente sempre mostram "BLOCO-XXX" no
comentario final, mesmo quando o cabecalho da UI mostra um numero real
(ex: #109, #110 -- contador de sessao, sistema diferente).

## Ideia
Injetar no contexto do prompt do `smith` o proximo numero sequencial real
(o mesmo contador que gera knowledge/blocos/BLOCO-NNN-*.md), trocando a
regra fixa por `echo ===== fim BLOCO-${numero_real} =====`.

## Por que nao agora
Exige tocar no prompt de geracao de blocos (mas/agents.mjs) -- fora do
escopo de seguranca/qualidade da sessao atual. Baixo risco, mas merece
rodada propria de ajuste fino de prompts (ver CTXAGENTTRAIN01).
