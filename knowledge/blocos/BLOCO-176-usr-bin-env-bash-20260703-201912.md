---
tipo: bloco-lave
id: BLOCO-176
title: "!/usr/bin/env bash"
sha256: 2728b952e6ab97f505114c981c082940f18b66cd3ad8b5d6c081de7bb33a18b5
created: 2026-07-03T20:19:12.720Z
---

# BLOCO-176 - !/usr/bin/env bash

## Script
~~~bash
#!/usr/bin/env bash
# --------------------------------------------------------------
# BLOCO-176 – Encontrar diretório com mais arquivos (recursivo)
# Escopo: /var/www/orquestrai   (read‑only – nenhum rm/mv/redirect fora /tmp)
# --------------------------------------------------------------

# ----- 1️⃣ Variáveis – definidas antes do uso -----------------
BASE="/var/www/orquestrai"                       # raiz da varredura
REPORT="/tmp/dir_filecount_$(date +%s).txt"      # relatório em /tmp
MARKER="BLOCO-176-MARKER"

# ----- 2️⃣ Idempotência – evita re‑execuções desnecessárias ----
if [[ -f "$REPORT" && $(grep -c "$MARKER" "$REPORT") -gt 0 ]]; then
    echo "[BLOCO-176] Relatório já existe: $REPORT"
    cat "$REPORT"
    exit 0
fi

# ----- 3️⃣ Cabeçalho do relatório --------------------------------
{
    echo "# $MARKER – $(date)"
    echo "# Relatório de contagem de arquivos por diretório"
    echo ""
} > "$REPORT"

# ----- 4️⃣ Contagem de arquivos por diretório --------------------
#   find → lista todos os arquivos
#   dirname → extrai o caminho do diretório‑pai
#   sort/uniq -c → conta ocorrências
#   sort -rn → ordena decrescente (maior primeiro)
#   head -n 20 → top‑20 (pode ser ajustado)
find "$BASE" -type f 2>/dev/null |
while IFS= read -r file; do
    dirname "$file"
done |
sort |
uniq -c |
sort -rn |
head -n 20 >> "$REPORT"

# ----- 5️⃣ Destaque do diretório com MAIOR contagem -------------
echo "" >> "$REPORT"
echo "=== DIRETÓRIO COM MAIS ARQUIVOS ===" >> "$REPORT"
find "$BASE" -type f 2>/dev/null |
while IFS= read -r file; do
    dirname "$file"
done |
sort |
uniq -c |
sort -rn |
head -n 1 >> "$REPORT"

# ----- 6️⃣ Finaliza ------------------------------------------------
echo "" >> "$REPORT"
echo "# Relatório salvo em: $REPORT" >> "$REPORT"

# Exibe o resultado para o usuário
cat "$REPORT"
echo ""
echo "===== FIM BLOCO-176 ====="
~~~
