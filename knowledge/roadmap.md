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
