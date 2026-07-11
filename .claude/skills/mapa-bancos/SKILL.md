---
name: mapa-bancos
description: Referência rápida de qual banco SQLite tem qual tabela no OrquestrAI e como consultar com segurança. Use antes de qualquer query, migration ou diagnóstico que toque cluster.db, blackboard.db ou orquestrai.db.
---

# mapa-bancos

Errar de banco custa rodadas (L-DURATION01). Consulte isto antes de query/migration.

## Mapa (path do container)
| Banco (`/app/data/`) | Tabelas principais | Usado por |
|---|---|---|
| `cluster.db` | `execucoes` (hash-chain auditoria LAVE) | `api/blocosRoutes.cjs` |
| `blackboard.db` | `mas_run`, `mas_event` (telemetria MAS) | `mas/*` |
| `orquestrai.db` | `totp` (2FA) | `server.js` |

## Como consultar (seguro)
Use `better-sqlite3` via node — o mesmo driver da app. NÃO use `sqlite3` CLI: está ausente no
container, e apontar para path errado CRIA um banco vazio silenciosamente (query "sem resultado"
não prova "sem dado" — pode ser só path errado). L-CTXDBPATH01.

```bash
docker exec orquestrai-api node -e "const D=require('better-sqlite3');const d=new D('/app/data/blackboard.db',{readonly:true});console.log(d.prepare(\"SELECT id FROM mas_run WHERE status='running'\").all());d.close()"
```

## Regras de migration
- Antes: `grep -rn 'new Database\|DB_PATH'` no arquivo que usa a tabela alvo — confirme o banco certo.
- NUNCA silenciar stderr (`2>/dev/null`) em migration — esconde "no such table" (L-DURATION02).
- Coluna nullable para não quebrar linhas antigas. `.bak` do db + backup Litestream antes.
- Após write em WAL, leitor em conexão separada pode ver defasado — retry loop (L-B244).
- `cluster.db` = auditoria imutável; `blackboard.db` = telemetria volátil. Não misturar queries
  (L-cluster-vs-blackboard-dualismo).
