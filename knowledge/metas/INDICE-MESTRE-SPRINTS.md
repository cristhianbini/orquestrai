# ÍNDICE MESTRE — Fila única de sprints (rolling wave)

**Criado:** 2026-07-07 (Fable 5) | **Regra:** este arquivo ORDENA, não descreve.
Detalhe de cada item vive na sua fonte (RODADA-6-PLANO, PLANO-POS-AUDITORIA,
META-*.md). Ao fechar um sprint: marcar aqui + na fonte. Reordenar S6+ é
esperado e saudável; S1-S5 só reordenar com motivo registrado.

## PRÓXIMOS 5 (detalhados, executáveis já)
- [x] S1  Itens 6-7 pós-auditoria (dedup L-B235 + frontmatter projeto: + filtro loadKB)
- [x] S2  Fase 2 pós-auditoria completa (8→9→10: mas_run_id + harness real)
- [x] S3  Fase 3 pós-auditoria (11-12: oqterm bind + nginx sem query string)
- [~] S4  Curadoria 6/9: ...guardiao✅memorialista✅ | falta RELATOR METRICO REVISOR (3)
- [ ] S5  R6-13.3→13.5.x: wrappers EventSource + containers-fantasma (fecha Bloco E)

## FILA ORDENADA (títulos; detalhar ao chegar)
- [ ] S6   R6-14 MutationObserver pesado (junto com S5 se a cirurgia permitir)
- [ ] S7   CTXTEAMROSTER01 (absorve CTXMODELCOMP01) — depende de S2
- [ ] S8   CTXALERTFAIL01 + CTXAGTDASH01 — dependem de S2/S7 (dado real)
- [ ] S9   R6-04 + R6-05 (Topbar React + design tokens — Bloco B)
- [ ] S10  CTXTOPBARCONSIST01 (junto com S9, mesma região)
- [ ] S11  R6-17 + R6-18 (responsividade + acessibilidade)
- [ ] S12  CTXPROVANIM01 (polish, só depois do estrutural)
- [ ] S13  R6-20/CTXMASTEST01 + CTXKBABSORB01 evidência final + CTXQAFULL01 (testes E2E)
- [ ] S14  CTXBLOCONUM01 + CTXBLOCODOC01 (qualidade dos blocos gerados)
- [ ] S15  CTXFICHA01 (cabeçalhos padrão)
- [ ] S16  CTXARQDECISION01 (Memorialista registra decisões formais)
- [ ] S17  CTXMASRUNID01 push via SSE (mata polling 2s — resposta Frente 2 Q4 do relatório)
- [ ] S18  CTXEXECMODAL01 (modal custom no lugar de confirm())
- [ ] S19  R6-19 fundação multi-user (preparada, não ativada)
- [ ] S20  CTXPROJISO01 (isolamento por container — abre a porta da visão longa)
- [ ] S21  CTXPROJDNA01 — depende de S20
- [ ] S22  CTXGOVAGENT01 — decisão pertence ao S4, reavaliar depois dele
- [ ] S23  CTXCOMMENTPASS01 (releitura+comentário do código-base — "fim de projeto")
- [ ] S24  CTXDNABASE01 (plataforma base multi-projeto — baixa prioridade declarada)
- [ ] S25  Visão longa: seam de deploy + scaffold containerizado (ver META-AUDITORIA-FABLE)

## RECONCILIAÇÕES (fonte dupla eliminada)
- CTXMASTEST01 = R6-20 (já declarado no plano R6) → vivem em S13
- CTXMODELCOMP01 absorvida por CTXTEAMROSTER01 → S7
- CTXAGENTTRAIN01 = item 13 pós-auditoria → S4
- META-CTXAGTUNIFY01: CONCLUÍDA (commit 62dac7e) — atualizar status no arquivo
