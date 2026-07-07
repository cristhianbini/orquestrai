# L-INFRA02 — Servicos podem viver totalmente fora do projeto principal
PROJETO: orquestrai

**Data:** 2026-07-01
**Contexto:** CTXUNIFY01

## Achado
/opt/oqterm/server.js: servico de terminal PTY completo, rodando direto no
host (nao Docker, nao PM2), na porta 7654, desde 22/06. Nao aparece em NENHUMA
busca dentro de /var/www/orquestrai porque literalmente nao esta la.

## Como foi encontrado
grep amplo por 'WebSocketServer'/'term/ws' em todo /var/www/orquestrai E dentro
do container voltou vazio. So apareceu ao rodar `ss -tlnp` e olhar TODAS as
portas escutando na VPS, nao so as que eu esperava (Docker/PM2 conhecidos).

## Regra permanente
Quando uma busca de codigo (grep amplo, incluindo dentro de containers) nao
acha nada mas a FUNCIONALIDADE claramente existe e funciona: o servico pode
estar em outro lugar do filesystem, rodando como processo solto do systemd/
manual. Proximo passo nesse caso: `ss -tlnp` pra ver TODAS as portas ativas
na maquina, nao so as do projeto que se esperava encontrar.
