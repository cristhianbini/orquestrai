# Plano gerado pelo mesh OrquestrAI

- run: mas_790f3f1a0019
- goal: Auditoria geral rapida
- gerado em: 2026-07-09T03:28:32.662Z

---

## SMITH (arquitetura)

# BLOCO-64 — Auditoria estrutural: sincronização bind-mount + proxy nginx + integridade DB

```lave
#!/usr/bin/env bash
set +e; set -H

PROJECT_ROOT="/var/www/orquestrai"
NGINX_CONF="/etc/nginx/conf.d/proxy.conf"
CLUSTER_DB="$PROJECT_ROOT/data/cluster.db"
BLACKBOARD_DB="$PROJECT_ROOT/data/blackboard.db"
CONTAINER_WEB="orquestrai-web"

echo "===== AUDITORIA GERAL RAPIDA ====="
echo ""

# 1. Sincronização host ↔ container (L-B194, L-B199)
echo "[1/4] Verificando bind-mount /var/www/orquestrai/src → /app/src"
HOST_FILES=$(find "$PROJECT_ROOT/src" -type f 2>/dev/null | wc -l)
CONTAINER_FILES=$(docker exec "$CONTAINER_WEB" find /app/src -type f 2>/dev/null | wc -l)
echo "  Host: $HOST_FILES arquivos | Container: $CONTAINER_FILES arquivos"
if [ "$HOST_FILES" -ne "$CONTAINER_FILES" ]; then
  echo "  ⚠️  ALERTA: desincronização detectada (L-B194 bind-mount-sync)"
else
  echo "  ✓ Sincronizado"
fi
echo ""

# 2. Proxy nginx → API (L-CTXUNIFY01 achado 1)
echo "[2/4] Validando proxy_pass nginx (esperado: api:3000)"
PORTA_ERRADA=$(grep -n 'proxy_pass.*http://api:8080' "$NGINX_CONF" 2>/dev/null | wc -l)
if [ "$PORTA_ERRADA" -gt 0 ]; then
  echo "  ❌ CRÍTICO: nginx ainda aponta para porta 8080 (L-CTXUNIFY01)"
  grep -n 'proxy_pass.*8080' "$NGINX_CONF"
else
  echo "  ✓ Configuração correta (api:3000)"
fi
echo ""

# 3. Portas escutando
echo "[3/4] Portas escutando (3000=API, 7654=oqterm, 80/443=nginx)"
netstat -tlnp 2>/dev/null | grep -E ':(3000|7654|80|443)' || echo "  netstat indisponível, pulando"
echo ""

# 4. Integridade dos bancos SQLite
echo "[4/4] Integridade SQLite"
if [ -f "$CLUSTER_DB" ]; then
  EXEC_COUNT=$(sqlite3 "$CLUSTER_DB" 'SELECT COUNT(*) FROM execucoes;' 2>&1)
  echo "  cluster.db: $EXEC_COUNT execuções registradas"
else
  echo "  ⚠️  cluster.db não encontrado"
fi

if [ -f "$BLACKBOARD_DB" ]; then
  EVENT_COUNT=$(sqlite3 "$BLACKBOARD_DB" 'SELECT COUNT(*) FROM events;' 2>&1)
  echo "  blackboard.db: $EVENT_COUNT eventos MAS"
else
  echo "  ⚠️  blackboard.db não encontrado"
fi

echo ""
echo "===== FIM BLOCO-64 ====="
```

---

## RELATOR (sintese)

# RELATOR — Síntese Final

## Entrega ao Cris
**BLOCO-64 auditoria rápida (leitura pura):** confirma sincronização bind-mount src/, valida porta proxy nginx 3000 (risco regressão 8080), conta execuções/eventos em SQLite. Rodar e reportar contagens + alertas (3min, zero risco).

## Versão Semver
**v1.2.1-audit** (patch: adição de script diagnostico read-only, sem quebra funcional)

## Próxima ação
Cris executa BLOCO-64 na VPS via oqterm; se `PORTA_ERRADA > 0` ou `HOST_FILES ≠ CONTAINER_FILES`, escalona para Arquiteto.