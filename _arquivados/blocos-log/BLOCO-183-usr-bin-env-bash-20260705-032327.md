---
tipo: licao-automatica
bloco: BLOCO-183
title: "Auto: !/usr/bin/env bash"
sha256: d9a7d76733575737753ad1352af96dccc3bbd2d60c7108e112e9ef087aa6de7f
created: 2026-07-05T03:23:27.183Z
---

# BLOCO-183 - !/usr/bin/env bash

## O que ficou aprendido
Bloco LAVE persistido automaticamente para consulta futura.

## Script completo
~~~bash
#!/usr/bin/env bash
# ---------------------------------------------------------
# BLOCO-182 – Limpeza segura de logs de debug em dashboard.html
# ---------------------------------------------------------
# 1️⃣  Busca do arquivo
# 2️⃣  Backup preventivo (L‑B236)
# 3️⃣  Listagem das ocorrências encontradas (read‑only)
# 4️⃣  Remoção controlada com sed (L‑B235)
# 5️⃣  Validação pós‑remoção + relatório
# ---------------------------------------------------------

# ----- CONFIGURAÇÃO -------------------------------------------------
BASE="/var/www/orquestrai"                     # raiz do projeto
REPORT="/tmp/debug_cleanup_$(date +%Y%m%d-%H%M%S).txt"
# ---------------------------------------------------------------------

echo "=== BLOCO‑182: Limpeza de debug em dashboard.html ===" | tee "$REPORT"
echo "Data: $(date)" | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

# 1️⃣  Localiza o dashboard.html (pode estar em /frontend ou na raiz)
FILE=$(find "$BASE" -type f -name "dashboard.html" 2>/dev/null | head -n1)

if [[ -z "$FILE" ]]; then
    echo "❌ ERRO: dashboard.html não encontrado em $BASE" | tee -a "$REPORT"
    exit 1
fi

echo "[1/5] Arquivo encontrado: $FILE" | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

# 2️⃣  Backup preventivo (L‑B236)
BAK="${FILE}.bak-$(date +%Y%m%d-%H%M%S)"
cp -a "$FILE" "$BAK"
echo "[2/5] Backup criado: $BAK" | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

# 3️⃣  Busca de padrões de debug (somente leitura)
PATTERN='console\.(log|debug|warn|error)\s*\(|debugger;|<!--.*[Dd]ebug.*-->'
echo "[3/5] Ocorrências encontradas (linha:número):" | tee -a "$REPORT"
grep -nE "$PATTERN" "$FILE" | tee -a "$REPORT"
TOTAL=$(grep -cE "$PATTERN" "$FILE")
echo "" | tee -a "$REPORT"
echo "Total de ocorrências: $TOTAL" | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

if [[ $TOTAL -eq 0 ]]; then
    echo "✅ Nenhum log de debug encontrado. Nada a remover." | tee -a "$REPORT"
    echo "===== FIM BLOCO‑182 =====" | tee -a "$REPORT"
    exit 0
fi

# 4️⃣  Remoção segura com sed (L‑B235)
#    - `-E` habilita expressões regulares estendidas
#    - `-i.tmp` cria um arquivo temporário de backup automático (já temos nosso .bak)
echo "[4/5] Removendo logs de debug…" | tee -a "$REPORT"
sed -E -i.tmp \
    -e '/console\.(log|debug|warn|error)\s*\(/d' \
    -e '/debugger;/d' \
    -e '/<!--.*[Dd]ebug.*-->/d' \
    "$FILE"

echo "Remoção concluída." | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

# 5️⃣  Validação pós‑remoção
echo "[5/5] Validando resultado (diff resumido)…" | tee -a "$REPORT"
diff -u "$BAK" "$FILE" | head -n 30 | tee -a "$REPORT"

RESTANTE=$(grep -cE "$PATTERN" "$FILE")
echo "" | tee -a "$REPORT"
echo "Ocorrências restantes após a remoção: $RESTANTE" | tee -a "$REPORT"

if [[ $RESTANTE -gt 0 ]]; then
    echo "⚠️  Ainda há $RESTANTE linhas de debug. Revise o .bak e ajuste o padrão." | tee -a "$REPORT"
else
    echo "✅  Todas as linhas de debug foram removidas." | tee -a "$REPORT"
fi

echo "" | tee -a "$REPORT"
echo "Relatório completo: $REPORT" | tee -a "$REPORT"
echo "Backup original (para rollback): $BAK" | tee -a "$REPORT"
echo "===== FIM BLOCO‑182 =====" | tee -a "$REPORT"
~~~
