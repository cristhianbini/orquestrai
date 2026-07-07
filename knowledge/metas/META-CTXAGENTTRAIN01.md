# META FUTURA — Rodada de refinamento de prompts dos agentes (CTXAGENTTRAIN01)

**Status:** INFRAESTRUTURA CONCLUIDA (2026-07-07) -- CONTEUDO ainda pendente
**Registrado:** 2026-07-04 | **Atualizado:** 2026-07-07
**Origem:** discussao do Bini sobre funcao fixa vs. modelo trocavel

## O que ficou pronto (sessao 2026-07-07)
- CTXAGTUNIFY01: a tela TITULAR/RESERVA (descrita abaixo como desconectada)
  AGORA le os 9 cards reais via /api/agents/cards, ordem canonica do
  pipeline, cor/modelo sincronizados com o ROUTING real de agents.mjs.
- Seed: os 9 agentes ganharam secao "Prompt do sistema" no card (8 copiados
  do role hardcoded + REVISOR ja tinha prompt customizado).
- /api/agents/train: endpoint que usa Opus pra SUGERIR melhoria dos 6
  campos de um agente. NUNCA salva sozinho -- humano revisa e clica
  Cadastrar. Botao Treinar no form ja funcional, testado.
- CTXAGTCARDMERGE01: edicao via form preserva telemetria/prompt/conteudo
  existente -- nao apaga mais dados nao cobertos pelo payload.

## Objetivo
Refinar os parametros/prompts de cada agente (papel e fixo -- Guardiao
sempre protege/valida, Detetive sempre investiga -- mas o MODELO por
posicao pode trocar). Cada agente precisa de instrucoes mais precisas de
QUANDO deve ser chamado, quando NAO deve, entrega tipica esperada, e
system prompt bem definido.

## Escopo (a definir na rodada dedicada)
- Bom em que / ruim em que, por agente
- Quando chamar / quando NAO chamar
- Entrega tipica esperada
- System prompt revisado por posicao

## O que AINDA falta (o objetivo original desta meta)
A infraestrutura acima permite refinar, mas ninguem ainda PASSOU pelos 9
agentes de fato decidindo/aprovando melhorias reais linha a linha. O
Treinar foi testado tecnicamente, nao usado como rodada de curadoria.
Sugestao: usar exatamente esta infraestrutura numa rodada dedicada,
1 agente por vez (LAVE+F), Treinar -> revisar -> ajustar -> Cadastrar.

## Por que nao agora
Grande o suficiente pra merecer sessao propria, com LAVE-F (um agente por
vez, testar antes de seguir pro proximo). Relacionado: a tela
TITULAR/RESERVA do modal Providers (hoje desconectada dos 9 agentes reais
-- ver investigacao de 2026-07-04) pode virar a UI natural pra essa
configuracao, quando o momento chegar.
