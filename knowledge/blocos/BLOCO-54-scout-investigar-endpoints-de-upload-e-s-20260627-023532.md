---
tipo: bloco-lave
id: BLOCO-54
title: "SCOUT: Investigar endpoints de upload e storage de arquivos"
sha256: bd6682500e1e63f76b8a61cd31ab62aa345bf82f6d10acb795d55c885aef5495
created: 2026-06-27T02:35:32.309Z
---

# BLOCO-54 - SCOUT: Investigar endpoints de upload e storage de arquivos

## Script
~~~bash
set +e; set +H

# SCOUT: Investigar endpoints de upload e storage de arquivos
REPORT=/tmp/upload_analysis_$(date +%s).txt
PROD_BE=/var/www/xmonex/backend
TESTE_BE=/var/www/xmonex_teste/backend
RELEASE_BE=/var/www/xmonex_release/backend
PROD_FE=/var/www/xmonex/frontend
TESTE_FE=/var/www/xmonex_teste/frontend
UPLOAD_DIRS="/var/www/uploads /var/www/xmonex/uploads /var/www/xmonex/public/uploads /var/www/xmonex/frontend/public/uploads"

echo "===== ANÁLISE DE CAPACIDADE DE UPLOAD DE IMAGENS =====" | tee $REPORT
echo "Data: $(date)" | tee -a $REPORT
echo "" | tee -a $REPORT

echo "[1] ENDPOINTS DE UPLOAD NO BACKEND" | tee -a $REPORT
for BE_PATH in $PROD_BE $TESTE_BE $RELEASE_BE; do
    echo ">>> $BE_PATH" | tee -a $REPORT
    find $BE_PATH/routes -type f -name "*.js" 2>/dev/null | while read route_file; do
        if grep -qE "(upload|multer|formidable|busboy)" "$route_file"; then
            echo "  MATCH: $route_file" | tee -a $REPORT
            grep -n -A3 -B3 -E "(upload|multer|formidable)" "$route_file" | tee -a $REPORT
        fi
    done
done

echo "" | tee -a $REPORT
echo "[2] MIDDLEWARE DE UPLOAD (multer, formidable)" | tee -a $REPORT
grep -rn --include="*.js" -E "require\(.*(multer|formidable|busboy)" $PROD_BE/middlewares/ $PROD_BE/ 2>/dev/null | head -20 | tee -a $REPORT

echo "" | tee -a $REPORT
echo "[3] COMPONENTES DE UPLOAD NO FRONTEND" | tee -a $REPORT
find $PROD_FE/src -type f \( -name "*.js" -o -name "*.jsx" -o -name "*.tsx" \) 2>/dev/null | while read fe_file; do
    if grep -qE "(input.*type=.file|FileUpload|Dropzone|react-dropzone)" "$fe_file"; then
        echo "  MATCH: $fe_file" | tee -a $REPORT
        grep -n -C2 -E "(input.*type=.file|FileUpload|Dropzone)" "$fe_file" | tee -a $REPORT
    fi
done

echo "" | tee -a $REPORT
echo "[4] DIRETÓRIOS DE ARMAZENAMENTO DE ARQUIVOS" | tee -a $REPORT
for DIR in $UPLOAD_DIRS; do
    if [ -d "$DIR" ]; then
        echo ">>> $DIR (EXISTS)" | tee -a $REPORT
        ls -lhd $DIR | tee -a $REPORT
        du -sh $DIR 2>/dev/null | tee -a $REPORT
        find $DIR -type f -name "*.jpg" -o -name "*.png" -o -name "*.gif" 2>/dev/null | head -5 | tee -a $REPORT
    else
        echo ">>> $DIR (NOT FOUND)" | tee -a $REPORT
    fi
done

echo "" | tee -a $REPORT
echo "[5] CONFIGURAÇÃO NGINX (client_max_body_size)" | tee -a $REPORT
grep -rn "client_max_body_size" /etc/nginx/sites-enabled/ 2>/dev/null | tee -a $REPORT

echo "" | tee -a $REPORT
echo "[6] VARIÁVEIS DE AMBIENTE RELACIONADAS A UPLOAD" | tee -a $REPORT
for ENV_FILE in $PROD_BE/.env $TESTE_BE/.env $RELEASE_BE/.env; do
    if [ -f "$ENV_FILE" ]; then
        echo ">>> $ENV_FILE" | tee -a $REPORT
        grep -E "(UPLOAD|STORAGE|MAX_FILE|BUCKET)" "$ENV_FILE" 2>/dev/null | tee -a $REPORT
    fi
done

echo "" | tee -a $REPORT
echo "Relatório salvo em: $REPORT"
echo "===== FIM BLOCO-UPLOAD-ANALYSIS ====="
~~~
