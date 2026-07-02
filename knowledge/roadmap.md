---
documento: roadmap
mantido_por: humano+ia
ultima_atualizacao: 2026-07-01
status: vivo (watcher v3 testado 04:35:11)
---

> **Como ler este documento:** 3 categorias com significado diferente.
>
> - **🔵 Rodada Ativa** = trabalho comprometido, ordem definida, sendo executado agora.
> - **🟡 Achados Pendentes** = problemas descobertos no meio do trabalho (não
>   estavam no plano original), aguardando decisão sobre quando entrar numa rodada.
> - **🟢 Metas Futuras** = ideias/desejos registrados, sem timeline, sem
>   compromisso de execução até serem promovidos para uma rodada.
>
> Histórico superado (planejamento antigo nunca sincronizado com a execução
> real) fica em 📦 Arquivado, no final — não confiar em checkboxes lá.

## 📊 Status do ciclo de sprints

**Rodada 5 (ativa) -- 5/10 concluídos, 5 restantes.**

| # | Item | Status |
|---|---|---|
| 1 | CTXPROVBRIDGE01 | ✅ Concluído |
| 2 | CTXMASAUTH01 | ⬜ Escopo mapeado, aguardando sessão dedicada |
| 3 | CTXHYGIENE01 | ✅ Concluído (1 sub-item adiado por decisão sua: `ADMIN_PASSWORD`) |
| 4 | CTXCLOUDFLARE01 | ✅ Concluído |
| 5 | CTXUNIFY01 | ⬜ Decisão de arquitetura pendente (precisa de você presente) |
| 6 | CTXAGENTSCORE01 | ⬜ Bloqueado pelo item 5 |
| 7 | CTXVITE02 | ✅ Concluído |
| 8 | CTXCLEANURL01 | ⬜ Depende do item 5 (CTXUNIFY01) |
| 9 | CTXPIPELINE01 | ⬜ Não iniciado |
| 10 | CTXRAG01 | ⬜ Não iniciado |

**Sessão de polish visual (2026-07-01, fora da contagem formal da Rodada 5,
trabalho real concluído):** ver seção dedicada mais abaixo.

**Histórico:** Rodada 1 ✅ · Rodada 2 ✅ 9/10 (ver `chat1.md`) · Rodada 3 ✅
10/10 · Rodada 4 ✅ 10/10 (CTXVITE02 iniciado ali, fechado na Rodada 5)

**Regra permanente:** ao fechar 10/10 de qualquer rodada, a próxima rodada
de 10 é planejada automaticamente antes de aguardar novo pedido do humano.

---

## 🔵 Rodada Ativa (Rodada 5, iniciada 2026-07-01)

1. [x] **CTXPROVBRIDGE01** -- Investigado. NÃO era bug: todos os 16 registros
   de `execucoes` são origem='individual' (chat comum). O código já manda
   `mas_run_id` corretamente quando o BLOCO vem do MAS -- só nunca houve
   amostra real pra confirmar. Sem ação de código necessária. (ver L-PROVBRIDGE01)

2. [ ] **CTXMASAUTH01** -- Tentado e **revertido**. Escopo real descoberto:
   não é 1 chamador (como CTXAGENTAUTH01), são **9 pontos** espalhados no
   dashboard.html chamando as 7 rotas de `mas/routes.mjs` sem token (2x
   /models-last, 2x /run, 2x /last, 3x EventSource /events/). Precisa de
   sessão dedicada mapeando os 9 pontos antes de qualquer patch no backend,
   não ajuste incremental em produção. (ver L-MASAUTH01)

3. [x] **CTXHYGIENE01** -- Concluído:
   - [x] `knowledge/agentes/` (pastas mortas, nomenclatura divergente dos 9
     titulares reais, zero uso no código) arquivado em `_arquivados/`
   - [x] Esclarecido: `blocosRoutes.cjs` "duplicado" é mount intencional do
     Docker Compose (mesmo padrão do `providers.cjs`), não é bug
   - [ ] `ADMIN_PASSWORD` real no `.env` -- **decisão do usuário, adiada de
     propósito**. Senha antiga (`OrquestrAI@2025`) continua ativa como
     fallback até a troca acontecer.

4. [x] **CTXCLOUDFLARE01** -- Concluído. Widget Turnstile na tela de login,
   tema escuro, horizontal, com legenda "protegido por Cloudflare". Backend
   com validação fail-open (se o Cloudflare cair, login segue -- defesa
   primária já é senha+2FA). Fluxo completo testado em produção.

5. [ ] **CTXUNIFY01** -- Decisão de arquitetura: unificar os 2 modelos de
   execução (execBloco protegido vs oqterm root/interativo). Precisa de
   você presente pra decidir junto, não só execução. (ver detalhe completo
   na seção Achados Pendentes)

6. [ ] **CTXAGENTSCORE01** -- Score real por agente. Desbloqueado após o
   item 5 (hoje o endpoint `/api/agents/score` existe mas depende de dados
   de `execucoes` com cobertura baixa/enviesada -- ver L-VITE02).

7. [x] **CTXVITE02** -- Concluído. Componente `AgentPanel` (React) integrado
   ao `dashboard.html` real via "React island" (montado fora do container
   legado, sem substituí-lo). Dados SSE ao vivo confirmados em produção.
   6 bugs encadeados resolvidos no processo (ver L-VITE02FINAL).

8. [ ] **CTXCLEANURL01** -- URL sem `/dashboard.html`. Depende do item 5
   (CTXUNIFY01) -- nasce naturalmente quando a SPA for unificada de vez.

9. [ ] **CTXPIPELINE01** -- Pipeline MAS adaptativo: classificar tarefa
   (simples/médio/complexo) e rodar 3/6/8 agentes -- redução estimada de
   40-60% no custo de runs simples.

10. [ ] **CTXRAG01** -- GitHub RAG básico, com sanitização anti-prompt-injection
    desde o design (conteúdo externo indexado é sempre dado, nunca instrução).

---

## 🎨 Sessão de Polish Visual (2026-07-01)

Trabalho real, fora da contagem formal da Rodada 5 -- itens concluídos e
testados em produção durante a mesma sessão do CTXVITE02/CTXCLOUDFLARE01:

- [x] **Spotlight animado** nos cards de agente -- borda + pulso (`@keyframes`)
  em ciano quando `status:running`, vermelho quando `status:error`. Intensidade
  ajustada por pedido explícito (destaque mais forte que a versão inicial).
- [x] **Scroll do painel de agentes corrigido** -- causa raiz: regra CSS
  genérica (`main.grid > * { overflow:hidden }`) vencia por especificidade
  a classe Tailwind `.overflow-y-auto`. Corrigido com seletor mais específico
  (`main.grid > aside.panel`), sem alterar a regra genérica (que protege
  outros painéis).
- [x] **3 botões reorganizados na barra do terminal** -- ordem final: 📤
  colar no chat → 🧹 clear (novo, usa `xterm.clear()`) → 🔒 conectar
  (placeholder visualmente ativo, meta futura registrada abaixo). Duas
  versões duplicadas do botão original (`b298` flutuante + `b305` solto
  dentro do `.xterm`) identificadas e neutralizadas.
- [x] **Card BLOCO LAVE reposicionado** -- número do bloco (`#101`) desceu
  para linha própria abaixo do título; botão fechar (`x`) movido para o
  canto superior direito, fixo, padrão universal de "fechar janela".
- [x] **Favicon adicionado** (SVG leve, sem dependência externa) -- eliminava
  404 constante no console.
- [x] **Versão dinâmica na tela de login** -- texto fixo `v0.12.0` (nunca
  atualizado em 10 releases) substituído por busca real em `/api/version`
  (`CTXVER01`), com fallback silencioso se a chamada falhar.
- [x] Badge "PT-BR" e botão duplicado no cabeçalho de agentes removidos
  (não serão usados por decisão do usuário).

---

## 🟡 Achados Pendentes

Problemas reais descobertos durante o trabalho, fora do plano original,
aguardando o momento certo de entrar numa rodada.

### 🔴 CTXUNIFY01 -- Decisão de arquitetura (investigado 2026-07-01)

Mapeamento completo feito -- são 2 modelos DIFERENTES de execução, não só
2 botões pro mesmo lugar:

1. **execBloco() / #bloco** -> `/api/blocos/preparar+executar` (container
   `orquestrai-api`): comando ISOLADO com sha256 anti-tampering,
   autorizo+confirmação+motivo obrigatórios, hash-chain (CTXAUDIT01),
   timeout/ulimit, roda DENTRO do Docker. Pouco usado na prática.

2. **Cards numerados (BLOCKS/cardHTML/oq71z-exec)** -> `/opt/oqterm/server.js`
   (porta 7654, FORA do docker-compose, roda direto no host como root,
   processo solto desde 22/06): sessão de TERMINAL INTERATIVA real
   (`pty.spawn('/bin/login',['-f','root'])`), com estado entre comandos.
   Valida JWT (role=admin/super_admin ou sub na ALLOWED list), nega com 403
   se não autorizado, loga por usuário/dia -- proteção própria, mas
   DIFERENTE do resto do sistema (fora do 2FA/cifra/hash-chain). **É o que
   você usa de fato no dia a dia.**

**Decisão necessária** (não é patch simples, é escolha de arquitetura):
- **Opção A:** aceitar que são 2 modelos legítimos p/ usos diferentes
  (comando pontual auditado vs sessão interativa root) -- documentar
  claramente, sem tentar fundir.
- **Opção B:** fazer o terminal interativo também gravar em `execucoes`
  (hash-chain cobre os 2), sem mudar o modelo de execução em si.
- **Opção C:** migrar tudo pro modelo protegido (perderia a interatividade
  de sessão).

Risco do `oqterm` em si (achado junto, fora do escopo do unify): root sem
senha, fora de Docker, único controle é a assinatura do `JWT_SECRET` -- se
vazar, acesso root total ao host. Considerar **CTXOQTERM01** (escopo de
usuário limitado, não root direto) como item separado, também exige decisão
de arquitetura com calma.

### 🟡 CTXMASAUTH01 -- Auth nas 7 rotas do MAS (escopo remapeado 2026-07-01)

Nenhuma das 7 rotas de `mas/routes.mjs` (`/run`, `/run/:id`, `/last`,
`/events/:id`, `/models-last`, `/harness-score`, `/harness-score/:id`) tem
`authMiddleware`. `/run` em especial dispara o pipeline MAS completo (custo
real de API) sem exigir login.

**Tentativa revertida** ao descobrir que o `dashboard.html` chama essas
rotas em **9 pontos diferentes**, e só 1 já manda `Authorization`. Corrigir
precisa de sessão dedicada mapeando todos os 9 pontos primeiro (não ajuste
incremental em produção). `/events/:id` (SSE) já tem solução desenhada:
auth via query param `?_t=`, já que `EventSource` nativo não manda header
`Authorization`.

---

## 🟢 Metas Futuras

Ideias e desejos registrados, sem timeline nem compromisso de execução até
serem promovidos para uma rodada ativa.

### CTXCLEANURL01 -- URL sem sufixo de arquivo
`orquestrai.cbini.com.br` sem `/dashboard.html`. Depende da decisão do
CTXUNIFY01 (item 5 da Rodada Ativa) -- nasce naturalmente quando a SPA for
unificada de vez. Não fazer via hack de nginx antes disso -- JWT fica em
localStorage (não cookie), então nginx não tem como decidir sozinho se
mostra login ou dashboard no server-side.

### Botão "Consultar agente" no card BLOCO LAVE
Evoluída ao longo de 3 rodadas de discussão (2026-07-01). Ideia original:
o agente Revisor comentaria automaticamente todo script gerado, linha a
linha. Refinada para: **botão opt-in no próprio card** ("🔍 Explicar" ou
similar, mesmo estilo de COPIAR/EXECUTAR), que só aciona a explicação
quando o usuário clicar -- evita pagar o custo do modelo mais caro (Opus)
em todo bloco, mesmo os triviais.

**Versão final decidida:** o agente consultado não precisa ser sempre o
Revisor -- o usuário **escolhe qual dos 9 agentes** quer ouvir sobre aquele
bloco específico (Revisor comentando código, Detetive investigando uma
dúvida, Auditor dando segunda opinião de segurança, etc), aproveitando o
catálogo de especialidades já documentado nos `AGENT_CARD-*.md`
(CTXSKILL01). É uma chamada **isolada e externa ao pipeline principal do
MAS** -- não interrompe nem duplica o fluxo sequencial que já roda em todo
run, evitando o problema que a primeira versão da ideia teria (2 scripts
concorrendo pelo mesmo card).

Design técnico esperado: novo botão no card LAVE + seletor dos 9 agentes
(mostrando especialidade via AGENT_CARD) + endpoint isolado, algo como
`POST /api/blocos/:id/consultar`. Resultado exibido expandido no próprio
card ou em modal (decidir na implementação).

### 2FA de terminal (segunda camada de autenticação antes do shell)
Botão "🔒 conectar" já existe na UI (placeholder visualmente ativo, sem
função ainda) na barra do terminal, pedindo usuário/senha PRÓPRIOS do
terminal, além do login já existente do dashboard (senha+2FA). Defesa em
profundidade -- separa "ver o painel" (risco baixo) de "ter shell root na
VPS" (risco máximo), hoje protegidas pela MESMA camada de auth (JWT de
sessão). Depende de: novo endpoint de auth dedicado ao terminal,
possivelmente ligado ao mesmo sistema TOTP do CTXAUTH2FA01. Relacionado a
CTXUNIFY01/CTXOQTERM01 (oqterm roda root sem senha hoje, fora do Docker).

### Investigar/limpar badge "B94 direto"
Indicador verde piscando no canto inferior direito ao carregar a página.
Funcional, não quebra nada, mas precisa de investigação visual/limpeza --
possivelmente debug info que deveria estar oculto ou redesenhado.

### XMonex -- ambiente de teste futuro
Projeto abandonado, sem uso ativo hoje. Um relato do agente Auditor mencionou
o `.env` do XMonex como exposto -- não verificado, mesmo relato que já foi
desmentido para `orquestrai/.env` (644 real vs 777 alegado, ver L-AUDITOR01).
Só investigar se XMonex passar a representar risco real e concreto para o
OrquestrAI. Futuro: usar como ambiente de teste/auditoria pelo próprio
OrquestrAI.

### Dog-fooding: OrquestrAI melhorando o próprio OrquestrAI
- [ ] Usar o MAS do OrquestrAI para propor e revisar patches do próprio
  sistema (já funciona parcialmente -- formalizar como workflow padrão)
- [ ] Conectar projeto "orquestrai" no módulo de Projetos e usar os agentes
  via interface, sem precisar do Claude.ai externo
- [ ] Pipeline: humano descreve goal -> MAS propõe BLOCO -> REVISOR comenta
  antes de executar -> humano aprova -> executor roda

### Calibração dos agentes via knowledge base
- [x] SKILL.md (formato AGENT_CARD) individual por agente -- **concluído**
  via CTXSKILL01, 9/9 titulares completos
- [ ] Agentes lerem o AGENT_CARD dos outros antes de delegar -- conhecimento
  mútuo do time
- [ ] Tooltip de descrição nos cards da Mesh Network mostrando especialidade
  do agente ao passar o mouse

### Polimento visual (itens ainda não atacados)
- [ ] Topbar mais compacta (fonte menor, ícones, info densa sem poluição)
- [ ] Cards da Mesh Network com indicador de desempenho histórico
- [ ] Animação suave ao trocar de aba no modal de Providers

### Monitoramento e avaliação dos agentes
- [ ] Dashboard de métricas por agente: total de runs, taxa de sucesso,
  custo acumulado, tempo médio
- [ ] Comparativo de modelos por posição (qual modelo teve melhor taxa no
  slot AUDITOR, por exemplo)
- [ ] Alerta automático quando um agente falha mais de N vezes seguidas

### Backlog geral -- fácil → difícil
**Fácil:**
- [ ] Limpeza periódica de arquivos órfãos
- [ ] Verificar fluxo de "Novo Projeto": criação de diretório individual +
  bloqueio de nome duplicado

**Média:**
- [ ] Tela de Agentes: reintroduzir configuração de providers/modelos,
  priorizando agentes gratuitos por padrão
- [ ] Revisar tela de Lições Aprendidas (180+ itens hoje): formato, ordem,
  organização
- [ ] Novo Projeto: opção de clonar repositório git via URL
- [ ] Agente especializado em Design (UI/consistência visual) -- 9ª posição
  do MAS, mais natural após Release 0.7 + migração Tailwind/React

**Difícil:**
- [ ] Instalador/script de setup do OrquestrAI para outras VPS Ubuntu --
  alto valor estratégico (produto replicável), exige externalizar o que
  hoje é manual (docker-compose, nginx, .env template, schema inicial)

**Distante / depende de investimento separado:**
- [ ] VPS dedicada com GPU para rodar modelos localmente -- viável
  tecnicamente, mas é projeto de infraestrutura à parte
- [ ] Isolamento por container (Docker) por projeto -- conecta com
  pendência de multi-tenant (Release 1.0)

### Releases de longo prazo (backlog original, sem release definida)
- [ ] Limite de orçamento configurável
- [ ] Rate limit por modelo
- [ ] Cadastro de provedores na UI (já parcialmente coberto por CTXSECRETS01)
- [ ] Seletor de modelo dinâmico
- [ ] Fallback automático entre modelos
- [ ] Comparação de respostas lado a lado
- [ ] Editor visual de workflow (DAG)
- [ ] Loop sequencial / paralelo (fan-out/fan-in) / ReAct (condicional)
- [ ] Guardrails e cerca eletrônica / Kill-switch
- [ ] Consulta à KB antes de responder + embeddings sqlite-vss (Release 0.5)
- [ ] JARVIS: wake-word, Whisper STT, Piper TTS on-premise (Release 0.6)
- [ ] Tabela `agent_executions` com ranking por posição real (Release 0.7)
- [ ] Multi-tenant, billing, DPA/LGPD, docs públicas, hardening (Release 1.0)
- [ ] LM Eval Harness para benchmarking padronizado de modelos por posição

---

## 📜 Decisões de Arquitetura (log append-only)

- **2026-06-30:** Frontend evolui para Vite+React+Tailwind (sem framework
  pesado tipo Next.js, sem trocar banco/auth). Migração por tela, começando
  por index.html (login) como piloto.
- **2026-06-30:** Captura de conhecimento para agentes NÃO inclui comando de
  terminal bruto (ruído). Critério: só BLOCO aplicado via execução real +
  outcome, nunca comando read-only isolado.
- **2026-06-30:** Card `.oq46y-card` já tinha 10+ patches sobrepostos
  (B330/B423/B434/B435/B443). Renderização visual de score ADIADA de
  propósito até migração Vite/React.
- **2026-07-01:** Bloco de segurança priorizado antes de frontend antes de
  features (fundamentos primeiro).
- **2026-07-01:** `CTXSCORE01` citado em documentação antiga como "backend
  pronto" nunca existiu de fato -- corrigido, ver `CTXAGENTSCORE01`.
- **2026-07-01:** React integrado ao dashboard legado via padrão "React
  island" (componente montado num container próprio, isolado, ao lado do
  HTML legado escondido) em vez de reescrita completa da SPA -- reduz risco,
  permite migração incremental peça por peça. Estado atual: híbrido por
  decisão consciente (login 100% React; dashboard ainda 100% legado, exceto
  o painel de agentes). Sem data definida para aposentar o legado por
  completo -- acontece gradualmente conforme novas ilhas forem migradas.

---

## 📖 Referência técnica

### Escalação do Time de Agentes
Inspiração: time de futebol. 11 titulares (posições fixas) + 15 reservas
(especializações, convocadas por tipo de tarefa) = 26 agentes no elenco completo.

**Titulares atuais (9/11):**
1. BATEDOR (scout) -- varredura rápida inicial
2. AUDITOR (auditor) -- análise detalhada e revisão
3. DETETIVE (detetive) -- investigação e correlação
4. ARQUITETO (smith) -- arquitetura e estruturação
5. GUARDIÃO (guardian) -- proteção e validação
6. MEMORIALISTA (memorialista) -- registro de memórias e lições
7. RELATOR (rel) -- relatórios e sínteses
8. MÉTRICO (metrico) -- métricas e monitoramento
9. REVISOR (revisor) -- revisão de qualidade final (claude-opus-4-8),
   convocado só ao final do pipeline

10-11. (vago) -- sugestões: TESTADOR (TDD), PUBLICADOR (deploy/changelog)

Reservas (0/15): a definir conforme necessidades reais dos projetos.
Critério de convocação: taxa de acerto por tipo de tarefa (Release 0.7).

### Arquitetura de segurança da Knowledge Base (decidido 2026-07-01)
Duas fases, evitando over-engineering prematuro (single-tenant hoje):
- **Fase atual:** rate limiting (CTXRATELIM01/02), secrets cifrados
  (CTXSECRETS01), auditoria hash-chain (CTXAUDIT01), sanitização
  anti-prompt-injection no RAG desde o design.
- **Fase GA (Release 1.0, multi-tenant):** isolamento real por
  organização/workspace, RBAC granular, embeddings segregados por tenant.

### Análise de documentos anexados (2026-07-01)
**Incorporado:** frontmatter type:lesson/type:adr em knowledge/ (inspirado
em Mega-Brain, sem plugin externo); 2FA TOTP + secrets cifrados + audit
hash-chain (já exigidos no Escopo V6.0 §11); validação em 3 camadas (AIOX,
para quando houver suite de testes automatizados).

**Descartado:** plugin claude-mega-brain (já coberto pelo Claude Project);
framework AIOX completo (colide com decisões já tomadas); grafo de
conhecimento/reputação entre agentes (overkill para 9 agentes); stack
MySQL/Redis do Escopo V6.0 (implementação real já divergiu para SQLite
por decisão consciente).

---

## ✅ Histórico condensado por rodada

**Rodada 1** -- CTXMEM01 (memória persistente chat individual), OQ-SEC01
(bloqueio de backups .bak/.env/.log expostos no docroot público),
CTXMAS01 (memória entre runs do MAS), CTXBLOCOMAS01, CTXPROV01
(proveniência rastreada), CTXPULSE01 (badge de agente intensificado),
CTXSCORE01* (*na verdade nunca implementado, achado corrigido em 2026-07-01
-- ver CTXAGENTSCORE01)

**Rodada 2** -- 9/10, ver `chat1.md` para lista completa (CTXSPOT04,
CTXNGINX01, CTXSSE02, CTXGUARD01, CTXB361, CTXBRIDGE01, CTXROUTE01,
CTXMODELOS01-06, CTXFILTROS01, CTXAGENTES01, CTXUSAR01/02, CTXFIX01-04,
CTXVER01, CTXSEC02, CTXSSE01)

**Rodada 3** -- 10/10: CTXAGT02, CTXAGT03, CTXFORMAGT01, CTXSSE03,
CTXDURATION01, CTXLITESTREAM01, CTXSPOT05, CTXFEEDBACK01, CTXREVISOR01,
CTXHARNESS01

**Rodada 4** -- 10/10: CTXAUTH2FA01, CTXSECRETS01, CTXAUDIT01,
CTXRATELIM01, CTXAGENTAUTH01, CTXRATELIM02, CTXVITE01, CTXVITE02 (iniciado
aqui, fechado na Rodada 5), CTXKBCURATOR01, CTXSKILL01

**Rodada 5** -- 5/10 até o momento: CTXPROVBRIDGE01, CTXHYGIENE01,
CTXCLOUDFLARE01, CTXVITE02 (fechado), + sessão de polish visual completa
(ver seção dedicada acima). Restam: CTXMASAUTH01, CTXUNIFY01,
CTXAGENTSCORE01, CTXCLEANURL01, CTXPIPELINE01, CTXRAG01.

---

## 📦 Arquivado -- planejamento superado

As duas seções abaixo eram planejamento ativo em 2026-06-30, mas nunca
foram sincronizadas com o que de fato aconteceu (a execução real virou uma
mistura reordenada dessas listas com itens do Parecer Consultivo v2).
Preservadas aqui só como registro histórico -- **não confiar nos
checkboxes**, usar `chat1.md` como fonte de status real desse período.

<details>
<summary>Sprint Rodada 2 (planejamento original, 2026-06-30)</summary>

FÁCIL: CTXSPOT04, CTXNGINX01, CTXSSE02, CTXGUARD01, CTXB361
MÉDIO: CTXBRIDGE01, CTXROUTE01, CTXMODELOS01-06
DIFÍCIL: CTXVITE01, CTXVITE02

</details>

<details>
<summary>Sprint Rodada 3 "próxima sessão" (planejamento original, 2026-06-30, superado pela execução real)</summary>

FÁCIL: CTXAGT02, CTXAGT03, CTXSPOT05
MÉDIO: CTXREVISOR01, CTXRAG01, CTXBUMP01
DIFÍCIL: CTXVITE01, CTXVITE02, CTXLMEVAL01, CTXRESERVA01

</details>
