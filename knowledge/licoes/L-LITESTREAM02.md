# L-LITESTREAM02 — Fechado o gap de backup do orquestrai.db (2FA/TOTP)
PROJETO: orquestrai
TAGS: infra, backup, litestream, sqlite, 2fa, seguranca, ops

**Data:** 2026-07-24 (Rodada 10)

## Contexto
Litestream (ver [[L-LITESTREAM01]]) cobria blackboard.db e cluster.db desde 01/07,
MAS o orquestrai.db — que guarda os segredos de **2FA/TOTP** — ficou SEM backup
nenhum (risco critico registrado desde 01/07). Fechado agora: 3o banco adicionado
ao /etc/litestream.yml JA EXISTENTE. A unit systemd litestream.service ja existia
(User=root, Restart=always) — NAO foi criada nem editada (Gate 5 nao acionado).

## O que foi feito
1. BACKUP MANUAL POR ARQUIVO ANTES de mexer (pedido explicito da CBini): `cp -a` do
   orquestrai.db + `-wal` + `-shm` (existiam: o db JA estava em WAL) para
   `_backups/orquestrai.db.pre-litestream-<ts>`. Rede de seguranca caso litestream
   fizesse algo inesperado no banco de 2FA. sha do db conferido.
2. Adicionado bloco no /etc/litestream.yml (os 2 existentes intactos):

       - path: /var/www/orquestrai/data/orquestrai.db
         replicas:
           - type: file
             path: /var/www/orquestrai/_backups/litestream/orquestrai
             retention: 48h
             sync-interval: 10s

3. `systemctl restart litestream` (unit inalterada). Log confirmou "initialized db"
   + "new generation" + "snapshot written" para o orquestrai.db.

## Decisoes (parametros — autonomia da fracao)
- **Destino: replica FILE LOCAL** (mesma convencao dos 2 irmaos). NENHUMA credencial
  de storage remoto existe (sem AWS_/S3_/B2_/LITESTREAM_ em nenhum .env) -> off-VPS
  nao e possivel hoje sem credencial que so a CBini tem.
- **LIMITACAO MVP (registrada, nao bloqueia):** replica no MESMO disco fisico (sda1
  e o unico; 83G livres). Protege contra corrupcao/delete logico do banco, NAO contra
  perda do disco inteiro. Backup off-VPS/off-disk = upgrade futuro.
- **sync-interval 10s, retention 48h** — iguais aos irmaos (2FA e baixo volume de
  escrita; RPO medido << 10s, ver prova).

## Prova (restore em SCRATCH, NUNCA no data/ real — ver [[L-OPSRESTORE01]])
1. Escrita sonda em tabela dedicada `_ls_probe` (sem tocar a tabela `totp` real) via
   better-sqlite3.
2. Replica refletiu em **~1s** (log "wal segment written", position avancou) — RPO
   muito abaixo do sync-interval.
3. `litestream restore -config /etc/litestream.yml -o <scratch> .../orquestrai.db`
   reconstruiu: `PRAGMA integrity_check=ok`, sonda presente (match exato), e as
   tabelas REAIS vieram junto (totp, agents, conversations, messages, runs, workflows).
4. Cleanup: `DROP TABLE _ls_probe` no banco real, scratch + temp do container removidos.

## Armadilhas / notas
- SQLite via **better-sqlite3** (driver do app), path do CONTAINER
  (/app/data/orquestrai.db) — NAO sqlite3 CLI (ausente no container). Ver [[L-CTXDBPATH01]].
- Restore NUNCA no proprio data/ (viraria orfao servido/replicado). Restore -> scratch,
  verifica, apaga. [[L-OPSRESTORE01]].
- `_backups/` e `data/` sao gitignored: o backup pre-litestream contem 2FA, NUNCA
  vai pro git (confirmado com git check-ignore antes de qualquer commit).
