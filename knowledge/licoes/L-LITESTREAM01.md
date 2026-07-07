# L-LITESTREAM01 — Padrao de sucesso: Litestream em VPS Ubuntu 24.04
PROJETO: orquestrai

**Data:** 2026-07-01
**Contexto:** CTXLITESTREAM01 — backup continuo SQLite

## O que funcionou
1. PRE-CHECK de espaco e .gitignore antes de instalar
2. litestream-v0.3.13-linux-amd64 via wget do GitHub releases
3. Configuracao em /etc/litestream.yml (replica type: file, retention: 48h)
4. Systemd service com Restart=always
5. WAL mode no SQLite e replicacao concorrente sem parar o servico

## Verificacao que confirma funcionamento
- "snapshot written" nos logs do systemctl status litestream
- Diretorio generations/ criado em cada replica
- HTTP 200 apos setup (servico nao interrompido)

## Recuperacao (quando precisar)
litestream restore -config /etc/litestream.yml /var/www/orquestrai/data/blackboard.db
