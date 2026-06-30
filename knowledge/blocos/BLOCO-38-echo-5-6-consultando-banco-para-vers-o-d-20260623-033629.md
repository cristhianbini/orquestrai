---
tipo: bloco-lave
id: BLOCO-38
title: "echo \"[5/6] Consultando banco para versão de schema...\" | tee -a $REPORT"
sha256: 577dbc21cf2ad93dd5f5167e23e16edb64727ab4f24a9118c83ea6843a4f1533
created: 2026-06-23T03:36:29.530Z
---

# BLOCO-38 - echo "[5/6] Consultando banco para versão de schema..." | tee -a $REPORT

## Script
~~~bash
echo "[5/6] Consultando banco para versão de schema..." | tee -a $REPORT
DB_HOST=$(grep "DATABASE_HOST" "$PROD_BE/.env" 2>/dev/null | cut -d'=' -f2 | tr -d '"')
DB_USER=$(grep "DATABASE_USERNAME" "$PROD_BE/.env" 2>/dev/null | cut -d'=' -f2 | tr -d '"')
DB_PASS=$(grep "DATABASE_PASSWORD" "$PROD_BE/.env" 2>/dev/null | cut -d'=' -f2 | tr -d '"')
DB_NAME=$(grep "DATABASE_NAME" "$PROD_BE/.env" 2>/dev/null | cut -d'=' -f2 | tr -d '"')
mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA='$DB_NAME';" > /tmp/schema_tables.txt 2>&1
echo "Tabelas em PROD: $(wc -l < /tmp/schema_tables.txt)" | tee -a $REPORT
~~~
