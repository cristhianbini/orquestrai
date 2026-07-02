# RODADA 6 — Refatoracao do Dashboard (React island) + Polish

**Registrado:** 2026-07-02
**Modelo de execucao:** Opus 4.8
**Objetivo:** matar a divida tecnica do dashboard.html (~4800 linhas de patches
empilhados) migrando para React island incremental (strangler fig), mantendo o
sistema 100% operante a cada passo. Resultado visual aparece cedo (sprint R6-04),
mas sobre fundacao segura -- nao repetir o erro de "polir base quebrada".

## Principio-guia (analogia da construcao)
Alicerce invisivel primeiro (build+dados), depois a primeira parede visivel
(topbar), depois estrutura (cards), depois limpeza do entulho (divida legada),
por fim o acabamento (polish). Cada sprint e independentemente deployavel:
terminar um sprint NUNCA deixa o sistema no meio de uma migracao quebrada.

## Convencao de nomes premium (definida no R6-02, aplicada em tudo)
frontend-vite/src/
  components/   -> componentes React (PascalCase: AgentCard.jsx)
  islands/      -> entrypoints de ilha (kebab: agent-panel.island.jsx)
  hooks/        -> logica reutilizavel (useSSE.js, useAuth.js, useMasRun.js)
  lib/          -> utilitarios puros (api.js, format.js, tokenStore.js)
  styles/       -> design tokens centralizados

---

## BLOCO A — Fundacao minima (invisivel, destrava tudo)
- [x] R6-01  build-island.sh: compila E copia dist-island->src/island automatico
             (fim da copia manual -- causa raiz do "editei e nao atualizou" de hoje)
- [x] R6-02  ARCHITECTURE.md: convencao de nomes premium documentada
- [x] R6-03  lib/api.js + lib/tokenStore.js: token centralizado (hoje espalhado
             em 9 lugares no dashboard)

## BLOCO B — Primeira vitoria visual (voce VE resultado)
- [ ] R6-04  Topbar em React (compacta, versao dinamica) -- 1a parede visivel
- [ ] R6-05  styles/tokens.css: design tokens centralizados (cores/espacos premium)

## BLOCO C — Hooks compartilhados (preparam multi-user do futuro)
- [x] R6-06  hooks/useAuth.js + interceptar 401->login (resolve UX de token
             expirado que travou o dashboard hoje)
- [x] R6-07  hooks/useSSE.js: um EventSource gerenciado (mata os 4 wrappers
             duplicados do legado)

## BLOCO D — Cards de agente (coracao, resolve o bug de hoje)
- [ ] R6-08  AgentCard.jsx isolado (componente premium por agente)
- [ ] R6-09  hooks/useMasRun.js: estado do run (preparado p/ multi-user)
- [ ] R6-10  Metricas no card (tokens/custo/modelo) -- CONSERTA o tk=null de hoje
             na fonte, nao com curativo
- [ ] R6-11  Score/harness no card + animacoes de estado (idle->running->done)

## BLOCO E — Limpeza da divida (cada item apaga bug de hoje)
- [ ] R6-12  Remover BLOG_MAS duplicado (2 declaracoes conflitantes)
- [ ] R6-13  Remover wrappers de EventSource empilhados
- [ ] R6-14  Remover MutationObserver pesado (observe document.body inteiro)
- [ ] R6-15  Tratar B94 (executar-sem-confirmar): decisao de seguranca --
             remover ou proteger (fura o modelo do CTXUNIFY01 hoje)

## BLOCO F — Polish + robustez (acabamento sobre base limpa)
- [ ] R6-16  Remover badges de debug e notas localStorage de producao
- [ ] R6-17  Responsividade dos cards
- [ ] R6-18  Acessibilidade (foco, contraste, teclado)
- [ ] R6-19  Fundacao multi-user: estrutura de sessao/permissao PREPARADA
             (nao ativada) -- alicerce p/ o futuro de equipes
- [ ] R6-20  Bateria de testes E2E: MAS vs individual, absorcao de KB
             (o CTXMASTEST01/CTXKBABSORB01 ja desejados)

---

## Criterio de fechamento por sprint
1. Codigo comentado explicando o PORQUE (nao so o que)
2. build-island.sh rodado + hash dist == src confirmado
3. Dashboard 100% operante (nada quebrado no fluxo real)
4. Divida legada correspondente APAGADA (quando aplicavel)
5. Tique no roadmap (X/20)
6. Licao em knowledge/licoes/ se houve aprendizado

## Itens da Rodada 5 que migraram/dependem
- CTXOQTERMHOOK01 (hook oqterm, revertido) -- sessao dedicada futura
- CTXAGENTSCORE01 -- depende do hook + captura de outcome
- CTXCLEANURL01 -- re-escopo (premissa mudou de C p/ B)
- CTXPIPELINE01, CTXRAG01 -- sessoes dedicadas (nao sao frontend)
