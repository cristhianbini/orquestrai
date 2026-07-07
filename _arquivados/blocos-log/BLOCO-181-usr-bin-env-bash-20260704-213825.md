---
tipo: licao-automatica
bloco: BLOCO-181
title: "Auto: !/usr/bin/env bash"
sha256: 3cbeac341a974dc7d81eeae3fb316adb3e3e5c1b9aa6de4b247aaaf90a12f201
created: 2026-07-04T21:38:25.172Z
---

# BLOCO-181 - !/usr/bin/env bash

## O que ficou aprendido
Bloco LAVE persistido automaticamente para consulta futura.

## Script completo
~~~bash
#!/usr/bin/env bash
# ------------------------------------------------------------
# BLOCO-178 – Contagem de Diretórios – OrquestrAI
# ------------------------------------------------------------
# OBJETIVO: contar quantos diretórios existem em /var/www/orquestrai,
#           excluindo diretórios “lixo” (node_modules, .git) e
#           mantendo o próprio relatório apenas em /tmp.
# ------------------------------------------------------------

set +e      # não aborta na primeira falha
set -H      # habilita expansão de history (padrão usado nos blocos)

# -------------------- Variáveis --------------------
BASE="/var/www/orquestrai"               # ponto de partida
TIMESTAMP=$(date +%s)                    # marca‑tempo única
REPORT="/tmp/count_dirs_${TIMESTAMP}.txt"   # arquivo de saída

# -------------------- Verificações --------------------
if [ ! -d "$BASE" ]; then
    echo "ERRO: diretório $BASE não encontrado."
    exit 1
fi

# -------------------- Início do Relatório --------------------
{
    echo "=== CONTAGEM DE DIRETÓRIOS - OrquestrAI ==="
    echo "Data: $(date)"
    echo "Base: $BASE"
    echo ""

    # 1) Contagem TOTAL (inclui node_modules e .git)
    echo "[1] TOTAL (todos os diretórios):"
    TOTAL=$(find "$BASE" -type d 2>/dev/null | wc -l)
    echo "    $TOTAL diretorios"
    echo ""

    # 2) Contagem LIMPA (exclui node_modules e .git)
    echo "[2] LIMPA (sem node_modules e .git):"
    CLEAN=$(find "$BASE" -type d \
            \( -name node_modules -o -name .git \) -prune -o -type d -print \
            2>/dev/null | wc -l)
    echo "    $CLEAN diretorios"
    echo ""

    # 3) Contagem LIMPA sem contar a raiz (mindepth 1)
    echo "[3] LIMPA (excluindo o diretório raiz):"
    CLEAN_NO_ROOT=$(find "$BASE" -mindepth 1 -type d \
                    \( -name node_modules -o -name .git \) -prune -o -type d -print \
                    2>/dev/null | wc -l)
    echo "    $CLEAN_NO_ROOT diretorios"
    echo ""

    # 4) Top 10 diretórios que possuem mais sub‑diretórios (limpo)
    echo "[4] TOP 10 diretórios com mais subdiretórios (excluindo lixo):"
    find "$BASE" -mindepth 1 -type d \
          \( -name node_modules -o -name .git \) -prune -o -type d -print \
          2>/dev/null | \
          sed 's|/[^/]*$||' |           # remove o último componente (conta o pai)
          sort | uniq -c | sort -rn | head -n 10
} | tee "$REPORT"

# -------------------- Mensagem Final --------------------
echo ""
echo "📄 Relatório salvo em: $REPORT"
echo "===== FIM BLOCO-178 ====="
~~~
