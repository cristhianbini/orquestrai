# META — Esteira ideal, escalacao 1-11 e PENEIRA (CTXESTEIRA01)
PROJETO: orquestrai
**Status:** backlog -- registrada 2026-07-07 durante S4 (curadoria)
**Origem:** proposta do Bini (analogia futebol: titular/reserva/peneira)

## Escalacao titular proposta (ordem da esteira)
1 BATEDOR (reconhecimento) -> 2 AUDITOR (anomalias) -> 3 DETETIVE (KB/correlacao)
-> 4 ARQUITETO (constroi) -> 5 GUARDIAO (veta) -> 6 MEMORIALISTA (registra)
-> 7 RELATOR (sintetiza) -> 8 METRICO (custo/latencia) -> 9 REVISOR (qualidade final)
-> 10 DOCUMENTADOR (documenta o ciclo) -> 11 [vago -- candidato: INTEGRADOR ou CRITICO]

## Decisao sobre CRITICO pos-REVISOR (analise adversarial)
REVISOR (Opus) JA cumpre papel de critico final -- CRITICO depois = duplicidade
e custo. Alternativas melhores: (a) CRITICO ANTES do ARQUITETO em demandas de
codigo (critica a abordagem, nao o produto); (b) pipeline ADAPTATIVO (Q10 do
parecer v2): CRITICO convocado so quando a demanda pede. Decidir junto com
CTXPIPELINE01.

## PENEIRA (novo tier abaixo da reserva)
Funil de scouting: modelos/agentes candidatos avaliados em runs de teste
ANTES de entrar na reserva. E o mecanismo de entrada do CTXTEAMROSTER01 +
CTXMODELCOMP01 (S7): peneira gera dados comparativos -> promocao por merito.
Implementar quando S7 chegar; UI = 3o bloco no agtPane.

## Escalacao da RESERVA (R1-R15, por proximidade da esteira)
Ordenados por "quem entra primeiro se um titular cair" (cobertura tatica):
R1 CRITICO (cobre REVISOR) | R2 VALIDADOR (GUARDIAO) | R3 ANALISTA (METRICO)
R4 PESQUISADOR (DETETIVE) | R5 DOCUMENTADOR (MEMORIALISTA/RELATOR)
R6 SINTETIZADOR (RELATOR) | R7 CONSULTOR (ARQUITETO) | R8 PLANEJADOR
R9 OTIMIZADOR | R10 MONITOR | R11 INTEGRADOR | R12 DESIGNER
R13 TREINADOR | R14 DESCOBRIDOR | R15 TRADUTOR
Especialistas sem cobertura direta no fim da fila.

## UI da PENEIRA (proxima sessao, fracao 1)
Secao visual abaixo da RESERVA no agtPane: titulo + placeholder vazio +
numeracao R1-R15 visivel nos cards da reserva. SO apresentacao (~15 linhas
HTML/CSS); logica de promocao/avaliacao vem no S7 (CTXTEAMROSTER01) --
nao construir logica nova no painel legado (strangler fig).

## Pre-requisito de qualidade
Slot #10 atual (llama-3.2-3b free) entrou sem peneira -- avaliar em 1 run
dedicada antes de considerar titular real.
