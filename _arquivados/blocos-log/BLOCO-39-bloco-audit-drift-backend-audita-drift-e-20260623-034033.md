---
tipo: licao-automatica
bloco: BLOCO-39
title: "Auto: BLOCO-AUDIT-DRIFT-BACKEND - Audita drift entre release e prod no backend XMonex"
sha256: e5a3146ab5ce4e5ddd9c5adab68b43210a841529125c11eca10573c093b7d8d2
created: 2026-06-23T03:40:33.543Z
---

# BLOCO-39 - BLOCO-AUDIT-DRIFT-BACKEND - Audita drift entre release e prod no backend XMonex

## O que ficou aprendido
Bloco LAVE persistido automaticamente para consulta futura.

## Script completo
~~~bash
set +e; set +H
# BLOCO-AUDIT-DRIFT-BACKEND - Audita drift entre release e prod no backend XMonex
# HISTORICO: 2025-01-10 - Smith - Criacao inicial para analise de drift

REPORT=/tmp/audit_drift_$(date +%s).txt
PROD_BACKEND=/var/www/xmonex/backend
RELEASE_BACKEND=/var/www/xmonex_release/backend
TESTE_BACKEND=/var/www/xmonex_teste/backend

echo "=== AUDITORIA DE DRIFT BACKEND XMONEX ===" > "$REPORT"
echo "Data: $(date '+%Y-%m-%d %H:%M:%S')" >> "$REPORT"
echo "" >> "$REPORT"

echo "--- 1. ANALISE DE ARQUIVOS MODIFICADOS ---" >> "$REPORT"
find "$PROD_BACKEND" -type f -name "*.js" -mtime -90 -exec stat -c "%y %n" {} \; | sort -r | head -20 >> "$REPORT"
echo "" >> "$REPORT"

echo "--- 2. COMPARACAO .ENV (RELEASE vs PROD) ---" >> "$REPORT"
if [ -f "$RELEASE_BACKEND/.env" ] && [ -f "$PROD_BACKEND/.env" ]; then
    diff -u "$RELEASE_BACKEND/.env" "$PROD_BACKEND/.env" >> "$REPORT" 2>&1 || echo "Divergencias encontradas em .env" >> "$REPORT"
else
    echo "ERRO: Arquivo .env nao encontrado em um dos ambientes" >> "$REPORT"
fi
echo "" >> "$REPORT"

echo "--- 3. HASH SHA256 DE ARQUIVOS CRITICOS ---" >> "$REPORT"
for FILE in app.js server.js routes/index.js models/index.js middlewares/Sistema.js; do
    echo "FILE: $FILE" >> "$REPORT"
    [ -f "$PROD_BACKEND/$FILE" ] && echo "  PROD: $(sha256sum "$PROD_BACKEND/$FILE" | cut -d' ' -f1)" >> "$REPORT" || echo "  PROD: AUSENTE" >> "$REPORT"
    [ -f "$RELEASE_BACKEND/$FILE" ] && echo "  RELEASE: $(sha256sum "$RELEASE_BACKEND/$FILE" | cut -d' ' -f1)" >> "$REPORT" || echo "  RELEASE: AUSENTE" >> "$REPORT"
    [ -f "$TESTE_BACKEND/$FILE" ] && echo "  TESTE: $(sha256sum "$TESTE_BACKEND/$FILE" | cut -d' ' -f1)" >> "$REPORT" || echo "  TESTE: AUSENTE" >> "$REPORT"
done
echo "" >> "$REPORT"

echo "--- 4. LINHAS DE CODIGO POR AMBIENTE ---" >> "$REPORT"
for ENV_PATH in "$PROD_BACKEND" "$RELEASE_BACKEND" "$TESTE_BACKEND"; do
    TOTAL=$(find "$ENV_PATH" -type f -name "*.js" 2>/dev/null | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
    echo "$(basename $(dirname $ENV_PATH)): $TOTAL linhas" >> "$REPORT"
done
echo "" >> "$REPORT"

echo "--- 5. ROTAS DIVERGENTES (routes/) ---" >> "$REPORT"
diff -rq "$RELEASE_BACKEND/routes/" "$PROD_BACKEND/routes/" >> "$REPORT" 2>&1 || echo "Divergencias detectadas em routes/" >> "$REPORT"
echo "" >> "$REPORT"

echo "--- 6. CONTROLLERS DIVERGENTES ---" >> "$REPORT"
diff -rq "$RELEASE_BACKEND/controllers/" "$PROD_BACKEND/controllers/" >> "$REPORT" 2>&1 || echo "Divergencias detectadas em controllers/" >> "$REPORT"
echo "" >> "$REPORT"

echo "--- 7. MIDDLEWARES DIVERGENTES ---" >> "$REPORT"
diff -rq "$RELEASE_BACKEND/middlewares/" "$PROD_BACKEND/middlewares/" >> "$REPORT" 2>&1 || echo "Divergencias detectadas em middlewares/" >> "$REPORT"
echo "" >> "$REPORT"

echo "--- 8. PACKAGE.JSON VERSIONS ---" >> "$REPORT"
for ENV_PATH in "$PROD_BACKEND" "$RELEASE_BACKEND" "$TESTE_BACKEND"; do
    if [ -f "$ENV_PATH/package.json" ]; then
        VERSION=$(grep -oP '"version"\s*:\s*"\K[^"]+' "$ENV_PATH/package.json" 2>/dev/null)
        echo "$(basename $(dirname $ENV_PATH)): version=$VERSION" >> "$REPORT"
    fi
done
echo "" >> "$REPORT"

echo "--- 9. TOP 10 ARQUIVOS MAIORES ---" >> "$REPORT"
find "$PROD_BACKEND" -type f -name "*.js" -exec du -h {} \; | sort -rh | head -10 >> "$REPORT"
echo "" >> "$REPORT"

echo "RELATORIO COMPLETO: $REPORT"
cat "$REPORT"
echo "===== fim BLOCO-AUDIT-DRIFT-BACKEND ====="
~~~
