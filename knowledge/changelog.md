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
