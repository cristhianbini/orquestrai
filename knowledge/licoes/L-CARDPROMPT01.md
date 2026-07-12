ID: L-CARDPROMPT01
PROJETO: orquestrai
TITULO: Prompt do sistema do AGENT_CARD sobrepoe o role do agents.mjs
CONTEXTO: R9-ELENCO01 - ao criar os titulares #10/#11, o role hardcoded no AGENTS de mas/agents.mjs parecia a fonte, mas loadAgentCardPrompt() le a secao "## Prompt do sistema" de knowledge/agents/AGENT_CARD-<slug>.md e ELA vence quando preenchida (CTXAGTUNIFY01).
REGRA: Ao criar ou alterar o papel de um agente da mesa, editar o AGENT_CARD (fonte real) e manter o role do agents.mjs como fallback identico - nunca so um dos dois.
COMO_APLICAR: grep "Prompt do sistema" knowledge/agents/AGENT_CARD-<slug>.md antes de assumir que o role do codigo esta valendo; placeholders "(...)" nao contam (Frac2e).
TAGS: mesh,agent-card,prompt,fonte-unica
ORIGEM: R9-ELENCO01 (commits 0769ff7 + 67b114e)
DATA: 2026-07-12
