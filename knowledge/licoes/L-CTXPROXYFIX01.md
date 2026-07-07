# L-CTXPROXYFIX01 — /api/blocos apontava pra porta sem listener (8080 vs 3000 real)
PROJETO: orquestrai

**Data:** 2026-07-02
**Contexto:** achado durante investigacao do CTXUNIFY01

## Achado
nginx/proxy.conf tinha 2 locations (/api/blocos/*) com proxy_pass http://api:8080,
enquanto server.js escuta hardcoded em PORT=3000 (unico app.listen do arquivo).
Todas as outras rotas (/api/auth/, /api/mas/*, /api/ generico) ja usavam
http://orquestrai-api:3000 corretamente -- so blocos tinha porta errada.

## Impacto
Confirmado 107 ocorrencias de "502" em nginx/logs relacionadas a "blocos".
O caminho PROTEGIDO de execucao (sha256 anti-tampering + hash-chain CTXAUDIT01)
estava inacessivel, mascarado porque oqterm (caminho nao-protegido) cobria o
uso real do dia a dia sem ninguem perceber a rota quebrada.

## Correcao
proxy_pass http://api:8080 -> http://api:3000 (2 ocorrencias), nginx -t antes
de reload, reload (nao restart) pra zero downtime.

## Regra permanente
Confirmar conectividade real (docker exec + wget/curl) SEMPRE que existir
mismatch entre config declarada (proxy_pass, env var) e valor hardcoded no
codigo-fonte -- grep encontrando os dois nao prova que estao alinhados.
