---
tipo: licao-automatica
bloco: BLOCO-204
title: "Auto: !/usr/bin/env bash"
sha256: 2e1c4007548b57d8e15803eb6258fee69137cd525884f01a7c47e23bf7e666aa
created: 2026-07-08T19:43:33.380Z
---

# BLOCO-204 - !/usr/bin/env bash

## O que ficou aprendido
Bloco LAVE persistido automaticamente para consulta futura.

## Script completo
~~~bash
#!/usr/bin/env bash
set +e; set -H
ROOT=/var/www/orquestrai

echo "=== NOME DO SISTEMA (fontes canônicas) ==="

# package.json na raiz
[ -f "$ROOT/package.json" ] && \
  echo "package.json name: $(grep -oP '"name"\s*:\s*"\K[^"]+' "$ROOT/package.json" | head -1)"

# BUG do Smith: grep -oP com -A não funciona (-A é do grep normal, -oP corta a linha).
# Uso awk pra pegar os nomes de service de verdade sob 'services:'.
if [ -f "$ROOT/docker-compose.yml" ]; then
  echo "compose services:"
  awk '/^services:/{f=1;next} f&&/^[a-zA-Z]/{f=0} f&&/^  [a-zA-Z0-9_-]+:/{gsub(/[: ]/,"");print "  - "$0}' "$ROOT/docker-compose.yml"
fi

# COMPOSE_PROJECT_NAME: o nome REAL que o Docker usa (prefixo de rede/volume)
# — pode diferir do branding. É a fonte mais "verdadeira" do runtime.
echo "compose project (runtime): $(docker ps --format '{{.Names}}' | grep -oP '^[a-z0-9]+(?=[-_])' | sort -u | head -3 | tr '\n' ' ')"

# BUG do Smith: dashboard.html está em src/, mas o title pode estar em várias linhas.
[ -f "$ROOT/src/dashboard.html" ] && \
  echo "dashboard <title>: $(grep -oP '<title>\K[^<]+' "$ROOT/src/dashboard.html" | head -1)"

# Vite: nome costuma estar no package.json do subprojeto, não em .env
[ -f "$ROOT/frontend-vite/package.json" ] && \
  echo "vite name: $(grep -oP '"name"\s*:\s*"\K[^"]+' "$ROOT/frontend-vite/package.json" | head -1)"

echo "===== fim ====="
~~~
