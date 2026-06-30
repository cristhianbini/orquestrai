# L-PROP-scout-script-idempotency

_Auto-promovida por Guardian em 2026-06-27T19:43:41.581Z_

ID: L-PROP-scout-script-idempotency
TITULO: Padrão Idempotência para Scripts Bash de Scout
CONTEXTO: Criação de scripts de diagnóstico/auditoria (Scout/Detetive) que geram logs em /tmp e podem ser re-executados.
REGRA: Definir `REPORT="/tmp/prefixo_$(date +%s).txt"` e `MARKER="UNIQUE_ID"`. Inserir verificação `grep -q "$MARKER" "$REPORT" && exit 0` no início para previnir execução duplicada e garantir logs únicos.
EVIDENCIA: BLOCO-SCOUT-B316
