---
tipo: bloco-lave
id: BLOCO-171
title: "!/usr/bin/env bash"
sha256: f9678b93b8cc43166931de446b06a3296ed25b21cacfd185c86530c78305f873
created: 2026-07-03T14:32:34.619Z
---

# BLOCO-171 - !/usr/bin/env bash

## Script
~~~bash
#!/usr/bin/env bash
# BLOCO-167 – Verificação de Versão e Estrutura do OrquestrAI
# ---------------------------------------------------------
# Protocolo LAVE (LEITURA, AVALIAÇÃO, VERIFICAÇÃO, EXECUÇÃO)
# - Nenhum comando destrutivo (rm, mv, > fora de /tmp, etc.)
# - Todas as variáveis são declaradas neste bloco.
# ---------------------------------------------------------

set +e               # continua mesmo se algum comando falhar
set +H               # desabilita expansão de ! (histórico)

# ── Variáveis de ambiente ─────────────────────────────────────
BASE_DIR="/var/www/orquestrai"
REPORT="/tmp/orquestrai_audit_$(date +%s).txt"
MARKER="### BLOCO-167 EXECUTED ###"

# ── Idempotência – evita re‑execuções desnecessárias ────────
if grep -q "$MARKER" "$REPORT" 2>/dev/null; then
    echo "BLOCO-167 já executado. Consulte: $REPORT"
    exit 0
fi

# ── Início do relatório ─────────────────────────────────────
{
    echo "$MARKER"
    echo "=== ORQUESTRAI – AUDITORIA $(date '+%Y-%m-%d %H:%M:%S') ==="
    echo
} > "$REPORT"

# ── 1️⃣ VERIFICAR VERSÃO DO SISTEMA ─────────────────────────────
{
    echo "1. VERSÃO DO SISTEMA"
    echo "-------------------"

    # 1.1 – Arquivo VERSION
    if [ -f "$BASE_DIR/VERSION" ]; then
        echo "[OK] Arquivo VERSION encontrado:"
        cat "$BASE_DIR/VERSION"
    else
        echo "[WARN] Arquivo VERSION não encontrado."
    fi
    echo

    # 1.2 – package.json (campo version)
    if [ -f "$BASE_DIR/package.json" ]; then
        echo "[OK] package.json encontrado – versão:"
        grep -i '"version"' "$BASE_DIR/package.json" | head -1
    else
        echo "[WARN] package.json não encontrado."
    fi
    echo

    # 1.3 – CHANGELOG.md (últimas linhas)
    if [ -f "$BASE_DIR/CHANGELOG.md" ]; then
        echo "[OK] CHANGELOG.md encontrado – últimos 20 linhas:"
        head -20 "$BASE_DIR/CHANGELOG.md"
    else
        echo "[WARN] CHANGELOG.md não encontrado."
    fi
    echo
} >> "$REPORT"

# ── 2️⃣ LISTAR ESTRUTURA DE DIRETÓRIOS (até 4 níveis) ─────────────
{
    echo "2. ESTRUTURA DE DIRETÓRIOS (4 níveis)"
    echo "-----------------------------------"

    if command -v tree &>/dev/null; then
        # tree já exclui node_modules e .git
        tree -L 4 -a -I 'node_modules|.git|*.log' --dirsfirst "$BASE_DIR"
    else
        # fallback usando find
        echo "[INFO] comando 'tree' não está disponível – usando 'find'"
        find "$BASE_DIR" -maxdepth 4 -type d \
            ! -path "*/node_modules/*" \
            ! -path "*/.git/*" \
            -print | sort
    fi
    echo
} >> "$REPORT"

# ── 3️⃣ RESUMO FINAL ─────────────────────────────────────────────
{
    echo "3. RESUMO FINAL"
    echo "--------------"
    echo "Diretório base: $BASE_DIR"
    echo "Total de arquivos (excluindo node_modules): $(find "$BASE_DIR" -type f ! -path "*/node_modules/*" | wc -l)"
    echo "Total de diretórios (excluindo node_modules): $(find "$BASE_DIR" -type d ! -path "*/node_modules/*" | wc -l)"
    echo
} >> "$REPORT"

# ── Exibir caminho do relatório e seu conteúdo ─────────────────
echo "===== RELATÓRIO GERADO EM: $REPORT ====="
cat "$REPORT"
echo "===== FIM BLOCO‑167 ====="
~~~
