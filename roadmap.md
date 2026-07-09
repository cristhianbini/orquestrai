
## Absorvido do Plano Mestre CBini v3.0 (2026-07-09) — SO padroes, NUNCA stack
Fonte de inspiracao classificada como NAO-CANONICA no PROTOCOLO-ANTICONTAMINACAO
(Cloud Run/Supabase/Lovable NAO se aplicam ao OrquestrAI). O que transfere:

### MEDIO
- [ ] CTXDNA01 (=S21) — DNA de projeto: ESTENDER o project.json existente
      (CTXPROJPERSIST01) com blocos modules:{} e infra:{} — nao criar formato
      novo. Inspiracao: cbini.config.ts do Plano Mestre (arquivo unico tipado).
- [ ] CTXIMPORT01 (parte de S25) — Import GitHub COMO PROJETO: repo via URL
      vira projects/{slug}/ + project.json. DISTINTO do CTXRAG01 (que so
      indexa na KB, nao cria projeto). Nao fundir os dois numa rota.
      UX de referencia: checklist de boas-vindas + resumo final (§7.2 do Plano).
- [ ] CTXOPSCHECK01 — Checklist operacional formal (semanal/mensal/trimestral)
      em knowledge/decisoes/. Item ja urgente: TESTE DE RESTORE do Litestream
      (backup continuo roda desde CTXLITESTREAM01, restore NUNCA testado —
      risco classificado Alto/Critico). Trimestral obrigatorio apos 1o teste.

### PRINCIPIO DE DESIGN (p/ quando S20 for desenhado)
- Gatilho duro de promocao por projeto (padrao §2 do Plano): container isolado
  so quando projeto tiver >=N execucoes reais via /api/mas/run OU humano marcar
  status:'producao' no project.json. Nunca container-por-padrao no wizard.

### RECONCILIACAO DE NUMERACAO
- S20/S21/S25 (citados em CTXPROJSCREEN01/handoffs) nao tinham espelho formal
  aqui. Mapeamento: S20=container isolado (ja em "Distante"), S21=CTXDNA01,
  S25=CTXIMPORT01+CTXRAG01. Usar codigos CTX* daqui em diante.
