---
tipo: bloco-lave
id: BLOCO-200
title: "!/usr/bin/env bash"
sha256: 55684c7f3851eaeb7ca6b2b00c16f35e017c637558cbee34798453e4d62b3c56
created: 2026-07-08T19:10:00.074Z
---

# BLOCO-200 - !/usr/bin/env bash

## Script
~~~bash
#!/usr/bin/env bash
# BLOCO-193 v1.1 — Mapa DB + KB (read-only). Cita L-B199, CTXUNIFY01, L-B194.
set +e; set -H

PROJECT_ROOT="/var/www/orquestrai"
KB_DIR="$PROJECT_ROOT/knowledge"
DATA_DIR="$PROJECT_ROOT/data"
COMPOSE="$PROJECT_ROOT/docker-compose.yml"
API_CONTAINER="orquestrai-api"

echo "===== BLOCO-193 v1.1 — DB + KB ====="

echo -e "\n[1/6] KB no HOST — estrutura + arquivos recentes:"
ls -lah "$KB_DIR/" 2>/dev/null || echo "AUSENTE: $KB_DIR"
find "$KB_DIR" -name "*.md" -type f -mtime -7 2>/dev/null | head -10

echo -e "\n[2/6] Bancos SQLite — existencia + schema real:"
# .tables pode vir vazio e mascarar db corrompido; sqlite_master prova conteudo real
for DB in cluster.db blackboard.db; do
  echo "--- $DB ---"
  stat -c '%n %s bytes mod:%y' "$DATA_DIR/$DB" 2>/dev/null || echo "AUSENTE: $DATA_DIR/$DB"
  sqlite3 "$DATA_DIR/$DB" "SELECT name FROM sqlite_master WHERE type='table';" 2>/dev/null | head -20 \
    || echo "  ERRO ao abrir $DB (lock/corrupt?)"
done

echo -e "\n[3/6] Paths RELATIVOS suspeitos no codigo (armadilha CTXUNIFY01):"
# grep amplo: qualquer ref a cluster/blackboard que NAO seja o path absoluto correto
grep -rn "cluster\.db\|blackboard\.db" "$PROJECT_ROOT/src" \
  --include="*.js" --include="*.mjs" 2>/dev/null \
  | grep -v "/var/www/orquestrai/data" || echo "  nenhum path relativo (OK)"

echo -e "\n[4/6] KB_ROOT / knowledge no codigo (L-B199):"
grep -rn "KB_ROOT\|knowledge/licoes\|knowledge/" "$PROJECT_ROOT/src" \
  --include="*.js" --include="*.mjs" 2>/dev/null | head -10 || echo "  sem referencia"

echo -e "\n[5/6] Path REAL dentro do container (prova, nao presume — L-B199/L-B194):"
docker exec "$API_CONTAINER" printenv KB_ROOT 2>/dev/null || echo "  KB_ROOT nao definida no container"
docker exec "$API_CONTAINER" sh -c \
  'find / -name "cluster.db" -not -path "*/node_modules/*" 2>/dev/null | head -3' \
  || echo "  container $API_CONTAINER inacessivel"

echo -e "\n[6/6] Bind-mounts declarados no compose:"
# grep -A2 do Smith perde mounts multi-linha; -E direto pega data e knowledge
grep -nE "\./(data|knowledge)" "$COMPOSE" 2>/dev/null || echo "AUSENTE ou sem mounts: $COMPOSE"

echo "===== fim BLOCO-193 v1.1 ====="
~~~
