---
tipo: bloco-lave
id: BLOCO-198
title: "!/usr/bin/env bash"
sha256: e2ee4486b165d285a24b0a7aace187baadf6bb9e0477962925c589430f236a7a
created: 2026-07-08T14:37:59.944Z
---

# BLOCO-198 - !/usr/bin/env bash

## Script
~~~bash
#!/usr/bin/env bash
# BLOCO-306 v1.2 — 10 .md mais recentes em knowledge/licoes (READ-ONLY, host)
set +e; set -H

LICOES_DIR="/var/www/orquestrai/knowledge/licoes"

echo "===== BLOCO-306 v1.2 ====="

# Falha cedo se path errado (KB pode estar sob outro mount — L-B199)
if [ ! -d "$LICOES_DIR" ]; then
  echo "ERRO: $LICOES_DIR nao existe no host."
  echo "Confirmar: docker exec orquestrai-web ls /var/www/orquestrai/knowledge"
  exit 1
fi

echo "Total .md: $(find "$LICOES_DIR" -maxdepth 1 -type f -name '*.md' | wc -l)"
echo ""
echo "=== 10 MAIS RECENTES (mtime desc) ==="
# %T@ = epoch (ordenavel numerico, sem subshell date); %TY-%Tm... = ISO ja formatado
# 1 unico find faz tudo: sem awk+pipe+date, sem processos orfaos, sem sort -M
find "$LICOES_DIR" -maxdepth 1 -type f -name '*.md' \
  -printf '%T@|%TY-%Tm-%Td %TH:%TM:%TS|%s|%f\n' 2>/dev/null \
  | sort -t'|' -k1,1 -rn \
  | head -10 \
  | awk -F'|' '{printf "%-20s %9s B  %s\n", substr($2,1,19), $3, $4}'

echo ""
echo "Formato: MTIME(ISO)  BYTES  ARQUIVO"
echo "===== fim BLOCO-306 ====="
~~~
