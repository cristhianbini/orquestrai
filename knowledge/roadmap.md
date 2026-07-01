---
documento: roadmap
mantido_por: humano+ia
ultima_atualizacao: 2026-06-30
status: vivo
---

## 📊 Status do ciclo de sprints (2026-07-01)

**Ciclo atual:** Rodada 3 (10 itens)
**Concluidos (8/10):** CTXAGT02, CTXAGT03, CTXFORMAGT01, CTXSSE03, CTXDURATION01, CTXLITESTREAM01, CTXSPOT05, CTXFEEDBACK01
**Em andamento:** 9/10 CTXREVISOR01
**Restante:** 10/10 CTXHARNESS01
**Regra permanente:** ao fechar 10/10, a proxima rodada de 10 e planejada automaticamente antes de novo pedido do humano.

## Concluido - fundacao tecnica (2026-06-29/30)
- [x] CTXMEM01 - memoria de conversa persistente no chat individual (history + conversationId)
- [x] OQ-SEC01 - bloqueio de backups (.bak/.env/.log) expostos no docroot publico
- [x] Versionamento git (repo privado github.com/cristhianbini/orquestrai)

## Backlog sem release definida (pendencias 01-14)
- [ ] 01 - titulo pendente de confirmacao
- [ ] 02 - titulo pendente de confirmacao
- [ ] 03 - titulo pendente de confirmacao
- [ ] 04 - titulo pendente de confirmacao
- [ ] 05 - titulo pendente de confirmacao
- [ ] 06 - Limite de orcamento configuravel
- [ ] 07 - Rate limit por modelo
- [ ] 08 - Cadastro de provedores na UI
- [ ] 09 - Seletor de modelo dinamico
- [ ] 10 - Fallback automatico entre modelos
- [ ] 11 - Score de qualidade por IA (base do Release 0.7, ver abaixo)
- [ ] 12 - Comparacao de respostas lado a lado
- [ ] 13 - Editor visual de workflow (DAG)
- [ ] 14 - Loop sequencial

## Release 0.4 - Core
- [ ] Loop paralelo (fan-out/fan-in)
- [ ] Loop ReAct (condicional)
- [ ] Guardrails e cerca eletronica
- [ ] Kill-switch

## Release 0.5 - RAG
- [ ] Indexacao automatica da knowledge base
- [ ] Consulta antes de responder
- [ ] Nao repetir erros registrados em licoes/
- [ ] Embeddings com sqlite-vss
- [ ] Padrao de proveniencia (frontmatter) em todo conteudo gerado por agente -- ver knowledge/skills/proveniencia-conteudo/SKILL.md

## Release 0.6 - JARVIS
- [ ] Wake-word "OrquestrAI"
- [ ] Whisper STT on-premise
- [ ] Piper TTS on-premise
- [ ] Voz so para leitura (nunca execucao)

## Release 0.7 - Agentes com posicao e ranking (decidido 2026-06-30)
- [ ] Tabela agent_executions (outcome, judged_by, position_id, provider, model)
- [ ] Ranking por posicao real (BATEDOR/AUDITOR/DETETIVE/ARQUITETO/GUARDIAO/MEMORIALISTA/RELATOR/METRICO)
- [ ] Realocacao do modelo numa posicao com base em desempenho medido
- [ ] Julgamento manual + automatico primeiro; peer-review entre agentes so depois de validar fase 1

## Release 1.0 - GA
- [ ] Multi-tenant
- [ ] Painel de billing
- [ ] DPA e LGPD
- [ ] Docs publicas
- [ ] Hardening total
- [ ] Modularizacao do frontend (dashboard.html -> modulos) -- DECISAO EM ABERTO: vanilla+build leve vs Next.js/Prisma do baseline v2.0

## Decisoes de arquitetura (log)
- 2026-06-30: Frontend evolui para Vite+React+Tailwind (sem framework pesado tipo Next.js, sem trocar banco/auth). Migracao por tela, comecando por index.html (login) como piloto. Motivo: trabalho real esta no backend (memoria MAS, ranking de agentes); frontend so precisa ficar mais leve/visual.
- 2026-06-30: Captura de conhecimento para agentes NAO inclui comando de terminal bruto (ruido). Criterio: so BLOCO aplicado via /api/execute + outcome (sucesso/falha/exit code), nunca comando read-only isolado (ls/cat/grep). Liga em agent_executions (Release 0.7).

## Sprint atual (rodada 1 -- foco imediato, 2026-06-30)
1. [x] CTXMAS01 - memoria entre runs do MAS (ultimas 3 runs concluidas injetadas no contexto)
2. [x] BLOCO no modo MAS - extrair codigo do agente 'smith' para o card BLOCO (igual chat individual ja faz); comentario no chat vira resumo curto por agente; codigo do BLOCO entregue ja vem comentado
3. [x] Teste de validacao - CONFIRMADO em producao (memoria individual + memoria MAS + BLOCO extraido + resumo curto). Achado: chave Groq invalida para auditor/metrico (corrigida via UI Providers, fora do codigo) - confirmar memoria do MAS funcionando (mesmo teste do chat individual: pergunta, depois "lembra?", via run com palavra-gatilho de auditoria)
4. [x] agent_executions (via tabela existente 'execucoes' + colunas de proveniencia, CTXPROV01) - schema de outcome (sucesso/falha) ligado a /api/execute, base do Release 0.7
5. [x] UI do card de agente - badge ja existia (b124g5), intensificado (CTXPULSE01); score por agente planejado (CTXAGENTSCORE01, Rodada 4), UI visual adiada para Vite/React por decisao consciente - badge "trabalhando agora" (liga no inicio, muda ao proximo agente) + indicador de score visual (luz vermelho/verde) abaixo do custo, alimentado por agent_executions

## Backlog futuro - ordenado de mais facil para mais dificil

### Facil
- [ ] Limpeza periodica de arquivos orfaos (ex: mas/agents.mjs.pre-B236 e outros que aparecerem)
- [ ] Verificar fluxo de "Novo Projeto": confirma criacao de diretorio individual por projeto + bloqueio de nome duplicado
- [ ] Topbar do cockpit: compactar espacamento/fonte/botoes (fazer junto da migracao para Vite/React ja decidida)

### Media
- [ ] Tela de Agentes: reintroduzir configuracao de providers/modelos ali, priorizando agentes gratuitos por padrao (liga com pendencias 06-limite-orcamento e 07-rate-limit ja existentes)
- [ ] Revisar tela de Licoes Aprendidas (149 itens hoje): formato, ordem, organizacao -- precisa investigar estado atual antes de desenhar solucao
- [ ] Tela de Projetos: preparar para teste progressivo (login simples -> login+menu -> cenarios avancados), suporte a treinar a IA nesses niveis de complexidade
- [ ] Novo Projeto etapa 3 (Descricao/Objetivo, Filtros): botao "IA melhora a descricao/filtros" antes de criar o projeto, para facilitar entendimento do MAS
- [ ] Novo Projeto: opcao de clonar repositorio git via URL para dentro da VPS (inverso do fluxo de push que ja fizemos)
- [ ] Agente especializado em Design (UI/consistencia visual) -- AVALIACAO: viavel, faz sentido como 9a posicao do MAS; fica mais natural apos Release 0.7 (ranking por posicao) e migracao para Tailwind/React (vocabulario de design consistente para o agente revisar)

### Dificil
- [ ] Instalador/script de setup do OrquestrAI para outras VPS Ubuntu -- alto valor estrategico (torna o produto replicavel), mas exige externalizar o que hoje e manual (docker-compose, nginx, .env template, schema inicial do banco) em instalador real testado do zero

### Distante / depende de investimento separado
- [ ] VPS dedicada com GPU para rodar modelos localmente -- AVALIACAO HONESTA: viavel tecnicamente (vLLM/Ollama com modelo open-weight), mas e projeto de infraestrutura a parte, nao so configuracao: GPU VPS custa significativamente mais que a KVM2 atual, exige escolher/quantizar modelo e dimensionar VRAM. Visao de longo prazo, nao proximo passo.

## Decisao 2026-06-30: card .oq46y-card ja tem 10+ patches sobrepostos (B330/B423/B434/B435/B443). Backend de score por agente planejado (CTXAGENTSCORE01, Rodada 4 -- CTXSCORE01 nunca foi implementado, achado em 2026-07-01 durante CTXHARNESS01). Renderizacao visual (luz vermelho/verde) ADIADA de proposito ate a migracao Vite/React -- evitar patch #12 num elemento ja fragil.

### Distante / depende de investimento separado (cont.)
- [ ] Isolamento por container (Docker) por projeto -- AVALIACAO: ideia solida, padrao conhecido de isolamento multi-tenant. Conecta direto com pendencia 27-multi-tenant ja existente, nao e item isolado. Caminho natural: hoje (VPS unica) -> container Docker dedicado por projeto (isolamento de processo/rede/volume, viavel ainda na VPS atual) -> futuro distante (cluster/datacenter proprio, multiplas VPS), so se a demanda real justificar esse investimento. Exige projeto de orquestracao de containers (provisionamento dinamico, limites de recurso, rede isolada) -- nao e so "rodar mais um docker-compose".

## Sprint Rodada 2 -- facil→dificil, foco visual primeiro (definido 2026-06-30)

### FACIL (resultado visivel imediato, baixo risco)

1. [ ] CTXSPOT04 -- BATEDOR amarelo permanente: remover os 2 setTimeout(markFirstWaiting) que
       rodam na carga da pagina (linhas 3422-3423 do dashboard.html). Causa raiz confirmada.

2. [ ] CTXNGINX01 -- Warning http2 no nginx: trocar 'listen 443 ssl http2' por
       'listen 443 ssl; http2 on;' (1 linha, sintaxe moderna). Zero impacto funcional.

3. [ ] CTXSSE02 -- Conexoes SSE antigas acumulando: o frontend deve fechar o EventSource
       anterior antes de abrir um novo (window.oqCurrentES?.close() antes de cada new EventSource).
       Evita o log de timeouts de runs antigas.

4. [ ] CTXGUARD01 -- guardianApproved() nunca chamada: em promote-lessons.mjs, adicionar
       verificacao real antes de promover licao (hoje qualquer L-PROP bem-formada vira licao,
       sem checar se Guardian aprovou de verdade).

5. [ ] CTXB361 -- MutationObserver proibido (violacao L-B70): B361 usa
       new MutationObserver(...).observe(document.documentElement, {subtree:true}).
       Trocar por simples click handler no botao que abre o modal.

### MEDIO (logica nova, mas isolada)

6. [ ] CTXBRIDGE01 -- Ponte memoria chat individual → MAS: quando runMas() inicia,
       buscar as ultimas N mensagens da conversa ativa (oq46mCID) e injetar como
       contexto adicional. Assim o MAS sabe o nome do usuario, o que foi discutido antes
       de ativar o modo MAS, etc.

7. [ ] CTXROUTE01 -- "lembra meu nome?" em modo MAS vai pro quickChatReply (backend
       nao sabe que o frontend esta em modo MAS): passar flag {mas_mode: true} no body
       de /api/mas/run, e no backend so ativar quickChatReply se mas_mode=false.

8. [x] CTXMODELOS01~06 -- Aba MODELOS do modal Providers: ligar ao b342u que ja existe
       (implementacao completa com filtro/FREE tags) mas nunca foi conectado a essa aba.
       Sem reescrever nada, so religar as pecas existentes.

### DIFICIL (reescrita ou refatoracao real)

9. [ ] CTXVITE01 -- Inicio da migracao frontend: extrair o login (index.html) pra
       componente React+Vite+Tailwind como projeto piloto. Pipeline: Vite build →
       dist/ copiado pro nginx-web. Resto do dashboard.html fica intacto ate o piloto
       provar o pipeline.

10. [ ] CTXVITE02 -- Modularizar dashboard.html: apos CTXVITE01 validar o pipeline,
        extrair o painel de agentes MAS como segundo componente React. Score visual
        (luz vermelho/verde, dado de CTXAGENTSCORE01) nasce aqui, limpo, sem mais patch em cima
        de patch.

## Escalacao do Time de Agentes (decidido 2026-06-30)
Inspiracao: time de futebol.
- 11 titulares (posicoes fixas, sempre no pipeline)
- 15 reservas (especializacoes, convocados por tipo de tarefa)
- Total elenco: 26 agentes

Time titular atual (8/11):
  1 BATEDOR    (scout)        - varredura rapida inicial
  2 AUDITOR    (auditor)      - analise detalhada e revisao
  3 DETETIVE   (detetive)     - investigacao e correlacao
  4 ARQUITETO  (smith)        - arquitetura e estruturacao
  5 GUARDIAO   (guardian)     - protecao e validacao
  6 MEMORIALISTA (memorialista) - registro de memorias e licoes
  7 RELATOR    (rel)          - relatorios e sinteses
  8 METRICO    (metrico)      - metricas e monitoramento
  9 REVISOR - revisao de qualidade final antes da entrega ao humano (slot titular, modelo top: claude-opus-4-8 ou superior). Diferente do GUARDIAO (seguranca): o REVISOR avalia qualidade da solucao, nao apenas seguranca. Convocado apenas ao final do pipeline pra reduzir custo. Nota: Claude Mythos Preview (mais avancado da Anthropic) nao disponivel publicamente -- ver anthropic.com/glasswing. FABLE: sem confirmacao oficial, aguardar lancamento antes de planejar.
 10 (vago) - sugestao: TESTADOR (validacao automatizada, TDD)
 11 (vago) - sugestao: PUBLICADOR (deploy, release notes, changelog)

Reservas (0/15): a definir conforme necessidades reais dos projetos.
Criterio de convocacao: taxa de acerto por tipo de tarefa (agent_executions, Release 0.7).

## Backlog futuro (adicionado 2026-06-30)
- [ ] GitHub RAG: ingerir repos publicos do GitHub (README/docs/codigo) na knowledge base local. Agente PESQUISADOR (reserva) faz git clone + parse + chunks no banco. Agentes consultam antes de responder. Conecta com Release 0.5 (RAG).
- [ ] LM Eval Harness: integrar benchmarks padronizados (EleutherAI lm-evaluation-harness) pra ranquear modelos por posicao antes de designar ao time. Complementa agent_executions (Release 0.7).

## Sprint Rodada 3 (proxima sessao)

### FACIL
1. [ ] CTXAGT02 - Botao "Usar neste agente" na aba MODELOS: seleciona posicao e persiste modelo no banco (substitui hardcode no AGS)
2. [ ] CTXAGT03 - AGS carregado do banco (nao hardcoded): permite mudar modelo de qualquer posicao sem deploy
3. [ ] CTXSPOT05 - Corrigir erros linha 2606 (B187 instrumento tentando setar innerHTML em elemento null) -- 70+ erros no console acumulando

### MEDIO
4. [ ] CTXREVISOR01 - Adicionar agente REVISOR como posicao #9 do pipeline MAS (modelo: claude-opus-4-8, convocado so ao final, avalia qualidade da solucao, nao apenas seguranca)
5. [ ] CTXRAG01 - GitHub RAG basico: clonar repo via URL para /var/www/orquestrai/projects/{nome}, indexar README+docs na knowledge base, agentes consultam antes de responder
6. [ ] CTXBUMP01 - Versionar o sistema apos cada sprint com bump-version.sh (hoje nao tem sido feito sistematicamente)

### DIFICIL
7. [ ] CTXVITE01 - Migrar login (index.html) para Vite+React+Tailwind como piloto do pipeline de build
8. [ ] CTXVITE02 - Modularizar painel de agentes MAS como segundo componente React (score visual nasce aqui limpo)
9. [ ] CTXLMEVAL01 - Integrar LM Eval Harness para benchmarking de modelos por posicao antes de designar ao time
10. [ ] CTXRESERVA01 - Estrutura para reservas: suporte a mais de 11 posicoes no AGS, convocacao por tipo de tarefa (liga com agent_executions)

## Metas futuras registradas em sessao (2026-07-01)

### Dog-fooding: OrquestrAI melhorando o proprio OrquestrAI
- [ ] Usar o MAS do OrquestrAI para propor e revisar patches do proprio sistema (ja funciona parcialmente -- formalizar como workflow padrao)
- [ ] Conectar projeto "orquestrai" no modulo de Projetos e usar os agentes via interface, sem precisar do Claude.ai externo
- [ ] Pipeline: humano descreve goal -> MAS propoe BLOCO -> REVISOR comenta antes de executar -> humano aprova -> executor roda

### Calibracao dos agentes via knowledge base (em vez de fine-tuning)
- [ ] Criar SKILL.md individual por agente em knowledge/skills/ (Bom em, Ruim em, Quando chamar, Nao chamar, Exemplos reais)
- [ ] Agentes lerem o SKILL.md dos outros agentes antes de delegar -- conhecimento mutuo do time
- [ ] Tooltip de descricao nos cards da Mesh Network (lado direito) mostrando especialidade do agente ao passar o mouse

### Polimento visual (rodada 4)
- [ ] Topbar mais compacta (fonte menor, icones, info densa sem poluicao)
- [ ] Cards da Mesh Network com indicador de desempenho historico (taxa de acerto, ultimas runs)
- [ ] Animacao suave ao trocar de aba no modal de Providers

### Monitoramento e avaliacao dos agentes
- [ ] Dashboard de metricas por agente: total de runs, taxa de sucesso, custo acumulado, tempo medio
- [ ] Comparativo de modelos por posicao (qual modelo teve melhor taxa no slot AUDITOR, por exemplo)
- [ ] Alerta automatico quando um agente falha mais de N vezes seguidas (liga com CTXSSE03 heartbeat)

## Itens do Parecer Consultivo v2 (2026-07-01) -- filtrado e priorizados

### Incorporados ao roadmap (novos, acionaveis, nao duplicados)
- [ ] CTXLITESTREAM01 - Backup SQLite continuo via Litestream (S3/B2 ou local) -- 0.5pw, risco critico mitigado (§3.1 debt_5)
- [ ] CTXDURATION01 - Coluna duration_ms em mas_event -- prerequisito para Harness Score real (§4.2)
- [ ] CTXFEEDBACK01 - Botao 👍/👎 explicito no BLOCO LAVE -- sinal humano real para w3 do Harness Score (gap identificado na revisao)
- [ ] CTXHARNESS01 - Harness Score v1 simplificado: exec_success + guardian_pass + human_approve + cost (sem OTel, usando dados ja coletados) (§4.1)
- [ ] CTXPIPELINE01 - Pipeline MAS adaptativo: classificar tarefa (simples/medio/complexo) e rodar 3/6/8 agentes -- reducao 40-60% custo runs simples (§Q10)
- [ ] CTXKBCURATOR01 - Revisao semanal da KB em batch (Memorialista + Guardian como pre-filtro, humano aprova em lote) -- evita KB envenenada (§3.1 debt_4)

### Descartados por ora (prematuros ou overkill para fase atual)
# OTel/Uptrace -- overkill para 1 VPS, cabe na Fase 3
# Redis+BullMQ -- SQLite WAL aguenta 100x o volume atual
# Kernel+Efemeros -- overkill ate 15+ agentes concorrentes ativos
# SOPS/secrets vault -- .env privado aceitavel no estagio atual
# K8s/Nomad -- Fase 5+, se chegar la

### Principios do documento que ja seguimos (confirmados)
# LAVE_sempre, KB_versionada, sem_vendor_lockin, dogfood_primeiro, incremental


## Rodada 4 (planejada automaticamente ao fechar Rodada 3, 2026-07-01)

Ordem: SEGURANCA -> FRONTEND -> CONHECIMENTO -> ESCALA. Fundamentos antes de expansao.

### Bloco 1 -- Seguranca (rapido, critico)
1. [ ] CTXAUTH2FA01 - Finalizar 2FA TOTP (RFC 6238, ja parcial em server.js B31C). Compativel
       nativamente com Google Authenticator/Authy. Obrigatorio para sessao com kind=E.
2. [ ] CTXSECRETS01 - Criptografar API keys em repouso (hoje .env plano) via age/sops.
       Revisita decisao anterior de adiar -- priorizado por pedido explicito 2026-07-01.
3. [ ] CTXAUDIT01 - Auditoria hash-chain estendendo colunas ja existentes em execucoes
       (usuario_jwt_sub, ip_origem) -- tamper-evident, Escopo V6.0 §11.
4. [ ] CTXRATELIM01 - Rate limiting dedicado nos endpoints que tocam a knowledge base
       (/api/mas/*, /api/agents/*, /api/providers/*) -- previne extracao em massa.
5. [ ] CTXAGENTSCORE01 - Score por agente (nao por run): % de runs sem veto/erro por agent_id,
       extensao do CTXHARNESS01 agrupando mas_event por agent. So backend/API, zero risco de HTML.
       Pre-requisito de dados para a animacao visual pedida em CTXVITE02 (item abaixo).

### Bloco 2 -- Frontend (antecipado por decisao 2026-07-01)
5. [ ] CTXVITE01 - Login (index.html) para Vite+React+Tailwind, piloto do pipeline
6. [ ] CTXVITE02 - Painel de agentes MAS como componente React (score visual nasce aqui)

### Bloco 3 -- Conhecimento
7. [ ] CTXKBCURATOR01 - Revisao semanal da KB em batch (Memorialista + Guardian pre-filtro)
8. [ ] CTXSKILL01 - SKILL.md por agente, frontmatter type:lesson/type:adr (inspirado em
       analise do documento Mega-Brain, sem instalar plugin externo)
9. [ ] CTXPIPELINE01 - Pipeline MAS adaptativo (simples/medio/complexo -> 3/6/8 agentes)

### Bloco 4 -- Escala
10. [ ] CTXRAG01 - GitHub RAG com sanitizacao anti-prompt-injection desde o design
        (conteudo externo indexado e sempre dado, nunca instrucao)

## Arquitetura de seguranca da Knowledge Base (decidido 2026-07-01)

Duas fases, evitando over-engineering prematuro (single-tenant hoje):
- **Fase atual:** rate limiting (CTXRATELIM01), secrets cifrados (CTXSECRETS01), auditoria
  hash-chain (CTXAUDIT01), sanitizacao anti-prompt-injection no RAG desde o design.
- **Fase GA (Release 1.0, multi-tenant):** isolamento real por organizacao/workspace,
  RBAC granular, embeddings/indices vetoriais segregados por tenant. Prematuro fazer agora.

## Analise de documentos anexados (2026-07-01) -- filtrado

### Incorporado
- Padronizar frontmatter type:lesson/type:adr em knowledge/ (inspirado em Mega-Brain, sem plugin)
- 2FA TOTP + secrets cifrados + audit hash-chain (ja exigidos no Escopo V6.0 §11, nao implementados)
- Validacao 3 camadas (AIOX) -- vira item quando houver suite de testes automatizados

### Descartado
- Plugin claude-mega-brain (dependencia externa, ja coberto pelo Claude Project + KB propria)
- Framework AIOX completo (Next.js/outra taxonomia, colide com decisoes ja tomadas)
- Grafo de conhecimento / sistema de reputacao entre agentes (overkill para 8 agentes, reavaliar em Release 0.7+)
- Stack MySQL/Redis do Escopo V6.0 (implementacao real ja divergiu para SQLite por decisao consciente e funciona bem)

## CTXPROVBRIDGE01 (adicionado 2026-07-01, achado durante CTXHARNESS01)
- [ ] CTXPROVBRIDGE01 - Ligar bloco_n (execucoes) ao run_id certo do MAS: quando o
      frontend chama /api/blocos/preparar a partir de um card BLOCO extraido de um
      run do MAS, enviar mas_run_id no body. Sem isso, human_approve nunca entra no
      Harness Score de verdade. Pre-requisito para Harness Score v2 completo.

## 🔴 CTXUNIFY01 (investigado 2026-07-01, DECISAO DE ARQUITETURA pendente)
Mapeamento completo feito -- sao 2 modelos DIFERENTES, nao so 2 botoes pro mesmo lugar:

1. execBloco()/#bloco -> /api/blocos/preparar+executar (container orquestrai-api):
   comando ISOLADO com sha256 anti-tampering, autorizo+confirmacao+motivo obrigatorios,
   hash-chain (CTXAUDIT01), timeout/ulimit, roda DENTRO do container Docker.
   Pouco usado na pratica (ultima execucao real: 8 dias atras).

2. Cards numerados (BLOCKS/cardHTML/oq71z-exec) -> /opt/oqterm/server.js (porta 7654,
   FORA do docker-compose, roda direto no host como root, PID solto desde 22/06):
   sessao de TERMINAL INTERATIVA real (pty.spawn('/bin/login',['-f','root'])), com
   estado entre comandos, diretorio atual mantido. Valida JWT (role=admin/super_admin
   ou sub na ALLOWED list), nega com 403 se nao autorizado, loga por usuario/dia em
   /opt/oqterm -- tem protecao propria, so que DIFERENTE da do resto do sistema (fora
   do 2FA/cifra/hash-chain que protegemos hoje). E o que voce usa de fato no dia a dia.

## Decisao necessaria (nao e patch simples, e escolha de arquitetura):
- Opcao A: aceitar que sao 2 modelos legitimos p/ usos diferentes (comando pontual
  auditado vs sessao interativa root) -- documentar claramente, sem tentar fundir.
- Opcao B: fazer o terminal interativo tambem gravar em execucoes (hash-chain cobre
  os 2), sem mudar o modelo de execucao em si.
- Opcao C: migrar tudo pro modelo protegido (perderia a interatividade de sessao).
Risco do oqterm em si (fora do escopo do unify, mas achado junto): root sem senha,
fora de Docker, unico controle e assinatura do JWT_SECRET -- se JWT_SECRET vazar,
acesso root total ao host. Considerar CTXOQTERM01 (escopo de usuario limitado,
nao root direto) como item separado, tambem exige decisao de arquitetura com calma.

## 🟡 Achados do CTXRATELIM01 (2026-07-01) -- pendentes, nao corrigidos hoje
- [ ] CTXAGENTAUTH01 - /api/agents/create (server.js:375) nao tem authMiddleware --
      qualquer um pode criar agente sem login. Achado durante CTXRATELIM01, nao
      corrigido na hora (fim de sessao longa, prefere decisao com calma).
- [ ] CTXRATELIM02 - /api/mas/* e /api/blocos/* continuam SEM rate limit dedicado
      (isentos pelo skip do limiter global B49L). CTXRATELIM01 cobriu so os
      endpoints de server.js que nao dependiam de reler arquivo separado com
      calma. Fechar junto com a decisao do CTXUNIFY01.
