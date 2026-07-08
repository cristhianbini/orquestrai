---
PROJETO: orquestrai
APROVADA: 2026-07-08 (curadoria humana)
---
# L-PROP-nome-sistema-nao-precisa-bloco

_Proposta por Memorialista, pre-aprovada por Guardian em 2026-07-08T19:43:13.276Z. Aguardando revisao humana._

ID: L-PROP-nome-sistema-nao-precisa-bloco
TITULO: Nome do sistema confirmado pelo manifesto e estrutura VPS — questão sem ambiguidade nao requer BLOCO LAVE
CONTEXTO: Quando a pergunta aponta para um fato estrutural (nome, dominio, path raiz) ja explicitado no manifesto ou na KB, a investigacao pode ser respondida diretamente sem gerar bloco bash. Exemplo: "qual o nome do sistema" = resposta textual + validacao de fontes (package.json e docker-compose sao confirmatorias, nao descoberta).
REGRA: Antes de gerar BLOCO, verificar se a resposta ja existe no manifesto (linhas iniciais, contexto obrigatorio, index da KB). Se existe, responda diretamente e declare ao Detetive que a questao e estrutural. Blocos sao para descoberta, verificacao de estado em tempo real, ou auditoria de conformidade — nao para fatos ja consolidados. Economiza tokens, tempo de execucao e evita bloco desnecessario aprovado mas nao relevante.
EVIDENCIA: run atual — Scout/Detetive responderam a questao sem precisar executar o BLOCO-64-nome-sistema (que foi gerado e aprovado, mas nao precisava ser). Custo evitavel: ~4000 tokens (smith + guardian + relator sintetizando saida do bloco).
