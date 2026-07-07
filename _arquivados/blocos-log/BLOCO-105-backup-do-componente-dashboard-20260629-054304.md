---
tipo: licao-automatica
bloco: BLOCO-105
title: "Auto: Backup do componente Dashboard"
sha256: 6d348145757f76f94ab3bcba786fe0779cfb280cd7af6c908255199c0ba76a5e
created: 2026-06-29T05:43:04.995Z
---

# BLOCO-105 - Backup do componente Dashboard

## O que ficou aprendido
Bloco LAVE persistido automaticamente para consulta futura.

## Script completo
~~~bash
set +e
set +H

# Backup do componente Dashboard
timestamp=$(date +%Y%m%d_%H%M%S)
cp -a /var/www/orquestrai/frontend/src/components/Dashboard.jsx /var/www/orquestrai/frontend/src/components/Dashboard.jsx.bak-${timestamp}

# Adiciona emoji robozinho 🤖 substituindo o ▸
sed -i 's/▸ AGENTES MESH NETWORK/🤖 AGENTES MESH NETWORK/g' /var/www/orquestrai/frontend/src/components/Dashboard.jsx

echo "✓ Emoji 🤖 adicionado. Rebuild do container web necessário."
echo "docker compose -f /var/www/orquestrai/docker-compose.yml restart web"
~~~
