---
PROJETO: orquestrai
DATA: 2026-07-10
CTXID: CTXPREVIEWMOUNT01, CTXPREVIEWAUTHFIX02, CTXPREVIEWALIASFIX01, CTXPREVIEWBLOCK403
TAGS: nginx, auth_request, alias, try_files, docker, preview
---

# Licao: fix do preview de projetos (nginx auth_request)

Contexto: o preview de sites gerados pelo mesh (/projects/{slug}/site/)
nao funcionava. O sintoma mudou 3 vezes durante o diagnostico porque eram
3 bugs empilhados, cada um escondendo o proximo. Registrado para nao repetir.

## Bug 1 -- container proxy sem bind-mount de projects/
O nginx (orquestrai-proxy) nao tinha volume apontando pra projects/, entao
qualquer arquivo estatico do projeto dava 404 -- o arquivo existia no host
mas nao dentro do container. Fix: adicionar `./projects:/var/www/orquestrai/
projects:ro` ao servico proxy no docker-compose.yml.
LICAO: ao servir arquivos estaticos via nginx, confirmar que o container
DO NGINX tem o diretorio montado -- nao basta existir no host. Verificar com
`docker inspect <container> --format '{{range .Mounts}}...'`, nao presumir
pelo compose no disco (que pode estar dessincronizado do container rodando).

## Bug 2 -- auth_request com $1 cru no path roteava a subreq pro catch-all
`auth_request /internal/preview-auth-443/$1;` com $1 capturado de uma
location regex NAO roteava a subrequisicao pra location interna esperada --
caia no catch-all `location /` (proxy pro web:80), que respondia 200 (SPA),
e o auth_request interpretava 200 como "autorizado". Resultado: preview
privado liberava sem token.
DIAGNOSTICO decisivo: `auth_request_set $x $upstream_addr; add_header
X-Debug $x;` revelou upstream_addr=web:80 em vez de api:3000.
FIX: location interna com MATCH EXATO (`location = /internal/preview-auth-443`,
sem regex, sem variavel no path) -- maior precedencia do nginx, nunca perde
pro catch-all. Slug e token passam por HEADER (proxy_set_header), setados na
location de preview via `set $var $1` / `set $var $arg__t`.
LICAO: nunca usar variavel capturada ($1) no PATH da diretiva auth_request.
Preferir path fixo + location = + dados por header.

## Bug 3 -- alias + regex + try_files = antipadrao (404 fantasma)
Com auth resolvido, token valido dava 404 ao servir o arquivo. Causa:
`alias /path/$1/site/` numa location REGEX combinado com `try_files $uri` --
com alias, o $uri no try_files vira o path COMPLETO da request, gerando
caminho duplicado (.../site/projects/{slug}/site/...) -> 404 mesmo com o
arquivo certo no disco. Sem erro `open() failed` no log (nao chega a tentar).
FIX: trocar `alias` por `root`. Com root, o path da URL e' anexado ao root
diretamente e bate com o layout real do disco.
LICAO: alias + try_files e' quebrado por design no nginx. Usar root quando
precisar de try_files. (Doc oficial do nginx recomenda o mesmo.)

## Bug 4 (seguranca) -- root expos o diretorio inteiro do projeto
Com root /var/www/orquestrai, paths como /projects/{slug}/project.json e
/docs/ nao casavam a location /site/ e caiam no catch-all -> 200 (serviam
o SPA, nao vazavam o JSON, mas status errado e risco futuro).
FIX: location `~ ^/projects/([a-z0-9-]+)/` DEPOIS da /site/ que retorna 403.
Ordem importa: /site/ (mais especifica, declarada antes) vence por ordem de
regex; o resto cai no 403.
LICAO: ao usar root apontando pra um diretorio-pai, bloquear explicitamente
tudo que nao deve ser servido -- nao confiar que "nao casa a location certa"
seja o mesmo que "e' negado".

## Metodo
- Instrumentar com headers de debug (auth_request_set + add_header) e
  contadores (grep -c em log) foi o que quebrou o impasse -- parar de
  supor e MEDIR onde a requisicao vai.
- Fracionar edicoes de config (LAVE+F): 3 edicoes pequenas com guard
  proprio em vez de 1 heredoc gigante (que embaralhou na colagem 2x).
- Smoke-test (scripts/smoke-preview.sh) criado pra revalidar os 8 casos
  em segundos apos qualquer mudanca futura no proxy.conf.
