# META — Metodologia de avaliacao de agentes (CTXAGENTSCORE01)
PROJETO: orquestrai
**Status:** DESENHO aprovado 2026-07-07 (Bini+Fable) -- implementacao faseada
**Resolve:** PENDENCIA DE PRODUTO do R6-11 ("o que e' score de um agente?")
**Destrava:** CTXTEAMROSTER01, CTXMODELCOMP01, PENEIRA funcional, curadoria 13.x

## Decisoes do Bini (norte da metodologia)
1. "Bom" = COMBINACAO PONDERADA de 3 dimensoes (nao uma so).
2. Juiz = HIBRIDO: sinais automaticos sempre + humano por amostragem.
3. Separar PROMPT ruim de MODELO fraco = SIM, mas em fase posterior (PENEIRA).

## Formula proposta -- AgentScore por (agente x papel)
Score = 0.40*contribuicao + 0.35*qualidade + 0.25*eficiencia

  contribuicao (0-1): o bloco final da run onde o agente atuou foi
    EXECUTADO e APROVADO pelo humano? (block_executed do S2 + 👍 do
    CTXFEEDBACK01). Merito compartilhado pela esteira -- mede se o time
    entregou, nao o agente isolado.
  qualidade (0-1): sinais automaticos por etapa --
    - nao gerou AGENT_ERROR (400/timeout/crash)  -> penaliza memorialista atual
    - guardian nao vetou a saida dele
    - (amostragem humana: 👍/👎 por card, quando presente, SOBRESCREVE o auto)
  eficiencia (0-1): custo+latencia normalizados contra teto do papel
    (papeis caros como REVISOR/Opus tem teto proprio -- nao punir por ser Opus).

## FASE 1 (agora, barata) -- coletar os sinais que JA existem
- block_executed + execucoes_count (S2, pronto)
- AGENT_ERROR count por agente (ja gravado em mas_event phase='error')
- guardian veto por agente (tabela vetoes, ja existe)
- custo/latencia por agente (mas_event, ja gravado)
- Persistir: nova tabela agent_scores (agente, papel, janela, score, n_runs).
- Exibir no card (o ScoreMeter que hoje fica "sem dados" ganha fonte real).
CRITERIO FASE 1: ScoreMeter mostra numero real, nao placeholder.

## FASE 2 (depois) -- amostragem humana
- 👍/👎 por agente ja existe parcial (CTXFEEDBACK01) -- ligar ao AgentScore
  como override de qualidade quando presente.
CRITERIO FASE 2: feedback humano move o score do agente.

## FASE 3 (PENEIRA) -- separar PROMPT de MODELO
- Run de teste PADRONIZADA: mesmo goal fixo, todos os candidatos ao papel.
- Roda o MESMO prompt com modelos diferentes -> isola MODELO.
- Roda prompts diferentes no mesmo modelo -> isola PROMPT.
- Comparativo custo x qualidade -> decide: curar prompt OU trocar modelo OU
  promover reserva. Alimenta CTXTEAMROSTER01/CTXMODELCOMP01.
CRITERIO FASE 3: decisao de troca baseada em dado, nao em impressao.

## Anti-armadilhas (registradas p/ nao esquecer)
- NAO punir agente por ser o modelo caro do papel (teto de eficiencia por papel).
- NAO deixar o auto-score sozinho definir troca -- humano no loop (amostragem).
- contribuicao e' merito de TIME; nao penalizar o BATEDOR se o REVISOR falhou.
- score e' JANELA movel (ultimas N runs), nao vida inteira -- agente melhora
  apos curadoria e o score deve refletir isso rapido.
