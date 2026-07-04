# ★ STATUS — estado vivo

> **Este é o único arquivo que muda toda hora.** Atualizado a cada tarefa
> fechada. Se está desatualizado, os demais arquivos também podem estar — mas
> este é o pulso.

**Última atualização:** `2026-07-04 06:09`
**Commit de referência:** `6a0a7ea`

---

## Onde estamos

- **Rodada 6** em andamento (~15 itens concluídos, ~13 pendentes).

## Fechado recentemente

- **R6-16** — remoção de logs de debug e nota localStorage de produção
  (12 pontos de debug puro removidos; console limpo para auditoria).
  Preservados os `console.error/warn` legítimos e `badge()` de feedback ao
  usuário. Commit `6a0a7ea`.
- **R6-15** — confirmação humana antes de executar no PTY root (2 portões
  unificados). Commit `160ebde`.
- **Painel de agentes React** — animação de estado ao vivo (3 fixes).
  Commit `d2e1aad`.
- Fix do run_id estagnado em `useMasRun.js` (polling de 2s substituindo busca
  única no mount).
- Autenticação das 10 rotas MAS + `authMiddlewareSSE` via `?_t=`.
- Correção de proxy nginx (`/api/blocos` apontava para porta morta 8080 →
  corrigido para 3000).

## Em andamento / próximo

Ordem de prioridade recomendada para o restante da Rodada 6:

1. **CTXEXEC01** — unificar caminhos de execução (`execBloco` protegido vs.
   caminho interativo do `oqterm`).
2. **CTXEXECMODAL01** — modal customizado substituindo `confirm()` nativo.
3. **R6-14** — remover o `MutationObserver` pesado sobre `document.body`.
4. UI / acessibilidade / multiusuário / E2E.

## Pendência técnica aberta neste momento

- `frontend-vite/dist-island/agent-panel-island.js` + `style.css` estão
  **modificados e não commitados** — rebuild da ilha que já incorpora o polling
  2s e as melhorias visuais de badge/estado `done`. O **source correspondente
  já está commitado**; falta só verificar no browser (Ctrl+Shift+R) e commitar o
  artefato para sincronizar. **Baixo risco**, mas está servido ao vivo.

## Cronograma

Trabalho intensivo previsto para os próximos dois dias. Este STATUS será
atualizado ao fim de cada tarefa.
