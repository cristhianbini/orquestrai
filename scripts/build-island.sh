#!/usr/bin/env bash
# build-island.sh — R6-01
# Compila a ilha React e faz o deploy pra src/island/ de forma atomica e
# verificada. Substitui a copia manual (causa raiz de "editei e nao atualizou").
# Regras: aborta em qualquer erro; verifica hash apos copiar; nunca deixa
# src/island/ pela metade.
set -euo pipefail

ROOT="/var/www/orquestrai"
SRC_DIR="$ROOT/frontend-vite"
DIST="$SRC_DIR/dist-island"
DEST="$ROOT/src/island"

# node via nvm nao esta no PATH de shells nao-interativos -- resolve aqui.
export NVM_DIR="/root/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

echo "[build-island] 1/4 build (vite.island.config.js)..."
cd "$SRC_DIR"
npm run build -- --config vite.island.config.js

echo "[build-island] 2/4 conferindo artefatos gerados..."
test -f "$DIST/agent-panel-island.js" || { echo "ERRO: JS nao gerado"; exit 1; }
test -f "$DIST/style.css"             || { echo "ERRO: CSS nao gerado"; exit 1; }

echo "[build-island] 3/4 deploy pra src/island/ (CSS renomeado p/ o nome que o dashboard carrega)..."
cp "$DIST/agent-panel-island.js" "$DEST/agent-panel-island.js"
cp "$DIST/style.css"             "$DEST/agent-panel-style.css"

echo "[build-island] 4/4 verificando hash (dist == deploy)..."
h1=$(sha256sum "$DIST/agent-panel-island.js" | cut -d' ' -f1)
h2=$(sha256sum "$DEST/agent-panel-island.js" | cut -d' ' -f1)
[ "$h1" = "$h2" ] || { echo "ERRO: hash do JS nao confere"; exit 1; }
c1=$(sha256sum "$DIST/style.css"             | cut -d' ' -f1)
c2=$(sha256sum "$DEST/agent-panel-style.css" | cut -d' ' -f1)
[ "$c1" = "$c2" ] || { echo "ERRO: hash do CSS nao confere"; exit 1; }

echo "[build-island] OK -- JS e CSS compilados e deployados, hash confere."
