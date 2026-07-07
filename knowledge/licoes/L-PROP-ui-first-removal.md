# L-PROP-ui-first-removal
PROJETO: orquestrai

_Auto-promovida por Guardian em 2026-06-29T05:11:34.283Z_

ID: L-PROP-ui-first-removal
TITULO: Desativar UI antes de lógica backend na remoção de features
CONTEXTO: Solicitação para remover ou desabilitar funcionalidades complexas (ex: tradução) onde frontend e backend são acoplados.
REGRA: Priorizar a ocultação ou remoção do elemento visual no frontend antes de alterar rotas, middlewares ou controllers no backend. Isso garante que novos erros 404/500 não sejam expostos ao usuário durante a transição de desativação.
EVIDENCIA: OBJETIVO "Oculte o botão ou link de tradução PT-BR... não ative a lógica de tradução do backend nesta etapa"
