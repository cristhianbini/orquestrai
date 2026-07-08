---
tipo: bloco-lave
id: BLOCO-179
title: "!/usr/bin/env bash"
sha256: c1c7ca790369ec1da63337617736c2874f875fb9700f67b04f2c4d0d2500407a
created: 2026-07-04T21:26:08.278Z
---

# BLOCO-179 - !/usr/bin/env bash

## Script
~~~bash
#!/usr/bin/env bash
# -----------------------------------------------------------------------
# BLOCO-179 – Último arquivo criado (última modificação) no OrquestrAI
# -----------------------------------------------------------------------
# RESTRIÇÕES: somente leitura – não altera nenhum arquivo do projeto.
# -----------------------------------------------------------------------

set +e          # continua mesmo se algum comando falhar
set -H          # habilita expansão de histórico (necessário para alguns shells)

# --------------------------- 1️⃣ VARIÁVEIS ----------------------------
BASE_DIR="/var/www/orquestrai"
REPORT_FILE="/tmp/orquestrai_ultimo_arquivo_$(date +%s).txt"

# --------------------------- 2️⃣ PRE‐CHECK ---------------------------
if [ ! -d "$BASE_DIR" ]; then
    echo "[ERRO] Diretório inexistente: $BASE_DIR" >&2
    exit 1
fi

# --------------------------- 3️⃣ CABEÇALHO DO RELATÓRIO ----------------
{
    echo "===== RELATÓRIO – ÚLTIMO ARQUIVO CRIADO ====="
    echo "Diretório analisado : $BASE_DIR"
    echo "Data/hora execução   : $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
} > "$REPORT_FILE"

# --------------------------- 4️⃣ BUSCA DO ARQUIVO --------------------
# Usa -print0 + xargs -0 para lidar com nomes que contenham espaços ou
# quebras de linha. 'stat -c %Y' devolve o timestamp Unix de mtime.
find "$BASE_DIR" -type f -print0 2>/dev/null \
| xargs -0 -I{} stat -c '%Y %n' {} 2>/dev/null \
| sort -rn \
| head -1 \
| while IFS=' ' read -r TS FILEPATH; do
    # Converte timestamp Unix → data legível
    READABLE_DATE=$(date -d "@$TS" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo "N/A")

    {
        echo "=== ÚLTIMO ARQUIVO MODIFICADO ==="
        echo "Caminho   : $FILEPATH"
        echo "Timestamp : $TS ($READABLE_DATE)"
        echo ""
    } >> "$REPORT_FILE"

    # Exibe também no console
    echo "→ Arquivo mais recente: $FILEPATH"
    echo "  Modificado em       : $READABLE_DATE"
done

# --------------------------- 5️⃣ FINALIZAÇÃO -------------------------
echo "===== FIM DO RELATÓRIO =====" >> "$REPORT_FILE"
echo ""
echo "[BLOCO-179] Relatório salvo em: $REPORT_FILE"
cat "$REPORT_FILE"
~~~
