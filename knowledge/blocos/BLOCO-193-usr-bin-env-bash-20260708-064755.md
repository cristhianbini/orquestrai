---
tipo: bloco-lave
id: BLOCO-193
title: "!/usr/bin/env bash"
sha256: da78551641637de4c6dad6d16d0501956063577f58b3ee4dd4af7e3959737afb
created: 2026-07-08T06:47:55.699Z
---

# BLOCO-193 - !/usr/bin/env bash

## Script
~~~bash
#!/usr/bin/env bash
# BLOCO-301 v1.1 — Auditoria caminho telemetria fallback (READ-ONLY)
set +e; set -H

PROJECT_ROOT="/var/www/orquestrai"
API_CONTAINER="orquestrai-api"
DB_PATH="$PROJECT_ROOT/data/cluster.db"

echo "===== BLOCO-301 v1.1 ====="

echo -e "\n[1/6] Schema real de 'execucoes' (evita SELECT vazio por coluna errada):"
# Sem isso, 'tipo'/'criado' inexistentes dariam 0 registros e falso-positivo de path.
sqlite3 "$DB_PATH" ".schema execucoes" 2>/dev/null || echo "ERRO: tabela execucoes ausente ou db inacessivel no host"

echo -e "\n[2/6] KB_ROOT e mount real DENTRO do container (path presumido != provado):"
docker exec "$API_CONTAINER" printenv KB_ROOT 2>/dev/null || echo "KB_ROOT nao definida"
# Descobre onde o db aparece de fato no container, sem chutar /app vs /var/www:
docker exec "$API_CONTAINER" sh -c 'find / -name cluster.db -not -path "*/node_modules/*" 2>/dev/null | head -5' \
  || echo "ERRO: container inacessivel"

echo -e "\n[3/6] Paths hardcoded no codigo de telemetria/fallback:"
grep -rn "cluster\.db\|blackboard\.db\|KB_ROOT\|/app/data\|/var/www/orquestrai/data" "$PROJECT_ROOT/src" \
  --include="*.js" --include="*.mjs" 2>/dev/null \
  | grep -i "fallback\|telemetry\|execuc" | head -20

echo -e "\n[4/6] Contagem fallback (ajuste 'tipo' ao schema do passo 1 se divergir):"
sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM execucoes WHERE tipo LIKE '%fallback%';" 2>/dev/null

echo -e "\n[5/6] Ultimos 3 fallbacks:"
sqlite3 "$DB_PATH" "SELECT criado, tipo, status FROM execucoes WHERE tipo LIKE '%fallback%' ORDER BY rowid DESC LIMIT 3;" 2>/dev/null

echo -e "\n[6/6] Erros recentes no container (ENOENT = escrita em path inexistente):"
docker logs --since 2m "$API_CONTAINER" 2>&1 | grep -iE "fallback|telemetry|ENOENT|SQLITE|cannot find|no such" | tail -15

echo -e "\n===== fim BLOCO-301 v1.1 ====="
~~~
