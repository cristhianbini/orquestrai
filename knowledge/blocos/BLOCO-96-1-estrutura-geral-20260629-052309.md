---
tipo: bloco-lave
id: BLOCO-96
title: "1. Estrutura geral"
sha256: 7216a2f9a533575aa350675d813104a5e55f1a3d5fb4574ec01b4c8c783e3ef1
created: 2026-06-29T05:23:09.552Z
---

# BLOCO-96 - 1. Estrutura geral

## Script
~~~bash
set +e; set +H

echo "=== MAPEAMENTO DA ESTRUTURA DO ORQUESTRAI ==="
echo ""

# 1. Estrutura geral
echo "📁 Estrutura base:"
ls -la /var/www/orquestrai/ | head -20

echo ""
echo "📦 package.json (se existir na raiz):"
ls -lh /var/www/orquestrai/package.json 2>/dev/null || echo "  ❌ Não encontrado na raiz"

echo ""
echo "🔍 Busca recursiva por Navigation (primeiros 10):"
find /var/www/orquestrai -type f -name "*avigation*" 2>/dev/null | head -10

echo ""
echo "🔍 Busca por componentes React/TSX:"
find /var/www/orquestrai -type f -name "*.tsx" -o -name "*.jsx" 2>/dev/null | head -15

echo ""
echo "🐳 Containers ativos:"
docker-compose ps

echo ""
echo "📋 docker-compose.yml (primeiras 30 linhas):"
head -30 /var/www/orquestrai/docker-compose.yml

echo ""
echo "🎯 Procurando 'PT-BR' em todo o projeto:"
grep -r "PT-BR" /var/www/orquestrai --include="*.tsx" --include="*.jsx" --include="*.ts" --include="*.js" 2>/dev/null | head -5
~~~
