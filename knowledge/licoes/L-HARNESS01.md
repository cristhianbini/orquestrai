# L-HARNESS01 — execucoes.mas_run_id nunca preenchido na pratica

**Data:** 2026-07-01
**Contexto:** CTXHARNESS01

## Achado
Coluna mas_run_id existe no schema de execucoes e na lista de colunas do
INSERT (api/blocosRoutes.cjs:124), mas depende de req.body.mas_run_id --
nada no frontend envia esse valor. 16/16 execucoes reais tem NULL.

## Impacto
Harness Score v1 nao pode usar join entre execucoes (cluster.db) e
mas_event/mas_run (blackboard.db). Calculado so com dados do blackboard.db.
human_approve (sinal do 👍/👎 CTXFEEDBACK01) fica fora da formula ate a
ponte existir (CTXPROVBRIDGE01).

## Regra permanente
Antes de desenhar qualquer formula/relatorio que combine 2+ tabelas,
confirmar com COUNT() que a coluna de join tem dado real, nao so schema.
Coluna existir != dado existir.
