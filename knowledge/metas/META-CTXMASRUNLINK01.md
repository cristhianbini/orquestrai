# META — Vinculo execucoes <-> mas_run (CTXMASRUNLINK01)
PROJETO: orquestrai
**Status:** decisao tomada 2026-07-07 (S2 do INDICE-MESTRE); implementacao = itens 9-10
**Origem:** achado A3 da auditoria Fable (relatorio 07-FEEDBACK-AUDITOR/2026-07-07)

## Contrato decidido
1. Todo bloco disparado A PARTIR de uma run MAS envia `mas_run_id` no body
   do POST /api/blocos/executar (o endpoint JA aceita e persiste; o elo
   faltante e o chamador -- confirmado em blocosRoutes.cjs:124).
2. Blocos manuais/individuais continuam com mas_run_id = null (correto,
   distingue origem).
3. SEM BACKFILL: execucoes anteriores a esta data ficam null PARA SEMPRE
   (o vinculo nao e reconstituivel apos o fato). Consequencia: o Harness
   Score completo mede "a partir de agora", nao o historico -- qualquer
   leitura do score deve deixar isso claro.
