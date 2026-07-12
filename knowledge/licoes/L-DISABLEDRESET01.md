ID: L-DISABLEDRESET01
PROJETO: orquestrai
TITULO: disabled=true no submit sem reset no caminho de SUCESSO = botao morto
CONTEXTO: R9-PJ1 - o wizard Novo Projeto setava $('proj-next').disabled=true ao submeter e so resetava nos caminhos de ERRO. Apos criar 1 projeto com sucesso, o 2o wizard da mesma sessao abria com o botao Criar morto ate recarregar a pagina. Bug invisivel em teste unico (so aparece na 2a criacao).
REGRA: Todo botao desabilitado no submit precisa de reset em TODOS os desfechos (sucesso incluido) - o lugar mais robusto e o proprio open() do fluxo, que cobre qualquer estado preso.
COMO_APLICAR: grep "disabled=true" no handler de submit e conferir se o open()/reset do fluxo zera; testar o fluxo DUAS vezes seguidas sem reload.
TAGS: ui,wizard,disabled,estado,teste-duplo
ORIGEM: R9-PJ1 (commit 6f6435f)
DATA: 2026-07-12
