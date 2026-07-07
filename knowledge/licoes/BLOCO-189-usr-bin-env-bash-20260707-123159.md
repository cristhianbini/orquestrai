---
tipo: licao-automatica
bloco: BLOCO-189
title: "Auto: !/usr/bin/env bash"
sha256: 795e7da8a0ff493ec5cd2614d87d34ce2fdd4a182c069221bb61d8bb9f224b2c
created: 2026-07-07T12:31:59.270Z
---

# BLOCO-189 - !/usr/bin/env bash

## O que ficou aprendido
Bloco LAVE persistido automaticamente para consulta futura.

## Script completo
~~~bash
#!/usr/bin/env bash
# BLOCO-202 v1.1.0: Último arquivo criado no OrquestrAI (read-only)
set +e; set -H

PROJECT_ROOT="/var/www/orquestrai"

echo "=== MÉTODO 1: mtime filesystem (find + sort) ==="
# -prune bem-sucedido nos dirs; nos arquivos, imprime epoch+path.
# find sem eval evita o quoting quebrado do EXCLUDE_DIRS anterior.
find "$PROJECT_ROOT" \
  \( -path '*/node_modules' -o -path '*/.git' \) -prune -o \
  -type f -printf '%T@ %p\n' 2>/dev/null \
  | sort -rn | head -1 | while read -r ts path; do
    # %T@ tem fração; corta pro date não reclamar
    echo "Arquivo: $path"
    echo "Data:    $(date -d "@${ts%.*}" '+%Y-%m-%d %H:%M:%S')"
done

echo ""
echo "=== MÉTODO 2: stat detalhado (top 5, sem node_modules/.git) ==="
find "$PROJECT_ROOT" \
  \( -path '*/node_modules' -o -path '*/.git' \) -prune -o \
  -type f -printf '%T@ %TY-%Tm-%Td %TH:%TM:%TS %p\n' 2>/dev/null \
  | sort -rn | head -5 | cut -d' ' -f2-

echo ""
echo "=== MÉTODO 3: SQLite cluster.db (últimas execuções) ==="
DB_PATH="$PROJECT_ROOT/data/cluster.db"
if [ -f "$DB_PATH" ]; then
  # .tables antes: nome/schema da tabela não é garantido — evita erro mudo
  echo "-- tabelas:"; sqlite3 "$DB_PATH" '.tables'
  sqlite3 "$DB_PATH" \
    "SELECT datetime(created_at,'unixepoch','localtime'), bloco_id, status
     FROM execucoes ORDER BY created_at DESC LIMIT 5;" 2>&1
else
  echo "⚠ $DB_PATH não encontrado"
fi

echo ""
echo "===== fim BLOCO-202 ====="
~~~
