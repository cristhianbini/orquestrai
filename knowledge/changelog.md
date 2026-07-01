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
