# L-LOCALHOST-ipv6-busybox — 'localhost' em container Alpine resolve ::1 e da Connection refused com app viva
PROJETO: orquestrai

**Data:** 2026-07-11 (sessao telemetria por projeto, validacao do endpoint E3)

## Sintoma
Smoke test de DENTRO do proprio container api falhou com "wget: can't
connect to remote host: Connection refused" em http://localhost:3000/...
— mas a API estava comprovadamente DE PE ("rodando na porta 3000" no
log, proxy servindo normal). Parece app morta; nao e.

## Causa raiz
O wget do busybox (Alpine) resolve 'localhost' preferindo ::1 (IPv6).
O Express escuta app.listen(PORT,'0.0.0.0') — SO IPv4. A conexao em ::1
e recusada pelo kernel na hora; nenhum log no servidor, porque a conexao
nem chega nele. Trocar para http://127.0.0.1:3000/ resolveu no ato
(rota respondeu 401 sem token = registrada e protegida, como esperado).

## Regra
1. Health-check/smoke test dentro de container: SEMPRE 127.0.0.1
   explicito, nunca 'localhost'.
2. "Connection refused" em localhost com app comprovadamente viva =
   suspeitar IPv6-vs-bind-IPv4 ANTES de suspeitar da app.
3. Espelho tambem vale: se um dia o bind virar '::' (dual-stack),
   teste IPv4-only tambem engana. Conferir o bind real (grep
   app.listen / ss -tlnp) antes de tirar conclusao do teste.

Parente do L-OQ58-alpine-bash (outra pegadinha de imagem Alpine minima).
