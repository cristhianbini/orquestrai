# L-SPOT06 — Mesmo padrao de bug null innerHTML, elemento diferente
PROJETO: orquestrai

**Data:** 2026-07-01
**Contexto:** CTXSPOT06 (achado durante teste de 2FA)

## Erro
sync() do chip de licoes (b169-lic-chip) checava so 'ul' (#licoes) antes
de escrever, mas usava mlist/chip/n sem checar. setInterval(sync,2500)
rodava em toda aba do dashboard, gerando erro repetido (271 no console)
sempre que a aba ativa nao tinha o modal de licoes no DOM.

## Padrao identificado (recorrente)
Ja e o 2o caso (1o: refresh() do OQ46W no CTXSPOT05). dashboard.html tem
varios setInterval que assumem que TODOS os elementos que eles tocam
existem sempre no DOM, mas o layout muda por aba/tela.

## Regra permanente
Todo setInterval que toca multiplos elementos: checar TODOS antes de
qualquer escrita, nao so o primeiro. Ao investigar erro de console,
perguntar "essa funcao roda em toda tela ou so numa aba especifica?" --
se rodar sempre (setInterval global) mas os elementos forem de uma aba
so, o guard precisa cobrir todos eles.
