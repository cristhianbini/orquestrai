# L-RATELIM01 — Rate limit global pode ter excecoes que anulam a protecao

**Data:** 2026-07-01
**Contexto:** CTXRATELIM01

## Achado
Limiter global (B49L) tinha regra skip isentando /api/mas, /api/blocos,
/api/oqterm, /api/term, /api/cluster, /api/memory de QUALQUER limite --
provavelmente pra resolver falso-positivo de polling do dashboard, mas
acabou isentando os endpoints mais sensiveis do sistema.

## Regra permanente
Ao herdar/revisar um rate limiter existente, sempre ler a regra 'skip'
inteira antes de assumir que ele protege o que parece proteger. Uma
excecao ampla pode anular a protecao exatamente onde ela mais importa.
