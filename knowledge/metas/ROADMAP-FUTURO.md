# Roadmap Futuro — OrquestrAI
Ultima atualizacao: 2026-07-14 (Decisao de escopo V1: ferramenta interna, nao SaaS). Ordem = alicerce antes do acabamento.

## Decisao 2026-07-14: Escopo V1 redefinido -- ferramenta interna, nao SaaS

CBini decidiu explicitamente: o objetivo imediato do OrquestrAI NAO e virar
produto/concorrente de Cursor, Devin, Lovable, v0. E ser ferramenta interna
funcional para auditar e evoluir os proprios sistemas (XMonex, XBarber,
XCorretor, XLavacar, XBolao, XDesk e projetos futuros). Monetizacao como SaaS
fica descartada como meta de curto prazo -- pode ser revisitada no futuro, mas
nao orienta prioridade agora.

Escopo V1 essencial (fechar isso = "pronto o suficiente"):
- Fechar Rodada 11 (itens 3-6)
- Import GitHub + Container Isolation ponta a ponta (repo/ -> site/, Dockerfile
  node, auto-mapeamento de stack) -- e o que faz a ferramenta cumprir sua razao
  de existir: auditar/evoluir sistema real, nao so criar projeto novo
- 2 itens de risco de producao (nao esperar virar dor): backup Litestream do
  orquestrai.db (segredos 2FA); auditoria do JWT admin compartilhado entre os 3
  daemons root

Descartado por ora (nao e erro, e escopo de SaaS fora do foco atual):
multi-tenancy com quotas, multi-VPS/datacenter proprio, portal com captura de
leads, JARVIS por voz, billing/DPA/LGPD/docs publicas.

Fica para quando surgir necessidade real de uso (nao push antecipado):
telemetria por projeto/expandida, PLANEJADOR/ORQUESTRADOR, agente DESIGNER,
curadoria de elenco premium, demais polimento de UI.

Proximo passo apos V1 essencial fechado: testar em sistema real da CBini
(candidato inicial: cbinixbarber, ja mencionado como piloto de Import GitHub).

## RODADA 9 — ENTREGUE (2026-07-12, validada pela CBini)
Foco: tela de Projetos utilizavel + OpenAI na mesa + fechar backlog visual.
- **Telemetria**: score real por agente (done/(done+error)), placeholder "Fase 2"
  aposentado; estado visual de amostra baixa (n<5). [a08c44a]
- **Elenco OpenAI**: AUDITOR -> openai/gpt-5.4-mini; +2 titulares #10
  ESTRATEGISTA (gpt-5.5, L0 decompoe objetivo) e #11 TESTADOR (gpt-5.4, L4.5
  verificacao pos-exec); custo real no caminho generico (EXT_PRICE, antes
  mentia FREE). AGENT_CARDs criados; ilha React da coluna lateral atualizada.
  [7a77aff, 0769ff7, 67b114e, 09835b2]
- **DNA de projeto (MVP)**: bloco dna no project.json, seed do wizard,
  GET/PUT /:slug/dna, injecao como contrato no runMas, chip+editor no card.
  E2E com auth real OK. [0fe65c6]
- **Tela Projetos**: bug do botao Criar (disabled sem reset) corrigido;
  wizard c/ Enter/Esc, validacao de nome duplicado, cards Stack/Banco
  compactos (escalaveis); container mostra estado REAL (nunca-ativado vs
  parado); Import GitHub habilitado c/ feedback de progresso; badge PROJETOS
  no padrao sobreposto de LICOES. [6f6435f, 26b0a7f, 09835b2]
- **Criar pagina em projeto existente** (bug real da CBini): comando
  /construir <pedido> gera pagina nomeada (site/<pagina>.html) via
  buildProjectPage, sem tocar irmas; chat do projeto vincula project_slug
  (Fatia A). E2E contra cafe-real OK. [d950910]
- **Cards padrao unico** (Licoes grid/acento por status/ordinal pill fixa),
  **nav largura unica** (D), **E1c** (botoes terminal .hdr-ico), **piloto
  Manual -> aba do oqShell** (modal aposentado). [26b0a7f, 742edbb]
- Licoes: L-CARDPROMPT01, L-COSTZERO01, L-DISABLEDRESET01, L-MOUNTPARSE01,
  L-CHATSLUG01, L-ISLANDAGENTS01.
- **Limitacao conhecida (candidata R10)**: buildStaticSite tem max_tokens=4000
  — "descricao completa" pode truncar a pagina. Elevar o cap ou fatiar a
  geracao fica p/ proxima rodada.

## ALICERCE
0. [~] **CTXOPSCHECK01 — restore do Litestream** — 1o teste de restore FEITO e
   APROVADO em 2026-07-11 (restore p/ path descartavel; integrity_check=ok nos 2
   bancos; contagem+timestamp restaurado == vivo ao milissegundo; RPO efetivo ~0).
   FALTA ainda: formalizar o checklist operacional (semanal/mensal/trimestral) em
   knowledge/decisoes/ e reteste trimestral. Migrado do roadmap.md antigo.
0b. [ ] **orquestrai.db (2FA/TOTP) NAO tem backup Litestream** — achado no teste de
   restore 2026-07-11: /etc/litestream.yml replica so cluster.db e blackboard.db.
   Se a VPS morrer, os segredos TOTP se perdem (usuarios teriam de refazer 2FA).
   Avaliar adicionar orquestrai.db ao litestream.yml. Decisao do Bini, sem urgencia.
1. [x] Token efemero de preview — feito 2026-07-10 (CTXPREVIEWTOKEN02/03)
2. [~] Import GitHub + container isolado — **Import GitHub ENTREGUE (UI + POST
   /:slug/import) na R9; container isolado = Fase B entregue.** Falta polir o
   fluxo pos-import (detectar stack, primeiro deploy guiado). Segue abaixo o
   contexto original:
   Visao ampliada em knowledge/decisoes/VISAO-IMPORT-MIGRACAO-INFRA.md: nao e so
   "importar codigo pra referencia" (isso e o CTXRAG01), e trazer sistema de
   terceiro pra DENTRO do OrquestrAI, melhorar aqui e hospedar/exportar com
   portabilidade real (VPS propria hoje -> VPS dedicada/outro provedor depois).
   O container deve nascer portavel. Ver tambem o gatilho de promocao por projeto
   no BACKLOG DE PRODUTO abaixo.
   **ESCLARECIMENTO "VPS dedicada" (CBini, 2026-07-12, rodada 9):** a feature
   NAO e sobre a VPS atual. E a capacidade de EXPORTAR/EMPACOTAR um projeto do
   OrquestrAI para rodar numa SEGUNDA VPS externa (futura, a ser contratada) —
   ou seja, empacotamento/portabilidade p/ deploy fora desta infraestrutura.
   Segue EM BREVE na UI (fase mais distante); o ALICERCE #3 (container isolado,
   Fase B entregue) ja cobre parte do caminho. Registrado aqui p/ nao haver
   confusao futura sobre o significado.
3. [x] Telemetria por projeto (custo/tokens) — **CONCLUIDO (camada de dados)
   em 2026-07-11**: migration mas-002 project_slug nullable (1de0bcc),
   captura no INSERT + guard idempotente TELEM01 (e9cc7e2), GET
   /api/mas/telemetry/projects (a763f51), card cru no dashboard (7ba1352).
   NULL = run solta, rotulo '(sem-projeto)' so na apresentacao. Design do
   card fica p/ a rodada de telas (#8). NOTA de reconhecimento: a correcao
   2026-07-10 dizia "DO ZERO", mas o encanamento do slug JA existia
   (CTXPROJRUN01: wizard -> rota -> runMas) — faltava so persistir; o L
   do LAVE encolheu o passo. PENDENTE: E2E do 2o bucket na 1a run real
   via wizard (3 .bak telem01/telem03/telem04 aguardam isso p/ limpeza,
   L-PROP-safe-bak-cleanup).

## ESTRUTURA
4. [ ] Telemetria expandida (disco/memoria/CPU) — depende do container isolado
5. [ ] PLANEJADOR + ORQUESTRADOR — pipeline dinamico, conecta com CTXEARLYEXIT01/CTXROUTER01
5b. [ ] **Sprint de Higiene de execucao root** (registrado 2026-07-11, sessao dedicada):
   - **CTXEXEC01** — unificar os dois portoes de execucao ao root: `execBloco`
     (auditado, sha256 + hash-chain) e `oq71z-exec`/`b94` (raw pro WebSocket do PTY
     root, com confirm desligavel via sessionStorage) coexistem. A auditoria
     hash-chain e contornavel pelo caminho usado no dia a dia. Unificar num
     `execToTerminal()` unico que registra em `execucoes`. Ler /opt/oqterm/server.js
     inteiro antes do 1o patch (L-CTXUNIFY01). Risco ALTO estrutural.
   - **CTXOQTERM01** — oqterm roda root sem senha, fora do Docker; unico controle e
     a assinatura do JWT (se vazar = root total no host). Escopo de usuario limitado
     (nao root direto) + 2FA de terminal ja desenhado. Mesma familia de risco.
   - **[2026-07-11] AUDITORIA CONJUNTA DOS TRES PORTOES ROOT** — a Fase B (Rodada
     7) adiciona um TERCEIRO ponto com privilegio: o daemon `project-supervisor`
     (acesso controlado ao socket docker). Ficam entao TRES superficies com algum
     nivel de root/privilegio no host: (1) execBloco (auditado, hash-chain),
     (2) oqterm/CTXOQTERM01 (PTY root raw), (3) project-supervisor (socket docker
     allowlisted). Decisao CBini: NAO auditar em separado — abrir uma **rodada
     futura dedicada de auditoria de seguranca CONJUNTA** dos tres, mapeando
     superficie total de escalonamento a root, o que cada JWT vazado permitiria,
     e o plano de contencao unificado. Pre-requisito: Fase B concluida (o 3o
     portao existir de fato). Nao e' nota solta do plano da sprint -- e' item de
     roadmap.
     - **[2026-07-11] NOTA B2 (insumo para esta auditoria): JWT admin unico
       abre os 3 portoes.** Constatado ao escrever o project-supervisor: os
       tres portoes root validam o MESMO JWT (mesmo JWT_SECRET, role
       admin/super_admin), sem claim de escopo/`aud` por servico. Um unico
       token admin vazado compromete oqterm (PTY root), project-runner e
       project-supervisor (socket docker) de uma vez -- o raio de dano de um
       vazamento e' a uniao dos tres, nao um portao isolado. Compartimentar
       (claim `aud`/scope por portao, ou segredo distinto por servico) e'
       decisao a tomar NESTA auditoria, nao antes. Nota espelhada em
       comentario no services/project-supervisor/server.js (requireAdmin).
     - **[2026-07-11] NOTA B3 (insumo para esta auditoria): containers de
       projeto na MESMA rede dos 3 portoes.** Os `proj-*` nascem na
       `orquestrai_app-net` (172.18.0.0/16) — a mesma subnet liberada no ufw
       para alcancar 7654 (oqterm), 7655 (project-runner) e 7656
       (project-supervisor) no gateway 172.18.0.1. Um container de projeto
       comprometido alcanca os 3 portoes na camada de REDE; a partir dai a
       unica contencao e' o JWT admin (ver nota B2 acima — e o JWT e' um so).
       Ja era verdade para 7654/7655 desde que os proj-* passaram a existir
       (B2); o B3 adiciona o 7656. Mitigacao candidata a avaliar NESTA
       auditoria: rede bridge separada para os proj-* (sem rota aos portoes),
       com o proxy participando das duas redes para o preview (B5).

5c. [ ] **Higiene: processos xmonex/PM2 escutando em 0.0.0.0 (achado B5
   2026-07-11).** Na verificacao de exposicao do B5, `ss` revelou listeners
   em 0.0.0.0/*: portas 4100-4102 e 4200-4202 — PM2 god daemon v6 rodando de
   /root/.pm2 (ROOT), servindo xmonex-teste/back (4101), next-server 16
   (4201) e afins. NAO tem relacao com a Fase B (docker port vazio, ufw
   intocado). Unica barreira externa e' o default-deny do ufw — scan nmap DE
   FORA (CBini, 2026-07-11) confirmou todas filtered; mas o bind em 0.0.0.0
   significa que qualquer regra ALLOW futura mal escopada as expoe.
   PERGUNTA A RESPONDER (pedido CBini): e' resquicio do incidente de
   contaminacao documentado (L-CONTAMINACAO01) ou coisa separada?
   Preliminar: SEPARADA — L-CONTAMINACAO01 e' contaminacao de CONTEXTO/KB
   (docs do XMonex poluindo a base); isto sao processos REAIS do xmonex
   co-hospedados na VPS (multi-tenancy, ver META-CTXPROJISO01, que ja cita
   "PM2/XMonex antigo"). Confirmar na sessao dedicada: quem iniciou, se
   ainda e' usado, e se cabe bind em 127.0.0.1 ou desligamento.
5d. [ ] **Mesh conhece o "como" mas nao o "o que vem a seguir" (achado B6
   2026-07-11).** Verificado no codigo: mas/kb.cjs injeta INDEX.md + top-5
   licoes de knowledge/licoes/ nos prompts dos 9 agentes (keyword-match,
   truncado em 1500 chars/arquivo), mas knowledge/metas/ (ROADMAP-FUTURO,
   planos de rodada) e INVISIVEL ao mesh — as licoes protegem os agentes,
   as metas nao os orientam. Documentado como lacuna, sem urgencia e sem
   solucao decidida. Avaliar junto do PLANEJADOR/ORQUESTRADOR (#5), o
   consumidor natural de visao de roadmap, e do RAG semantico do backlog
   tecnico (keyword-match raso nao escala p/ docs longos como o roadmap).
5e. [ ] **Contexto de projeto ativo (Gate 2, sessao de design dedicada)**
   — registrado 2026-07-14, achado do E2E "Sabor da Serra" (R11 Bloco 1).
   Hoje chat/MAS/terminal NAO sabem automaticamente qual projeto esta
   selecionado no dropdown do cockpit (localStorage oq_proj_current); os
   agentes INFEREM o projeto via grep cross-project a cada interacao (a
   checagem "confusao de slug" da L-CHATSLUG01 e do resumo do RELATOR). O
   alvo e propagar o projeto ativo como CONTEXTO EXPLICITO (chat, MAS e
   terminal recebem o slug selecionado), aposentando a inferencia por grep.
   Conecta com **telemetria por projeto** (#3, camada de dados concluida):
   MESMA frente de trabalho — tratar JUNTO (o slug ativo alimenta tanto o
   roteamento das acoes quanto o bucket de telemetria). Ambos arquiteturais/
   multi-modulo (Gate 2): exigem sessao de design dedicada, NAO entram em
   bloco de correcoes. Ver [[L-CHATSLUG01]] e item 5d (consciencia do mesh).
6. [ ] Agente DESIGNER dedicado no pipeline — especializado em UI e consistencia
   visual. Encaixa mais naturalmente DEPOIS que a migracao Tailwind/React
   (strangler fig do dashboard) estiver madura, para o agente ter um sistema de
   design coerente sobre o qual opinar. Entra pela PENEIRA (META-CTXESTEIRA01)
   como novo titular do elenco.
7. [ ] Curadoria de elenco premium (GLM-5.2, MiniMax, OpenAI, Anthropic) — comparar custo x qualidade
8. [~] UI padrao janelas (menu lateral + conteudo a direita, estilo Claude) —
   **rodada dupla de telas EM ANDAMENTO (Rodada 8, plano aprovado 2026-07-11:**
   knowledge/metas/RODADA-8-PLANO-TELAS-UI.md, escopo T1-T5). Decisao A3(i)
   SUBSTITUI a nota antiga "manter modal Provedores como esta": Configuracoes
   novo (sidebar de abas) absorve Provedores + Telemetria; o modal antigo
   vira "Elenco" (Modelos + Agentes, form de agentes intocado).
   PROGRESSO 2026-07-12: T1-T5 ENTREGUES e validados (nav icones
   5d352c0, shell ddd734a, Provedores 04c3c34, Telemetria 95ae089,
   Seguranca cf88625, fix BUG-NAVJUMP + engrenagem 923e186; licao
   L-SINGLEOWNER02). Proxima etapa da rodada dupla: expandir o shell
   Configuracoes (tamanho + arquitetura p/ futuras telas na sidebar).
   DECISAO 12/07: candidatas a migrar = Manual, Licoes, Elenco (uma
   por vez, aprovacao da CBini a cada uma); PROJETOS NAO MIGRA —
   segue modal dedicado (categoria "gestao de entidades com acoes",
   wizard + cards + 5 itens EM BREVE, diferente de configuracao/
   leitura de estado). Pendentes E1c/E1d (ordem final da nav).
   8a. [ ] **Captacao de leads no portal** (registrado 2026-07-11, decisao
      CBini — sub-item do portal, NAO entra na Rodada 8 / T1-T5 atual).
      Formulario simples: nome/email/interesse + botao discreto no portal.
      Requisitos de seguranca ja fechados na concepcao:
      - Banco ISOLADO: SQLite dedicado (ex. leads.db) — NUNCA blackboard.db/
        cluster.db; dado de formulario NUNCA vira prompt de agente (mesma
        familia de risco do L-CONTAMINACAO01: input publico nao entra na KB
        nem no pipeline).
      - Validacao de schema no backend (nao confiar no front).
      - Rate limiting por IP + honeypot anti-bot.
      - Export CSV autenticado sob demanda — SEM escrita direta em planilha/
        API externa.
      Avaliar na hora: litestream p/ leads.db (mesma lacuna do item 0b).
   8b. [ ] **URLs limpas no portal** (registrado 2026-07-12, decisao CBini
      — pendencia p/ a construcao do portal, NAO agir agora). URLs nunca
      expoem extensao (.html) nem path tecnico: seudominio.com/login,
      nunca /login.html. Resolver no nginx via try_files ($uri $uri.html
      $uri/ =404), servindo o .html internamente sem expor na barra.
      ATENCAO na hora: proxy.conf e bind-mount de ARQUIVO UNICO :ro —
      editar in-place com cat>, nunca rename (L-BINDMOUNT-inode-proxyconf).

## EXPANSAO (bem pro final)
9. [ ] Cotas/multi-tenancy ("VPS dentro da VPS") — depende de container isolado maduro
10. [ ] Cluster multi-VPS / datacenter proprio

## OUTROS (dashboard "EM BREVE")
- [x] DNA de projeto — MVP entregue R9 (0fe65c6); v2 = versionamento + validador dedicado + geracao pelo mesh
- [ ] Deploy automatizado

## Ferramentas discutidas (sem prioridade de rodada ainda)
- Claude Code na VPS — instalar quando houver janela dedicada
- Auditoria com modelo forte — script pronto (scripts/gerar-dossie-auditoria.py)

## BACKLOG DE PRODUTO (ideias de feature, sem prioridade de sprint)
Migrado do roadmap.md antigo em 2026-07-11 — ideias de produto, nao debito.
- **Botao "Consultar agente" no card LAVE** — botao opt-in no card que deixa o
  usuario escolher qual dos 9 agentes quer ouvir sobre aquele bloco (Revisor
  comenta codigo, Detetive investiga, Auditor da 2a opiniao de seguranca).
  Chamada isolada e externa ao pipeline MAS (nao interrompe o fluxo sequencial).
  Endpoint esperado: POST /api/blocos/:id/consultar.
- **Gatilho duro de promocao por projeto** (principio de design p/ o item #2 /
  container isolado): container isolado so quando o projeto tiver >=N execucoes
  reais via /api/mas/run OU o humano marcar status:'producao' no project.json.
  Nunca container-por-padrao no wizard.

## BACKLOG TECNICO (condensado, sem prioridade — migrado do roadmap.md antigo 2026-07-11)
Lista de desejos de longo prazo, so para nao ficar invisivel. Detalhe quando
cada um for promovido a uma rodada:
- Limite de orcamento configuravel; rate limit por modelo; fallback automatico
  entre modelos; seletor de modelo dinamico.
- Cadastro de provedores na UI (parcial via CTXSECRETS01); comparacao de
  respostas lado a lado.
- Editor visual de workflow (DAG); loops sequencial/paralelo (fan-out/fan-in) /
  ReAct condicional.
- Guardrails / cerca eletronica / kill-switch.
- Consulta a KB antes de responder + embeddings sqlite-vss (RAG semantico).
- JARVIS: wake-word + Whisper STT + Piper TTS on-premise.
- Tabela agent_executions com ranking por posicao real; LM Eval Harness
  (benchmark padronizado de modelos por posicao).
- Multi-tenant + billing + DPA/LGPD + docs publicas + hardening (fase GA,
  conecta com item #9 EXPANSAO).

## Sprint 2 — Import GitHub (item #2, em andamento)
Status 2026-07-11 (3a sessao): **Fases A0, A2 e B (nucleo B0-B5) concluidas.**
- A0 (daemon project-runner): ver services/project-runner/ e commit 93a2bbf.
  Executor isolado (projrunner nao-root, ProtectSystem=strict, score 3.9),
  JWT+path-guard, clone --depth 1 + limite + timeout, staging atomico.
- A2 (integracao api): POST /api/projects/:slug/import em projectsRoutes.cjs.
  Api gera JWT interno admin (120s) e chama o daemon; re-enraiza o
  stagingPath (host->container, L-B199); rename ATOMICO .staging ->
  projects/{slug}/repo/ (mesmo bind mount); project.json criado se nao
  existe OU so recebe source+updatedAt se ja existe (decisao CBini);
  listagem filtra ^[._] explicitamente. 12/12 testes E2E + verificacao
  no host (perms 750/640, .staging sem orfaos). UMask=0027 na unit.
- Rede (desvio aprovado do plano original): daemon NAO escuta mais em
  127.0.0.1 -- do container, 127.0.0.1 e o proprio container. PR_HOST=
  172.18.0.1 (IP do host na bridge app-net, padrao oqterm) + regra ufw
  "7655/tcp ALLOW from 172.18.0.0/16" (sem ela: timeout silencioso; o
  oqterm ja tinha a regra gemea p/ 7654). Unit ganhou After=docker.service.
- Bonus S2: removido o ultimo fallback fraco de JWT_SECRET (hardcoded em
  projectsRoutes.cjs:20, lacuna do S2 achada pela CBini) -- agora fatal,
  mesmo padrao do server.js.

- Fase B (container isolado por projeto): **nucleo B0-B5 CONCLUIDO e
  commitado em 2026-07-11** (B0/B1 921ea4c plano+contrato, B2 a084c2b
  daemon project-supervisor, B3 edb6b65 bridge+ufw 7656, B4 2b89fe3
  rotas deploy/stop/runtime, B5 1925921 preview vivo /app/ no proxy).
  Detalhe em knowledge/metas/RODADA-7-PLANO-CONTAINER-ISOLADO.md.

**Pendente:**
- Fase B — restos: B2b (stack `node` via Dockerfile build-time; supervisor
  responde 501 ate la; proxy precisa mapear internalPort) e B6 (docs/licoes,
  em andamento 2026-07-11).
- Fase C (preview conteinerizado): REAVALIAR se ainda faz sentido como fase
  separada — o B5 ja entregou preview do container vivo atras de auth;
  o que sobraria para C precisa ser redefinido antes de virar rodada.
- Achados de seguranca da sessao A2 (triados em 2026-07-11):
  - [CORRIGIDO] blocoMemoryRoutes.cjs -- era MUITO pior que "fallback fraco":
    assinatura invalida caia num "fallback decode" que aceitava QUALQUER
    token bem-formado (auth decorativa), na rota que ESCREVE .md em
    knowledge/ (vetor de contaminacao da KB, e /api/memory e isenta do
    rate-limit global). Fix AUTHFIX: require duro + JWT_SECRET fatal +
    jwt.verify ou 401. Teste 3/3 (forjado=401, sem token=401, valido=200).
  - [BAIXA] mas/auth.mjs:27 -- codigo OK (sem fallback); so o COMENTARIO
    esta obsoleto (cita fallback do server.js que o S2 removeu) e o
    console.error poderia ser exit(1). Corrigir quando tocar no arquivo.
  - [CORRIGIDO] ADMIN_PASSWORD -- definida no .env pela CBini (valor nunca
    manuseado pelo assistente) + docker compose up -d --force-recreate api
    (relê .env; restart NAO releria -- L-INFRA01). Validado: warning
    CTXAUTH2FA01 sumiu do boot (senha do .env em uso); senha padrao antiga
    'OrquestrAI@2025' agora da 401 "senha incorretos"; senha nova chega ao
    gate TOTP (need_totp=true). Login exige Turnstile na 1a chamada +
    TOTP -- defesa em 2 camadas alem da senha.
- Rotas GET /modes e /scorecard de projectsRoutes.cjs sao inalcancaveis
  (sombreadas por GET /:slug, definidas depois) -- bug pre-existente,
  corrigir quando tocar no arquivo de novo.
