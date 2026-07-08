# META — Loop de aprendizado da KB / curadoria ativa (CTXKBLOOP01)
PROJETO: orquestrai
**Status:** DESENHO 2026-07-07 (Bini+Fable) -- rodada dedicada futura
**Depende de:** CTXAGENTSCORE01 FASE 1 (score revela quem/o que curar)

## Esclarecimento conceitual (importante -- Bini perguntou)
Os agentes NAO sao fine-tuned. Sao modelos genericos (haiku/sonnet/opus) que
recebem a KB no prompt a cada run (RAG). "Treinar" aqui = CURAR as licoes que
o loadKB injeta -- NAO ajustar pesos. Logo:
- O que o Opus 4.x "sabe" de fabrica = conhecimento geral (nunca muda, cutoff).
- O que a KB adiciona = conhecimento ESPECIFICO do OrquestrAI (paths, bugs
  recorrentes, regras do projeto) que NENHUM modelo tem de fabrica.
- A KB E' o treinamento continuo, e ja esta ativa. Falta CURADORIA SISTEMATICA.

## O loop de aprendizado (fechar o ciclo)
1. Agente age -> mas_event registra sucesso/erro (ja acontece).
2. Memorialista PROPOE licao (kb/pending -- ja existe).
3. [GAP] Humano valida qualidade da licao proposta (kb/approve|reject existe
   mas nao ha rotina). -> curadoria de ENTRADA.
4. [GAP] AgentScore aponta agente/erro recorrente -> CRIAR licao dirigida ao
   padrao do erro -> reduz erro na proxima run -> sobe score. -> curadoria
   DIRIGIDA POR DADO (o loop que fecha).

## Rodada de curadoria proposta (quando executar)
- Passo A: revisar kb/pending em lote (aprovar boas, rejeitar ruido).
- Passo B: p/ cada agente com score baixo em 'convergencia', olhar os erros
  recorrentes (mas_event phase='error') e escrever 1 licao que ensine a evitar.
  Ex: memorialista (14 erros, todos de contexto) -> licao ja resolvida via
  CTXMEMKB01, mas registrar a REGRA na KB p/ outros agentes free-tier.
- Passo C: medir -- rodar N runs, ver se o score de convergencia sobe.

## Anti-armadilha
- KB curada por dado NAO vira despejo de logs (o CTXKBCLEAN01 ja limpou 139
  BLOCO-*). Licao boa = REGRA generalizavel, nao registro de 1 incidente.
- Nao inflar a KB: cada licao nova disputa espaco no prompt (limite de contexto,
  ver CTXMEMKB01). Curadoria e' tanto ADICIONAR boas quanto PODAR obsoletas.
