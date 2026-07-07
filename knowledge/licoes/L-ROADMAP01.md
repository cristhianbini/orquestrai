# L-ROADMAP01 — knowledge/roadmap.md so existe na VPS, nao no Claude Project
PROJETO: orquestrai

**Data:** 2026-07-01

## Erro
Tentei editar 'roadmap.md' (path relativo errado) assumindo que era o mesmo
arquivo do Claude Project. Rodou sem erro de sintaxe mas cp/python falharam
com FileNotFoundError -- o arquivo real esta em 'knowledge/roadmap.md',
caminho diferente do que eu tinha em memoria via Claude Project.

## Causa raiz
Dois arquivos com nome parecido em lugares diferentes: o anexado ao Claude
Project (referencia estatica, pode estar desatualizado) e o real na VPS em
knowledge/roadmap.md (versionado em git, fonte de verdade).

## Regra permanente
Antes de editar qualquer arquivo de knowledge/ pelo path assumido do Claude
Project: confirmar o path real na VPS primeiro (find/ls). Para leitura
atualizada de arquivos grandes/criticos: pedir SCP para o diretorio
~/vps/ do usuario, mesmo fluxo ja usado para dashboard.html.
