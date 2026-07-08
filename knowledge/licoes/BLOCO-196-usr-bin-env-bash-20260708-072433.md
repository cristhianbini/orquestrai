---
tipo: licao-automatica
bloco: BLOCO-196
title: "Auto: !/usr/bin/env bash"
sha256: a319f4b0ebb3bdfc21f032edbd92e21e9d6d7208a78f0c30f97f5751cc3a07b5
created: 2026-07-08T07:24:33.919Z
---

# BLOCO-196 - !/usr/bin/env bash

## O que ficou aprendido
Bloco LAVE persistido automaticamente para consulta futura.

## Script completo
~~~bash
#!/usr/bin/env bash
# BLOCO-305 v1.0 — Auditoria memória VPS (READ-ONLY)
set +e; set -H

echo "===== TOP 5 PROCESSOS POR %MEM (com RSS real) ====="
# RSS = memória física real (KB); %MEM sozinho engana em box com muita RAM.
# Mostro os dois lado a lado pra correlacionar pressão real vs percentual.
ps aux --sort=-rss | awk '
  NR==1 {printf "%-9s %6s %5s %10s %s\n","USER","PID","%MEM","RSS_KB","CMD"}
  NR>=2 && NR<=6 {printf "%-9s %6s %5.1f %10s %s\n",$1,$2,$4,$6,substr($0,index($0,$11))}'

echo -e "\n===== RAM/SWAP GLOBAL (/proc/meminfo) ====="
# meminfo é a fonte-verdade; free -h abaixo é só o resumo legível.
grep -E '^(MemTotal|MemAvailable|MemFree|SwapTotal|SwapFree|Buffers|Cached):' /proc/meminfo

echo -e "\n===== RESUMO free -h ====="
free -h

echo -e "\n===== CONTAINERS DOCKER (snapshot) ====="
# --no-stream: 1 leitura e sai; sem isso trava esperando refresh contínuo.
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" 2>/dev/null \
  || echo "(docker stats indisponível)"

echo -e "\n===== FIM BLOCO-305 ====="
~~~
