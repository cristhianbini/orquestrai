---
tipo: licao-automatica
bloco: BLOCO-107
title: "Auto: 1. Verificar último bloco executado relacionado a ícone"
sha256: 174c6bf73038e615497711f5131ecd14ce7d822ac1617dffc6f08d3e79377ce0
created: 2026-06-29T05:45:43.884Z
---

# BLOCO-107 - 1. Verificar último bloco executado relacionado a ícone

## O que ficou aprendido
Bloco LAVE persistido automaticamente para consulta futura.

## Script completo
~~~bash
set +e
set +H

echo "=== AUDITORIA: Mudança de Ícone ==="
echo ""

# 1. Verificar último bloco executado relacionado a ícone
echo "--- Últimos blocos LAVE executados (auditoria) ---"
if [ -d "/var/www/orquestrai/data/knowledge/blocos" ]; then
  ls -lt /var/www/orquestrai/data/knowledge/blocos/*.md 2>/dev/null | head -5
  echo ""
fi

# 2. Verificar se existe registro da solicitação
echo "--- Contextos recentes (solicitações do usuário) ---"
if [ -d "/var/www/orquestrai/knowledge/contextos" ]; then
  ls -lt /var/www/orquestrai/knowledge/contextos/*.md 2>/dev/null | head -3
  echo ""
fi

# 3. Verificar mudanças recentes nos arquivos frontend (onde ficam ícones)
echo "--- Últimas modificações em arquivos do frontend ---"
find /var/www/orquestrai/frontend -type f -name "*.jsx" -o -name "*.tsx" -o -name "*.json" 2>/dev/null | xargs ls -lt 2>/dev/null | head -10
echo ""

# 4. Buscar por commits/mudanças relacionadas a "icon" ou "ícone"
echo "--- Git log: mudanças recentes relacionadas a ícone ---"
if [ -d "/var/www/orquestrai/.git" ]; then
  cd /var/www/orquestrai
  git log --oneline --grep="icon\|ícone" -n 5 2>/dev/null
  echo ""
fi

# 5. Verificar pendências/metas sobre ícone
echo "--- Pendências/Metas registradas sobre ícone ---"
if [ -d "/var/www/orquestrai/knowledge/pendencias" ]; then
  grep -r "icon\|ícone" /var/www/orquestrai/knowledge/pendencias/ 2>/dev/null | head -5
fi
if [ -d "/var/www/orquestrai/knowledge/metas" ]; then
  grep -r "icon\|ícone" /var/www/orquestrai/knowledge/metas/ 2>/dev/null | head -5
fi

echo ""
echo "=== Resultado da auditoria disponível para análise ==="
~~~
