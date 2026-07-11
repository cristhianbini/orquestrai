# L-BINDMOUNT-inode-proxyconf — bind-mount de ARQUIVO unico: editar via rename quebra o inode
PROJETO: orquestrai

**Data:** 2026-07-11 (Rodada 7, Fase B5 — location /app/ no proxy)

## Erro
nginx/proxy.conf e bind-mount de ARQUIVO UNICO (`:ro`) no container
orquestrai-proxy. Bind-mount de arquivo prende o INODE, nao o caminho.
Ferramentas que salvam via temp+rename (Edit do Claude Code, `sed -i`,
maioria dos editores) criam um arquivo NOVO com outro inode — o host
mostra o conteudo novo, mas DENTRO do container continua o arquivo
antigo. Armadilha dupla: `nginx -t` e `nginx -s reload` passam "OK"
validando a config VELHA — sucesso aparente, mudanca nenhuma aplicada.

## Correcao (validada no B5)
1. Editar o proxy.conf IN-PLACE, sem rename: `cat > proxy.conf` (ou
   `tee`), preservando o inode. Backup `.bak` antes, como sempre.
2. VERIFICAR DENTRO do container antes de confiar no reload:
   `docker exec orquestrai-proxy grep '<trecho novo>' /etc/nginx/...`.
   So depois `nginx -t` + `nginx -s reload` + skill smoke-preview.

## Regra
Qualquer bind-mount de arquivo unico (nao diretorio): NUNCA editar por
rename; sempre in-place + grep de conferencia dentro do container.
Mesma causa-raiz do L-WATCHER01 (inotify perdia o inode apos sed -i).
Alternativa estrutural (avaliar se doer de novo): montar o DIRETORIO
em vez do arquivo.
