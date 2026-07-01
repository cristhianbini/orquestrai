# L-VITE02 — ScoreMeter visual pronto, mas dado real bloqueado por CTXUNIFY01

**Data:** 2026-07-01
**Contexto:** CTXVITE02

## Decisao
Construi o ScoreMeter (medidor tipo equalizador, 10 barras, degrade
verde->vermelho) mas deixei ele sem dado real (score=null -> tudo apagado)
de proposito. Existe /api/agents/score (blocosRoutes.cjs) que calcula
taxa de sucesso por agente via execucoes.exit_code, mas essa tabela quase
nao recebe dados reais do MAS (achado do CTXUNIFY01 -- caminho usado no
dia a dia bypassa execucoes via WebSocket direto).

## Regra permanente
Nunca ligar um indicador visual de "score/qualidade/confianca" a uma
fonte de dados que sabidamente tem cobertura baixa ou enviesada. Preferir
mostrar "sem dados" honesto do que um numero tecnicamente calculado mas
estatisticamente enganoso. CTXAGENTSCORE01 fica bloqueado ate CTXUNIFY01
resolver qual caminho de execucao e o oficial.
