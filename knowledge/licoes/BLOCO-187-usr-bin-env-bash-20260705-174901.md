---
tipo: licao-automatica
bloco: BLOCO-187
title: "Auto: !/usr/bin/env bash"
sha256: c4011f6437a8d7786d87e7f25757182ff4cadaa18e3a223a4fd7748aacfa04b0
created: 2026-07-05T17:49:01.544Z
---

# BLOCO-187 - !/usr/bin/env bash

## O que ficou aprendido
Bloco LAVE persistido automaticamente para consulta futura.

## Script completo
~~~bash
#!/usr/bin/env bash
# BLOCO-185 – Maior arquivo modificado HOJE no OrquestrAI (read-only)
set +e; set +H

BASE_DIR="/var/www/orquestrai"
REPORT="/tmp/maior_arquivo_hoje_$(date +%Y%m%d).txt"   # data-only: 1 relatorio/dia = idempotencia real
START_TODAY="$(date +%Y-%m-%d)"
TOP_N=5                                                 # top-5 dá contexto, nao só o #1

[ -d "$BASE_DIR" ] || { echo "[ERRO] $BASE_DIR inexistente" >&2; exit 1; }

{
  echo "===== BLOCO-185: Maiores arquivos de HOJE ($START_TODAY) ====="
  echo "Execução: $(date '+%F %T')"
  echo ""

  # -newermt captura mtime>=00:00 hoje; sort -z/-rh preserva paths com espaço
  # exclui node_modules/.git pra nao poluir com lixo de deps
  find "$BASE_DIR" -type f -newermt "$START_TODAY" \
       -not -path '*/node_modules/*' -not -path '*/.git/*' \
       -printf '%s\t%p\0' 2>/dev/null \
    | sort -z -rn \
    | head -z -n "$TOP_N" \
    | while IFS=$'\t' read -r -d '' sz path; do
        # conversao bytes->humano inline
        hr=$(awk -v b="$sz" 'BEGIN{
          if(b>=1073741824)printf"%.2f GB",b/1073741824;
          else if(b>=1048576)printf"%.2f MB",b/1048576;
          else if(b>=1024)printf"%.2f KB",b/1024;
          else printf"%d B",b}')
        printf "  %-12s %s\n" "$hr" "$path"
      done

  echo ""
  echo "(nada acima = nenhum arquivo com mtime de hoje)"
} | tee "$REPORT"

echo "Relatório: $REPORT"
~~~
