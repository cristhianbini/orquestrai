---
tipo: bloco-lave
id: BLOCO-101
title: "1. Estrutura de pastas principal"
sha256: 8a9ab0101cdacecf37c2d9f148a81f213cd6759ff871095b5b26aac6679e25e0
created: 2026-06-29T05:36:38.021Z
---

# BLOCO-101 - 1. Estrutura de pastas principal

## Script
~~~bash
set +e; set +H

echo "=== AUDITORIA COMPLETA ORQUESTRAI (SEM EXCLUSOES) ==="
echo ""

# 1. Estrutura de pastas principal
echo "## 1. ÁRVORE DE DIRETÓRIOS"
tree -L 3 -d /var/www/orquestrai/ 2>/dev/null || find /var/www/orquestrai/ -type d -maxdepth 3

echo ""
echo "## 2. TAMANHO TOTAL POR DIRETÓRIO TOP-LEVEL"
du -sh /var/www/orquestrai/*/ 2>/dev/null | sort -rh

echo ""
echo "## 3. ARQUIVOS DE CONFIGURAÇÃO"
find /var/www/orquestrai/ -maxdepth 2 -type f \( -name "*.json" -o -name "*.yaml" -o -name "*.env*" -o -name "Dockerfile*" -o -name "docker-compose*" \) -ls

echo ""
echo "## 4. DATABASES SQLITE"
find /var/www/orquestrai/ -type f -name "*.db" -o -name "*.sqlite" -o -name "*.sqlite3"

echo ""
echo "## 5. LOGS RECENTES (últimas 24h)"
find /var/www/orquestrai/ -type f -name "*.log" -mtime -1 -ls

echo ""
echo "## 6. KNOWLEDGE BASE"
ls -lhR /var/www/orquestrai/knowledge/ 2>/dev/null

echo ""
echo "## 7. CONTAINERS DOCKER ATIVOS"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "## 8. VOLUMES DOCKER"
docker volume ls

echo ""
echo "## 9. RESUMO DE ESPAÇO"
df -h /var/www/
~~~
