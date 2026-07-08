---
tipo: bloco-lave
id: BLOCO-188
title: "!/usr/bin/env bash"
sha256: 9acaf2b85438fd360cb6343d426fa55715bfdca3e8e0481a1afd6cf9f8239712
created: 2026-07-07T12:27:27.280Z
---

# BLOCO-188 - !/usr/bin/env bash

## Script
~~~bash
#!/usr/bin/env bash
# BLOCO-67 — Maior arquivo do OrquestrAI (read-only)
# L-B199 (path do container), L-B194 (bind-mount = leitura ao vivo)
set +e; set -H

PROJECT_ROOT="/var/www/orquestrai"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
REPORT_FILE="/tmp/orquestrai-largest-${TIMESTAMP}.txt"

# fmt() centraliza a formatacao KB/MB pra nao repetir awk 3x
fmt='{s=$1;$1="";m=s/1048576;k=s/1024;printf "%-10s %s\n",(m>=1?sprintf("%.2fMB",m):sprintf("%.2fKB",k)),$0}'

echo "=== BLOCO-67 @ ${TIMESTAMP} — raiz ${PROJECT_ROOT} ==="

# node_modules/.git excluidos: sao dependencia/VCS, nao "arquivo do sistema"
echo "--- TOP 5 codigo (sem node_modules/.git) ---"
find "${PROJECT_ROOT}" -type f \
  -not -path "*/node_modules/*" -not -path "*/.git/*" \
  -printf "%s %p\n" 2>/dev/null | sort -nr | head -5 \
  | awk "${fmt}" | tee -a "${REPORT_FILE}"

# DBs listados a parte: crescem sozinhos e costumam ser o real maior arquivo
echo "--- SQLite em data/ ---"
[ -d "${PROJECT_ROOT}/data" ] \
  && ls -lhS "${PROJECT_ROOT}/data"/*.db 2>/dev/null | awk '{printf "%-10s %s\n",$5,$9}' | tee -a "${REPORT_FILE}" \
  || echo "(data/ ausente)" | tee -a "${REPORT_FILE}"

echo "--- TOP 3 .bak ---"
find "${PROJECT_ROOT}" -type f -name "*.bak*" -printf "%s %p\n" 2>/dev/null \
  | sort -nr | head -3 | awk "${fmt}" | tee -a "${REPORT_FILE}"

# RESUMO: maior arquivo ABSOLUTO do projeto (inclui data/, exclui node_modules/.git)
echo "=== MAIOR ARQUIVO ABSOLUTO ==="
find "${PROJECT_ROOT}" -type f \
  -not -path "*/node_modules/*" -not -path "*/.git/*" \
  -printf "%s %p\n" 2>/dev/null | sort -nr | head -1 \
  | awk '{printf "%s (%.2fMB)\n",$2,$1/1048576}' | tee -a "${REPORT_FILE}"

echo "Relatorio: ${REPORT_FILE}"
~~~
