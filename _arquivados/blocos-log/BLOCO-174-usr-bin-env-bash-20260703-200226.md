---
tipo: licao-automatica
bloco: BLOCO-174
title: "Auto: !/usr/bin/env bash"
sha256: a18a65b498acf80c7cf2a98b5a9b1eced1b4ad341ed746bdc894e0680bd11407
created: 2026-07-03T20:02:26.343Z
---

# BLOCO-174 - !/usr/bin/env bash

## O que ficou aprendido
Bloco LAVE persistido automaticamente para consulta futura.

## Script completo
~~~bash
#!/usr/bin/env bash
# --------------------------------------------------------------
# BLOCO‑XXX – Listagem completa de arquivos e diretórios da KB
# Objetivo: inventariar /var/www/orquestrai/data/knowledge
# Restrições: comandos read‑only, nenhum redirecionamento fora /tmp
# --------------------------------------------------------------

set +e               # continua mesmo com erros
set +H               # desabilita expansão do histórico (!)

# ---------- VARIÁVEIS ----------
BASE="/var/www/orquestrai"
KB_ROOT="${BASE}/data/knowledge"
REPORT="/tmp/kb_inventory_$(date +%Y%m%d_%H%M%S).txt"

# ---------- INÍCIO DO RELATÓRIO ----------
{
  echo "════════════════════════════════════════════════════════════════"
  echo "   RELATÓRIO DE INVENTÁRIO – BASE DE CONHECIMENTO ORQUESTRAI"
  echo "   $(date '+%Y-%m-%d %H:%M:%S')"
  echo "   KB_ROOT: $KB_ROOT"
  echo "════════════════════════════════════════════════════════════════"
  echo ""

  # 1) Estrutura de diretórios (até 4 níveis)
  echo "## 1. ESTRUTURA DE DIRETÓRIOS (até 4 níveis) ##"
  if command -v tree >/dev/null 2>&1; then
    tree -L 4 -a -I 'node_modules|.git' --dirsfirst "$KB_ROOT"
  else
    find "$KB_ROOT" -maxdepth 4 -type d | sort | sed "s|$KB_ROOT|.|"
  fi
  echo ""

  # 2) Listagem de arquivos (.md e demais)
  echo "## 2. ARQUIVOS .MD (listados por caminho completo) ##"
  find "$KB_ROOT" -type f -name "*.md" | sort
  echo ""

  # 3) Contadores resumidos
  echo "## 3. CONTADORES RESUMIDOS ##"
  echo "Total de arquivos               : $(find "$KB_ROOT" -type f | wc -l)"
  echo "Total de diretórios             : $(find "$KB_ROOT" -type d | wc -l)"
  echo "Arquivos .md (blocos + lições)  : $(find "$KB_ROOT" -name "*.md" | wc -l)"
  echo "Blocos (BLOCO‑*.md)              : $(find "$KB_ROOT/blocos" -name "BLOCO-*.md" 2>/dev/null | wc -l)"
  echo "Liçõ­es (L‑*.md)                 : $(find "$KB_ROOT" -name "L-*.md" 2>/dev/null | wc -l)"
  echo ""

  # 4) Últimos 10 blocos criados
  echo "## 4. ÚLTIMOS 10 BLOCOS CRIADOS ##"
  find "$KB_ROOT/blocos" -type f -name "BLOCO-*.md" 2>/dev/null \
    | xargs -r ls -lt | head -10 | awk '{printf "%s  %s %s %s\n",$9,$6,$7,$8}'
  echo ""

  # 5) Verificação do Índice (se existir)
  echo "## 5. VERIFICAÇÃO DO INDEX.md ##"
  INDEX_FILE="${KB_ROOT}/INDEX.md"
  if [ -f "$INDEX_FILE" ]; then
    echo "INDEX.md encontrado"
    echo "Entradas listadas no índice: $(grep -c "^- \*\*" "$INDEX_FILE")"
  else
    echo "⚠️  INDEX.md não encontrado"
  fi
} > "$REPORT"

# ---------- SAÍDA ----------
cat "$REPORT"
echo ""
echo "📄 Relatório salvo em: $REPORT"
echo "════════════════════════════════════════════════════════════════"
~~~
