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

# [R10-CACHE02 2026-07-15] Cache-busting por hash de conteudo no filename.
# O dashboard.html e' servido no-cache (revalida sempre) e aponta pra
# agent-panel-island.<hash>.js / agent-panel-style.<hash>.css; esses assets
# hasheados sao imutaveis e ficam cacheados 7d (expires no nginx-web). Trocar
# o conteudo muda o hash -> muda o filename -> o browser busca o novo sozinho.
# Substitui o esquema fragil do ?v= manual (dava pra esquecer de bumpar).
echo "[build-island] 3/5 hash de conteudo dos artefatos..."
JS_HASH=$(sha256sum "$DIST/agent-panel-island.js" | cut -c1-8)
CSS_HASH=$(sha256sum "$DIST/style.css"            | cut -c1-8)
JS_NAME="agent-panel-island.$JS_HASH.js"
CSS_NAME="agent-panel-style.$CSS_HASH.css"

echo "[build-island] 4/5 deploy hasheado ($JS_NAME + $CSS_NAME) + limpeza dos antigos..."
# remove versoes hasheadas anteriores (dashboard passa a apontar so pra nova;
# HTML e' no-cache, entao qualquer referencia velha some no proximo load).
find "$DEST" -maxdepth 1 -name 'agent-panel-island.*.js'  ! -name "$JS_NAME"  -delete
find "$DEST" -maxdepth 1 -name 'agent-panel-style.*.css'  ! -name "$CSS_NAME" -delete
cp "$DIST/agent-panel-island.js" "$DEST/$JS_NAME"
cp "$DIST/style.css"             "$DEST/$CSS_NAME"

echo "[build-island] 5/5 reescrevendo referencias no dashboard.html + verificando hash..."
DASH="$ROOT/src/dashboard.html"
sed -E -i "s#/island/agent-panel-island[^\"']*#/island/$JS_NAME#g; s#/island/agent-panel-style[^\"']*#/island/$CSS_NAME#g" "$DASH"
grep -q "/island/$JS_NAME"  "$DASH" || { echo "ERRO: referencia JS nao aplicada no dashboard.html"; exit 1; }
grep -q "/island/$CSS_NAME" "$DASH" || { echo "ERRO: referencia CSS nao aplicada no dashboard.html"; exit 1; }
h1=$(sha256sum "$DIST/agent-panel-island.js" | cut -d' ' -f1)
h2=$(sha256sum "$DEST/$JS_NAME"              | cut -d' ' -f1)
[ "$h1" = "$h2" ] || { echo "ERRO: hash do JS nao confere"; exit 1; }
c1=$(sha256sum "$DIST/style.css"    | cut -d' ' -f1)
c2=$(sha256sum "$DEST/$CSS_NAME"    | cut -d' ' -f1)
[ "$c1" = "$c2" ] || { echo "ERRO: hash do CSS nao confere"; exit 1; }

echo "[build-island] OK -- $JS_NAME + $CSS_NAME deployados, dashboard.html atualizado, hash confere."
echo "[build-island] LEMBRETE: commitar src/island/ + src/dashboard.html."
