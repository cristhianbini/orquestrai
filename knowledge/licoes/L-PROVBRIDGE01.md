# L-PROVBRIDGE01 — Nao era bug, era falta de amostra
PROJETO: orquestrai

**Data:** 2026-07-01
**Contexto:** CTXPROVBRIDGE01

## Achado
Todos os 16 registros de execucoes sao origem='individual'. O codigo do
execBloco() ja manda mas_run_id corretamente quando bloco vem do MAS
(dataset.masRunId) -- so nunca houve um caso real de BLOCO do modo MAS
executado pelo caminho protegido pra confirmar isso na pratica.

## Decisao
Nao mexer em codigo -- nao ha bug a corrigir agora. Fica como item de
observacao: proxima vez que um BLOCO do modo MAS for executado via
execBloco(), confirmar que mas_run_id realmente aparece preenchido em
execucoes. Se nao aparecer, ai sim investigar codigo.

## Regra permanente
Confirmar com dado real antes de assumir que algo e bug -- as vezes a
ausencia de dado e so ausencia de amostra, nao falha de logica.
