---
tipo: bloco-lave
id: BLOCO-195
title: "!/usr/bin/env bash"
sha256: 8c30385e584b8f0cae1f817a303e48f95965253fb476d45fe396daf915c49799
created: 2026-07-08T07:20:56.128Z
---

# BLOCO-195 - !/usr/bin/env bash

## Script
~~~bash
#!/usr/bin/env bash
# BLOCO-305 v1.0 — Top 5 processos por consumo de RAM (READ-ONLY)
set +e; set -H

echo "===== TOP 5 PROCESSOS POR %MEM ====="
# RSS = memoria fisica real (KB). %MEM pode enganar em box com muita RAM,
# por isso mostro RSS junto: e o numero que importa pra pressao real.
ps aux --sort=-%mem | awk '
  NR==1 {printf "%-9s %6s %5s %10s %s\n","USER","PID","%MEM","RSS_KB","CMD"}
  NR>=2 && NR<=6 {printf "%-9s %6s %5.1f %10s %s\n",$1,$2,$4,$6,substr($0,index($0,$11))}'

echo ""
echo "===== LOAD / MEM GLOBAL ====="
uptime
free -h

echo ""
echo "===== DOCKER (containers orquestrai) ====="
# ps aux ja pega os processos do host (inclui os PIDs dos containers via cgroup),
# mas docker stats da o numero agregado por container, mais legivel p/ correlacao.
docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}\t{{.MemPerc}}" 2>/dev/null \
  || echo "(docker stats indisponivel)"

echo "===== fim BLOCO-305 ====="
~~~
