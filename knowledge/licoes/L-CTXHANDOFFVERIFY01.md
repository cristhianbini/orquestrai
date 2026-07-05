# L-CTXHANDOFFVERIFY01 — Handoff herdado e HIPOTESE, nao verdade

**Data:** 2026-07-05
**Contexto:** Chat6 (continuidade Chat5->Chat6). Primeira tarefa: reconciliar
RODADA-6-PLANO.md a partir do handoff. O usuario barrou o assistente 2x
("verifique antes") e evitou 3 erros de propagacao.

## REGRA (front-loaded de proposito -- loadKB corta licao em 1500 chars)
Todo item de handoff marcado "resolvido/feito/ver licao" e uma HIPOTESE a
verificar contra git + filesystem + producao ANTES de ser copiado para
qualquer doc fonte-da-verdade (plano/roadmap/licao). NUNCA marcar [x] num
plano com base na palavra do handoff. Verificar =
  1. O artefato citado EXISTE? ("ver licao X" -> ela esta em knowledge/licoes/?)
  2. "Resolvido" significa O QUE? Causa corrigida != efeito confirmado.
     (Corrigir o truncamento da KB NAO satisfaz "confirmar absorcao por run".)
  3. Commitado != em producao. Processo sem watch (node server.js) so
     reflete .cjs/.mjs apos restart -> comparar data do commit com
     `docker inspect -f '{{.State.StartedAt}}'`.

## INCIDENTE (o que quase aconteceu)
Handoff afirmava "CTXKBABSORB01 resolvido -- ver licao". O assistente quase:
- marcou [x] no plano confiando na frase;
- escreveu "ver licao" apontando pra uma licao INEXISTENTE (grep por
  CTXKBABSORB01/CTXKBSHARE01 nas licoes = 0 matches);
- diagnosticou o bug lendo o ARQUIVO ERRADO.
Verificacao revelou: (a) a licao nunca foi escrita; (b) "[x] resolvido"
conflava causa (truncamento corrigido, commit 548cde8) com o pedido real do
item (confirmar absorcao por run), que segue PENDENTE; (c) o timing PROVOU
que o fix esta em producao (StartedAt 58s apos o commit) -- o usuario estava
certo no "ja consertado".

## MECANISMO TECNICO (repete a familia CTXR616GAP01)
grep casa SUBSTRING, nao semantica:
- `grep '400'` casou dentro de `max_tokens:1400` e num `.slice(0,400)` de
  msg de erro do guardian -- nenhum era o corte da KB.
- `grep -rl 'loadKB' | head -1` pegou agents.mjs (que so CHAMA) em vez de
  mas/kb.cjs (que DEFINE). `head -1` != "o arquivo certo".
REGRA: para achar onde algo e DEFINIDO, buscar o padrao de definicao
(`function X`, `X =`, `exports.*X`), nunca qualquer mencao. Confirmar o
efeito real com `git show <commit>`, nunca inferir do assunto do commit.

## COMO APLICAR NO PROXIMO HANDOFF
Ao herdar um handoff em chat novo, antes de tocar em doc fonte-da-verdade:
- tratar cada "feito/resolvido" como [a verificar];
- so promover a [x] apos evidencia concreta (git show / arquivo existe / run);
- se o handoff cita um artefato, ABRIR o artefato antes de referencia-lo.

## RECOMENDACAO DE PROCESSO (gerador de handoff)
O handoff deve marcar cada claim como VERIFICADO ou ALEGADO. Claim
"resolvido" sem commit/licao/run apontavel e ALEGADO por definicao. Isso
transfere o custo de verificacao pra quem TEM o contexto (fim do chat),
em vez de deixar pro proximo chat redescobrir do zero.

TAGS: handoff,verificacao,grep,kb,processo,chat-continuidade
ORIGEM: Chat6-2026-07-05
