---
tipo: licao-automatica
bloco: BLOCO-175
title: "Auto: !/usr/bin/env bash"
sha256: adca2a94f87dd84cef9eb0f05d8eb9ae27f0993fb3543a2d2ac05f11d22fc22a
created: 2026-07-03T20:14:26.163Z
---

# BLOCO-175 - !/usr/bin/env bash

## O que ficou aprendido
Bloco LAVE persistido automaticamente para consulta futura.

## Script completo
~~~bash
#!/usr/bin/env bash
# BLOCO-175 – Listagem dos Maiores Arquivos do OrquestrAI
# Objetivo: identificar top 50 arquivos por tamanho + top 10 dirs + top 10 extensões
# Restrição: READ-ONLY, grava apenas em /tmp
# ---------------------------------------------------------------

set +e
set -H

BASE="/var/www/orquestrai"
REPORT="/tmp/biggest_files_$(date +%Y%m%d_%H%M%S).txt"

echo "=== BLOCO-175 – Maiores Arquivos do OrquestrAI ===" > "$REPORT"
echo "Data: $(date)" >> "$REPORT"
echo "Base: $BASE" >> "$REPORT"
echo "" >> "$REPORT"

# 1. Uso total do diretório principal
echo "1. Uso total de disco (du -sh):" >> "$REPORT"
du -sh "$BASE" 2>/dev/null >> "$REPORT"
echo "" >> "$REPORT"

# 2. Top 50 maiores arquivos (find + stat, ordenado por tamanho decrescente)
echo "2. Top 50 maiores arquivos (bytes | path relativo):" >> "$REPORT"
find "$BASE" -type f -exec stat --printf="%s %n\n" {} \; 2>/dev/null \
  | sort -rn \
  | head -50 \
  | awk -v base="$BASE" '{
      size=$1; 
      path=$2; 
      gsub(base"/", "", path); 
      printf "%12d  %s\n", size, path
    }' >> "$REPORT"
echo "" >> "$REPORT"

# 3. Top 10 diretórios que mais ocupam espaço
echo "3. Top 10 diretórios (du -sh *):" >> "$REPORT"
(cd "$BASE" && du -sh * 2>/dev/null | sort -hr | head -10) >> "$REPORT"
echo "" >> "$REPORT"

# 4. Resumo de extensões (top 10 por volume acumulado)
echo "4. Top 10 extensões por volume acumulado:" >> "$REPORT"
find "$BASE" -type f -name "*.*" -exec stat --printf="%s %n\n" {} \; 2>/dev/null \
  | awk '{
      size=$1; 
      path=$2; 
      match(path, /\.([^.]+)$/, ext); 
      if (ext[1]) total[ext[1]] += size
    } 
    END {
      for (e in total) printf "%12d  .%s\n", total[e], e
    }' \
  | sort -rn \
  | head -10 >> "$REPORT"

echo "" >> "$REPORT"
echo "=== Relatório completo salvo em: $REPORT ===" >> "$REPORT"

# Exibir no terminal
cat "$REPORT"
echo ""
ls -lh "$REPORT"

echo "===== fim BLOCO-175 ====="
~~~
