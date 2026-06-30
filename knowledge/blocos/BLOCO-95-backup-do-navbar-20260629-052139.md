---
tipo: bloco-lave
id: BLOCO-95
title: "Backup do navbar"
sha256: c3b6a748f011e536084d7e4c918239f5810b89ab9b84c0a50ff08e9639e640d2
created: 2026-06-29T05:21:39.758Z
---

# BLOCO-95 - Backup do navbar

## Script
~~~bash
set +e; set +H

# Backup do navbar
cp -a /var/www/orquestrai/src/components/Navigation.tsx /var/www/orquestrai/src/components/Navigation.tsx.bak-$(date +%Y%m%d-%H%M%S)

# Edita o Navigation.tsx para comentar/remover o botão PT-BR
cd /var/www/orquestrai
sed -i '/<button.*PT-BR/,/<\/button>/s/^/<!--/' src/components/Navigation.tsx 2>/dev/null || \
sed -i '/PT-BR/d' src/components/Navigation.tsx

# Verifica a mudança
grep -n "PT-BR" src/components/Navigation.tsx || echo "Ícone PT-BR removido/comentado"

# Rebuild do frontend (se necessário)
docker-compose exec web npm run build 2>/dev/null || echo "Container web não rodando ou build manual necessário"
~~~
