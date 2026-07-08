---
tipo: bloco-lave
id: BLOCO-186
title: "!/usr/bin/env bash"
sha256: c9a89a7e23e8052a01f30a682ba3acedb82c089e7ff841e87fec065f9f18b760
created: 2026-07-05T17:20:27.832Z
---

# BLOCO-186 - !/usr/bin/env bash

## Script
~~~bash
#!/usr/bin/env bash
# BLOCO-184 – Contagem de diretórios do OrquestrAI (read-only)
set +e   # relatório parcial é melhor que abort em erro de permissão
set +H   # evita expansão de '!' nos echos

BASE="/var/www/orquestrai"
REPORT="/tmp/count_dirs_$(date +%s).txt"   # timestamp evita colisão entre runs

[ -d "$BASE" ] || { echo "ERRO: $BASE não encontrado."; exit 1; }

{
    echo "=== CONTAGEM DE DIRETÓRIOS - OrquestrAI ==="
    echo "Data: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "Base: $BASE"
    echo ""

    # total bruto: reflete o que existe em disco, inclui deps
    TOTAL_ALL=$(find "$BASE" -type d 2>/dev/null | wc -l)
    echo "1. Total (inclui raiz/node_modules/.git) : $TOTAL_ALL"

    # depth<=4: visão de topologia sem cauda de deps
    TOTAL_DEPTH4=$(find "$BASE" -maxdepth 4 -type d 2>/dev/null | wc -l)
    echo "2. Total até profundidade 4              : $TOTAL_DEPTH4"

    # limpo: número que interessa p/ entender o projeto
    TOTAL_CLEAN=$(find "$BASE" -type d \
        ! -path "*/node_modules*" \
        ! -path "*/.git*" \
        ! -path "*/.next*" \
        2>/dev/null | wc -l)
    echo "3. Total excluindo node_modules/.git/.next: $TOTAL_CLEAN"

    echo ""
    echo "Relatório: $REPORT"
} | tee "$REPORT"
~~~
