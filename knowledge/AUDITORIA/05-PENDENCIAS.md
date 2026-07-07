# 📌 Pendências conhecidas (catálogo)

> Listadas para que o auditor **não perca tempo "descobrindo" o que já
> sabemos**. Cada item tem um código de registro rastreável.

| Código | Descrição | Frente |
|---|---|---|
| `CTXEXEC01` | Unificar caminhos de execução (`execBloco` protegido vs. `oqterm` interativo) | segurança/arquitetura |
| `CTXEXECMODAL01` | Substituir `confirm()` nativo por modal customizado nas confirmações de execução | UX/segurança |
| `R6-14` | Remover `MutationObserver` pesado sobre `document.body` | performance |
| `CTXMASRUNID01` | Empurrar run_ids corretamente pelo pipeline (hoje: polling de 2s como paliativo) | arquitetura |
| `CTXDEBUGFLAG01` | Wrapper `DEBUG && log(...)` com flag única (em vez de remover logs linha a linha) | manutenção |
| `CTXDEBUGFLAG01`→ | Alternativa a avaliar: logger com níveis (info/warn/error/debug) | manutenção |

## Detalhamentos

### `execucoes.mas_run_id` nunca populado
Todos os registros da tabela de execuções têm `mas_run_id = null`. Isso
**bloqueia o cálculo completo do Harness Score**. Elo faltante no pipeline:
o run_id não é injetado no momento da persistência da execução.

### Containers-fantasma no legado
`#agentes`, `#masx-cards` e afins permanecem no `dashboard.html` com
`display:none`. São dívida de limpeza pendente da migração strangler fig.
Decisão em aberto (ver `03-DESAFIOS`, pergunta 6): remover agora ou depois.

---

## Follow-ups adicionais mencionados em sessões anteriores

Alguns códigos citados em lições anteriores (`CTXUNIFY01-B`, `CTXDEPLOY01`,
`CTXBUILD1206`) devem ser reconciliados com este catálogo conforme forem
retomados. Registrados aqui para não se perderem; detalhamento em
`knowledge/licoes/` quando aplicável.
