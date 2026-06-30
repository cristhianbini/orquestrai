---
tipo: bloco-lave
id: BLOCO-98
title: "Backup preventivo do frontend"
sha256: 1c5a51561ab67bef4e5046b10b74c9cec62c0c5913a782247083b9664a027e38
created: 2026-06-29T05:26:27.618Z
---

# BLOCO-98 - Backup preventivo do frontend

## Script
~~~bash
set +e
set +H

echo "=== AUDITORIA: Localizando ícone para remoção segura ==="

# Backup preventivo do frontend
timestamp=$(date +%Y%m%d_%H%M%S)
cd /var/www/orquestrai || exit 1

if [ -d "frontend" ]; then
  echo "→ Criando backup do frontend..."
  cp -a frontend "frontend.bak-${timestamp}"
  echo "✓ Backup: frontend.bak-${timestamp}"
fi

# Procurar arquivos JSX/TSX/HTML com ícones ou botões suspeitos
echo -e "\n→ Buscando componentes com ícones no frontend..."
find frontend/src -type f \( -name "*.jsx" -o -name "*.tsx" -o -name "*.js" \) -exec grep -l "icon\|Icon\|button\|Button" {} \; 2>/dev/null | head -20

echo -e "\n→ Buscando especificamente por 'função' ou labels de menu..."
find frontend/src -type f \( -name "*.jsx" -o -name "*.tsx" \) -exec grep -Hn "função\|menu\|sidebar\|nav" {} \; 2>/dev/null | head -30

echo -e "\n→ Listando componentes principais do frontend..."
ls -lah frontend/src/components/ 2>/dev/null || echo "Pasta components não encontrada"
ls -lah frontend/src/pages/ 2>/dev/null || echo "Pasta pages não encontrada"

echo -e "\n✓ Auditoria concluída. Identifique o componente/arquivo correto e confirme para edição."
~~~
