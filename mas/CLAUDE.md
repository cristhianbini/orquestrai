# CLAUDE.md — mas/ (pipeline multi-agente)

Pipeline sequencial de 9 agentes ("MAS"). Ver `../CLAUDE.md` para regras gerais.

## Arquivos
- `agents.mjs` — orquestração, chamadas LLM, telemetria, guardian. Define agentes e ROUTING.
- `routes.mjs` — router `/api/mas` (auth própria via auth.mjs).
- `auth.mjs` — `authMiddleware` (Bearer) e `authMiddlewareSSE` (`?_t=` com **jwt.verify real**).
  É o padrão CORRETO de auth SSE do projeto — copie daqui.
- `kb.cjs` — acesso à KB (lições). `promote-lessons.mjs` — promoção L-PROP → KB.

## Os 9 agentes (ordem = execução) e ROUTING de modelo (agents.mjs ~L169)
scout→auditor→detetive→smith→guardian→memorialista→rel→metrico→revisor
- scout, guardian, memorialista, rel: `anthropic/claude-haiku-4-5`
- detetive, smith: `anthropic/claude-sonnet-4-5`
- auditor, metrico: `cerebras/gpt-oss-120b`
- revisor: `anthropic/claude-opus-4-8` (só ao final, dispensado se run não gerou BLOCO — CTXREVCOND01)
- memorialista foi trocado de zai-glm p/ haiku (CTXMEMHAIKU01: glm falhava com tokens_out=0).

## Armadilhas
- **DB_PATH real = `/app/data/blackboard.db`** (path do container). NÃO `/app/mas/` (nunca existiu — L-CTXDBPATH01).
- Editar = `docker restart orquestrai-api` (bind-mount `:ro`, L-B194). node --check antes.
- Guardian valida CÓDIGO (veto de execução); Memorialista valida CONHECIMENTO (lição). Papéis
  ortogonais: auto-promote de lição roda mesmo se Guardian vetar o comando (L-B243).
- Após write em WAL, leitor em conexão separada pode ver 0 rows — retry loop (L-B244).
