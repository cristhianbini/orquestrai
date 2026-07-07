ID: L-B70-mutationobserver-loop
PROJETO: orquestrai
TITULO: MutationObserver em document.body com subtree gera loop infinito
CONTEXTO: B70 travou dashboard inteiro porque callback do MO mutava o proprio DOM observado.
REGRA: Antes de qualquer mutacao dentro de callback de MutationObserver: (a) ter idempotencia forte (marca data-* aplicado), (b) disconnect/reconnect, ou (c) escopo narrow (nao document.body).
COMO_APLICAR: Sempre marcar nodes ja processados com data-applied; verificar marca ANTES de mutar; nunca usar subtree:true em body sem guarda.
TAGS: dom,observer,loop,dashboard
ORIGEM: seed-historico-B248
DATA: 2026-06-27
