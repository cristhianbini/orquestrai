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
2. [ ] BLOCO no modo MAS - extrair codigo do agente 'smith' para o card BLOCO (igual chat individual ja faz); comentario no chat vira resumo curto por agente; codigo do BLOCO entregue ja vem comentado
3. [ ] Teste de validacao - confirmar memoria do MAS funcionando (mesmo teste do chat individual: pergunta, depois "lembra?", via run com palavra-gatilho de auditoria)
4. [ ] agent_executions - schema de outcome (sucesso/falha) ligado a /api/execute, base do Release 0.7
5. [ ] UI do card de agente - badge "trabalhando agora" (liga no inicio, muda ao proximo agente) + indicador de score visual (luz vermelho/verde) abaixo do custo, alimentado por agent_executions

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
