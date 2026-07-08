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
Score = 0.35*contribuicao + 0.30*qualidade + 0.20*eficiencia + 0.15*convergencia
  (rebalanceado 2026-07-07: 4a dimensao 'convergencia' adicionada a pedido do
   Bini -- persistencia do erro distingue 2 agentes que parecem iguais no resto)

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
STATUS FASE 1 (2026-07-07): endpoint /api/mas/agent-scores FUNCIONANDO e
validado com dado real (ranking coerente: perfeitos no topo, memorialista no
fundo por 7 erros, REVISOR nao punido por ser Opus). FALTA: ligar ao
ScoreMeter dos cards (hoje 'sem dados'). Aprendizados:
- contribuicao fica imatura ate mas_run_id acumular historico (so 2 runs
  vinculadas hoje) -- dimensao ganha sinal com o uso, endpoint avisa.
- eficiencia cross-papel foi ABANDONADA na FASE 1 (puniria Opus); comparacao
  de custo so intra-papel na FASE 3 (PENEIRA).

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

## Dimensao CONVERGENCIA (0-1) -- persistencia do erro (decidido por Fable a pedido do Bini)
Mede se o agente RESOLVE ou fica preso repetindo. Dimensao PROPRIA (nao
enterrada em qualidade) porque distingue agentes que parecem iguais no resto
e e' sinal forte p/ troca de modelo. 3 sabores, FASEADOS:

  SABOR 1 -- retry intra-run (FASE 1, barato, dado JA existe):
    quantas tentativas o agente fez DENTRO da run ate 'done'. mas_event ja
    grava cada tentativa (ex: memorialista 400->fallback->sucesso = 2 retries).
    convergencia = 1.0 se acertou de primeira; decai ~0.2 por retry.

  SABOR 2 -- reincidencia inter-run (FASE 2/3, precisa agrupar erros):
    o MESMO tipo de erro reaparece em runs diferentes apesar da KB registrar
    a licao. E o sinal MAIS FORTE p/ troca de modelo: o modelo nao aprende do
    contexto. Precisa de assinatura/hash do erro p/ agrupar. Ex: Smith erra
    schema cluster.db (created_at) repetidamente -> candidato a troca.

  SABOR 3 -- loop com humano (FASE 2):
    blocos consecutivos do mesmo agente SEM execucao/aprovacao = "nao marcou
    gol" (ideia do Bini, Rodada 5). Sinal: sequencia de blocos rejeitados.

## Anti-armadilhas (registradas p/ nao esquecer)
- NAO punir agente por ser o modelo caro do papel (teto de eficiencia por papel).
- NAO deixar o auto-score sozinho definir troca -- humano no loop (amostragem).
- contribuicao e' merito de TIME; nao penalizar o BATEDOR se o REVISOR falhou.
- convergencia: retry por CAUSA EXTERNA (rate limit 429, provider fora) NAO
  e' culpa do agente -- distinguir de retry por erro proprio (400 de contexto,
  bug no bash gerado). So o segundo penaliza.
- score e' JANELA movel (ultimas N runs), nao vida inteira -- agente melhora
  apos curadoria e o score deve refletir isso rapido.
