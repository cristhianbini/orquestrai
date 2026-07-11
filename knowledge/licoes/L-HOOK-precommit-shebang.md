# L-HOOK-precommit-shebang — hook de pre-commit prepende header ACIMA do shebang e quebra o parse
PROJETO: orquestrai

**Data:** 2026-07-11 (Rodada 7, Fase B2 — server.js do project-supervisor)

## Erro
O hook de pre-commit do repo (/var/www/orquestrai) prepende o header
"ATUALIZADO:" na LINHA 1 de arquivos commitados — acima de qualquer
shebang `#!`. Em script executavel isso empurra o shebang para baixo e o
kernel/node deixa de reconhece-lo: o server.js do project-supervisor
quebrou o parse DUAS vezes na Fase B por isso (shebang "duplicado"/
deslocado a cada commit).

## Correcao aplicada (mitigacao, nao cura)
Removido o shebang do services/project-supervisor/server.js — a unit
systemd ja invoca `/usr/bin/node server.js` explicitamente (atencao:
`/usr/bin/node` e o caminho real das units; `which node` engana, aponta
pro nvm em /root).

## Regra
1. Script novo neste repo que dependa de shebang: OU nao usar shebang
   (invocar pelo interprete explicito na unit/cron), OU esperar o hook
   quebrar.
2. DECISAO CBini 2026-07-11: se acontecer DE NOVO em qualquer arquivo,
   parar de corrigir na mao e INVESTIGAR O HOOK (ensina-lo a detectar e
   preservar a linha `#!`, inserindo o header depois dela).
