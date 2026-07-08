---
PROJETO: orquestrai
APROVADA: 2026-07-08 (curadoria humana, propostas do MEMORIALISTA)
---
# L-PROP-find-dual-type

_Proposta por Memorialista, pre-aprovada por Guardian em 2026-07-03T14:45:25.573Z. Aguardando revisao humana._

ID: L-PROP-find-dual-type
TITULO: Auditoria visual completa exige find -type f E -type d
CONTEXTO: Listar apenas diretorios com 'tree -d' ou 'find -type d' omite arquivos criticos como .env, .js ou chaves de crypto durante auditorias de seguranca.
REGRA: Sempre usar parênteses e o operador -o no find para capturar ambos os tipos: find \( -type f -o -type d \). Adicionar exclusoes para node_modules.
EVIDENCIA: BLOCO-172 (Melhoria solicitada pelo usuário para incluir arquivos na listagem)
