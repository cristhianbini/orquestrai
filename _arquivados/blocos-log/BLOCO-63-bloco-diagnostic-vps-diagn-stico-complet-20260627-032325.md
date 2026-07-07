---
tipo: licao-automatica
bloco: BLOCO-63
title: "Auto: BLOCO-DIAGNOSTIC-VPS | Diagnóstico completo segurança e recursos VPS Ubuntu 24.04"
sha256: 3999f244e6adc8065679720974bb930a2a49370e15625b58397a5b884ae78e63
created: 2026-06-27T03:23:25.165Z
---

# BLOCO-63 - BLOCO-DIAGNOSTIC-VPS | Diagnóstico completo segurança e recursos VPS Ubuntu 24.04

## O que ficou aprendido
Bloco LAVE persistido automaticamente para consulta futura.

## Script completo
~~~bash
set +e; set +H
# BLOCO-DIAGNOSTIC-VPS | Diagnóstico completo segurança e recursos VPS Ubuntu 24.04
# HISTORICO: 2025-01-10 - Diagnóstico inicial sistema, processos, segurança e logs

REPORT=/tmp/vps_diagnostic_$(date +%s).txt
MARKER="MK_VPS_DIAG_20250110"

grep -q "$MARKER" /tmp/.diagnostic_marker 2>/dev/null && { echo "Diagnóstico já executado hoje"; exit 0; }

echo "===== INICIANDO DIAGNÓSTICO VPS =====" | tee "$REPORT"
echo "Data: $(date '+%Y-%m-%d %H:%M:%S')" | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

echo "--- 1. INFO SISTEMA ---" | tee -a "$REPORT"
uname -a | tee -a "$REPORT"
uptime | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

echo "--- 2. USO DISCO ---" | tee -a "$REPORT"
df -h | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

echo "--- 3. USO MEMORIA ---" | tee -a "$REPORT"
free -h | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

echo "--- 4. PROCESSOS TOP CPU ---" | tee -a "$REPORT"
ps aux --sort=-%cpu | head -n 10 | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

echo "--- 5. PROCESSOS TOP MEMORIA ---" | tee -a "$REPORT"
ps aux --sort=-%mem | head -n 10 | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

echo "--- 6. PORTAS ABERTAS ---" | tee -a "$REPORT"
netstat -tulnp 2>/dev/null | grep LISTEN | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

echo "--- 7. PM2 PROCESSOS ---" | tee -a "$REPORT"
pm2 list 2>/dev/null | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

echo "--- 8. NGINX STATUS ---" | tee -a "$REPORT"
systemctl status nginx --no-pager | head -n 20 | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

echo "--- 9. MYSQL STATUS ---" | tee -a "$REPORT"
systemctl status mysql --no-pager | head -n 20 | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

echo "--- 10. FALHAS SSH (ultimas 20) ---" | tee -a "$REPORT"
grep "Failed password" /var/log/auth.log 2>/dev/null | tail -n 20 | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

echo "--- 11. ERROS SISTEMA (ultimas 15) ---" | tee -a "$REPORT"
journalctl -p err -b --no-pager | tail -n 15 | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

echo "--- 12. AMBIENTES XMONEX ---" | tee -a "$REPORT"
ls -lah /var/www/ | grep xmonex | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

echo "--- 13. TAMANHO LOGS ---" | tee -a "$REPORT"
du -sh /var/log/* 2>/dev/null | sort -hr | head -n 10 | tee -a "$REPORT"
echo "" | tee -a "$REPORT"

echo "$MARKER" > /tmp/.diagnostic_marker
echo "===== RELATORIO SALVO: $REPORT =====" | tee -a "$REPORT"
echo "===== FIM BLOCO-DIAGNOSTIC-VPS ====="
~~~
