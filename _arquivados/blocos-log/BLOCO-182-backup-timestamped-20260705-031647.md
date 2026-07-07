---
tipo: licao-automatica
bloco: BLOCO-182
title: "Auto: Backup timestamped"
sha256: 71003ab3c2f9f94b62b306714e968745990d26560084d28e70c805f59ca2372d
created: 2026-07-05T03:16:47.910Z
---

# BLOCO-182 - Backup timestamped

## O que ficou aprendido
Bloco LAVE persistido automaticamente para consulta futura.

## Script completo
~~~bash
set +e; set -H
cd /var/www/orquestrai
FILE="dashboard.html"

# Backup timestamped
cp -a "$FILE" "$FILE.bak-$(date +%Y%m%d-%H%M%S)"

# Procura padrões de debug
echo "=== LOGS ENCONTRADOS ==="
grep -n "console\.\(log\|debug\|warn\|error\|info\|trace\)" "$FILE" || echo "Nenhum console.* encontrado"
echo ""
grep -n "//.*DEBUG\|//.*TEMP\|//.*FIXME\|//.*TODO.*debug" "$FILE" || echo "Nenhum comentário de debug encontrado"
echo ""

# Mostra estatística
echo "=== RESUMO ==="
echo "Total console.*: $(grep -c 'console\.' "$FILE" 2>/dev/null || echo 0)"
echo "Backup criado: $FILE.bak-*"
echo ""
echo "Para remover execute:"
echo "sed -i.bak2 '/console\.\(log\|debug\|warn\|error\|info\|trace\)/d' $FILE"
~~~
