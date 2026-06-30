---
tipo: bloco-lave
id: BLOCO-43
title: "BLOCO-LIST-DIR-001 | Listar diretório atual (read-only)"
sha256: 0c32835b15d7e81f49924bb93da3a2db7119e38e8aab4f7b1b1e6b17ca581387
created: 2026-06-23T04:10:33.915Z
---

# BLOCO-43 - BLOCO-LIST-DIR-001 | Listar diretório atual (read-only)

## Script
~~~bash
set +e; set +H
# BLOCO-LIST-DIR-001 | Listar diretório atual (read-only)
# HISTORICO: 2025-01-09 - Criação inicial para exibir diretório corrente
MARKER="MK_LIST_DIR_001"
grep -q "$MARKER" /tmp/.markers 2>/dev/null && { echo "Bloco já executado"; exit 0; }

REPORT_FILE="/tmp/current_dir_report_$(date +%s).txt"
CURRENT_DIR="$(pwd)"

echo "===== RELATÓRIO DIRETÓRIO ATUAL =====" | tee "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

echo ">> Comando: pwd" | tee -a "$REPORT_FILE"
pwd | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

echo ">> Variável de ambiente \$PWD:" | tee -a "$REPORT_FILE"
echo "$PWD" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

echo ">> Caminho absoluto (readlink):" | tee -a "$REPORT_FILE"
readlink -f . | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

echo ">> Conteúdo do diretório atual (ls -lah):" | tee -a "$REPORT_FILE"
ls -lah "$CURRENT_DIR" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

echo ">> Informações do filesystem (df -h):" | tee -a "$REPORT_FILE"
df -h "$CURRENT_DIR" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

echo ">> Permissões do diretório:" | tee -a "$REPORT_FILE"
stat -c "Permissões: %a | Dono: %U | Grupo: %G" "$CURRENT_DIR" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

echo "Relatório salvo em: $REPORT_FILE"
mkdir -p /tmp && echo "$MARKER" >> /tmp/.markers
echo "===== fim BLOCO-LIST-DIR-001 ====="
~~~
