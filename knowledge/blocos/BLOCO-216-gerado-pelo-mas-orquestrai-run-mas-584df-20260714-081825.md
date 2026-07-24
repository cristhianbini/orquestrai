---
tipo: bloco-lave
id: BLOCO-216
title: "Gerado pelo MAS (OrquestrAI) -- run mas_584df79dd9fd -- revise antes de executar"
sha256: 16524bfa24c6109e942954ce4963c104a157c9acc8ea3f09e16f14feea0202be
created: 2026-07-14T08:18:25.322Z
---

# BLOCO-216 - Gerado pelo MAS (OrquestrAI) -- run mas_584df79dd9fd -- revise antes de executar

## Script
~~~bash
# Gerado pelo MAS (OrquestrAI) -- run mas_584df79dd9fd -- revise antes de executar
set +e; set -H

PROOT="/var/www/orquestrai/projects"
OLD="Cafeteria artesanal no coração da montanha"
NEW="Cafeteria artesanal no coração das montanhas de Minas Gerais"

echo "=== RECON sabordaterra $(date '+%F %T') ==="

# Slug existe? (L-CHATSLUG01: evitar editar projeto errado)
echo "-- projetos sabor*/cafe* --"
ls -1d "$PROOT"/*sabor* "$PROOT"/*cafe* 2>/dev/null || echo "nenhum"

# Onde vive o HTML servido (raiz? site/? public/?) -- nao assumir path
echo "-- htmls em sabordaterra --"
find "$PROOT/sabordaterra" -type f -name "*.html" 2>/dev/null || echo "sem sabordaterra"

# Frase antiga: quantas e em quais arquivos (idempotencia do futuro patch)
echo "-- OLD em sabordaterra --"
grep -rnF "$OLD" "$PROOT/sabordaterra" 2>/dev/null || echo "OLD ausente em sabordaterra"

# Frase nova ja aplicada? (nao re-patchear)
echo "-- NEW ja presente? --"
grep -rnF "$NEW" "$PROOT/sabordaterra" 2>/dev/null || echo "NEW ausente"

# Confusao de slug: a frase esta no projeto ERRADO?
echo "-- OLD em cafe-real (sentinela L-CHATSLUG01) --"
grep -rnF "$OLD" "$PROOT/cafe-real" 2>/dev/null || echo "OLD ausente em cafe-real"

# Fallback: se OLD nao existe, achar a tagline/hero real pra saber o que trocar
echo "-- ancoras de hero (fallback se OLD ausente) --"
grep -rniE "cafeteria|artesanal|montanha|hero|tagline" \
  "$PROOT/sabordaterra"/*.html "$PROOT/sabordaterra"/**/*.html 2>/dev/null | head -20 || true

echo "=== fim RECON ==="
~~~
