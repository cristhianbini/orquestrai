# CLAUDE.md — OrquestrAI (raiz)

> Índice de armadilhas e ponteiros para quem edita este sistema. **Não** é
> enciclopédia — cada regra aponta para a lição-fonte em `knowledge/licoes/`.
> Sistema em **produção real** na VPS. Leia antes de editar qualquer coisa.

## O que é
Cockpit multi-IA self-hosted da CBini. Ver `README.md` e
`knowledge/AUDITORIA/00-LEIA-PRIMEIRO.md`. Planejamento canônico:
`knowledge/metas/ROADMAP-FUTURO.md`. Governança: `knowledge/decisoes/PROTOCOLO-ANTICONTAMINACAO.md`.

## Arquitetura em 10 linhas
- **3 containers** (`docker-compose.yml`, rede `app-net`):
  - `orquestrai-proxy` — nginx público, **único com portas 80/443**.
  - `orquestrai-web` — nginx servindo `./src` como `:ro` (editar src/ = produção ao vivo).
  - `orquestrai-api` — Node/Express, porta interna 3000, `server.js` raiz montado `:ro`.
- **Fora do Docker (systemd)**: `oqterm` (PTY root, `/opt/oqterm/server.js`, :7654),
  `litestream` (backup contínuo SQLite), `roadmap-autosync` (auto-commita roadmap/changelog/licoes).
- **3 bancos SQLite** em `data/` — ver "Qual banco tem o quê" abaixo.

## Regras permanentes (a fonte é a lição citada)
- **Restart vs recreate**: editar arquivo bind-mount (server.js, mas/, api/, src/) →
  `docker restart <container>`. Mudar `.env` → `docker compose up -d --force-recreate <service>`
  (restart NÃO relê .env). L-INFRA01, L-B226. Nomes: `compose` usa SERVICE, `exec/inspect` usa CONTAINER (L-B227).
- **Path host vs container**: código que roda no container usa path do container
  (`/app/*`), não `/var/www/orquestrai`. L-B199, L-CTXDBPATH01.
- **Patch seguro**: `.bak` antes (L-B236) → editar via ARQUIVO (nunca `node -e` inline, L-BASHHIST01)
  → `node --check` (não em .html, L-SPOT05) → confirmar por **grep no arquivo**, não pela
  mensagem do terminal (L-FEEDBACK02). Ver skill `patch-seguro`.
- **Nunca ler VALORES de .env/segredos** — só NOMES de variáveis.
- **Protocolo LAVE**: nenhum comando roda na VPS sem aprovação humana (Ler/Avaliar/Verificar/Executar).

## Qual banco tem o quê (errar custa rodadas — L-DURATION01)
- `data/cluster.db` → tabela `execucoes` (hash-chain de auditoria LAVE). Usada por `api/blocosRoutes.cjs`.
- `data/blackboard.db` → `mas_run`, `mas_event` (telemetria do pipeline MAS). Usada por `mas/*`.
- `data/orquestrai.db` → `totp` (2FA). Usada por `server.js`.
- Consultar via `better-sqlite3` no node (o driver da app), NÃO `sqlite3` CLI (ausente no
  container, e path errado cria banco vazio silencioso — L-CTXDBPATH01). Ver skill `mapa-bancos`.

## Armadilhas estruturais
- **`oqterm` vive fora do projeto** (`/opt/oqterm/`, systemd, não Docker). grep no repo não acha (L-INFRA02).
- **Dois portões de execução ao root** coexistem (execBloco auditado vs oq71z-exec/b94 raw PTY).
  A auditoria hash-chain é contornável pelo caminho do dia a dia. Unificação = CTXEXEC01 (ROADMAP-FUTURO/ESTRUTURA).
- **`roadmap-autosync` vigia `knowledge/roadmap.md`** (hoje um redirect) — NÃO deletar esse
  arquivo ou o watcher entra em crash-loop e para o auto-sync de changelog/licoes.
- **Nome enganoso ≠ código morto**: ler o corpo, não o nome, antes de remover (R6-13.5.3).

## Segurança — estado (2026-07-11)
- Corrigido: S1 (`/api/blocos/:id/stream` agora faz jwt.verify real), S2 (JWT_SECRET fatal).
- Conhecido/pendente: S3 (rate-limit global isenta rotas quentes), S4 (poucas rotas sem auth).
  Ver diagnóstico no plano do Sprint 0.

## Estrutura de diretórios (cada um tem seu CLAUDE.md)
`api/` `mas/` `src/` `frontend-vite/` `nginx/` `knowledge/` — leia o CLAUDE.md do diretório
antes de editar dentro dele.

## GATES — mesmo com allow-list de edição liberada, PARE e peça confirmação explícita antes de:
1. Qualquer mudança visual/CSS/UX perceptível — screenshot antes do commit.
2. Decisão que afeta múltiplos módulos/arquitetura.
3. Qualquer coisa tocando produção real ou dados reais (DB, .env, container em uso real).
4. Falha que você não entende de primeira — pare e explique, não tente 3 abordagens diferentes sozinho.
5. Qualquer edição em unit do systemd (`*.service`, `*.socket`, `*.timer` em `/etc/systemd/system/` ou equivalente)
   SEMPRE pausa pra confirmação explícita — mesmo que a causa raiz de um bug esteja lá, e independente da
   allow-list de Edit/Write já liberada em `api/`, `services/project-supervisor/`, `lib/`. Essas pastas cobrem
   código da aplicação; a unit systemd é infraestrutura de produção e fica de fora dessa autonomia.

Fora desses casos, prossiga sem pausar pra aprovação mecânica.
