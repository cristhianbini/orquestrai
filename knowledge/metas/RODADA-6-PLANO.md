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
- [ ] R6-04  Topbar em React (compacta, versao dinamica) -- 1a parede visivel.
             NAO CONFUNDIR com CTXTOPBAR01 (feito 2026-07-04, commit
             d347b3b): aquele foi so CSS compactando o header legado
             (OQ16_PREMIUM); R6-04 continua pendente -- pede migracao real
             pra componente React, parte do strangler fig.
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
- [x] R6-15  Tratar B94 (executar-sem-confirmar): decisao de seguranca --
             remover ou proteger (fura o modelo do CTXUNIFY01 hoje).
             RESOLVIDO 2026-07-04: confirmacao humana centralizada
             (window.__b94Confirm) nos 2 portoes (oq71z-exec + B94
             sendDirect). Commit 160ebde.

## BLOCO F — Polish + robustez (acabamento sobre base limpa)
- [x] R6-16  Remover badges de debug e notas localStorage de producao.
             RESOLVIDO 2026-07-04: 12 pontos removidos (commit 6a0a7ea);
             3 sobreviventes corrigidos como R6-16.1/CTXR616GAP01 (commits
             1b02515, eb66d96 -- licao sobre contagem bruta de string vs.
             deteccao real de debug).
- [x] R6-16.2 (CTXUNIFY01-B)  Auditoria hash-chain conectada ao oqterm
             (endpoint ja existia, orfao) + dedup de sendDirect usando
             window.__b94Confirm centralizado. Commits db1d76e, 86428a4.
- [x] R6-16.3 (CTXAGTSCROLL01)  Auto-scroll inteligente ate o agente ativo
             no painel (stick-to-active, respeita rolagem manual). Commit
             d347b3b (nota: mesmo commit incluiu CTXTOPBAR01 por escopo
             amplo de git add; ver CTXGITADDSCOPE01 em knowledge/licoes/).
- [x] R6-16.4 (CTXAGTSTATUS01)  Reset de liveData ao detectar run nova do
             MAS -- corrige badges presos em "concluido" da run anterior.
             Commit 54f0f99.
- [ ] R6-17  Responsividade dos cards
- [ ] R6-18  Acessibilidade (foco, contraste, teclado)
- [ ] R6-19  Fundacao multi-user: estrutura de sessao/permissao PREPARADA
             (nao ativada) -- alicerce p/ o futuro de equipes
- [ ] R6-20  Bateria de testes E2E: MAS vs individual, absorcao de KB
             (o CTXMASTEST01/CTXKBABSORB01 ja desejados)

---

## BLOCO G -- Polimento visual + testes (fundido de roadmap.md em 2026-07-04)
Escrito originalmente como lista separada em roadmap.md (2026-07-02);
fundido aqui porque R6-20 ja citava CTXMASTEST01/CTXKBABSORB01 como
"ja desejados" -- eram o mesmo escopo, documentado em dois lugares
(ver knowledge/licoes/ para o registro do erro de reconciliacao e correcao).

- [x] CTXTOPBAR01     Topbar mais compacta (CSS, nao confundir com R6-04
                       acima). Commit d347b3b.
- [ ] CTXPROVANIM01   Animacao suave ao trocar de aba no modal Providers
- [ ] CTXMESHTIP01    Tooltip de especialidade nos cards Mesh Network
- [ ] CTXMESHPERF01   Cards Mesh Network com indicador de desempenho
                       historico (taxa de acerto, ultimas runs)
- [ ] CTXAGTDASH01    Dashboard de metricas por agente
- [ ] CTXQAFULL01     Regressao end-to-end (login+2FA, MAS run, verify-chain)
- [ ] CTXMASTEST01    3-5 cenarios fixos MAS vs. chat individual (= R6-20)
- [~] CTXKBABSORB01   Confirmar uso real de KB pelos agentes (= R6-20).
                       PARCIAL 2026-07-05: causa-raiz corrigida E confirmada
                       em producao, mas absorcao NAO confirmada por run (o
                       item pede "confirmar uso", nao "corrigir causa").
                       Causa: mas/kb.cjs:40 truncava o CORPO de cada licao
                       em 400 chars antes de injetar no prompt (top-5 por
                       score) -- KB chegava mutilada aos agentes. Corrigido
                       p/ 1500 (commit 548cde8, via CTXKBSHARE01 que extraiu
                       loadKB/STACK_CTX/loadManifesto p/ modulo compartilhado,
                       commit 18ad7f6). Em producao: StartedAt do container
                       58s apos o commit (timing verificado).
                       FECHA COMO [x] QUANDO: 1 run de evidencia mostrar um
                       agente citando conteudo de licao alem dos 400 chars
                       antigos. Ver knowledge/licoes/L-CTXHANDOFFVERIFY01.md.
- [ ] CTXMODELCOMP01  Comparativo de modelos por posicao
- [ ] CTXALERTFAIL01  Alerta de falhas consecutivas por agente

---

## Backlog estrategico (Metas) -- vive em knowledge/metas/, fora do escopo da R6
Meta = pedido NOVO fora do sprint atual (taxonomia do Escopo v6.0); so vira
Pendencia quando entra num sprint. NAO copiadas aqui de proposito -- duplicar
a lista criaria fonte dupla que desincroniza (mesma divida que fez o
roadmap.md virar indice). Cada META-*.md em knowledge/metas/ e uma meta.
Fonte da verdade para enumerar o backlog atual:
    ls -1 knowledge/metas/META-*.md
Nota: knowledge/metas/ NAO e vigiado pelo roadmap-autosync -- criar/editar
uma meta exige git add/commit manual (o autosync cobre licoes/, roadmap.md,
changelog.md, nao metas/).

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

### Achado pre-existente (nao bloqueia R6-13)
- insertBefore NotFoundError em dashboard.html:1231 (funcao 'build'): erro
  PRE-EXISTENTE, confirmado independente do R6-13.2 (persiste apos SyntaxError
  resolvido). Investigar em sub-sprint futuro. favicon.ico 404 = cosmetico.

### R6-13.4 progresso
- [x] R6-13.4.1  hook __masxWrapped removido (.masx-card fantasma)
- [x] R6-13.4.2  hook origES removido (cards legados fantasma)
- [x] R6-13.4.3  hook __B187_WRAP (L2990) -> alimenta paint(); confirmar se e React ou legado ANTES
- [ ] R6-13.5.x  containers mortos: #agentes-legacy-unused, #masx-cards, #agentes+paintAg (migracao)

### Ideia visual futura (Score) — sugerida 2026-07-03
ScoreMeter hoje fica apagado (sem score por agente). Ideia do Bini: dar uma
leve animacao/cor de repouso nas barrinhas mesmo sem dado (shimmer sutil ou
gradiente estatico), pra nao parecer "morto". Fica pro polish visual (Bloco F)
ou pra quando o score por agente existir (ver PENDENCIA DE PRODUTO).
