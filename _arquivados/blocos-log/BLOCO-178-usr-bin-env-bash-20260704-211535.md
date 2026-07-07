---
tipo: licao-automatica
bloco: BLOCO-178
title: "Auto: !/usr/bin/env bash"
sha256: 1c2c617da64fc6be96c9b7014103345dac69179e340d3112e1561162d73c23c0
created: 2026-07-04T21:15:35.715Z
---

# BLOCO-178 - !/usr/bin/env bash

## O que ficou aprendido
Bloco LAVE persistido automaticamente para consulta futura.

## Script completo
~~~bash
#!/usr/bin/env bash
# --------------------------------------------------------------
# BLOCO-178 – Últimos arquivos criados no OrquestrAI
# Uso:   bash BLOCO-178.sh
# Saída: /tmp/ultimos_arquivos_criados_<timestamp>.txt
# --------------------------------------------------------------
# RESTRIÇÕES: somente comandos READ‑ONLY (find, stat, date, sort,…)
#             nenhum arquivo é criado fora de /tmp
# --------------------------------------------------------------

set +e          # não aborta em erros
set -H          # habilita histórico de expansão (padrão)

# --------------------  CONFIGURAÇÕES  -------------------------
PROJETO="/var/www/orquestrai"          # caminho absoluto do projeto
DIAS=30                                # janela de busca (últimos N dias)
MAX_RESULTADOS=50                      # quantos arquivos mostrar
REPORT="/tmp/ultimos_arquivos_criados_$(date +%s).txt"
MARKER="BLOCO-178_FIM"

# --------------------  INICIALIZAÇÃO  -------------------------
# Cabeçalho do relatório
{
    echo "=================================================================="
    echo "BLOCO-178 – Últimos arquivos criados no OrquestrAI"
    echo "Projeto   : $PROJETO"
    echo "Janela    : últimos $DIAS dias (baseado em ctime)"
    echo "Gerado em : $(date '+%Y-%m-%d %H:%M:%S')"
    echo "=================================================================="
    echo ""
} > "$REPORT"

# Verifica se o diretório do projeto existe
if [[ ! -d "$PROJETO" ]]; then
    echo "ERRO: Diretório $PROJETO não encontrado." | tee -a "$REPORT"
    exit 1
fi

# --------------------  BUSCA DE ARQUIVOS  --------------------
# find:
#   -type f            → somente arquivos regulares
#   -ctime -$DIAS     → criados/modificados nos últimos $DIAS dias
#   -printf '%C@ %s %p\n'  → timestamp ctime, tamanho (bytes) e caminho completo
# sort -rn → ordena decrescente pelo timestamp (mais recentes primeiro)
# head → limita ao número máximo definido
echo "=== Top $MAX_RESULTADOS arquivos mais recentes (ctime) ===" >> "$REPORT"
find "$PROJETO" -type f -ctime -"$DIAS" -printf '%C@ %s %p\n' 2>/dev/null \
    | sort -rn \
    | head -n "$MAX_RESULTADOS" \
    | while IFS=' ' read -r ts size path; do
        # Converte timestamp Unix para data legível
        datetime=$(date -d "@$ts" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || echo "N/A")
        # Converte tamanho para formato legível (IEC)
        human_size=$(numfmt --to=iec-i --suffix=B "$size" 2>/dev/null || echo "${size}B")
        printf "%-20s %-10s %s\n" "$datetime" "$human_size" "$path"
    done >> "$REPORT"

# --------------------  RESUMO POR DIRETÓRIO  --------------------
echo "" >> "$REPORT"
echo "=== Resumo por diretório (quantidade de arquivos recentes) ===" >> "$REPORT"
find "$PROJETO" -type f -ctime -"$DIAS" -printf '%h\n' 2>/dev/null \
    | sort \
    | uniq -c \
    | sort -rn \
    | head -n 20 >> "$REPORT"

# Marca de conclusão (permite idempotência simples)
echo "" >> "$REPORT"
echo "$MARKER" >> "$REPORT"
echo "==================================================================" >> "$REPORT"

# --------------------  EXIBIÇÃO DO RESULTADO  -----------------
cat "$REPORT"
echo ""
echo "Relatório salvo em: $REPORT"
~~~
