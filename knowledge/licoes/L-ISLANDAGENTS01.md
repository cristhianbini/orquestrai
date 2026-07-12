ID: L-ISLANDAGENTS01
PROJETO: orquestrai
TITULO: A coluna "AGENTES MESH NETWORK" e ilha React com array de agentes HARDCODED
CONTEXTO: R9 - ao adicionar ESTRATEGISTA(#10)/TESTADOR(#11), eles nao apareceram na coluna lateral. A lista visivel NAO e o #agentes do paintAg (esta display:none, legado): e a ilha React #oq-agent-panel-island (src/island/agent-panel-island.js, bundle minificado) com um array `const B=[...]` de agentes fixo. E a 5a lista paralela de agentes do sistema (AGENTS/ROUTING/MODEL_BY_AGENT em agents.mjs, AGS em dashboard, cards em knowledge/agents/, e este B).
REGRA: Adicionar/remover agente da mesa exige tocar TODAS as fontes paralelas ate a unificacao (CTXAGTUNIFY01): agents.mjs (AGENTS+ROUTING+MODEL_BY_AGENT+EXT_PRICE se pago), AGENT_CARD-<slug>.md, AGS no dashboard, e o array B da ilha React. Unificar a ilha p/ ler /api/agents/cards e candidato de roadmap.
COMO_APLICAR: grep -rl "BATEDOR\|scout.*nome" src/ knowledge/ mas/ ao mexer no elenco; a ilha e minificada, editar o literal do array B direto. Ver [[orquestrai-rodada-9]] e L-CARDPROMPT01.
TAGS: elenco,ilha-react,fonte-unica,agentes,ctxagtunify
ORIGEM: R9 (commit 09835b2)
DATA: 2026-07-12
