# PLANO PÓS-AUDITORIA — Fable Rodada 1

**Origem:** knowledge/AUDITORIA/07-FEEDBACK-AUDITOR/2026-07-07-FABLE-AUDIT-01.md
**Protocolo:** LAVE+F — um item por vez, teste antes de avançar, nunca em lote.

## FASE 0 — Aquecimento
- [x] 1. Quarentena mas/*.bak + .pre -> _arquivados/mas-baks/ (commit c960b5c)
- [x] 2. Drift do dossiê corrigido (00 e 05) (commit c960b5c)

## FASE 1 — Higiene da KB (CTXKBCLEAN01)
- [x] 3. Verificação prévia (nada referenciava BLOCO-* por nome)
- [x] 4. 139 BLOCO-* -> _arquivados/blocos-log/ (commit 776c26e)
- [x] 5. Lições cross-projeto (Baileys/XMonex/Next) -> _arquivados/licoes-xmonex/
      (commit 70ef5f4) + L-B109 generalizado p/ Vite/JSX, contexto corrigido
      (commit 4c3aa74)
- [ ] 6. Dedup L-B235 (2 arquivos, mesma lição) + frontmatter `projeto: orquestrai`
      em cada lição restante de knowledge/licoes/
- [ ] 7. loadKB() (mas/kb.cjs) filtra por `projeto:` quando o campo existir +
      corrige leitura dupla do arquivo (ler 1x, derivar score e body)

**PENDENTE (não bloqueia o resto):** rodar 1 run MAS de fumaça no dashboard
pra confirmar que a remoção dos itens 4-5 não quebrou loadKB() em produção.

## FASE 2 — Fundação Harness Score (mas_run_id)
- [ ] 8. Meta CTXMASRUNLINK01: decisão de contrato (mas_run_id só a partir de
      agora; execuções antigas ficam null permanentemente, sem backfill)
- [ ] 9. Frontend envia mas_run_id ao disparar /api/blocos/executar a partir
      de um run MAS em andamento
- [ ] 10. /api/mas/harness-score passa a refletir exec_success real via join

## FASE 3 — Segurança de infra (MÉDIO, sem urgência -- ver ADENDO do relatório)
- [ ] 11. oqterm: OQTERM_HOST 0.0.0.0 -> 172.18.0.1 + After=docker.service
- [ ] 12. nginx: log_format sem query string nos locations de SSE/terminal
      + truncar logs atuais depois de confirmado

## FASE 4 — Curadoria dos 9 agentes (CTXAGENTTRAIN01)
Pré-requisito: Fase 1 completa (KB limpa) -- CUMPRIDO nos itens 4-5.
Método: botão "Treinar" no agtPane (Opus sugere, humano aprova, nunca salva
sozinho) -- um agente por vez, diff revisado, 1 execução de teste antes do
próximo. NUNCA em lote.
- [ ] 13.1 scout   13.2 auditor   13.3 detetive   13.4 smith   13.5 guardian
- [ ] 13.6 memorialista   13.7 rel   13.8 metrico   13.9 revisor

---
**Próximo passo ao retomar:** item 6 (dedup + frontmatter), ou pular direto
pra Fase 4 se a prioridade for curadoria -- não há dependência dura entre
6-7 e 13, só ordem de prioridade recomendada.
