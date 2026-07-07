# L-INFRA01 — docker restart NAO rele .env; precisa recreate
PROJETO: orquestrai

**Data:** 2026-07-01
**Contexto:** CTXSECRETS01 -- migracao de chave falhou silenciosamente na 1a tentativa

## Erro
Adicionei PROVIDERS_ENC_KEY ao .env, rodei 'docker compose restart api',
migracao rodou sem erro visivel mas nao cifrou nada. Container so foi
criado em 27/06 -- todo restart desde entao reiniciou o MESMO processo,
nunca releu o env_file (.env) do docker-compose.yml.

## Causa raiz
'docker compose restart' reinicia o processo dentro do container existente.
Variaveis de ambiente sao injetadas na CRIACAO do container, nao no restart.
Mudancas em .env exigem 'docker compose up -d --force-recreate <servico>'.

## Diferenca importante
- Arquivo de codigo (bind mount, ex: mas/agents.mjs, server.js): restart
  simples basta, o volume ja reflete a mudanca instantaneamente.
- Variavel de ambiente nova/alterada no .env: precisa recreate.

## Regra permanente
Toda vez que adicionar ou mudar variavel no .env: usar
'docker compose up -d --force-recreate <servico>', nunca so restart.
Verificar com: docker exec <container> sh -c "cat /proc/1/environ | tr '\0' '\n' | grep NOME_VAR"
(docker exec sozinho NAO prova nada -- ele pode nao herdar env do processo
principal; sempre checar via /proc/1/environ, que e o processo real).
