---
tipo: licao-automatica
bloco: BLOCO-180
title: "Auto: !/usr/bin/env bash"
sha256: 492d95d06db5a3f4c6ecece6508141008d9be790e654b9b861e9cc645c7ea879
created: 2026-07-04T21:35:12.788Z
---

# BLOCO-180 - !/usr/bin/env bash

## O que ficou aprendido
Bloco LAVE persistido automaticamente para consulta futura.

## Script completo
~~~bash
#!/usr/bin/env bash
set +e; set -H
# ============================================================
# BLOCO-179 – Último arquivo criado/alterado no OrquestrAI
# Versão: 1.0.0 (2026-07-04)
# ============================================================

BASE="/var/www/orquestrai"
REPORT="/tmp/orquestrai_latest_files_$(date +%s).txt"

echo "=== BLOCO-179 – Últimos 20 arquivos modificados ===" > "$REPORT"
echo "Gerado em: $(date --iso-8601=seconds)" >> "$REPORT"
echo "---" >> "$REPORT"

find "$BASE" -type f \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/.next/*" \
    -not -path "*/dist/*" \
    -not -path "*/build/*" \
    -printf '%T@ %M %s %p\n' 2>/dev/null \
| sort -rn | head -n 20 \
| while IFS=' ' read -r epoch perms size fullpath; do
    timestamp=$(date -d "@${epoch%.*}" --iso-8601=seconds 2>/dev/null || echo "N/A")
    relpath="${fullpath#$BASE/}"
    printf "%-26s %-10s %10s  %s\n" "$timestamp" "$perms" "$size" "$relpath"
done >> "$REPORT"

cat "$REPORT"
echo "✅ Relatório salvo: $REPORT"
~~~
