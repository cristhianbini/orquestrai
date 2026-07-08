---
PROJETO: orquestrai
APROVADA: 2026-07-08 (curadoria humana, propostas do MEMORIALISTA)
---
# L-PROP-find-count-dirs

_Proposta por Memorialista, pre-aprovada por Guardian em 2026-07-04T21:38:13.722Z. Aguardando revisao humana._

ID: L-PROP-find-count-dirs
TITULO: Contagem de Diretórios Recursiva com Exclusão de Lixo
CONTEXTO: Auditar estrutura de pastas (`find /var/www/orquestrai`) sem contar dependências (`node_modules`) ou versionamento (.git), que inflacionam os números.
REGRA: Use `find BASE -type d \( -name node_modules -o -name .git \) -prune -o -type d -print | wc -l` para contagem limpa. Adicione `-mindepth 1` se quiser excluir o próprio diretório raiz da contagem.
EVIDENCIA: BLOCO-178
