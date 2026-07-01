# L-DURATION02 — Nunca silenciar stderr em migrations SQLite

**Data:** 2026-07-01
**Contexto:** CTXDURATION01

## Erro cometido
Usar 2>/dev/null em migration SQL silenciou erro real ("no such table").
O shell interpretou como sucesso e imprimiu "ja existia (ok)".
Falso positivo — sistema quebrado em silencio.

## Regra permanente
Em migrations de banco: NUNCA redirecionar stderr.
Sempre: sqlite3 db.db "ALTER TABLE ..."; echo "exit: $?"
Verificar exit code explicitamente antes de prosseguir.
