---
tipo: bloco-lave
id: BLOCO-192
title: "!/usr/bin/env bash"
sha256: abd0b688a0eb82005daf718cd50eceec964a6b5a510fecdd648a6be17227938b
created: 2026-07-07T18:40:27.103Z
---

# BLOCO-192 - !/usr/bin/env bash

## Script
~~~bash
#!/usr/bin/env bash
# L-B199 (path host correto), L-B236 (read-only, sem patch)
set +e; set -H   # +e: SIGPIPE do 'head' nao aborta pipeline

PROJECT_ROOT="/var/www/orquestrai"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
REPORT_FILE="/tmp/orquestrai-maiores-dirs-${TIMESTAMP}.txt"

echo "=== BLOCO-203 @ ${TIMESTAMP} — raiz ${PROJECT_ROOT} ===" | tee "${REPORT_FILE}"

# TOP 10 arquivos individuais. -prune em vez de -not -path: nao DESCE em
# node_modules/.git (mais rapido e nao "vaza" na agregacao abaixo)
echo -e "\n--- TOP 10 ARQUIVOS (>1MB) ---" | tee -a "${REPORT_FILE}"
find "${PROJECT_ROOT}" \
  \( -path '*/node_modules' -o -path '*/.git' \) -prune -o \
  -type f -size +1M -printf "%s %p\n" 2>/dev/null \
  | sort -nr | head -10 \
  | awk '{printf "%.2f MB\t%s\n", $1/1048576, $2}' \
  | tee -a "${REPORT_FILE}"

# Agrupa por diretorio pai (%h). Mesmo -prune -> agregacao limpa
echo -e "\n--- TOP 10 DIRETORIOS (soma arquivos >1MB) ---" | tee -a "${REPORT_FILE}"
find "${PROJECT_ROOT}" \
  \( -path '*/node_modules' -o -path '*/.git' \) -prune -o \
  -type f -size +1M -printf "%s %h\n" 2>/dev/null \
  | awk '{dir[$2]+=$1} END{for(d in dir) print dir[d],d}' \
  | sort -nr | head -10 \
  | awk '{printf "%.2f MB\t%s\n", $1/1048576, $2}' \
  | tee -a "${REPORT_FILE}"

# du dos subdirs imediatos: visao macro (INCLUI node_modules de proposito,
# pra voce ver o peso real do disco por pasta raiz)
echo -e "\n--- TOP 10 CONSUMO TOTAL (du -sh, dir raiz) ---" | tee -a "${REPORT_FILE}"
du -sh "${PROJECT_ROOT}"/* 2>/dev/null | sort -hr | head -10 | tee -a "${REPORT_FILE}"

echo -e "\n--- DATABASES SQLite (data/) ---" | tee -a "${REPORT_FILE}"
[ -d "${PROJECT_ROOT}/data" ] \
  && ls -lhS "${PROJECT_ROOT}/data"/*.db 2>/dev/null | awk '{printf "%s\t%s\n",$5,$9}' | tee -a "${REPORT_FILE}" \
  || echo "(data/ ausente)" | tee -a "${REPORT_FILE}"

echo -e "\nRelatorio: ${REPORT_FILE}\n===== fim BLOCO-203 ====="
~~~
