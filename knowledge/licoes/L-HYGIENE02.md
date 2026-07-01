# L-HYGIENE02 — Exemplo de comando com placeholder foi executado literalmente

**Data:** 2026-07-01
**Contexto:** CTXHYGIENE01

## Erro
Dei um comando de exemplo com placeholder 'SUA_SENHA_NOVA_AQUI' para o
usuario substituir. Usuario disse "deixa pendente" mas colou o bloco
inteiro sem editar -- senha do admin virou literalmente o texto do
placeholder por alguns minutos.

## Como foi pego
Verificacao ANTES de assumir que a intencao ("deixa pendente") bateu com
a acao real -- ver a var no /proc/1/environ confirmou o placeholder
literal antes de eu seguir para o proximo item.

## Regra permanente
Comandos com placeholder OBVIO (TROQUE_AQUI, SUA_SENHA_AQUI, etc) sao
perigosos de dar como bloco pronto pra copiar -- especialmente se o
usuario acabou de dizer que vai pular esse passo. Preferir: nao dar o
comando completo quando o usuario disse que vai fazer depois -- so
descrever o passo em texto, ou pedir confirmacao explicita do valor
antes de montar o comando.
