# L-CTXUNIFY01 — Investigacao completa + tentativa de auditoria do oqterm (2026-07-02)

## Contexto
CTXUNIFY01: dois modelos de execucao coexistem — execBloco (protegido,
hash-chain CTXAUDIT01) e oqterm (terminal interativo real, e o usado no
dia a dia). Decisao tomada: Opcao B — oqterm passa a registrar em
`execucoes` (hash apenas, nao texto puro), sem abrir mao da sessao com
estado.

## Achado 1 (critico, resolvido): /api/blocos apontava pra porta errada
nginx/proxy.conf tinha 2 locations de /api/blocos/* com
`proxy_pass http://api:8080`, mas server.js escuta hardcoded em
`PORT=3000` (unico app.listen do arquivo). 107 ocorrencias de 502
confirmadas em logs. O caminho PROTEGIDO de execucao estava inacessivel
havia tempo indeterminado, mascarado porque oqterm cobria o uso real.

**Correcao aplicada e mantida:** proxy_pass 8080 -> 3000 (2 ocorrencias),
via patch Python com assert count==2, nginx -t + reload, reteste
502->401 confirmado. COMMITADO, nao foi revertido.

## Achado 2: db real fica em /var/www/orquestrai/data/cluster.db
Caminho `db/cluster.db` (relativo, alguns comandos anteriores) nao existe.
Path correto confirmado via docker-compose.yml (bind mount ./data:/var/www/orquestrai/data).

## Achado 3: rede oqterm -> api
oqterm roda fora do Docker (systemd, /opt/oqterm/server.js, porta 7654).
api so e acessivel via porta 3000 dentro da rede app-net, sem porta
publicada no host. Solucao adotada: oqterm chama a API via
https://127.0.0.1:443 (porta ja publicada pelo proxy), reusando o mesmo
JWT que o usuario ja tem (oqterm ja valida esse token pra abrir o PTY).
Testado IP de origem visto pelo nginx quando host chama porta publicada:
172.18.0.1 (gateway Docker), NAO 127.0.0.1 -- relevante se algum dia
quiser restringir por IP.

## Achado 4: risco de dado sensivel
Buffer por linha do terminal capturaria SENHAS em texto puro (sudo,
mysql -p, etc) se gravasse o comando cru. Decisao tomada: gravar so
sha256(linha) + tamanho, nunca o texto. status='registrado' (nao
sucesso/falha -- oqterm nao expoe exit code por linha sem instrumentar
a shell, isso ficou fora de escopo).

## Achado 5 (NAO resolvido -- revertido): hook de escrita no oqterm falhou silenciosamente
Endpoint /api/blocos/oqterm-log criado em api/blocosRoutes.cjs, TESTADO
E FUNCIONANDO via curl manual (200, grava em execucoes com hash-chain
correto). Mas a chamada automatica do oqterm nunca disparou de verdade:

- Buffer por linha (`lineBuf`) confirmado funcionando (log HIT gravava
  a cada linha real digitada, tamanho batendo com o comando).
- `sendOqtermLog(tok, hash, tamanho)` chamada logo em seguida, MAS a
  primeira linha de dentro da funcao (dbg('CALLED...')) nunca gravou --
  nem apos trocar fs2 (nao declarado) por fs (comprovadamente
  funcional). Sugere que a chamada em si nunca executa ou falha antes
  de entrar no corpo da funcao, por motivo nao identificado apos multiplas
  tentativas de instrumentacao.

## Erro operacional serio durante a investigacao (impacto real em producao)
Tentativa de corrigir um `require("crypto")` presumido ausente (hipotese
que se provou ERRADA -- crypto ja estava declarado) duplicou a
declaracao e quebrou a sintaxe do arquivo. `systemctl restart oqterm`
rodou mesmo assim (script sem validar exit code antes do proximo passo)
e o servico ficou em crash-loop por ~12s ate o proximo patch corrigir.
CONFIRMADO no log do proxy: HTTP 502 real na sessao do usuario logado
no dashboard (Chrome) durante essa janela.

## Decisao final desta sessao: REVERTIDO
Apos achado 5 permanecer sem causa raiz identificada e o incidente do
achado operacional acima, revertido oqterm/server.js para o backup
anterior ao CTXUNIFY01 (_arquivados/oqterm-server.js.bak-CTXUNIFY01-*).
O endpoint /api/blocos/oqterm-log FICA no ar (isolado, testado, zero
risco -- so existe, nada chama ainda).

## Regras permanentes aprendidas hoje
1. SEMPRE `node --check` E conferir exit code ANTES de restart -- nunca
   encadear restart logo apos um patch sem confirmar sintaxe passou.
2. Ao suspeitar de "modulo ausente", CONFIRMAR com grep antes de
   adicionar require novo -- adicionar por hipotese nao confirmada
   causou o unico incidente real desta sessao.
3. Depois de 3+ patches incrementais no MESMO arquivo sem sucesso,
   PARAR e ler o arquivo inteiro (nao mais grep fatiado) antes do
   patch seguinte -- ou reverter e reescrever do zero com calma.
4. Terminal interativo (oqterm) e bash script na mesma janela: sempre
   redirecionar output de teste pra arquivo (`> /tmp/x.txt`) antes de
   `cat` -- evita perda de output por scrollback do terminal remoto.

## Proximo passo (sessao dedicada, nao no fim de uma sessao longa)
Reescrever a integracao oqterm -> /api/blocos/oqterm-log do zero, lendo
o arquivo /opt/oqterm/server.js por inteiro (nao fatiado) antes do
primeiro patch. Endpoint da API ja pronto, nao precisa refazer essa
parte.
