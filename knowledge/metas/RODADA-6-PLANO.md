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
- [x] R6-08  AgentCard.jsx isolado (componente premium por agente)
- [x] R6-09  hooks/useMasRun.js: estado do run (preparado p/ multi-user)
- [x] R6-10  Metricas no card (tokens/custo/modelo) -- CONSERTA o tk=null de hoje
             na fonte, nao com curativo
- [x] R6-11  Score/harness no card + animacoes de estado (idle->running->done)

## BLOCO E — Limpeza da divida (cada item apaga bug de hoje)
- [x] R6-12  Remover BLOG_MAS duplicado (2 declaracoes conflitantes)
- [~] R6-13 (em progresso: .2 de 5 sub-sprints)  Remover wrappers de EventSource empilhados
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

---

## PENDENCIA DE PRODUTO — Score por agente (levantada no R6-11, 2026-07-02)
O ScoreMeter do AgentCard espera `live.score` POR AGENTE, mas essa fonte NAO
existe. O backend so tem harness-score POR RUN (/api/mas/harness-score,
formula 0.4*exec_success + 0.3*guardian_pass + 0.3*cost_score). Antes de
virar codigo, precisa de DECISAO DE PRODUTO: o que e "score de um agente"?
Taxa de sucesso das suas execucoes? Contribuicao pro resultado do run?
Nao e so destravar o CTXAGENTSCORE01 -- e definir a metrica primeiro.
Ideia do usuario (Rodada 5) a considerar: pontuar agente por features
repetidas sem sucesso (nao "marcou gol" -> candidato a troca de modelo).
Enquanto indefinido, ScoreMeter renderiza "sem dados" (honesto).

---

## PONTO DE PARADA — R6-13 (registrado 2026-07-02, fim de sessao longa)
R6-12 fechado: BLOG_MAS removido (quarentena em _arquivados/), cards React
100% funcionais confirmado no navegador. 12/20.

R6-13 (remover wrappers de window.EventSource) NAO iniciado -- e a cirurgia
mais delicada da rodada, adiada de proposito pra sessao fresca. Motivo:
sao 5 wrappers (__b332 L777, __b334 L835, __masxWrapped L2701, __B187_WRAP
L3008, origES L3711) ENTRELACADOS com 3 conexoes SSE VIVAS (L1505, L2733,
L2989) e com CSS/modais/window.MASX/window.OQ46Y. Nao sao blocos isolados.

INVESTIGACAO OBRIGATORIA antes de remover qualquer wrapper (proxima sessao):
1. Os cards legados .oq46y-card ainda estao no DOM, ou o AgentPanel React ja
   e o unico painel? (decide se quem os alimenta pode morrer)
2. window.MASX e usado por algo ainda renderizado?
3. Cada wrapper sobrescreve window.EventSource GLOBAL -> afeta o useSSE do
   React tambem. Remover pode ate CORRIGIR bugs sutis do React, mas exige
   testar o painel React apos cada remocao.
Abordagem: 1 wrapper por vez, quarentena, Ctrl+Shift+R e confirmacao visual
entre cada um. Nunca em lote.

### R6-13 progresso (fracionado)
- [x] R6-13.1  Investigacao: #agentes esta display:none (cards legados = fantasmas).
               3 wrappers reais restantes: L2693 (__masxWrapped), L3014 (__B187_WRAP),
               L3702 (origES). onEvt/onCost so alimentam o container invisivel.
- [x] R6-13.2  Removidos hooks __b332 + __b334 (alimentavam #agentes invisivel).
               onEvt/onCost ficaram orfaos (sem chamador) -> saem no R6-13.3.
               setIdle preservado (usado por init).
- [ ] R6-13.3  Remover funcoes orfas onEvt/onCost/paintAg + avaliar __masxWrapped (L2693)
- [ ] R6-13.4  Avaliar/remover __B187_WRAP (L3014)
- [ ] R6-13.5  Avaliar/remover origES (L3702)
