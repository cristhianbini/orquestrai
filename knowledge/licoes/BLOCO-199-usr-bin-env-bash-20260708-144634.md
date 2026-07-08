---
tipo: licao-automatica
bloco: BLOCO-199
title: "Auto: !/usr/bin/env bash"
sha256: 6b70630a08fe9afa392c393c9d83ff0cf97c2665d0b93e853712181d25bcb3f5
created: 2026-07-08T14:46:34.619Z
---

# BLOCO-199 - !/usr/bin/env bash

## O que ficou aprendido
Bloco LAVE persistido automaticamente para consulta futura.

## Script completo
~~~bash
#!/usr/bin/env bash
# BLOCO-306 v1.1 — Auditoria Docker containers (READ-ONLY)
set +e; set -H
COMPOSE="/var/www/orquestrai/docker-compose.yml"

echo "===== DOCKER PS (--all: inclui Exited/crash-loop) ====="
docker ps --all --format "table {{.Names}}\t{{.Status}}\t{{.Image}}\t{{.Ports}}"

echo -e "\n===== RESTART POLICY + UPTIME (itera --all, nao so running) ====="
# --all garante que container caido tambem apareca no inspect
for c in $(docker ps --all --format '{{.Names}}'); do
  echo "--- $c ---"
  docker inspect -f \
    'State: {{.State.Status}} | Started: {{.State.StartedAt}} | RestartCount: {{.RestartCount}} | Policy: {{.HostConfig.RestartPolicy.Name}}' \
    "$c"
done

echo -e "\n===== LOGS orquestrai-api (contexto + filtro erro) ====="
# grep -c primeiro: distingue "sem erro" de "container inacessivel" (R6-16.1)
LOGS=$(docker logs --tail 50 orquestrai-api 2>&1)
if [ -z "$LOGS" ]; then
  echo "AVISO: logs vazios ou container inexistente"
else
  ERR=$(echo "$LOGS" | grep -cE 'SyntaxError|Error:|ENOENT|exit code')
  echo "matches de erro: $ERR"
  [ "$ERR" -gt 0 ] && echo "$LOGS" | grep -E 'SyntaxError|Error:|ENOENT|exit code'
fi

echo -e "\n===== OQTERM (systemd, fora do Docker) ====="
systemctl status oqterm --no-pager 2>&1 | grep -E 'Active:|Main PID:|Restart='

echo -e "\n===== COMPOSE DECLARADO (drift check manual) ====="
# grep -n dos service names + restart pra cruzar declarado vs. inspect acima
grep -nE '^\s{2}[a-z].*:$|restart:' "$COMPOSE" 2>/dev/null | head -30

echo -e "\n===== fim BLOCO-306 v1.1 ====="
~~~
