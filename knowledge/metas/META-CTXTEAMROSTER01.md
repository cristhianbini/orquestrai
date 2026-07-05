# META-CTXTEAMROSTER01 — Escalacao deliberada do time (qualidade da KB, nao so custo)

**Registrado:** 2026-07-05 (Chat6)
**Prioridade:** MEDIA-ALTA — nao e bug, mas define a qualidade de tudo que o MAS produz
**Relacionada:** CTXMODELCOMP01 (BLOCO G, ainda so titulo) -- esta Meta EXPANDE
aquela com o criterio que faltava; nao duplica.

## Analogia-guia (do Cris)
Escalar o time e como Copa do Mundo: precisamos dos melhores jogadores nas
melhores posicoes -- nao so o mais barato, e nao so o "melhor" generico, mas
o melhor PRA AQUELA FUNCAO especifica.

## Problema
ROUTING em mas/agents.mjs foi montado ad-hoc (haiku/cerebras/opus por posicao)
sem criterio documentado. Falta pensar 3 eixos JUNTOS, nao isolados:
1. Custo (USD por run)
2. Qualidade da resposta do proprio agente
3. Qualidade do que alimenta a KB (memorialista gera as licoes que TODO
   agente futuro recebe via loadKB -- um agente fraco aqui degrada o
   sistema inteiro de forma composta e invisivel)

## Achado do dia que motiva isso (evidencia real, nao teorico)
memorialista (cerebras/zai-glm-4.7) estourou janela de contexto 2x nesta
sessao (9282 e 9035 tokens vs limite ~8192) -- FALHOU SILENCIOSAMENTE (o
pipeline sobrevive via try/catch, run parece OK, mas a licao nao foi
gerada). "Barato" custou qualidade de KB sem ninguem perceber ate hoje.
Ver knowledge/licoes/L-CTXDBPATH01.md (achado colateral).

## Proposta
Levantamento estruturado por posicao (scout/auditor/detetive/smith/guardian/
memorialista/rel/metrico/revisor), 2-3 candidatos cada, comparando:
- custo por run
- qualidade da saida (teste A/B, mesma missao)
- adequacao a FUNCAO especifica (memorialista precisa janela grande + sintese;
  revisor precisa raciocinio denso; scout pode ser rapido/barato)

## Depende de / conecta com
- Teste A/B do REVISOR ja cogitado (Opus vs GLM vs MiniMax) -- primeiro caso
  de uso deste framework.
- CTXAGTUNIFY01 (fonte unica do agente) -- uma vez unificado, trocar modelo
  de uma posicao vira operacao simples e testavel via o proprio card.

## Cuidado (LAVE+F)
Isto e planejamento, nao codigo. Fracionar por POSICAO -- nunca trocar o
time inteiro de uma vez. Um agente testado e aprovado por vez, comparando
com o baseline atual antes de promover a producao.

TAGS: modelos,custo,qualidade,kb,escalacao,fundacao,chat6
