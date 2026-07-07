---
tipo: licao-automatica
bloco: BLOCO-190
title: "Auto: !/usr/bin/env bash"
sha256: c724f2f5270538a2f68c227fad7baa820261750a2c38efef5cd598c6de8a643f
created: 2026-07-07T12:39:32.996Z
---

# BLOCO-190 - !/usr/bin/env bash

## O que ficou aprendido
Bloco LAVE persistido automaticamente para consulta futura.

## Script completo
~~~bash
#!/usr/bin/env bash
# BLOCO-202: ultimo arquivo modificado no OrquestrAI (read-only)
set +e; set -H   # NAO usar set -e: SIGPIPE de 'head' abortaria o pipeline

PROJECT_ROOT="/var/www/orquestrai"

echo "=== Ultimo arquivo (mtime) — sem node_modules/.git ==="
# -prune precisa de '/*' no glob p/ casar subpaths; sem isso so casa o dir raiz.
# %T@ = epoch (fracao); ordena e pega o topo. read separa ts do path (path pode ter espaco).
find "$PROJECT_ROOT" \
  \( -path '*/node_modules/*' -o -path '*/.git/*' \) -prune -o \
  -type f -printf '%T@\t%p\n' 2>/dev/null \
  | sort -rn | head -1 \
  | while IFS=$'\t' read -r ts path; do
      echo "Arquivo: $path"
      echo "Data:    $(date -d "@${ts%.*}" '+%Y-%m-%d %H:%M:%S')"
    done

echo ""
echo "=== Top 5 mais recentes (contexto) ==="
find "$PROJECT_ROOT" \
  \( -path '*/node_modules/*' -o -path '*/.git/*' \) -prune -o \
  -type f -printf '%TY-%Tm-%Td %TH:%TM:%.2TS  %p\n' 2>/dev/null \
  | sort -r | head -5

echo "===== fim BLOCO-202 ====="
~~~
