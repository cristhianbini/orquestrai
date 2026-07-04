# 🏗️ Arquitetura

## Visão geral dos serviços

| Serviço | Papel | Porta | Onde roda |
|---|---|---|---|
| `orquestrai-api` | API Node.js/Express | 3000 | Docker |
| `orquestrai-proxy` | nginx (reverse proxy / TLS) | 80/443 | Docker |
| `orquestrai-web` | Container do frontend estático | — | Docker |
| `oqterm` | PTY host (terminal interativo) | 7654 | **root, FORA do Docker** |
| `frontend-vite` | Build das ilhas React | — | build-time |

> ⚠️ **Ponto de atenção de segurança:** o `oqterm` roda como **root fora do
> Docker**. É o único componente com esse nível de privilégio. Ver `02-SEGURANCA`
> para as mitigações (R6-15: confirmação humana antes de executar).

---

## Bind-mount de `src/` — convém entender bem

O diretório `src/` é **bind-mount direto** dentro do container web. Consequência:

- Editar `src/dashboard.html` é **live em produção imediatamente** — sem build,
  sem restart de container.
- Isso é conveniência **e** risco: uma edição malfeita está no ar no mesmo
  instante. Por isso o gate `Ctrl+Shift+R` (verificação visual no browser) é
  **obrigatório antes de qualquer commit**.

---

## Persistência

- **`blackboard.db`** (SQLite) — eventos do MAS (o quadro-negro compartilhado).
- **`cluster.db`** (SQLite) — execuções.
- **Litestream** — backup contínuo do SQLite (replicação streaming).

---

## Os DOIS sistemas de card (fonte histórica de confusão)

Este é o gotcha arquitetural mais importante para quem for mexer no frontend:

1. **Sistema legado** (dentro do `dashboard.html` monolítico): contém
   *containers-fantasma* como `#agentes`, `#masx-cards` que têm
   **`display:none` permanente**. Parecem ativos no HTML, mas **não renderizam
   nada** ao usuário.

2. **Sistema React (ilhas)**: o painel realmente visível é o
   `#oq-agent-panel-island`, servido a partir de `frontend-vite/src/` e buildado
   para `frontend-vite/dist-island/agent-panel-island.js` via
   `scripts/build-island.sh` (com verificação de hash sha256).

> **Regra:** ao debugar o painel de agentes, o alvo real é
> `#oq-agent-panel-island` (React), **não** `#agentes` (legado, oculto).
> Confundir os dois já causou múltiplos desvios de diagnóstico.

---

## Fluxo SSE (Server-Sent Events) — eventos ao vivo do MAS

O painel React consome eventos de execução via SSE:

- Endpoint: `/api/mas/events/<run_id>`
- Como SSE **não pode enviar header `Authorization`**, a autenticação usa
  **query param**: `?_t=<token>` com o middleware dedicado `authMiddlewareSSE`.
- O `run_id` corrente é obtido de `/api/mas/last` com **polling de 2s**
  (correção do bug de run_id estagnado — antes buscava só uma vez no mount).

Detalhe de build: as ilhas são minificadas; ao inspecionar
`dist-island/*.js` espere nomes de variáveis ofuscados. O comportamento é o que
importa, não os nomes.
