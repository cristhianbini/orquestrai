---
documento: roadmap
mantido_por: humano+ia
ultima_atualizacao: 2026-07-01
status: vivo
---

> **Nota de reorganizacao (2026-07-01):** este documento foi reestruturado em 3
> categorias com significado diferente. Ler esta nota antes de interpretar
> qualquer item abaixo:
>
> - **🔵 Rodada Ativa** = trabalho comprometido, ordem definida, sendo executado agora.
> - **🟡 Achados Pendentes** = problemas descobertos no meio do trabalho (nao
>   estavam no plano original), aguardando decisao sobre quando entrar numa rodada.
> - **🟢 Metas Futuras** = ideias/desejos registrados, sem timeline, sem
>   compromisso de execucao ate serem promovidos para uma rodada.
>
> Conteudo tecnico de cada item foi preservado integralmente na reorganizacao --
> so a categoria/posicao mudou. Duas secoes de planejamento antigas (Sprint
> Rodada 2 e Sprint Rodada 3 "proxima sessao") ficaram desatualizadas e nunca
> foram sincronizadas com o que realmente aconteceu -- movidas para 📦 Arquivado
> no final deste documento, com nota explicita de que `chat1.md` e fonte mais
> confiavel pra status daquele periodo.

## 📊 Status do ciclo de sprints

**Rodada 5 (ativa) -- 5/10 concluidos (CTXCLOUDFLARE01 + CTXVITE02 fechados), 5 restantes.**

**Sessao de polish visual 2026-07-01 (fora da contagem formal, trabalho real):**
spotlight animado, scroll do painel corrigido, 3 botoes do terminal
reorganizados, card LAVE reposicionado, favicon, versao dinamica no login.
3 metas novas registradas (2FA terminal, agente consultavel, badge B94).
Ver detalhamento completo na secao 🔵 Rodada Ativa abaixo.

**Historico:** Rodada 1 ✅ (ver chat1.md) · Rodada 2 ✅ 9/10 (ver chat1.md) ·
Rodada 3 ✅ 10/10 · Rodada 4 ✅ 10/10 (1 item parcial: CTXVITE02)

**Regra permanente:** ao fechar 10/10 de qualquer rodada, a proxima rodada de
10 e planejada automaticamente antes de aguardar novo pedido do humano.

---

## 🔵 Rodada Ativa (Rodada 5, iniciada 2026-07-01)

1. [x] **CTXPROVBRIDGE01** -- Investigado. NAO era bug: todos os 16 registros de
   `execucoes` sao origem='individual' (chat comum). O codigo ja manda
   `mas_run_id` corretamente quando o BLOCO vem do MAS -- so nunca houve
   amostra real pra confirmar. Sem acao de codigo necessaria. (ver L-PROVBRIDGE01)

2. [ ] **CTXMASAUTH01** -- Tentado e **revertido** hoje. Escopo real descoberto:
   nao e 1 chamador (como CTXAGENTAUTH01), sao **9 pontos** espalhados no
   dashboard.html chamando as 7 rotas de `mas/routes.mjs` sem token (2x
   /models-last, 2x /run, 2x /last, 3x EventSource /events/). Precisa de
   sessao dedicada mapeando os 9 pontos ANTES de qualquer patch no backend,
   nao ajuste incremental em producao. (ver L-MASAUTH01)

3. [x] **CTXHYGIENE01** -- Concluido parcialmente:
   - [x] `knowledge/agentes/` (pastas mortas, nomenclatura divergente dos 9
     titulares reais, zero uso no codigo) arquivado em `_arquivados/`
   - [x] Esclarecido: `blocosRoutes.cjs` "duplicado" e mount intencional do
     Docker Compose (mesmo padrao do `providers.cjs`), nao e bug
   - [ ] `ADMIN_PASSWORD` real no `.env` -- **decisao do usuario, adiada
     de proposito**. Senha antiga (`OrquestrAI@2025`) continua ativa como
     fallback ate a troca acontecer.

4. [ ] **CTXCLOUDFLARE01** -- Turnstile na tela de login (widget discreto
   abaixo do botao Entrar) ou proxy/WAF completo. Decisao de escopo
   pendente (ver detalhe na secao Metas Futuras).

5. [ ] **CTXUNIFY01** -- Decisao de arquitetura: unificar os 2 modelos de
   execucao (execBloco protegido vs oqterm root/interativo). Precisa de
   voce presente pra decidir junto, nao so execucao. (ver detalhe completo
   na secao Achados Pendentes)

6. [ ] **CTXAGENTSCORE01** -- Score real por agente. Desbloqueado apos
   item 5 (hoje o endpoint `/api/agents/score` existe mas depende de dados
   de `execucoes` que tem cobertura baixa/enviesada -- ver L-VITE02).

7. [ ] **CTXVITE02 (fechar)** -- Integrar o componente `AgentPanel` (ja
   pronto e testado isolado) no `dashboard.html` real de producao.

8. [ ] **CTXCLEANURL01** -- URL sem `/dashboard.html`. Nasce naturalmente
   apos o item 7 (SPA unificada via react-router-dom).

9. [ ] **CTXPIPELINE01** -- Pipeline MAS adaptativo: classificar tarefa
   (simples/medio/complexo) e rodar 3/6/8 agentes -- reducao estimada de
   40-60% no custo de runs simples.

10. [ ] **CTXRAG01** -- GitHub RAG basico, com sanitizacao anti-prompt-injection
    desde o design (conteudo externo indexado e sempre dado, nunca instrucao).

---

## 🟡 Achados Pendentes

Problemas reais descobertos durante o trabalho, fora do plano original,
aguardando o momento certo de entrar numa rodada.

### 🔴 CTXUNIFY01 -- Decisao de arquitetura (investigado 2026-07-01)

Mapeamento completo feito -- sao 2 modelos DIFERENTES de execucao, nao so
2 botoes pro mesmo lugar:

1. **execBloco() / #bloco** -> `/api/blocos/preparar+executar` (container
   `orquestrai-api`): comando ISOLADO com sha256 anti-tampering,
   autorizo+confirmacao+motivo obrigatorios, hash-chain (CTXAUDIT01),
   timeout/ulimit, roda DENTRO do Docker. Pouco usado na pratica.

2. **Cards numerados (BLOCKS/cardHTML/oq71z-exec)** -> `/opt/oqterm/server.js`
   (porta 7654, FORA do docker-compose, roda direto no host como root,
   processo solto desde 22/06): sessao de TERMINAL INTERATIVA real
   (`pty.spawn('/bin/login',['-f','root'])`), com estado entre comandos.
   Valida JWT (role=admin/super_admin ou sub na ALLOWED list), nega com 403
   se nao autorizado, loga por usuario/dia -- protecao propria, mas
   DIFERENTE do resto do sistema (fora do 2FA/cifra/hash-chain). **E o que
   voce usa de fato no dia a dia.**

**Decisao necessaria** (nao e patch simples, e escolha de arquitetura):
- **Opcao A:** aceitar que sao 2 modelos legitimos p/ usos diferentes
  (comando pontual auditado vs sessao interativa root) -- documentar
  claramente, sem tentar fundir.
- **Opcao B:** fazer o terminal interativo tambem gravar em `execucoes`
  (hash-chain cobre os 2), sem mudar o modelo de execucao em si.
- **Opcao C:** migrar tudo pro modelo protegido (perderia a interatividade
  de sessao).

Risco do `oqterm` em si (achado junto, fora do escopo do unify): root sem
senha, fora de Docker, unico controle e a assinatura do `JWT_SECRET` -- se
vazar, acesso root total ao host. Considerar **CTXOQTERM01** (escopo de
usuario limitado, nao root direto) como item separado, tambem exige decisao
de arquitetura com calma.

### 🟡 CTXMASAUTH01 -- Auth nas 7 rotas do MAS (escopo remapeado 2026-07-01)

Nenhuma das 7 rotas de `mas/routes.mjs` (`/run`, `/run/:id`, `/last`,
`/events/:id`, `/models-last`, `/harness-score`, `/harness-score/:id`) tem
`authMiddleware`. `/run` em especial dispara o pipeline MAS completo (custo
real de API) sem exigir login.

**Tentativa de hoje revertida** ao descobrir que o `dashboard.html` chama
essas rotas em **9 pontos diferentes**, e só 1 já manda `Authorization`.
Corrigir precisa de sessão dedicada mapeando todos os 9 pontos primeiro
(não ajuste incremental em produção). `/events/:id` (SSE) já tem solução
desenhada: auth via query param `?_t=`, já que `EventSource` nativo não
manda header `Authorization`.

---

## 🟢 Metas Futuras

Ideias e desejos registrados, sem timeline nem compromisso de execução até
serem promovidos para uma rodada ativa.

### CTXCLOUDFLARE01 -- Cloudflare na tela de login
Turnstile (widget anti-bot, substitui CAPTCHA tradicional) ou proxy/WAF
completo do Cloudflare. Posicionamento pedido: discreto, logo abaixo do
botão "Entrar". Depende de decisão: Cloudflare como proxy DNS completo
(protege toda a VPS, mascara IP real) vs só o widget Turnstile no
formulário (mais simples, não muda infraestrutura).

### CTXCLEANURL01 -- URL sem sufixo de arquivo
`orquestrai.cbini.com.br` sem `/dashboard.html`. Nasce naturalmente quando
CTXVITE02 unificar login+dashboard numa SPA só, roteada por
react-router-dom. Não fazer via hack de nginx antes disso -- JWT fica em
localStorage (não cookie), então nginx não tem como decidir sozinho se
mostra login ou dashboard no server-side.

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
- [ ] Tooltip de descrição nos cards da Mesh Network (lado direito) mostrando
  especialidade do agente ao passar o mouse

### Polimento visual
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
- [ ] Revisar tela de Lições Aprendidas (174+ itens hoje): formato, ordem,
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

---

## 📖 Referência técnica

### Escalação do Time de Agentes
Inspiração: time de futebol. 11 titulares (posições fixas) + 15 reservas
(especializações, convocados por tipo de tarefa) = 26 agentes no elenco completo.

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

**Rodada 4** -- 10/10 (1 parcial): CTXAUTH2FA01, CTXSECRETS01, CTXAUDIT01,
CTXRATELIM01, CTXAGENTAUTH01, CTXRATELIM02, CTXVITE01, CTXVITE02 (parcial),
CTXKBCURATOR01, CTXSKILL01

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

### XMonex (pendencia baixa prioridade, 2026-07-01)
Projeto abandonado, sem uso ativo hoje. Relato do Auditor (L-AUDITOR01)
mencionou .env do XMonex tambem exposto -- nao verificado, mesmo relato
que ja foi desmentido para orquestrai/.env (644 real vs 777 alegado).
So investigar se XMonex passar a representar risco real e concreto para
o OrquestrAI (ex: mesma rede, credenciais compartilhadas). Futuro: usar
como ambiente de teste/auditoria pelo proprio OrquestrAI.

### Meta: botao "colar no chat" alinhado a direita no cabecalho do terminal
Usuario quer o botao no mesmo estilo dos botoes de bloco (COPIAR/EXECUTAR/X),
alinhado a direita, dentro da barra "TERMINAL - conectado". Hoje o botao e
inserido via JS dinamico (linha ~3498, script oq71z-xterm) buscando o texto
na tela. Provavel fix simples de CSS (flex/position), nao logica. Baixa
prioridade -- registrado para a rodada de polish visual apos CTXVITE02 estabilizar.

### Meta: investigar/limpar badge "B94 direto" que aparece e some
Usuario notou um indicador verde piscando no canto inferior direito ao
carregar a pagina (badge tipo "B94v direto"). Funcional, nao quebra nada,
mas precisa de investigacao visual/limpeza -- possivelmente debug info que
deveria estar oculto ou redesenhado. Baixa prioridade, rodada de polish visual.

### Meta: 2FA de terminal (segunda camada de autenticacao antes do shell)
Usuario propos: botao "Conectar" na barra do terminal, pedindo usuario/senha
PROPRIOS do terminal, alem do login ja existente do dashboard (senha+2FA).
Defesa em profundidade -- separa "ver o painel" (risco baixo) de "ter shell
root na VPS" (risco maximo), hoje protegidos pela MESMA camada de auth (JWT
de sessao). Botao placeholder ja adicionado na UI (desabilitado). Depende de:
novo endpoint de auth dedicado ao terminal, possivelmente ligado ao mesmo
sistema TOTP do CTXAUTH2FA01. Relacionado a CTXUNIFY01/CTXOQTERM01 (oqterm
roda root sem senha hoje, fora do Docker -- ver decisao de arquitetura pendente).
