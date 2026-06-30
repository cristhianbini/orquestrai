---
tipo: bloco-lave
id: BLOCO-100
title: "1. AUDITORIA COMPLETA da base de conhecimento"
sha256: 87edd834e5aa0ec3e93b7e5ba1689c17250a3f475293b7acb2b7a890da6b8b3a
created: 2026-06-29T05:34:55.632Z
---

# BLOCO-100 - 1. AUDITORIA COMPLETA da base de conhecimento

## Script
~~~bash
set +e; set +H

# 1. AUDITORIA COMPLETA da base de conhecimento
echo "=== INVENTÁRIO KNOWLEDGE BASE ==="
find /var/www/orquestrai/knowledge -type f -exec wc -l {} + | sort -rn | head -20
echo ""

# 2. Identificar arquivos duplicados/obsoletos (SHA256)
echo "=== DUPLICATAS (SHA256) ==="
find /var/www/orquestrai/knowledge -type f -exec sha256sum {} + | sort | uniq -w64 -D
echo ""

# 3. Verificar arquivos vazios ou corrompidos
echo "=== ARQUIVOS VAZIOS/QUEBRADOS ==="
find /var/www/orquestrai/knowledge -type f -size 0
find /var/www/orquestrai/knowledge -type f -name "*.md" -exec sh -c 'if ! grep -q "." "$1" 2>/dev/null; then echo "$1"; fi' _ {} \;
echo ""

# 4. Listar últimas modificações (suspeitar de abandono >90 dias)
echo "=== NÃO TOCADOS EM 90+ DIAS ==="
find /var/www/orquestrai/knowledge -type f -mtime +90 -ls
echo ""

# 5. Análise de tamanho por categoria
echo "=== CONSUMO POR PASTA ==="
du -sh /var/www/orquestrai/knowledge/*/ 2>/dev/null
~~~
