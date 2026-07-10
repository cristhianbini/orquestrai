#!/usr/bin/env bash
# [CTXPREVIEWSMOKE01 2026-07-10] Smoke-test do preview de projetos.
# POR QUE existe: o preview depende de 3 pecas frageis que quebraram nesta
# ordem durante o desenvolvimento (sessao 2026-07-09/10):
#   1) o container proxy precisa do bind-mount de projects/ (senao 404);
#   2) o auth_request precisa mandar slug/token por HEADER pra location
#      interna com match exato (=), nao por $1 cru no path (que roteava a
#      subreq pro catch-all web:80 -> auth sempre passava -> 200 indevido);
#   3) a location de preview usa 'root' + try_files, nao 'alias' (alias +
#      regex + try_files e' antipadrao do nginx -> 404 mesmo com arquivo ok).
# Alem disso, tudo sob /projects/{slug}/ que nao seja /site/ deve dar 403
# (project.json e docs/ nao podem vazar).
# COMO USAR: ./scripts/smoke-preview.sh  (precisa de docker + curl no host)
# Sai com codigo 0 se os 8 testes passam, 1 se qualquer um falha.
set -u
HOST="https://orquestrai.cbini.com.br"
HOSTHTTP="http://orquestrai.cbini.com.br"
SLUG="cafe-real"   # projeto privado usado como fixture
FAILS=0

# gera um JWT valido usando o MESMO segredo da API (via container)
TOKEN=$(docker exec orquestrai-api node -e "console.log(require('jsonwebtoken').sign({id:1,email:'admin@cbini.com.br',role:'admin'}, process.env.JWT_SECRET||'orquestrai-secret-2025', {expiresIn:'5m'}))")

check() { # $1=descricao  $2=esperado  $3=obtido
  if [ "$2" = "$3" ]; then echo "  OK   $1 ($3)"; else echo "  FAIL $1 -- esperado $2, obtido $3"; FAILS=$((FAILS+1)); fi
}

code() { curl -s -o /dev/null -w "%{http_code}" "$1"; }

echo "== AUTENTICACAO =="
check "sem token -> 401"        401 "$(code "$HOST/projects/$SLUG/site/")"
check "token invalido -> 401"   401 "$(code "$HOST/projects/$SLUG/site/?_t=xyzinvalido")"
check "token valido -> 200"     200 "$(code "$HOST/projects/$SLUG/site/?_t=$TOKEN")"

echo "== SEGURANCA (nao vaza project.json / docs) =="
check "project.json -> 403"     403 "$(code "$HOST/projects/$SLUG/project.json?_t=$TOKEN")"
check "docs/ -> 403"            403 "$(code "$HOST/projects/$SLUG/docs/?_t=$TOKEN")"

echo "== HTTP -> HTTPS =="
check "HTTP /site/ -> 301"       301 "$(code "$HOSTHTTP/projects/$SLUG/site/")"

echo "== SANITY =="
check "dashboard -> 200"         200 "$(code "$HOST/dashboard.html")"

# conteudo: o site servido e' mesmo o do projeto?
TITLE=$(curl -s "$HOST/projects/$SLUG/site/?_t=$TOKEN" | grep -oE "<title>[^<]*" | head -1)
if echo "$TITLE" | grep -qi "caf"; then echo "  OK   serve o HTML real ($TITLE)"; else echo "  FAIL titulo inesperado: $TITLE"; FAILS=$((FAILS+1)); fi

echo ""
if [ "$FAILS" -eq 0 ]; then echo "RESULTADO: 8/8 OK"; exit 0; else echo "RESULTADO: $FAILS FALHA(S)"; exit 1; fi
