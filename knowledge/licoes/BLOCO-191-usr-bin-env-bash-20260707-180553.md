---
tipo: licao-automatica
bloco: BLOCO-191
title: "Auto: !/usr/bin/env bash"
sha256: 7dbd28d0d4f58b974ad7663a9856aa87e246db7a142bb80de16104ae86e036ab
created: 2026-07-07T18:05:53.293Z
---

# BLOCO-191 - !/usr/bin/env bash

## O que ficou aprendido
Bloco LAVE persistido automaticamente para consulta futura.

## Script completo
~~~bash
#!/usr/bin/env bash
# Mapeia estrutura de /var/www/orquestrai (READ-ONLY). Saida em /tmp.
set +e; set -H   # +e: SIGPIPE de 'head' nao aborta pipeline; -H padrao

PROJECT_ROOT="/var/www/orquestrai"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
OUTPUT_FILE="/tmp/orquestrai-structure-${TIMESTAMP}.txt"

{
  echo "===== BLOCO-tree-structure-001 @ $(date -Iseconds) ====="

  # [1/4] Arvore de dirs (nivel 4). tree opcional -> fallback find portavel.
  echo; echo "[1/4] Arvore de diretorios (nivel 4)"
  if command -v tree >/dev/null 2>&1; then
    tree -L 4 -a -I 'node_modules|.git|*.log' --dirsfirst "$PROJECT_ROOT"
  else
    echo "(tree ausente - fallback find, so diretorios)"
    # -prune corta a descida em node_modules/.git: mais rapido que -not -path
    find "$PROJECT_ROOT" -maxdepth 4 \
      \( -path '*/node_modules' -o -path '*/.git' \) -prune -o \
      -type d -print 2>/dev/null | sort | sed "s|${PROJECT_ROOT}||"
  fi

  # [2/4] Peso por dir raiz. || true: du falha em symlink quebrado sem abortar
  echo; echo "[2/4] Ocupacao top 15 diretorios"
  du -sh "$PROJECT_ROOT"/*/ 2>/dev/null | sort -rh | head -15 || true

  # [3/4] Maior arquivo (exclui deps/VCS). %s = bytes -> MB no awk
  echo; echo "[3/4] Maior arquivo"
  find "$PROJECT_ROOT" \
    \( -path '*/node_modules/*' -o -path '*/.git/*' \) -prune -o \
    -type f -printf '%s %p\n' 2>/dev/null \
    | sort -rn | head -1 \
    | awk '{printf "%.2f MB  %s\n", $1/1048576, $2}'

  # [4/4] mtime, nao ctime: "modificado" e o que interessa no dia a dia
  echo; echo "[4/4] Ultimos 10 modificados"
  find "$PROJECT_ROOT" \
    \( -path '*/node_modules/*' -o -path '*/.git/*' \) -prune -o \
    -type f -printf '%T@ %TY-%Tm-%Td %TH:%TM %p\n' 2>/dev/null \
    | sort -rn | head -10 | cut -d' ' -f2-

  echo; echo "Salvo em: $OUTPUT_FILE"
  echo "===== fim ====="
} | tee "$OUTPUT_FILE"
~~~
