---
tipo: bloco-lave
id: BLOCO-207
title: "!/usr/bin/env bash"
sha256: a3f846055d07f84f79f3a9ee6f6bbf78f936faccf301361a5e6ab5d2ddab0070
created: 2026-07-08T20:01:01.197Z
---

# BLOCO-207 - !/usr/bin/env bash

## Script
~~~bash
#!/usr/bin/env bash
set +e; set -H

PROJECT_ROOT="/var/www/orquestrai"
PACKAGE_JSON="$PROJECT_ROOT/package.json"
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.yml"
ENV_FILE="$PROJECT_ROOT/.env"

echo "===== Identificação do Sistema ====="

# package.json — extrai só o valor do name, não a linha inteira (menos ruído p/ confirmar)
if [[ -f "$PACKAGE_JSON" ]]; then
  echo -e "\n[package.json]"
  grep -oP '"name"\s*:\s*"\K[^"]+' "$PACKAGE_JSON" | head -1
  grep -oP '"version"\s*:\s*"\K[^"]+' "$PACKAGE_JSON" | head -1
else
  echo "[WARN] package.json ausente"
fi

# docker-compose: awk pega services reais sob 'services:'.
# grep 'services:|image:' do Smith pegava lixo (image de qualquer service, indentação irrelevante) — ver BLOCO-204.
if [[ -f "$COMPOSE_FILE" ]]; then
  echo -e "\n[compose services]"
  awk '/^services:/{f=1;next} f&&/^[a-zA-Z]/{f=0} f&&/^  [a-zA-Z0-9_-]+:/{gsub(/[: ]/,"");print "  - "$0}' "$COMPOSE_FILE"
else
  echo "[WARN] docker-compose.yml ausente"
fi

# COMPOSE_PROJECT_NAME = nome REAL do runtime (prefixo de rede/volume), pode divergir do branding
echo -e "\n[compose project (runtime)]"
docker ps --format '{{.Names}}' | grep -oP '^[a-z0-9]+(?=[-_])' | sort -u | head -3

if [[ -f "$ENV_FILE" ]]; then
  echo -e "\n[.env identidade]"
  grep -iE '^(NAME|PROJECT|SYSTEM|APP)' "$ENV_FILE" | grep -v '^#' || echo "(nenhuma)"
fi

echo -e "\n[Hostname]"
hostname

# src/ está DENTRO de src/, dashboard.html confirmado lá (não na raiz)
echo -e "\n[Refs no código]"
grep -rhi "orquestrai" "$PROJECT_ROOT/src/" 2>/dev/null | head -2 || echo "(sem match)"

echo -e "\n===== fim ====="
~~~
