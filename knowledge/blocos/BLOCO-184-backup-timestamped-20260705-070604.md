---
tipo: bloco-lave
id: BLOCO-184
title: "Backup timestamped"
sha256: b982797ea6e9d9b63c45205dbfe1174d28fcdfd9655640094aa194428c27e86e
created: 2026-07-05T07:06:04.162Z
---

# BLOCO-184 - Backup timestamped

## Script
~~~bash
set +e; set -H
cd /var/www/orquestrai
FILE="dashboard.html"

# Backup timestamped
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
cp -a "$FILE" "$FILE.bak-$TIMESTAMP"

# Procura padrões de debug
echo "=== CONSOLE.* ENCONTRADOS ==="
grep -n "console\.\(log\|debug\|warn\|error\|info\|trace\)" "$FILE" | head -n 20
echo ""

echo "=== COMENTÁRIOS DE DEBUG ==="
grep -n "//.*\(DEBUG\|TEMP\|FIXME\|TODO.*debug\|XXX\)" "$FILE" | head -n 20
echo ""

echo "=== DEBUGGER; ==="
grep -n "debugger;" "$FILE" || echo "Nenhum debugger; encontrado"
echo ""

echo "=== ESTATÍSTICAS ==="
echo "Total console.*: $(grep -c 'console\.' "$FILE" 2>/dev/null || echo 0)"
echo "Total comentários debug: $(grep -c '//.*DEBUG\|//.*TEMP' "$FILE" 2>/dev/null || echo 0)"
echo "Backup criado: $FILE.bak-$TIMESTAMP"
echo ""
echo "PRÓXIMO PASSO (execute após revisar):"
echo "sed -i '/console\.\(log\|debug\|warn\|error\|info\|trace\)/d' $FILE"
~~~
