---
tipo: bloco-lave
id: BLOCO-70
title: "!/usr/bin/env bash"
sha256: e8b923e613284e902201f5e27c62901418f09e6fe1d0ad13eabf311274a6957e
created: 2026-06-27T23:59:45.023Z
---

# BLOCO-70 - !/usr/bin/env bash

## Script
~~~bash
#!/usr/bin/env bash
# -------------------------------------------------
# BLOCO-CURL-CREATEC-001 | Teste de conectividade da API externa
# Objetivo: curl https://createc.com.br/api/status
# Criado: 2026-06-27 | Agente: SMITH
# -------------------------------------------------
# HISTORICO:
# v1.0 – bloco inicial (HEAD, GET‑verbose e validação de certificado)
# -------------------------------------------------

# -------------------------------------------------
# 0 – CONFIGURAÇÕES GERAIS
# -------------------------------------------------
set +e          # não abortar no primeiro erro
set +H          # desabilita ! (history expansion)

# --------------------
# VARIÁVEIS
# --------------------
API_URL="https://createc.com.br/api/status"
REPORT="/tmp/curl_createc_$(date +%s).txt"
TIMEOUT=10
MARKER="MK-CURL-CREATEC-001"

# -------------------------------------------------
# 1 – SCOUT: validar existência de "/mas"
# -------------------------------------------------
if [[ -e /mas ]]; then
    echo "[SCOUT] Aviso: o caminho /mas existe – reveja se o bloco deve atuar nele." | tee -a "$REPORT"
else
    echo "[SCOUT] /mas não encontrado – prosseguindo com teste apenas da API externa." | tee -a "$REPORT"
fi

# -------------------------------------------------
# 2 – Idempotência (evita re‑execuções desnecessárias)
# -------------------------------------------------
if grep -q "$MARKER" "$REPORT" 2>/dev/null; then
    echo "[INFO] BLOCO já executado anteriormente (marker encontrado)." | tee -a "$REPORT"
    exit 0
fi

# -------------------------------------------------
# 3 – INÍCIO DO RELATÓRIO
# -------------------------------------------------
{
    echo "========================================"
    echo "BLOCO-CURL-CREATEC-001"
    echo "Data: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "API testada: $API_URL"
    echo "========================================"
    echo ""
} | tee -a "$REPORT"

# -------------------------------------------------
# 4 – TESTE 1 – HEAD (cabeçalhos apenas)
# -------------------------------------------------
{
    echo "[1/3] HEAD request (cabeçalhos):"
    curl -I -m "$TIMEOUT" "$API_URL"
    echo ""
} | tee -a "$REPORT"

# -------------------------------------------------
# 5 – TESTE 2 – GET com verbose (primeiros 30 linhas)
# -------------------------------------------------
{
    echo "[2/3] GET completo com verbose (SSL/TLS):"
    curl -v -m "$TIMEOUT" "$API_URL" 2>&1 | head -n 30
    echo ""
} | tee -a "$REPORT"

# -------------------------------------------------
# 6 – TESTE 3 – Validação do certificado SSL
# -------------------------------------------------
{
    echo "[3/3] Certificado SSL do host:"
    echo | openssl s_client -connect createc.com.br:443 -servername createc.com.br 2>/dev/null \
        | openssl x509 -noout -dates -subject -issuer
    echo ""
} | tee -a "$REPORT"

# -------------------------------------------------
# 7 – Marcar execução e encerrar relatório
# -------------------------------------------------
echo "$MARKER" >> "$REPORT"

{
    echo "========================================"
    echo "Relatório salvo em: $REPORT"
    echo "===== FIM BLOCO-CURL-CREATEC-001 ====="
    echo "========================================"
} | tee -a "$REPORT"
~~~
