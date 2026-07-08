---
tipo: bloco-lave
id: BLOCO-203
title: "!/usr/bin/env bash"
sha256: 4db34ae19cdd7edeb7adc0ec175613f1ddbdd58542a045717a01b0eb20a33bd4
created: 2026-07-08T19:40:39.623Z
---

# BLOCO-203 - !/usr/bin/env bash

## Script
~~~bash
#!/usr/bin/env bash
set +e; set -H

# Descobre containers vivos em runtime — evita hardcode que quebra se um nome mudar
CONTAINERS=$(docker ps --format '{{.Names}}' | grep '^orquestrai-' 2>/dev/null)
[ -z "$CONTAINERS" ] && { echo "ERRO: nenhum container orquestrai-* rodando"; exit 0; }

echo "===== BLOCO-67 v1.1 — Auditoria de Memória ====="

echo -e "\n[1/3] Stats em tempo real (snapshot único)"
# Filtra pelo mesmo conjunto: stats sem args pega TUDO no host, inclui ruído
docker stats --no-stream --format "table {{.Container}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.CPUPerc}}" $CONTAINERS 2>&1

echo -e "\n[2/3] Limites configurados + %-uso real calculado"
for container in $CONTAINERS; do
  LIMIT=$(docker inspect "$container" --format '{{.HostConfig.Memory}}' 2>/dev/null)
  RESERVATION=$(docker inspect "$container" --format '{{.HostConfig.MemoryReservation}}' 2>/dev/null)
  # LIMIT vazio (container sumiu entre ps e inspect) != "0" (sem cap): trata os dois
  LIMIT=${LIMIT:-0}; RESERVATION=${RESERVATION:-0}
  echo "Container: $container"
  if [ "$LIMIT" = "0" ]; then
    echo "  Memory limit: SEM CAP (usa RAM do host — MemPerc do stats é vs. host, não vs. limite)"
  else
    echo "  Memory limit: $LIMIT bytes (~$((LIMIT/1048576)) MiB)"
  fi
  echo "  Reservation: $RESERVATION bytes"
done

echo -e "\n[3/3] Logs recentes: sinais de OOM/heap (últimas 100 linhas)"
for container in $CONTAINERS; do
  echo "--- $container ---"
  LOGS=$(docker logs --tail 100 "$container" 2>&1)
  # grep -c antes de imprimir: distingue "sem alerta" de "container sem log" (R6-16.1)
  HITS=$(echo "$LOGS" | grep -icE "reached heap limit|out of memory|oom|fatal error|allocation failed")
  if [ "$HITS" -gt 0 ]; then
    echo "  ALERTAS: $HITS"
    echo "$LOGS" | grep -iE "reached heap limit|out of memory|oom|fatal error|allocation failed"
  else
    echo "  (sem sinais de OOM)"
  fi
done

echo -e "\n===== fim BLOCO-67 v1.1 ====="
~~~
