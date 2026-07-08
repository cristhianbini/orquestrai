---
tipo: licao-automatica
bloco: BLOCO-197
title: "Auto: !/usr/bin/env bash"
sha256: 526bf9336b8f08f796d5c33890db283c98b7419772f7e4194582215a80d92b9d
created: 2026-07-08T14:29:29.683Z
---

# BLOCO-197 - !/usr/bin/env bash

## O que ficou aprendido
Bloco LAVE persistido automaticamente para consulta futura.

## Script completo
~~~bash
#!/usr/bin/env bash
# BLOCO-306 v1.0 — Auditoria knowledge/licoes (READ-ONLY)
set +e; set -H

LICOES_DIR="/var/www/orquestrai/knowledge/licoes"

echo "===== BLOCO-306 v1.0 ====="
echo "Alvo: $LICOES_DIR"
echo ""

# Falha cedo e clara se o path nao existir (o KB pode estar sob outro bind-mount — L-B199)
if [ ! -d "$LICOES_DIR" ]; then
  echo "ERRO: $LICOES_DIR nao existe no host. Confirmar com: docker exec orquestrai-web ls /var/www/orquestrai/knowledge"
  exit 1
fi

TOTAL=$(find "$LICOES_DIR" -maxdepth 1 -type f -name "*.md" 2>/dev/null | wc -l)
echo "Total de .md: $TOTAL"
echo ""

# %T+ = mtime ISO ordenavel lexicograficamente -> sort -r simples resolve, sem sort -n por epoch
echo "=== 5 MAIS RECENTES (mtime desc) ==="
find "$LICOES_DIR" -maxdepth 1 -type f -name "*.md" -printf "%T+ %s %f\n" 2>/dev/null \
  | sort -r \
  | head -5 \
  | awk '{printf "%-28s %10s bytes  %s\n", $1, $2, $3}'

echo ""
echo "Formato: MTIME  BYTES  ARQUIVO"
echo "===== fim BLOCO-306 ====="
~~~
