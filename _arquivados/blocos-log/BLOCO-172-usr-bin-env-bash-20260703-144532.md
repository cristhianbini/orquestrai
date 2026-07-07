---
tipo: licao-automatica
bloco: BLOCO-172
title: "Auto: !/usr/bin/env bash"
sha256: 8313d22ea72d522cf8afb86df49de04fc07a98d071e7390513869934bc484b04
created: 2026-07-03T14:45:32.392Z
---

# BLOCO-172 - !/usr/bin/env bash

## O que ficou aprendido
Bloco LAVE persistido automaticamente para consulta futura.

## Script completo
~~~bash
#!/usr/bin/env bash
# BLOCO-172 – Listagem completa de diretórios + arquivos (max depth 4)
# Contexto: melhorar a listagem anterior incluindo arquivos, filtrando node_modules/.git/.next.
# -------------------------------------------------------------

set +e   # continua mesmo se algum find falhar por permissão
set +H   # desativa expansão de histórico (segurança)

#=== Variáveis locais (obrigatório) =========================================
REPORT=/tmp/orquestrai_tree_$(date +%s).txt
BASE_DIR="/var/www/orquestrai"          # caminho do projeto dentro da VPS

#=== Início do relatório ======================================================
{
    echo "=== BLOCO-172 – Listagem completa (dirs + arquivos) ==="
    echo "Data: $(date)"
    echo "Alvo: $BASE_DIR"
    echo ""
} | tee "$REPORT"

#=== Verificação de existência do diretório ==================================
if [ ! -d "$BASE_DIR" ]; then
    echo "[ERRO] Diretório não encontrado: $BASE_DIR" | tee -a "$REPORT"
    exit 1
fi

#=== 1. Estrutura (até 4 níveis) – arquivos e diretórios ======================
echo "1. ESTRUTURA COMPLETA (max depth 4, excluindo node_modules/.git/.next)" | tee -a "$REPORT"
echo "   Formato: PERMISSOES  TAMANHO  CAMINHO_COMPLETO" | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

find "$BASE_DIR" -maxdepth 4 \
    \( -type f -o -type d \) \
    ! -path "*/node_modules/*" \
    ! -path "*/.git/*" \
    ! -path "*/.next/*" \
    -printf "%M %10s  %p\n" 2>/dev/null | sort | tee -a "$REPORT"

#=== 2. Resumo quantitativo ==================================================
echo "" | tee -a "$REPORT"
echo "2. RESUMO QUANTITATIVO" | tee -a "$REPORT"

DIR_COUNT=$(find "$BASE_DIR" -maxdepth 4 -type d ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/.next/*" | wc -l)
FILE_COUNT=$(find "$BASE_DIR" -maxdepth 4 -type f ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/.next/*" | wc -l)

echo "   Diretórios encontrados: $DIR_COUNT" | tee -a "$REPORT"
echo "   Arquivos   encontrados: $FILE_COUNT" | tee -a "$REPORT"

#=== 3. Top 10 maiores arquivos (bytes) =======================================
echo "" | tee -a "$REPORT"
echo "3. TOP 10 MAIORES ARQUIVOS (bytes)" | tee -a "$REPORT"
find "$BASE_DIR" -maxdepth 4 -type f \
    ! -path "*/node_modules/*" ! -path "*/.git/*" ! -path "*/.next/*" \
    -printf "%s %p\n" 2>/dev/null | sort -rn | head -10 | tee -a "$REPORT"

#=== Finalização ==============================================================
{
    echo ""
    echo "===== Relatório salvo em: $REPORT ====="
    echo "===== FIM BLOCO-172 ====="
} | tee -a "$REPORT"
~~~
