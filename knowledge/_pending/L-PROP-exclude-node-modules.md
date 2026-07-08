# L-PROP-exclude-node-modules

_Proposta por Memorialista, pre-aprovada por Guardian em 2026-07-03T20:27:39.410Z. Aguardando revisao humana._

ID: L-PROP-exclude-node-modules
TITULO: Auditoria de disco deve excluir node_modules
CONTEXTO: Ao rodar `du` ou `find` para encontrar consumo de espaço ou arquivos grandes em projetos Node/JS.
REGRA: Use sempre filtros de exclusão como `-not -path "*/node_modules/*"` (e também .git, .next, dist) para evitar processamento de milhares de arquivos irrelevantes e travamentos.
EVIDENCIA: BLOCO-175 (Script de listagem de maiores arquivos)
