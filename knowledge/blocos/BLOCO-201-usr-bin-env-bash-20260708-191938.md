---
tipo: bloco-lave
id: BLOCO-201
title: "!/usr/bin/env bash"
sha256: 68d02d6b72ca69aba274fd9229f83442b123ee208b977532eab80db4d18ffeab
created: 2026-07-08T19:19:38.951Z
---

# BLOCO-201 - !/usr/bin/env bash

## Script
~~~bash
#!/usr/bin/env bash
# BLOCO-204 v1.1 — 5 licoes mais recentes da KB (dentro do container). Cita L-B194, L-B199.
set +e; set -H

PROJECT_ROOT="/var/www/orquestrai"
KB_LICOES="$PROJECT_ROOT/knowledge/licoes"
CONTAINER="orquestrai-web"

echo "===== BLOCO-204 v1.1 ====="

echo -e "\n[1/3] Confirma container ativo:"
docker ps --filter "name=$CONTAINER" --format "{{.Names}} {{.Status}}" \
  | grep -q . || echo "ERRO: container $CONTAINER nao encontrado/parado"
docker ps --filter "name=$CONTAINER" --format "{{.Names}} {{.Status}}"

echo -e "\n[2/3] 5 licoes mais recentes (mtime, dentro do container):"
# %TY-... formata a data no proprio find -> dispensa 'date -d @epoch',
# que quebra no sh/busybox do container. Ordena por %T@ (epoch) numerico.
docker exec "$CONTAINER" sh -c "
  cd '$KB_LICOES' 2>/dev/null || { echo 'ERRO: path ausente no container (L-B199)'; exit 1; }
  find . -maxdepth 1 -type f -name '*.md' \
    -printf '%T@|%TY-%Tm-%Td %TH:%TM:%TS|%f\n' 2>/dev/null \
  | sort -t'|' -k1,1 -rn | head -5 \
  | awk -F'|' '{printf \"%s  %s\n\", substr(\$2,1,19), \$3}'
" || echo "ERRO: docker exec falhou"

echo -e "\n[3/3] Validacao bind-mount (HOST vs CONTAINER, top 3 nomes):"
echo "--- HOST ---"
find "$KB_LICOES" -maxdepth 1 -type f -name '*.md' -printf '%T@ %f\n' 2>/dev/null \
  | sort -k1,1nr | head -3 | cut -d' ' -f2-
echo "--- CONTAINER ---"
docker exec "$CONTAINER" sh -c "
  cd '$KB_LICOES' && find . -maxdepth 1 -type f -name '*.md' -printf '%T@ %f\n' \
  | sort -k1,1nr | head -3 | cut -d' ' -f2-
" 2>/dev/null

echo -e "\n===== fim BLOCO-204 v1.1 ====="
~~~
