# L-KBCURATOR01 — Fila humana adicionada ao pipeline de auto-promocao de licoes

**Data:** 2026-07-01
**Contexto:** CTXKBCURATOR01

## Achado
promote-lessons.mjs (ja existia) escrevia direto em knowledge/licoes/
apos aprovacao do Guardian via regex de palavras-chave -- ZERO revisao
humana antes de uma licao proposta virar parte da KB que alimenta todo
agente futuro (loadKB() em agents.mjs injeta as licoes em todo prompt).

## O que foi feito
promoteFromRun() agora enfileira em knowledge/_pending/ em vez de gravar
direto. 3 endpoints novos em /api/mas/kb/*: pending (listar), approve
(lote), reject (lote, com motivo). Auditoria (_audit/promocoes.jsonl)
registra queued/approved/rejected com timestamp e responsavel.

## Fluxo de uso (semanal)
1. GET /api/mas/kb/pending -- ver o que se acumulou na semana
2. POST /api/mas/kb/approve {ids:[...]} -- aprova em lote os bons
3. POST /api/mas/kb/reject {ids:[...], reason:'...'} -- descarta o resto

## Pendente para o futuro (nao fechado agora)
Interface visual pra essa revisao (hoje e via curl/API direta) --
natural encaixar no CTXVITE02 quando o dashboard React crescer.
