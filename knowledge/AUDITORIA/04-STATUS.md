# ★ STATUS — estado vivo

> **Este é o único arquivo que muda toda hora.** Atualizado a cada tarefa
> fechada. Se está desatualizado, os demais arquivos também podem estar — mas
> este é o pulso.

**Última atualização:** `2026-07-04 17:58`
**Commit de referência:** `86428a4`

---

## Onde estamos

- **Rodada 6**: 10 itens planejados (foco: polimento visual + testes),
  **0/10 feitos ainda** -- o trabalho real desta sessão foi segurança
  emergente, fora do escopo original, priorizado por conta do prazo da
  auditoria externa. Ver `roadmap.md`, seção "Segurança (emergente)" dentro
  da Rodada 6, para o registro completo.

## Fechado recentemente (segurança emergente, fora do plano original)

- **CTXUNIFY01-B (dedup)** -- `sendDirect` (botão B94) parou de duplicar a
  lógica de confirmação; agora chama `window.__b94Confirm` centralizado.
  Verificado: confirmar executa, cancelar bloqueia. Commit `86428a4`.
- **CTXUNIFY01-B (auditoria)** -- execuções via PTY root (`oqterm`) agora
  registram hash na cadeia de auditoria (endpoint `oqterm-log` que já
  existia no backend, órfão até então). Fire-and-forget, nunca bloqueia o
  terminal. Commit `db1d76e`.
- **R6-16.1 / CTXR616GAP01** -- 3 de 12 logs de debug do R6-16 tinham
  sobrevivido (contagem bruta de string confundia identificador de bloco
  com debug real). Corrigido + lição registrada. Commits `1b02515`, `eb66d96`.
- **R6-16** -- remoção de logs de debug e nota localStorage de produção.
  Console limpo para auditoria. Commit `6a0a7ea`.
- **R6-15** -- confirmação humana antes de executar no PTY root (2 portões
  unificados). Commit `160ebde`.
- **Sync dist-island** -- artefato buildado sincronizado com o source já
  commitado. Commit `2b39bc9`.
- **Painel de agentes React** -- animação de estado ao vivo (3 fixes).
  Commit `d2e1aad`.
- Fix do run_id estagnado em `useMasRun.js` (polling de 2s).
- Autenticação das 10 rotas MAS + `authMiddlewareSSE` via `?_t=`.
- Correção de proxy nginx (`/api/blocos` porta 8080 → 3000).

## Em andamento / próximo (os 10 itens reais da Rodada 6)

FÁCIL:
1. [ ] CTXTOPBAR01 -- Topbar mais compacta
2. [ ] CTXPROVANIM01 -- Animação suave ao trocar de aba (modal Providers)
3. [ ] CTXMESHTIP01 -- Tooltip de especialidade nos cards Mesh Network

MÉDIO:
4. [ ] CTXMESHPERF01 -- Cards com indicador de desempenho histórico
5. [ ] CTXAGTDASH01 -- Dashboard de métricas por agente
6. [ ] CTXQAFULL01 -- Regressão end-to-end
7. [ ] CTXMASTEST01 -- Cenários fixos MAS vs. chat individual

DIFÍCIL:
8. [ ] CTXKBABSORB01 -- Confirmar uso real de KB pelos agentes
9. [ ] CTXMODELCOMP01 -- Comparativo de modelos por posição
10. [ ] CTXALERTFAIL01 -- Alerta de falhas consecutivas por agente

Follow-ups adicionais (fora do checklist numerado):
- CTXEXECMODAL01 -- modal customizado substituindo confirm() nativo
- R6-14 -- remover MutationObserver pesado sobre document.body
- CTXMASRUNID01 -- push de run_id pelo pipeline (hoje: polling)
- CTXDEBUGFLAG01 -- wrapper DEBUG&&log() (em vez de remoção manual)
- CTXBLOCONUM01 (Meta) -- `# BLOCO-XXX` literal no prompt do agente smith
- CTXAGENTTRAIN01 (Meta) -- rodada de refinamento de prompts dos agentes

## Pendência técnica aberta neste momento

*(nenhuma pendência bloqueante)* -- nota de transparência: linhas antigas
(`origem=individual`) na tabela `execucoes` têm `prev_hash`/`chain_hash`
vazios (schema evoluiu depois que essas linhas existiam); a cadeia de hash
começa do `GENESIS` a partir do commit `db1d76e` -- não é regressão.

## Cronograma

Trabalho intensivo previsto para os próximos dois dias. Este STATUS será
atualizado ao fim de cada tarefa.
