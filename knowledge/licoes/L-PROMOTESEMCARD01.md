ID: L-PROMOTESEMCARD01
PROJETO: orquestrai
TITULO: Botao 'usar' promovia reserva a titular SEM criar AGENT_CARD -- titular fantasma
CONTEXTO: S4 (2026-07-07). UI mostrava 11/11 titulares mas so 9 cards existiam; DOCUMENTADOR e #10 (llama-3b) eram fantasmas: posicao em agent_positions, zero card, zero prompt, zero participacao em runs. Classe do bug: promocao grava POSICAO mas nao MATERIALIZA o recurso (mesmo padrao do CTXAGTCARDMERGE01: endpoint que nao trata o recurso completo).
REGRA: Toda promocao reserva->titular DEVE criar/verificar o AGENT_CARD no mesmo ato. UI que mostra N titulares deve derivar N dos CARDS (fonte unica), nao de tabela de posicoes solta.
COMO_APLICAR: Validar consistencia com: ls knowledge/agents/AGENT_CARD-*.md | wc -l vs contagem da UI. Entrada de titular novo passa pela PENEIRA (META-CTXESTEIRA01) -- avaliacao antes da promocao.
TAGS: agentes,promocao,card,fonte-unica,ui
DATA: 2026-07-07
