# L-OPSRESTORE01 — Restore-teste do Litestream deve ir para path descartavel, nunca data/
PROJETO: orquestrai

**Data:** 2026-07-11
**Contexto:** CTXOPSCHECK01 — 1o teste de restore do Litestream (aprovado).

## Achado
Durante o 1o teste de restore, encontrei em /var/www/orquestrai/data/ dois
arquivos orfaos de uma tentativa ANTERIOR de restore-teste:
- `restore-teste-blackboard.db-shm` (32K, 2026-07-09)
- `restore-teste-blackboard.db-wal` (0 bytes, 2026-07-09)
Sem o `.db` principal correspondente — resto de um restore incompleto/abortado,
deixado DENTRO do diretorio dos bancos vivos.

## Por que e ruim
data/ e o diretorio que o Litestream vigia (data/cluster.db, data/blackboard.db).
Arquivos com nome `restore-teste-blackboard.db-*` ali:
1. Confundem auditoria (parecem banco vivo relacionado ao blackboard).
2. Risco real: se alguem der restore SEM `-o` apontando para um path em data/, ou
   se o nome colidir, pode-se sobrescrever ou corromper o banco vivo.

## Regra permanente
Todo restore-teste do Litestream vai para um path DESCARTAVEL fora de data/
(ex: /tmp/litestream-restore-test-<timestamp>/), com o flag `-o` OBRIGATORIO.
Sem `-o`, `litestream restore` restaura para o path original (o VIVO). O banco
vivo nunca e destino nem e lido no teste — o restore le das replicas em
_backups/litestream/. Limpar o path descartavel ao final (rm -rf).

## Procedimento validado (2026-07-11)
```
DEST=/tmp/litestream-restore-test-$(date +%Y%m%d-%H%M%S); mkdir -p "$DEST"
litestream restore -config /etc/litestream.yml -o "$DEST/cluster.restored.db"    /var/www/orquestrai/data/cluster.db
litestream restore -config /etc/litestream.yml -o "$DEST/blackboard.restored.db" /var/www/orquestrai/data/blackboard.db
sqlite3 "$DEST/cluster.restored.db" 'PRAGMA integrity_check;'   # -> ok
# comparar COUNT(*) e MAX(timestamp) restaurado vs vivo (sqlite3 -readonly no vivo)
rm -rf "$DEST"
```

## Pendente (NAO feito nesta sessao, por decisao do Bini)
- Limpar os orfaos `restore-teste-blackboard.db-{shm,wal}` de data/ — o Bini decide depois.
- Avaliar backup do orquestrai.db (2FA), hoje fora do litestream.yml — registrado no ROADMAP-FUTURO (item 0b).

TAGS: litestream,backup,restore,ops,seguranca,sqlite
