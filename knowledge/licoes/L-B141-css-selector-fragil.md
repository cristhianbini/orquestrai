ID: L-B141-css-selector-fragil
TITULO: Selector CSS errado quebra MutationObserver inteiro
CONTEXTO: B141 tentou hookar .agent-card mas DOM real era .masx-card[data-ag], silenciosamente nao casou.
REGRA: Antes de escrever selector, INSPECIONAR DOM real (querySelectorAll no console) e validar count>0.
COMO_APLICAR: Sempre logar quantos nodes casaram no primeiro tick. Se 0, abortar com erro alto, nao silenciar.
TAGS: dom,selector,debug
ORIGEM: seed-historico-B248
DATA: 2026-06-27
