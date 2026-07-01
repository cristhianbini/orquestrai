# L-VITE01 — Sempre pedir SCP em vez de sed/grep picado pra arquivos que serao editados 2+ vezes

**Data:** 2026-07-01
**Contexto:** CTXVITE01 -- bug do 'loginDone' persistiu por 2 rodadas de patch

## Erro
Depois do primeiro patch corrigir so o finishLogin() (trocar setLoginDone por
redirect real), assumi que o resto do arquivo (estado 'loginDone' e o JSX que
dependia dele) tambem tinha sido limpo -- nunca vi. So descobri o problema
real quando o usuario testou no navegador e a tela de "sucesso" apareceu
em producao. Levou 2 rodadas extras de grep fragmentado pra confirmar.

## Como resolveu
Usuario sugeriu SCP do arquivo inteiro (~260 linhas, cabia numa mensagem).
Ver o arquivo completo de uma vez eliminou a incerteza na hora.

## Regra permanente
Para qualquer arquivo que vai receber 2+ patches na mesma sessao, pedir SCP
do arquivo inteiro ANTES do primeiro patch, nao depois de um bug aparecer.
sed/grep fragmentado serve bem pra diagnostico pontual (achar 1 linha), mas
nao substitui ver o arquivo completo quando o patch precisa considerar
estado espalhado (variaveis declaradas longe de onde sao usadas, JSX
condicional, etc). Arquivos ate ~300 linhas: sempre pedir completo.
