# CTXGITADDSCOPE01 -- git add em arquivo grande mistura patches nao relacionados

## O que aconteceu

O patch do CTXTOPBAR01 (CSS da topbar) ficou aplicado em src/dashboard.html
por varias mensagens sem commit, enquanto a sessao seguia para outras
tarefas. Quando o commit do CTXAGTSCROLL01 (auto-scroll do painel de
agentes) rodou `git add src/dashboard.html`, ele stageou o arquivo
INTEIRO -- incluindo o CSS do topbar que ainda esperava commit. O commit
final saiu com mensagem falando so de scroll; o topbar foi junto, sem
documentacao.

Resultado: codigo correto e funcionando, mas rastreabilidade quebrada --
"onde foi feito o CTXTOPBAR01" nao aparece em nenhum commit com esse nome.

## Causa raiz (padrao generalizavel)

`git add <arquivo>` sempre stage o DIFF INTEIRO do arquivo contra o commit
anterior -- nao so a regiao que voce acabou de editar. Em arquivos
monoliticos e compartilhados (dashboard.html, ~4700 linhas, editado por
varios patches na mesma sessao), isso significa: qualquer patch anterior
que ainda nao foi commitado entra de carona no proximo commit que tocar
o mesmo arquivo, com uma mensagem que nao o descreve.

## Regra adotada

Antes de `git add <arquivo-grande-compartilhado>`, rodar:

```bash
git diff --stat <arquivo>
```

Se o numero de linhas mudadas for maior que o esperado pro patch atual,
investigar antes de commitar -- pode haver um patch antigo pendurado.
Regra de ouro: nunca commitar um arquivo grande "as cegas" so porque
sabe que seu patch atual esta correto -- o arquivo pode carregar mais
coisa que voce nao lembra.

## Nota

Nao vale a pena reescrever historico (`commit --amend`/`rebase`) num repo
ja pushado so por rastreabilidade -- o risco de quebrar hashes referenciados
em outro lugar (STATUS.md, roadmap.md) supera o beneficio. A correcao
correta e documentar a realidade, nao fingir que a historia foi diferente.
