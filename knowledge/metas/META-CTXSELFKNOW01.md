# META-CTXSELFKNOW01 — Autoconhecimento: a plataforma se conhece p/ se melhorar
PROJETO: orquestrai
STATUS: registrada 2026-07-08 (ideia do Bini) | EXECUTAR: rodada dedicada pos-S4

## Tese
"Antes de tudo, o OrquestrAI primeiro se conhece a si mesmo. Entao pode
melhorar a si mesmo, a cada passo." Hoje o conhecimento da melhoria vive
FORA (chat externo -> copia -> cola na VPS). A KB dos agentes sabe de
bash/SQLite, mas pouco sobre o PROPRIO OrquestrAI: arquitetura, esteira,
decisoes, porques. Agente que nao conhece a plataforma nao pode melhora-la.

## Fase 1 — Rodada de alimentacao da KB (sessao dedicada)
Serie de licoes L-SELF* geradas em sessao com mentor externo, colaveis,
cobrindo: arquitetura (containers, DBs, quem escreve onde), esteira 1-9
(papel + fronteira de cada agente), fluxo BLOCO (nasce->veta->executa->
registra), decisoes de arquitetura (resumo das META-CTX*), armadilhas
conhecidas (restart obrigatorio, sqlite CLI cria db vazio, etc -- as
licoes L-* existentes ja cobrem parte). Formato: mesmas licoes da KB
(frontmatter PROJETO:, Regra pratica), absorviveis pelo scoring atual.
Criterio de sucesso: run com goal sobre a propria plataforma responde
com precisao SEM mentor externo.

## Fase 2 — O loop interno (visao)
O processo copia-cola (chat externo -> VPS) migra pra DENTRO: operador
descreve a melhoria no proprio cockpit, esteira gera/veta/executa/verifica,
MEMORIALISTA registra. Dependencias: CTXPIPECLOSE01 (#11 VERIFICADOR
fecha o loop mecanico), CTXKBLOOP01 (curadoria de licoes), S23
CTXCOMMENTPASS01 (o codigo-base comentado E' autoconhecimento legivel).
Quando Fase 1+2 prontas: o OrquestrAI passa a ser o proprio ambiente de
evolucao do OrquestrAI.
