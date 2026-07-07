# L-WATCHER01 — Watcher de auto-sync precisa cobrir close_write E moved_to
PROJETO: orquestrai

**Data:** 2026-07-02
**Contexto:** automacao de sincronizacao do roadmap.md com Git

## Erro (v1 e v2)
v1: vigiava os ARQUIVOS diretamente (inotifywait em cima do roadmap.md) --
sed -i troca o arquivo via rename, invalidando o inode vigiado, matando
o processo (systemd reiniciava, mas perdia o evento no meio).
v2: corrigiu vigiando o DIRETORIO (sobrevive ao rename), mas so escutava
o evento close_write -- que so dispara em escrita DIRETA (ex: Python
open().write()). sed -i usa temp+rename, que gera moved_to, nao
close_write -- o watcher ficava vivo mas nunca via a mudanca.

## Correcao (v3)
inotifywait -e close_write,moved_to no DIRETORIO -- cobre os 2 padroes
de escrita (direta e atomica via temp+rename). Testado 2x seguidas com
sed -i real, commit automatico confirmado em ~4s nas duas vezes.

## Regra permanente
Watcher de arquivo sempre precisa cobrir close_write E moved_to juntos,
nunca so um. Validar com o comando que REALMENTE sera usado no dia a dia
(sed -i, nao so Python), nao so o mais conveniente de testar.
