# CLAUDE.md — nginx/ (proxy público)

`proxy.conf` é montado `:ro` no container `orquestrai-proxy` (único com portas 80/443).
Ver `../CLAUDE.md` para regras gerais.

## ⚠️ DOIS blocos server{} (:80 e :443)
`proxy.conf` tem `server{}` para porta 80 E porta 443. Editar um location e esquecer o outro já
expôs preview público sem auth por ~1h (PROTOCOLO-ANTICONTAMINACAO seção 12). **Confirme em qual
bloco está editando** e se a mudança precisa estar nos dois. O tráfego real de produção é o :443.

## Ritual de mudança
1. `.bak` do proxy.conf antes.
2. `docker exec orquestrai-proxy nginx -t` (valida sintaxe).
3. `docker exec orquestrai-proxy nginx -s reload` (reload, não restart — zero downtime).
4. `bash scripts/smoke-preview.sh` revalida os casos do preview (ver skill `smoke-preview`).

## Armadilhas (lições)
- **`alias` + `try_files` é quebrado por design** — use `root` quando precisar de try_files
  (L-CTXPREVIEWAUTH01). Com `root` apontando p/ dir-pai, bloqueie explicitamente o que não deve
  ser servido (não confie em "não casa a location certa" = "negado").
- **Nunca use variável capturada ($1) no PATH de `auth_request`** — cai no catch-all e 200 vira
  "autorizado" falso. Path fixo + `location =` (match exato) + dados por header (L-CTXPREVIEWAUTH01).
- Mismatch config vs código (ex: proxy_pass porta) não se prova por grep — teste conectividade real
  (docker exec + wget). Já houve proxy_pass 8080 vs listen 3000 causando 107x 502 (L-CTXPROXYFIX01).
- Regressão de porta não é detectada por CI — grep periódico `proxy_pass.*8080` (L-audit-regressao-proxy-nginx).
