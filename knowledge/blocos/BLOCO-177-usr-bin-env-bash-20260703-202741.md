---
tipo: bloco-lave
id: BLOCO-177
title: "!/usr/bin/env bash"
sha256: fd28826d261db17772549153f09fbe43df982db55c53825b2609c5f8afeb4e57
created: 2026-07-03T20:27:41.285Z
---

# BLOCO-177 - !/usr/bin/env bash

## Script
~~~bash
#!/usr/bin/env bash
# --------------------------------------------------------------
# BLOCO‑XXX – Encontrar os maiores arquivos no projeto OrquestrAI
# --------------------------------------------------------------

set +e          # não aborta em caso de erro
set -H          # habilita expansão de histórico (não afeta)

# ==== Variáveis locais (todas definidas aqui) ==================
BASE="/var/www/orquestrai"                     # raiz do projeto
TIMESTAMP=$(date +%Y%m%d_%H%M%S)               # para nome único do relatório
REPORT="/tmp/maiores_arquivos_orquestrai_${TIMESTAMP}.txt"
TOP_N=30                                      # quantos arquivos listar
# --------------------------------------------------------------

# Verifica a existência da base
if [ ! -d "$BASE" ]; then
    echo "ERRO: Diretório $BASE não encontrado"
    exit 1
fi

# Cabeçalho do relatório
{
    echo "=== BLOCO‑XXX – Maiores arquivos de $BASE ==="
    echo "Data: $(date)"
    echo "Relatório gerado em: $REPORT"
    echo ""
} > "$REPORT"

# Busca os $TOP_N maiores arquivos, excluindo diretórios volumosos que
# não interessam (node_modules, .git, .next, dist, build, .nuxt)
find "$BASE" -type f \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/.next/*" \
    -not -path "*/dist/*" \
    -not -path "*/build/*" \
    -not -path "*/.nuxt/*" \
    -printf "%s %p\n" 2>/dev/null |
    sort -rn |
    head -n "$TOP_N" |
    awk '
        {
            size=$1; $1="";
            if (size>=1073741824)   printf "%.2f GB - %s\n", size/1073741824, $0;
            else if (size>=1048576) printf "%.2f MB - %s\n", size/1048576, $0;
            else if (size>=1024)    printf "%.2f KB - %s\n", size/1024, $0;
            else                    printf "%d B - %s\n", size, $0;
        }
    ' >> "$REPORT"

# Resumo rápido por diretório (os 10 maiores diretórios)
echo "" >> "$REPORT"
echo "=== Top 10 diretórios por uso de espaço (excluindo node_modules/.git) ===" >> "$REPORT"
du -h --max-depth=2 "$BASE" 2>/dev/null |
    grep -vE "node_modules|\.git" |
    sort -rh |
    head -n 10 >> "$REPORT"

# --------------------------------------------------------------
echo ""
echo "Relatório salvo em: $REPORT"
cat "$REPORT"
echo ""
echo "===== FIM BLOCO‑XXX ====="
~~~
