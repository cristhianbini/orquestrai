ID: L-MOUNTPARSE01
PROJETO: orquestrai
TITULO: mount() do oqShell roda no parse - DOM abaixo do register nao existe ainda
CONTEXTO: R9-MAN01 (piloto Manual -> oqShell) - o register() do oqShell executa mount(pane) IMEDIATAMENTE, durante o parse (~linha 2160 do dashboard). O #b83Manual que a aba ia adotar so e definido mais abaixo (~linha 2985): mount acharia null, marcaria _mounted=true e a aba nasceria quebrada para sempre.
REGRA: No oqShell, adocao de DOM que vive ABAIXO do bloco do registry vai no onShow (lazy, dispara pos-parse com o modal aberto), nunca no mount; o guard de idempotencia e verificar se o no adotado ja esta no pane.
COMO_APLICAR: Ao registrar aba nova, perguntar "o DOM que o mount toca ja existe na linha do register?"; se nao, usar onShow com guard. Complementa L-OQSHELL01.
TAGS: oqshell,registry,parse,ordem-de-carga,manual
ORIGEM: R9-MAN01 (lote visual da rodada 9)
DATA: 2026-07-12
