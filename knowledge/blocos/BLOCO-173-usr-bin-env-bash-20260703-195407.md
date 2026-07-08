---
tipo: bloco-lave
id: BLOCO-173
title: "!/usr/bin/env bash"
sha256: 54aeb55bffa375e61e39a45beee3a7af35065043cd55e3782ef72c3e15e1270a
created: 2026-07-03T19:54:07.085Z
---

# BLOCO-173 - !/usr/bin/env bash

## Script
~~~bash
#!/usr/bin/env bash
# BLOCO‑XXX – Listagem somente de rotas no sistema OrquestrAI
# Objetivo: gerar um relatório de todas as rotas (backend, frontend e proxy)
# -------------------------------------------------------------
# Variáveis – todas definidas aqui (nenhuma dependência externa)
REPORT="/tmp/orquestrai_rotas_$(date +%s).txt"

# Caminhos base (conforme o ambiente descrito)
ORQUESTRAI="/var/www/orquestrai"
XMONEX_PROD="/var/www/xmonex"
XMONEX_TESTE="/var/www/xmonex_teste"
XMONEX_RELEASE="/var/www/xmonex_release"
NGINX_CONF="/etc/nginx/sites-enabled"

# -------------------------------------------------------------
{
  echo "=== RELATÓRIO DE ROTAS – ORQUESTRAI ==="
  echo "Data: $(date '+%Y-%m-%d %H:%M:%S')"
  echo ""

  # 1️⃣ Rotas Express (backend) – OrquestrAI
  echo "=== 1. ROTAS EXPRESS – BACKEND ORQUESTRAI ==="
  if [ -d "$ORQUESTRAI/backend/routes" ]; then
    grep -rn "router\.\(get\|post\|put\|delete\|patch\)" \
      "$ORQUESTRAI/backend/routes/" --include="*.js" 2>/dev/null ||
      echo "[nenhuma rota encontrada]"
  else
    echo "[diretório não encontrado: $ORQUESTRAI/backend/routes]"
  fi
  echo ""

  # 2️⃣ Rotas Express – Backends XMonex (PROD/TESTE/RELEASE)
  echo "=== 2. ROTAS EXPRESS – BACKENDS XMONEX (TODOS AMBIENTES) ==="
  for ENV in "$XMONEX_PROD" "$XMONEX_TESTE" "$XMONEX_RELEASE"; do
    if [ -d "$ENV/backend/routes" ]; then
      echo "--- $ENV ---"
      grep -rn "router\.\(get\|post\|put\|delete\|patch\)" \
        "$ENV/backend/routes/" --include="*.js" 2>/dev/null ||
        echo "[nenhuma rota encontrada]"
    else
      echo "[diretório não encontrado: $ENV/backend/routes]"
    fi
  done
  echo ""

  # 3️⃣ Rotas Next.js (app router) – OrquestrAI
  echo "=== 3. ROTAS NEXT.JS – FRONTEND ORQUESTRAI ==="
  if [ -d "$ORQUESTRAI/frontend/src/app" ]; then
    find "$ORQUESTRAI/frontend/src/app" -type f \
      \( -name "page.js" -o -name "page.tsx" -o -name "route.js" -o -name "route.ts" \) \
      2>/dev/null | sort || echo "[nenhuma rota encontrada]"
  else
    echo "[diretório não encontrado: $ORQUESTRAI/frontend/src/app]"
  fi
  echo ""

  # 4️⃣ Rotas Next.js – Frontends XMonex (PROD/TESTE/RELEASE)
  echo "=== 4. ROTAS NEXT.JS – FRONTENDS XMONEX ==="
  for ENV in "$XMONEX_PROD" "$XMONEX_TESTE" "$XMONEX_RELEASE"; do
    if [ -d "$ENV/frontend/src/app" ]; then
      echo "--- $ENV ---"
      find "$ENV/frontend/src/app" -type f \
        \( -name "page.js" -o -name "page.tsx" -o -name "route.js" -o -name "route.ts" \) \
        2>/dev/null | sort || echo "[nenhuma rota encontrada]"
    else
      echo "[diretório não encontrado: $ENV/frontend/src/app]"
    fi
  done
  echo ""

  # 5️⃣ Mapeamento Nginx (location / proxy_pass)
  echo "=== 5. MAPEAMENTO NGINX (PROXY REVERSE) ==="
  if [ -d "$NGINX_CONF" ]; then
    grep -E "server_name|location|proxy_pass|upstream" "$NGINX_CONF"/* \
      2>/dev/null | grep -v "^[[:space:]]*#" | sort || echo "[nenhum bloco encontrado]"
  else
    echo "[diretório não encontrado: $NGINX_CONF]"
  fi
  echo ""

  # 6️⃣ Resumo rápido
  echo "=== 6. RESUMO ==="
  echo "Total de linhas de rotas Express: $(grep -c "router\." "$REPORT" 2>/dev/null || echo 0)"
  echo "Total de arquivos Next.js (page/route): $(grep -c -E "page\.js|page\.tsx|route\.js|route\.ts" "$REPORT" 2>/dev/null || echo 0)"
  echo "Total de blocos location Nginx: $(grep -c "location" "$REPORT" 2>/dev/null || echo 0)"
} | tee "$REPORT"

echo ""
echo "📄 Relatório salvo em: $REPORT"
~~~
