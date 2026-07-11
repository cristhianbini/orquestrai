PROJETO: orquestrai
TIPO: contrato-de-interface
CRIADO: 2026-07-11
FASE: Rodada 7 / B1 (schema + contrato, NENHUM container executado)
STATUS: rascunho — aguardando aprovacao da CBini antes do B2 (daemon)

# B1 — Contrato do container isolado por projeto

Define a FORMA das coisas antes de qualquer execucao: o bloco `runtime` no
project.json, o catalogo de stacks v1, e o template allowlisted de `docker
run` que o futuro `project-supervisor` (B2) vai montar. Nada aqui roda um
container — e' so o contrato para revisao.

Decisoes congeladas (RODADA-7-PLANO, aprovadas 2026-07-11): supervisor
dedicado; gate de promocao MANUAL (`status:'producao'`); teto de 3 containers
vivos; stacks v1 = static e node.

---

## 1. Bloco `runtime` no project.json (ADITIVO e nullable)

Projeto que nunca foi deployado como container NAO tem a chave `runtime`.
Isso mantem todos os project.json atuais validos sem migracao.

```jsonc
{
  "slug": "meu-projeto",
  "status": "producao",          // CAMPO EXISTENTE — e' o gate de promocao
  "stack": "node-express",       // CAMPO EXISTENTE — mapeado p/ runtime.stack
  // ... demais campos atuais inalterados ...
  "runtime": {                    // NOVO bloco, ausente = nunca conteinerizado
    "stack": "node",             // runtime stack RESOLVIDO (static|node)
    "image": "node:20-alpine",   // imagem base (do catalogo, nao arbitraria)
    "internalPort": 3000,         // porta que o container escuta (NAO publicada)
    "containerName": "proj-meu-projeto",
    "state": "stopped",          // stopped|running — NAO confundir c/ status
    "promotedAt": "2026-07-11T10:00:00.000Z",
    "lastDeployAt": null,
    "resources": { "memoryMax": "256m", "cpus": "0.5", "pidsLimit": 128 }
  }
}
```

**Nomes que NAO colidem (verificado no disco 2026-07-11):**
- `status` (nivel projeto) ja usa `draft`/`producao` — e' o gate, reaproveitado.
- `runtime.state` (`stopped`/`running`) e' o estado do CONTAINER — nome
  diferente de proposito, para nunca se confundir com `status`.

**Consumidores atuais e imunidade (verificado):**
- `loadAll()` (projectsRoutes.cjs) faz `JSON.parse` e devolve o objeto —
  chave extra e' ignorada, nao quebra.
- `GET /:slug`, `preview-auth` (le `project.public`), `PATCH` (le `public`)
  — nenhum le `runtime`. Bloco aditivo e' seguro.

---

## 2. Gate de promocao (MANUAL, decisao #2)

Deploy de container so e' permitido se **`project.status === 'producao'`**
(campo existente, ja em uso por 1 projeto real). Sem gatilho automatico por N
execucoes nesta rodada. Wizard NUNCA cria container. Fluxo:
1. Humano (admin) marca `status:'producao'` no projeto.
2. Humano dispara `POST /api/projects/:slug/deploy` (B4).
3. api valida o gate + o teto de 3, chama o supervisor, grava `runtime`.

---

## 3. Catalogo de stacks v1 (so static e node)

### Mapeamento project.stack -> runtime.stack
| project.stack (existente) | runtime.stack | 
|---|---|
| `static-html`, `static` | **static** |
| `node-express`, `node` | **node** |
| qualquer outro | **RECUSA** (nao suportado na v1) |

### static
- **image**: `nginx:1.27-alpine` (pinada — reproduzivel/portavel).
- **internalPort**: 80.
- **monta**: `projects/{slug}/site/` :ro em `/usr/share/nginx/html`.
- **rootfs**: read-only + tmpfs em `/var/cache/nginx` e `/var/run`.
- **command**: default da imagem (nginx). Sem rede externa necessaria.
- Observacao: o preview ESTATICO atual (proxy servindo site/) continua
  existindo em paralelo; a stack static conteinerizada e' a versao "app vivo"
  do mesmo conteudo — nao substitui o preview estatico nesta fase.

### node
- **image**: `node:20-alpine` (pinada).
- **internalPort**: 3000 (convencao; o app DEVE escutar `process.env.PORT`).
- **monta**: `projects/{slug}/repo/` :ro em `/app`, workdir `/app`.
- **command**: `node <entry>` do projeto (definido no project.json ou
  package.json `main`/`scripts.start`).
- **PONTO ABERTO p/ B2** (registrado, nao resolvido aqui): dependencias npm.
  Com rootfs :ro e repo :ro nao ha onde instalar node_modules. Opcoes a
  decidir no B2: (a) exigir deps vendorizadas no repo; (b) step de `npm ci`
  numa layer/volume de build antes do run; (c) imagem por projeto (build).
  O contrato B1 fixa a FORMA (monta repo, escuta PORT); o COMO do install
  fica para o desenho do B2.

---

## 4. Template `docker run` allowlisted (o supervisor MONTA; nunca comando cru)

Conjunto FIXO de flags. O supervisor preenche placeholders validados; nao
aceita flags extras nem comando arbitrario do chamador.

```
docker run -d
  --name proj-{slug}                         # slug validado ^[a-z0-9-]{1,60}$
  --network app-net                          # bridge interna; proxy resolve por nome
  --memory {resources.memoryMax}             # teto RAM (ex: 256m)
  --cpus {resources.cpus}                    # teto CPU (ex: 0.5)
  --pids-limit {resources.pidsLimit}         # ex: 128
  --read-only                                # rootfs imutavel
  --tmpfs /tmp                               # (+ /var/cache/nginx,/var/run p/ static)
  --cap-drop ALL                             # zero capabilities
  --security-opt no-new-privileges
  --restart no                               # NAO ressuscita codigo hostil sozinho
  -v {HOST}/projects/{slug}/{site|repo}:{mount}:ro
  --label orquestrai.project={slug}          # p/ inventario e contagem do teto
  {image}                                    # so do catalogo
  [command]                                  # so do template da stack
```

**Proibicoes duras** (o supervisor recusa se aparecerem):
- SEM `-p`/`--publish` — nunca publica porta no host (L-PORTTEST01,
  L-PROP-docker-listen-0-0-0-0). Proxy alcanca por nome `proj-{slug}` via
  resolver Docker (127.0.0.11), como ja faz com os upstreams.
- SEM `--privileged`, SEM `--cap-add`, SEM montar `/var/run/docker.sock`,
  SEM `-v` fora de `projects/{slug}/`.

**Teto de 3 (decisao #3):** antes de subir, o supervisor conta
`docker ps --filter label=orquestrai.project` — se ja houver 3 rodando,
RECUSA com erro explicito (nao enfileira).

---

## 5. Superficie da API do supervisor (so o contrato; implementa no B2)

Espelha o padrao A0/A2 (JWT HMAC admin, bind localhost+bridge, hardening):
- `GET  /healthz` — liveness.
- `POST /up`      `{slug, stack, image, internalPort, mount, resources}` ->
                   valida tudo, aplica teto, sobe o container, devolve estado.
- `POST /down`    `{slug}` -> para e remove `proj-{slug}`.
- `GET  /status/{slug}` -> running|stopped|absent + infos basicas.

O corpo do `/up` e' montado pela API (B4) a partir do catalogo — o supervisor
RE-VALIDA tudo (nunca confia no chamador), igual o project-runner re-valida
slug/URL na A2.

---

## 6. Validacao do B1 (criterios de "pronto")

- [ ] Um project.json de exemplo COM o bloco `runtime` faz parse e os
      consumidores atuais (loadAll, GET/:slug, preview-auth) o tratam sem erro
      e sem depender de `runtime` — provado por teste read-only.
- [ ] Nenhum project.json real e' alterado neste passo.
- [ ] Nomes de campo revisados sem colisao (`status` vs `runtime.state`).
- [ ] CBini aprova o contrato antes do B2 (daemon).
