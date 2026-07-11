PROJETO: orquestrai
TIPO: plano-de-sprint
CRIADO: 2026-07-11
STATUS: APROVADO pela CBini em 2026-07-11 — B0 concluido, B1 em andamento
CONECTA: ROADMAP-FUTURO.md item #2 (Import GitHub + container isolado),
         VISAO-IMPORT-MIGRACAO-INFRA.md, Fase A0/A2 (services/project-runner/)

# RODADA 7 — Container isolado por projeto (Fase B do Sprint 2)

Continuacao do item #2 do ALICERCE. A parte de IMPORT ja esta pronta (Fase
A0 = daemon de clone; Fase A2 = rota POST /:slug/import). Esta rodada dá o
passo seguinte: fazer um projeto **executar** dentro de um container proprio,
isolado, com teto de recursos, sem publicar portas no host e sem quebrar o
preview estatico nem a telemetria atuais.

Principio-guia herdado da VISAO: o container deve **nascer portavel** (Docker
padrao, sem amarra de provedor) para o "roda aqui hoje, exporta pra outra VPS
depois" ficar barato. E o gatilho de promocao vale: **nunca container por
padrao** — so quando o projeto merece (criterio na secao 4).

---

## 1. ESTADO ATUAL (como funciona hoje — sem nenhum isolamento)

Verificado por reconhecimento read-only em 2026-07-11:

- **Projetos nao executam.** Nao ha `docker run`, `dockerode`, gerenciador de
  processo nem spawn de codigo de projeto em lugar nenhum do backend (grep
  varreu server.js, api/*.cjs, mas/*). Um projeto e' um diretorio:
  - `projects/{slug}/repo/` — codigo importado do GitHub (.git removido, A2).
  - `projects/{slug}/site/` — site ESTATICO gerado pelo agente MAS
    (`mas/agents.mjs:398` escreve `site/index.html`).
  - `projects/{slug}/docs/` — planos .md gerados pelo mesh.
  - `projects/{slug}/project.json` — metadados (slug, name, stack, db,
    status:'draft', public:false, timestamps). SEM campo de runtime/porta/
    container.
- **"Preview" hoje = arquivo estatico.** O proxy (proxy.conf, LOCATION 1)
  serve `projects/{slug}/site/` via `root` + `try_files`, protegido por
  `auth_request`. `./projects` esta montado `:ro` no orquestrai-proxy. Nao ha
  processo vivo por tras — e' HTML/CSS/JS servido direto do disco.
- **3 containers, tudo compartilhado** (docker-compose.yml, rede app-net):
  proxy (80/443), web (SPA), api (Express :3000). Qualquer codigo de projeto
  que rodasse hoje rodaria DENTRO do api (mesmo processo/uid/limites) — nao
  roda, mas se rodasse seria zero isolamento.
- **Telemetria** (blackboard.db: mas_run/mas_event) NAO tem `project_slug`
  hoje (roadmap #3, "do zero"). Ou seja: metrica por projeto ainda nao existe;
  nao dá pra "so ligar" nesta fase.
- **Executor privilegiado que ja existe**: `project-runner` (systemd, host,
  :7655) — mas e' DELIBERADAMENTE sem poder: uid 999 nao-root,
  `CapabilityBoundingSet=` vazio, ProtectSystem=strict, ReadWritePaths so o
  staging, NAO esta no grupo docker, sem socket docker montado. **Nao pode
  gerenciar Docker** — e isso e' feature, nao bug (Fase A0).
- **Recursos da VPS** (Hostinger KVM2): 2 vCPU, 7.8 GiB RAM (~5.5 livres),
  96 GB disco (~85 livres). Docker 29.6.0, storage overlayfs, runtime runc.
  Modesto: cabe um punhado de containers pequenos com teto, nao dezenas.
- **Portas em uso**: 80, 443 (proxy), 7654 (oqterm), 7655 (project-runner).
  Socket docker nao exposto a nenhum container. api sem docker CLI.

**Resumo:** Fase B nao "melhora" um isolamento fraco — ela **introduz**
execucao de projeto, que hoje simplesmente nao existe. Isso e bom (folha em
branco, sem migracao de legado) e perigoso (toca compose + proxy + um novo
portao de execucao privilegiado).

---

## 2. PROPOSTA DE ARQUITETURA

### Opcoes avaliadas

- **Docker-in-Docker (DinD) dentro do api** — REJEITADO. Exige container
  `--privileged`, duplica um daemon Docker sobre o que ja existe no host,
  tem historico de dor com storage/overlay, e amplia a superficie de root.
  Nao ha ganho: ja temos um daemon Docker no host.
- **project-runner gerencia os containers (sidecar)** — REJEITADO na forma
  ingenua. Ele so gerencia Docker se ganhar o socket (= root-equivalente no
  host), o que desmancha todo o hardening da Fase A0. Nao vamos re-privilegiar
  o daemon de clone.
- **[RECOMENDADO] Novo daemon supervisor dedicado + Docker do host** —
  espelha o padrao ja validado na A0/A2: um systemd pequeno, single-purpose,
  hardened, que a api chama pela bridge com JWT. A diferenca e' que ESTE
  daemon (`project-supervisor`, :7656) tem acesso CONTROLADO ao Docker do
  host, com uma API estreita e allowlisted (start/stop/status de UM container
  por slug, a partir de template por stack), **nunca** `docker exec` arbitrario
  nem comando cru. Assim o project-runner continua sem poder (so clona) e toda
  a superficie que toca o socket fica isolada numa unidade propria, auditavel.

### Desenho recomendado (esqueleto, detalhe vem nos passos)

```
  Internet ──443──> orquestrai-proxy (nginx)
                       │
                       ├─ /                → web (SPA)          [inalterado]
                       ├─ /api/            → api:3000           [inalterado]
                       ├─ /projects/{s}/site/ → estatico ./projects [inalterado]
                       └─ /projects/{s}/app/   → NOVO: container do projeto
                                                  (via IP interno na bridge,
                                                   SEM porta publicada no host)

  api (Express) ──JWT/bridge──> project-supervisor (:7656, systemd, host)
                                   │  (unico com acesso controlado ao
                                   │   socket docker; API allowlisted)
                                   └─ docker run/stop  proj-{slug}
                                        - imagem base por stack (node/static/…)
                                        - rede app-net, SEM -p (nao publica porta)
                                        - MemoryMax/CPUQuota por container
                                        - monta projects/{slug}/repo :ro
                                        - read-only rootfs + tmpfs onde precisar
```

Pontos de projeto (nao-negociaveis, vem das licoes):

- **Sem publicar portas no host** (`-p`). Cada container escuta em 0.0.0.0
  DENTRO de si (L-PROP-docker-listen-0-0-0-0) mas so e' alcançavel pela rede
  interna app-net. O proxy roteia por nome/IP do container. Isso evita
  exaustao de portas, evita espalhar regra ufw por projeto, e mantem "proxy
  e o unico com portas publicas" (regra da casa). Teste de exposicao SEMPRE
  de fora da VPS (L-PORTTEST01), nunca do proprio host.
- **Teto de recursos obrigatorio por container** (MemoryMax, CPUQuota,
  PidsLimit) — 2 vCPU / 7.8G nao perdoa. Mesma filosofia do MemoryMax=256M
  do project-runner.
- **Portabilidade desde o inicio** (VISAO): imagem Docker padrao + um
  `compose.project.yml` template versionado por stack, para `docker save`/
  export futuro sem reescrever nada. Nao construir o export agora (fora de
  escopo), mas nao criar amarra que o impeça.
- **project.json ganha bloco `runtime`**: `{ stack, containerImage, internalPort,
  status: stopped|running, promotedAt }`. Coluna/campo nullable (projeto
  antigo sem runtime continua valido — mesma disciplina de migration).

---

## 3. RISCOS IDENTIFICADOS

| # | Risco | Mitigacao |
|---|---|---|
| R1 | **Terceiro portao de root.** Ja ha 2 (execBloco auditado + oqterm raw, CTXEXEC01). Um daemon com socket docker e' o 3o. | API estreita e allowlisted (sem exec/comando cru), JWT admin obrigatorio, bind 127-only + bridge via ufw como o :7655, systemd hardening. Registrar no CTXEXEC01 como divida a unificar depois — NAO unificar agora (escopo). |
| R2 | **Exaustao de recursos** (2 vCPU / 7.8G). N containers sem teto = OOM do host, derruba o cockpit inteiro. | MemoryMax/CPUQuota/PidsLimit por container + **gatilho de promocao** (secao 4) limita quantos existem. Teto agregado configuravel (ex: no maximo K containers vivos). |
| R3 | **Portas / networking.** Publicar porta por projeto = exaustao + ufw sprawl + risco de expor sem auth. | Zero `-p`. Roteamento interno pela app-net (proxy alcanca por IP/nome). Preview do container tambem passa por auth_request, como o estatico. |
| R4 | **Quebrar o preview estatico atual** ao mexer no proxy.conf (LOCATION 1 e o 403 catch-all — ja custou ~1h de preview publico exposto, PROTOCOLO-ANTICONTAMINACAO sec.12). | Nova location `/projects/{s}/app/` ADICIONADA sem tocar a de `/site/`; `.bak` + `nginx -t` + `nginx -s reload` + skill `smoke-preview` a cada mudanca. Editar OS DOIS server{} se aplicavel (nginx/CLAUDE.md). |
| R5 | **Telemetria descasada.** mas_run nao tem project_slug; querer medir CPU/mem do container agora arrasta o item #3/#4. | Fase B **nao** acopla telemetria. Expor no maximo um `status`/`healthz` do container. Metrica de custo (#3) e disco/CPU (#4) ficam FORA (secao 5). |
| R6 | **Recreate do api derruba deploy.** A integracao vai exigir restart/recreate do api. | Padrao S1/S2: validacao intermediaria, checar MAS inativa antes, sem encadear. force-recreate so se mexer em .env (L-INFRA01). |
| R7 | **Codigo de terceiro hostil** (import roda codigo arbitrario). | rootfs read-only, sem capabilities, sem socket dentro do container do projeto, rede sem acesso a app-net sensivel (avaliar rede dedicada por projeto vs app-net), sem montar segredos. O container do projeto e' o menos confiavel do sistema — tratar como tal. |
| R8 | **IP da bridge nao e' estavel por contrato.** Hoje 172.18.0.1 e' hardcoded (oqterm/A2). Mais containers = IPs dinamicos. | Roteamento por NOME de container na app-net (resolver do Docker), nao por IP fixo. Proxy ja usa `resolver 127.0.0.11` (Docker DNS) — reaproveitar. |

---

## 4. PASSOS FRACIONADOS (LAVE + F, validacao intermediaria, sem encadear)

Ordem: alicerce invisivel e nao-destrutivo primeiro; compose e proxy (as
partes perigosas) so depois de tudo abaixo validado. Cada passo e' um bloco
LAVE aprovado individualmente.

**Gate de promocao (pre-requisito de produto, decidir ANTES do B1):**
container so nasce quando o projeto tem `status:'producao'` marcado pelo
humano OU >=N execucoes reais via /api/mas/run (numero a definir com a CBini).
Nunca no wizard. (Fonte: BACKLOG DE PRODUTO do roadmap + VISAO.)

- **B0 — Decisao de arquitetura + este plano aprovado.** (voce esta aqui)
  Validacao: CBini aprova a abordagem "supervisor dedicado", o gate de
  promocao e o valor de N.

- **B1 — Schema/contrato, sem executar nada.** Definir o bloco `runtime` no
  project.json (nullable) + o catalogo de stacks suportadas (v1: `static`
  e `node` apenas) + o template `compose.project.yml`/args de `docker run`
  por stack, versionado em services/. NENHUM container ainda.
  Validacao: revisao de contrato + um project.json de exemplo valido; a
  listagem atual (loadAll) continua intacta com o campo novo ausente.

- **B2 — Daemon `project-supervisor` (esqueleto), bind 127.0.0.1 SO.**
  Espelha A0: systemd, JWT HMAC, healthz, hardening. API v1 minima:
  `POST /up {slug}`, `POST /down {slug}`, `GET /status/{slug}`. Nesta etapa
  o "up" faz `docker run` de UMA imagem de teste inofensiva (ex: um static
  nginx servindo o site/), com teto de recursos, SEM porta publicada.
  Ainda NAO exposto a app-net (so localhost), NAO chamado pela api.
  Validacao (5 testes, modelo A0): JWT 401/403, allowlist de slug/stack,
  container sobe com MemoryMax/CPUQuota aplicados (docker inspect), sobe SEM
  `-p`, down remove limpo. systemd-analyze score >= 3.9.

- **B3 — Rede: supervisor alcancavel pela api (bridge + ufw).** Igual A2:
  PR-supervisor em 172.18.0.1:7656 + regra ufw `7656 ALLOW from 172.18.0.0/16`.
  Validacao: healthz de dentro do container api; 127.0.0.1 recusa; teste de
  segredo compartilhado (JWT) igual A2.

- **B4 — Rota na api: POST /api/projects/:slug/deploy (e /stop, /runtime).**
  admin-only, gate de promocao aplicado, chama o supervisor, grava
  `runtime` no project.json (escrita atomica, padrao do arquivo). Restart do
  api com o rigor S1/S2 (MAS inativa, sem encadear).
  Validacao E2E: 403 nao-admin, 409 sem promocao, deploy sobe container,
  status reflete, stop derruba, project.json coerente. Cleanup dos projetos
  de teste (quarentena, como A2).

- **B5 — Proxy: preview do container vivo em /projects/{s}/app/.** Nova
  location roteando por NOME de container via resolver do Docker, protegida
  por auth_request (reusar o mecanismo do /site/). NAO tocar a location de
  /site/ nem o 403 catch-all. `.bak` + `nginx -t` + reload + `smoke-preview`.
  Validacao: site estatico segue OK (smoke-preview verde); app do container
  responde atras de auth; path nao-/app/ e nao-/site/ segue 403; teste de
  exposicao de porta DE FORA da VPS confirma que nada novo vazou.

- **B6 — Documentacao + licoes + roadmap.** Registrar CTXIDs, atualizar
  ROADMAP-FUTURO (Fase B concluida), lições dos tropecos. Marcar o que ficou
  para Fase C (preview conteinerizado ja e parte disto — reavaliar se C ainda
  faz sentido separada) e para os itens #3/#4.

Cada passo B1..B5 e' independentemente reversivel (rollback por .bak/unit/
git + stop do container). Terminar qualquer passo NUNCA deixa o cockpit no
meio de uma migracao quebrada.

---

## 5. FORA DE ESCOPO desta fase (nao misturar — conecta com metas 3, 4, 8, 9)

Explicito para evitar contaminacao de escopo:

- **Telemetria de custo/tokens por projeto (roadmap #3).** Exige `project_slug`
  em mas_run/mas_event (nao existe hoje) — trabalho proprio. Fase B expoe no
  maximo `status`/health do container, nada de custo.
- **Telemetria expandida disco/memoria/CPU por projeto (roadmap #4).** Depende
  do container isolado (que esta fase entrega) mas a coleta de cgroup stats +
  UI e' o item #4. Nao construir aqui.
- **UI padrao janelas / menu lateral (roadmap #8).** Puro frontend, sem
  relacao com execucao. Nao tocar.
- **Cotas / multi-tenancy / "VPS dentro da VPS" (roadmap #9).** Depende de
  container isolado MADURO. Longe.
- **Export/deploy para outra VPS (VISAO fase 3, docker save/load).** Vamos
  DESENHAR para nao impedir (imagem padrao, template versionado), mas nao
  implementar export nesta rodada.
- **Auto-scale / elasticidade self-hosted (VISAO fase 4).** Pesquisa, nao
  compromisso. Fora.
- **Unificar os portoes de execucao root (CTXEXEC01/CTXOQTERM01, roadmap #5b).**
  Esta fase ADICIONA um 3o portao (supervisor); a unificacao dos tres e' um
  sprint de higiene dedicado. So registrar a divida, nao pagar agora.
- **Auto-promocao de container / gatilho automatico.** Nesta fase o deploy e'
  disparado manualmente pelo humano (admin) respeitando o gate; automatizar o
  gatilho vem depois.

---

## Decisoes da CBini (2026-07-11) — congeladas para a Rodada 7
1. **Arquitetura**: novo daemon `project-supervisor` dedicado. APROVADO.
2. **Gate de promocao**: manual por enquanto — so `status:'producao'` marcado
   pelo humano no project.json. SEM gatilho por N execucoes nesta rodada.
3. **Teto agregado**: no maximo **3** containers de projeto vivos ao mesmo
   tempo na VPS. Deploy que exceder = recusa explicita (nao enfileira).
4. **Stacks v1**: apenas `static` (nginx servindo site/) e `node`. Nada mais.
5. **Auditoria dos 3 portoes root**: registrada no ROADMAP-FUTURO (#5b) como
   rodada futura dedicada, nao nota solta. Feito.
