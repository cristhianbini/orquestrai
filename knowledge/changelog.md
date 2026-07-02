## [0.19.0] - 2026-07-01
### Mudado
- Reorganizacao completa do roadmap.md: 3 categorias claras (Rodada Ativa/Achados Pendentes/Metas Futuras), status desatualizados corrigidos, secoes obsoletas arquivadas, 0 itens tecnicos perdidos (verificado por diff)

## [0.18.2] - 2026-07-01
### Mudado
- Fix: ADMIN_PASSWORD placeholder literal removido (executado por engano), revertido para estado pendente real

## [0.18.1] - 2026-07-01
### Mudado
- CTXHYGIENE01 - knowledge/agentes/ (pastas mortas) arquivado. Esclarecido: blocosRoutes.cjs duplicado e mount intencional, nao bug. ADMIN_PASSWORD ainda pendente (decisao do usuario)

## [0.18.0] - 2026-07-01
### Mudado
- CTXSKILL01 - 6 AGENT_CARD completados (auditor/guardian/memorialista/rel/metrico/revisor), 9/9 titulares com card completo. RODADA 4 CONCLUIDA 10/10

## [0.17.0] - 2026-07-01
### Mudado
- CTXKBCURATOR01 - fila de revisao humana antes de licoes entrarem na KB (antes: auto-promocao direta so com Guardian regex). 3 endpoints: kb/pending, kb/approve, kb/reject

## [0.16.1] - 2026-07-01
### Mudado
- Fix critico CTXVITE01 - login travava no dashboard.html:1393 (chave de token) + tela preta no logout (rota /index.html ausente no router). Resolvido e testado.

## [0.16.0] - 2026-07-01
### Mudado
- CTXRATELIM02 - rate limit diferenciado em mas/routes.mjs (run 5/min, leituras 30/min, SSE sem limite). Achado: 7 rotas sem authMiddleware -- CTXMASAUTH01 registrado

## [0.15.0] - 2026-07-01
### Mudado
- CTXAGENTAUTH01 - authMiddleware em /api/agents/create + token no fetch do dashboard. Testado: 401 sem auth, criacao normal com token

## [0.14.0] - 2026-07-01
### Mudado
- CTXVITE02 (parcial) - AgentPanel React com 9 cards, SSE real, StatusBadge animado, ScoreMeter visual (sem dado ate CTXUNIFY01 resolver fonte de dados confiavel)

## [0.13.0] - 2026-07-01
### Mudado
- CTXVITE01 concluido - login em Vite+React deployado em producao, fluxo completo testado (senha+2FA+redirect+logout)

## [0.12.0] - 2026-07-01
### Mudado
- CTXRATELIM01 - rate limit dedicado (20/min) em providers/key, providers/test, agents/create, agents/position. Achados pendentes registrados: agents/create sem auth, mas/blocos ainda sem rate limit dedicado

## [0.11.0] - 2026-07-01
### Mudado
- CTXUNIFY01 - investigacao completa (sem patch): sao 2 modelos de execucao diferentes, nao duplicados. Achado adicional: /opt/oqterm roda root sem senha fora do Docker, controlado so por JWT. Decisao de arquitetura registrada pra proxima sessao com calma (CTXUNIFY01 + CTXOQTERM01 novo)

## [0.10.0] - 2026-07-01
### Mudado
- CTXAUDIT01 - hash-chain append-only em execucoes + endpoint verify-chain, funcionando e testado. Achado critico: 2 sistemas de EXECUTAR coexistem, um protegido (pouco usado) e outro inseguro (uso real) -- CTXUNIFY01 registrado como prioridade maxima da proxima sessao

## [0.9.0] - 2026-07-01
### Mudado
- CTXSECRETS01 - API keys dos providers cifradas em repouso (AES-256-GCM, 5/6 migradas, openai sem chave configurada). Achado critico: docker restart nao rele .env, precisa --force-recreate

## [0.8.1] - 2026-07-01
### Mudado
- CTXSPOT06 - null guard em sync() do chip de licoes (mlist/chip/n), elimina 271 erros de console recorrentes

## [0.8.0] - 2026-07-01
### Mudado
- CTXAUTH2FA01 - senha admin para .env, /api/login duplicado removido, QR TOTP local (sem vazar secret pra terceiro), avisos de fallback fraco em JWT_SECRET/ADMIN_PASSWORD

## [0.7.2] - 2026-07-01
### Mudado
- Roadmap: corrige 3 mencoes de CTXSCORE01 (nunca implementado) + CTXAGENTSCORE01 inserido no Bloco 1 Seguranca + CTXVITE02 detalhado

## [0.7.1] - 2026-07-01
### Mudado
- Roadmap: CTXAGENTSCORE01 (score por agente, backend) + CTXVITE02 detalhado com pedido de animacao no indicador de score

## [0.7.0] - 2026-07-01
### Mudado
- CTXHARNESS01 - Harness Score v1 (exec_success+guardian_pass+cost_score, sem join entre bancos). Achado: execucoes.mas_run_id nunca preenchido -- CTXPROVBRIDGE01 registrado para proxima rodada

## [0.6.0] - 2026-07-01
### Mudado
- CTXREVISOR01 - agente REVISOR posicao 9 do pipeline MAS (claude-opus-4-8, convocado ao final, avalia qualidade da solucao)

## [0.5.0] - 2026-07-01
### Mudado
- Roadmap Rodada 4 (seguranca->frontend->conhecimento->escala) + status de ciclo + analise Mega-Brain/AIOX/Evolucao Colaborativa + fix path knowledge/roadmap.md

## [0.4.0] - 2026-07-01
### Mudado
- Fix botoes feedback (write faltante) + roadmap Rodada 4 (seguranca->frontend->conhecimento) + analise Mega-Brain/AIOX/Evolucao

## [0.3.2] - 2026-07-01
### Mudado
- CTXSPOT05 remove B434 duplicados + null guard refresh

## [0.3.1] - 2026-07-01
### Mudado
- CTXDURATION01 duration_ms em mas_event + CTXLITESTREAM01 backup continuo Litestream

## [0.3.0] - 2026-06-30
### Mudado
- Rodada 2 completa: memoria MAS+individual, BLOCO MAS, aba Modelos com filtros, aba Agentes time titular, escalacao 26 agentes, REVISOR slot 9, seguranca nginx, git auto-push

## [0.2.0] - 2026-06-30
### Mudado
- Rodada 2: memoria MAS, BLOCO MAS, filtros modelos, aba agentes, time titular, REVISOR, GitHub RAG, harness

# Changelog OrquestraAI

## [0.1.3] - 2026-06-19
### Adicionado
- Base de conhecimento com 33 diretorios
- Contexto do sistema salvo em knowledge/contextos/
- Changelog e roadmap versionados
- Diretorio de skills (importadas, criadas, testadas)
- Diretorio de loops (ativos, pausados, concluidos)
- Diretorio de templates, gateways, custo

## [0.1.2] - 2026-06-19
### Corrigido
- Shell no Alpine: /bin/ash ao inves de /bin/sh
- Chat.js com todas as funcoes presentes

### Adicionado
- Botao "Aplicar na VPS" com execucao real
- Botao "Copiar" para comandos
- Extracao automatica de comandos do bloco bash
- Comandos bloqueados por seguranca

## [0.1.1] - 2026-06-19
### Adicionado
- GLM 5.2 com modo pensamento (thinking enabled)
- System prompt com contexto do servidor
- Historico de conversa (ate 30 mensagens)

## [0.1.0] - 2026-06-19
### Adicionado
- Login com JWT (bcrypt + jsonwebtoken)
- Dashboard com chat
- Seletor de modelos (GLM, GPT-4o, Claude 4, Gemini 2.5)
- Docker Compose (web, api, proxy)
- Nginx proxy reverso com SSL
- UFW + Fail2ban
- Certbot SSL Let's Encrypt
