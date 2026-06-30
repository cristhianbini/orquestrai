---
tipo: bloco-lave
id: BLOCO-108
title: "Buscar em contextos recentes"
sha256: 97b77eeb05eb2df8e69b41a3ea13efb100772162c04f986e9d3b51837d6b246b
created: 2026-06-29T05:46:35.242Z
---

# BLOCO-108 - Buscar em contextos recentes

## Script
~~~bash
set +e
set +H

echo "=== Buscando registros de mudanca de icone na base de conhecimento ==="
echo ""

# Buscar em contextos recentes
echo "--- Contextos recentes ---"
find /var/www/orquestrai/knowledge/contextos/ -type f -name "*.md" -mtime -7 -exec grep -l "icone\|icon" {} \; 2>/dev/null | head -5

echo ""
echo "--- Pendencias relacionadas ---"
find /var/www/orquestrai/knowledge/pendencias/ -type f -name "*.md" -exec grep -l "icone\|icon" {} \; 2>/dev/null | head -5

echo ""
echo "--- Decisoes sobre UI/icones ---"
find /var/www/orquestrai/knowledge/decisoes/ -type f -name "*.md" -exec grep -l "icone\|icon" {} \; 2>/dev/null | head -5

echo ""
echo "--- Changelog recente ---"
tail -50 /var/www/orquestrai/knowledge/changelog.md 2>/dev/null | grep -i "icone\|icon" || echo "Nenhuma entrada sobre icone no changelog recente"
~~~
