# L-WATCHERRACE01 — auto-sync de licoes/ ganha a corrida do commit manual; historico fica enganoso
PROJETO: orquestrai

**Data:** 2026-07-11 (fechamento do B6, Rodada 7). Irmao do L-WATCHER01.

## Sintoma (como reconhecer)
Commit manual "docs(...)" nao lista arquivos que voce acabou de criar em
knowledge/licoes/ — eles ja entraram 30-60s antes em commits "auto-sync
knowledge" (caso real: b024261/049b91a/4f484ca engoliram as 3 licoes da
Fase B; o commit manual 7c08733 so levou os deltas restantes). Nada se
perde de CONTEUDO; o que quebra e a RASTREABILIDADE — o log atribui o
trabalho a mensagem generica.

## Causa raiz
roadmap-autosync.service (/opt/roadmap-autosync/watch.sh v4) vigia
knowledge/licoes/ + roadmap.md + changelog.md (NAO vigia metas/ nem
INDEX.md). A cada write de .md vigiado: sleep 3 -> git add dos paths
vigiados -> commit generico -> push. Quem commita POR ULTIMO leva a
autoria visivel no log; quem escreve em licoes/ e demora >3s para
commitar perde a corrida. AGRAVANTE: o `git commit` do watcher e SEM
paths — leva junto QUALQUER arquivo staged no momento, mesmo fora do
escopo vigiado (no B6 escapamos por timing, nao por design).

## Mitigacao
1. APLICAR SEMPRE: commit manual IMEDIATAMENTE apos o ultimo write em
   licoes/ — ideal no MESMO comando (cp/write + add + commit em <3s).
2. EM ABERTO (so registrado, decisao CBini futura): watcher pular
   quando houver staged changes, e/ou commitar com paths explicitos
   (`git commit -- <paths>`).
