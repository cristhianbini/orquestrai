# L-AUDIT02 — Existir 2 sistemas de EXECUTAR na mesma tela e um risco real
PROJETO: orquestrai

**Data:** 2026-07-01

## Achado
execBloco()/#bloco (protegido: sha256, autorizo+confirmacao+motivo, hash-chain)
coexiste com cards numerados/oq71z-exec (direto pro WebSocket, sem protecao
nenhuma). Ambos recebem conteudo da IA, ambos tem botao visivel na tela.
O caminho protegido nao e usado de fato ha 8+ dias -- toda auditoria/hash-chain
construida sobre ele fica sem efeito pratico ate os sistemas serem unificados.

## Como foi descoberto
Testando CTXAUDIT01: criei um bloco, cliquei EXECUTAR, vi o resultado rodar
no terminal, mas verify-chain continuou total_verificado:0. execucoes nao
cresceu. So investigando linha a linha achamos os 2 caminhos separados.

## Regra permanente
Ao construir auditoria/seguranca em cima de um endpoint, sempre confirmar
que a UI REAL usa aquele endpoint (nao so que o endpoint existe e funciona
isolado). Testar clicando no botao que o usuario realmente usa no dia a dia,
nao um caminho alternativo que pode estar desconectado da UI principal.
