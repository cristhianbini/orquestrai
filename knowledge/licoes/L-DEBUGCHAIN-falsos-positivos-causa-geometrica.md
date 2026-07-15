# L-DEBUGCHAIN01 — Cadeia de falsos positivos escondendo causa raiz geometrica
PROJETO: orquestrai
TAGS: infra, css, nginx, docker, ux, debug, processo

**Data:** 2026-07-15 (Rodada 10 — depuracao do icone Perfil/Sair na nav)

## Contexto
Pedido visual simples ("2 botoes da nav pequenos/apagados") virou uma sessao
inteira de investigacao porque MULTIPLAS causas reais foram achadas e corrigidas
em sequencia — cada fix era genuino e necessario, mas nenhum era a causa FINAL.
Cada correcao mascarava a proxima, e a verdadeira so apareceu por ultimo.

## A cadeia completa (nesta ordem)
1. **CSS com excecoes de tamanho** (Sair menor, Perfil com borda invisivel +
   bug de especificidade no hover). Causa real, fix trivial. [92563d7]
2. **HTML sem Cache-Control** — nginx-web servia `.html` so com `Last-Modified`.
   O browser aplicava cache heuristico e podia repintar a versao VELHA por cima
   da nova ("flash correto->antigo"). Fix: `Cache-Control: no-cache` em
   `location ~* \.html$` (e `= /`). Assets com hash no nome seguem 7d. [92c4bb5]
3. **Bind-mount preso ao inode antigo (Docker)** — editar arquivo via temp+rename
   (Edit do Claude Code, `sed -i`) cria inode NOVO; bind-mount de arquivo unico do
   container fica preso no original. `nginx -t`/`nginx -s reload` PASSAM validando
   a config velha (sucesso aparente, mudanca nenhuma). Fix: `docker restart`.
   *** ESTA CAUSA JA ESTAVA DOCUMENTADA em [[L-BINDMOUNT-inode-proxyconf]] e foi
   REDESCOBERTA DO ZERO por nao ter sido consultada primeiro. ***
4. **Hipotese de CDN externa** — investigada e DESCARTADA: rDNS de 76.13.166.207
   = `srv1635175.hstgr.cloud` (VPS Hostinger direta), Cloudflare so faz DNS
   (nuvem cinza), zero `cf-ray`/`cf-cache-status` no HTTP.
5. **Hipotese de diferenca estrutural no HTML** (child combinator `>` quebrado) —
   investigada e DESCARTADA: markup do `#hdr-avatar` e do botao Sair byte-a-byte
   identico (`<button class="hdr-ico"><svg width="18"...>`), svg filho direto nos
   dois, sem wrapper/comentario/`style`/`!important`.
6. **CAUSA RAIZ REAL (geometrica):** o Perfil tinha regra propria
   `#hdr-avatar.hdr-ico{width:30px;height:30px;border-radius:50%}` pra ser
   CIRCULAR — estetica aprovada num Gate 1 ANTERIOR da mesma sessao. Circulo tem
   largura=altura; a altura da fileira e' fixa em 30px; os vizinhos sao
   retangulos de 38px de largura. Um circulo de 30px numa fileira de retangulos
   de 38px SEMPRE parece "menor/errado" — isso e' GEOMETRIA, nao bug de CSS.
   Fix: abandonar o circulo, Perfil vira retangular 38x30, pixel-identico. [37828c9]

## Licao 1 (processo) — buscar nas licoes ANTES de investigar infra do zero
Antes de investigar bug de infraestrutura (cache, Docker, nginx, CDN) montando
hipotese nova, buscar em `knowledge/licoes/` por termos do sintoma. A causa #3
(inode do bind-mount) ja estava escrita e foi perdida por nao ter sido lida.
Custo: uma rodada inteira de redescoberta.

## Licao 2 (design) — excecao de forma quebra uniformidade geometrica
Decisao estetica que quebra a UNIFORMIDADE geometrica de um grupo (ex: 1 botao
circular numa fileira de retangulos de altura fixa) SEMPRE gera percepcao de
"diferente/menor/errado" — inevitavel, nao corrigivel via CSS. Ao aprovar uma
excecao de forma num Gate 1, avaliar o trade-off geometrico EXPLICITAMENTE antes
de aprovar, nao descobrir depois de uma sessao de depuracao. (Um circulo nunca
casa a largura de um retangulo mais largo que a altura da fileira.)

## Licao 3 (ordem de investigacao) — do mais simples ao mais complexo
Ao cacar bug visual persistente que "parece resolvido mas nao e", testar em ordem
CRESCENTE de complexidade: (a) cache do browser [aba anonima], (b) infra [cache
HTML, bind-mount, CDN], (c) estrutura do markup, (d) SO NO FINAL, a geometria/CSS
do proprio elemento. A explicacao mais simples (o elemento e' fisicamente
diferente POR DECISAO DE DESIGN) costuma ser descartada cedo demais em favor de
hipoteses de infra mais "interessantes" de investigar.

## Regra
Bug visual "resolvido mas nao": (1) grep nas licoes pelo sintoma antes de hipotese
nova; (2) subir a escada de complexidade cache->infra->markup->geometria, nao
comecar pelo meio; (3) ao aprovar excecao de forma, cravar o trade-off geometrico
na hora. Ver [[orquestrai-rodada-10]], [[L-BINDMOUNT-inode-proxyconf]].

ORIGEM: R10 depuracao Perfil/Sair (commits 92563d7, 92c4bb5, abecdb8, 37828c9)
DATA: 2026-07-15
