---
documento: roadmap
mantido_por: humano+ia
ultima_atualizacao: 2026-06-30
status: vivo
---

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
5. [x] UI do card de agente - badge ja existia (b124g5), intensificado (CTXPULSE01); score backend pronto (CTXSCORE01), UI visual adiada para Vite/React por decisao consciente - badge "trabalhando agora" (liga no inicio, muda ao proximo agente) + indicador de score visual (luz vermelho/verde) abaixo do custo, alimentado por agent_executions

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

## Decisao 2026-06-30: card .oq46y-card ja tem 10+ patches sobrepostos (B330/B423/B434/B435/B443). Backend de score pronto (CTXSCORE01, /api/agents/score). Renderizacao visual (luz vermelho/verde) ADIADA de proposito ate a migracao Vite/React -- evitar patch #12 num elemento ja fragil.

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
        (luz vermelho/verde, CTXSCORE01 UI) nasce aqui, limpo, sem mais patch em cima
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
