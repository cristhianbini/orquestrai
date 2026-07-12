ID: L-COSTZERO01
PROJETO: orquestrai
TITULO: Provider pago roteado pelo caminho generico aparecia como FREE
CONTEXTO: R9-OAI1 - _callLLM_inner (mas/agents.mjs) devolvia cost_usd:0 fixo para todo provider nao-anthropic. Enquanto so free tiers (groq/cerebras) passavam ali, era verdade; ao rotear o auditor para openai (pago), a telemetria mentiria FREE e a CBini perderia a nocao de custo real.
REGRA: Rotear um agente para provider PAGO exige, na MESMA fatia, registrar o preco (EXT_PRICE em agents.mjs, USD/1M in+out) - troca de roteamento sem preco e mentira na telemetria.
COMO_APLICAR: Ao editar ROUTING com provider novo, conferir EXT_PRICE no mesmo arquivo; tokens do caminho generico sao estimados por chars/4, o custo herda essa estimativa.
TAGS: telemetria,custo,provider,openai,mesh
ORIGEM: R9-OAI1 (commit 7a77aff)
DATA: 2026-07-12
