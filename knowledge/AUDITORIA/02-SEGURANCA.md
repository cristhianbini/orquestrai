# 🔒 Segurança

## O que já está protegido

| Camada | Implementação |
|---|---|
| Autenticação | JWT (Bearer token) |
| Segundo fator | 2FA TOTP |
| Rotas MAS | **Todas as 10 rotas** de `mas/routes.mjs` autenticadas via `mas/auth.mjs` (verificação JWT) |
| SSE | `authMiddlewareSSE` -- variante que lê o token de `?_t=` (SSE não envia header Authorization) |
| Segredos em repouso | API keys cifradas com **AES-256-GCM** at rest |
| Auditoria (execBloco) | **hash-chain** append-only (`api/blocosRoutes.cjs`) -- cada execução encadeia prev_hash+sha256+status+usuario+ip |
| Auditoria (oqterm/PTY root) | **CTXUNIFY01-B**: `sendDirect` registra hash no mesmo hash-chain via endpoint `oqterm-log` (antes órfão, nunca chamado) |
| Login | **Cloudflare Turnstile** (anti-bot) |
| Execução no PTY root | **R6-15**: checkpoint de confirmação humana (`window.__b94Confirm(cmd)`) centralizado -- usado pelos 2 botões EXECUTAR (`oq71z-exec` e B94 `sendDirect`), sem duplicação de código desde CTXUNIFY01-B |

---

## Detalhe importante sobre cobertura de auth (lição aprendida)

A verificação de cobertura de autenticação **não pode depender só de string
matching**. A regra que adotamos:

> Contar o total de ocorrências de rota **versus** ocorrências com header
> `Authorization`. Um patch parcial de auth já deixou vários call-sites
> desprotegidos e causou um **loop de 401** em produção.

O mesmo princípio se generalizou para limpeza de debug (ver lição
`R6-16.1`): contagem bruta de string mede menções, não comportamento real.

---

## Riscos conhecidos (declarados por transparência)

Preferimos listar honestamente a esconder:

1. **PTY root fora do Docker.** O `oqterm` roda como root fora de container.
   Mitigado pelo checkpoint humano (R6-15) e agora também auditado
   (CTXUNIFY01-B), mas o isolamento de processo continua sendo um risco
   arquitetural. Auditor: recomendações de sandboxing são bem-vindas.

2. **Dois motores de execução distintos, por design.** `execBloco`
   (sandboxed: ulimit, timeout 120s) e `oqterm` (PTY root interativo,
   sem limite de tempo) não são o mesmo motor -- e não deveriam ser: tarefas
   reais de operação (systemctl, apt, docker) não cabem no sandbox curto.
   O que já está unificado: checkpoint de confirmação e auditoria
   hash-chain. O que permanece separado por necessidade real: o motor de
   execução em si.

3. **Confirmação via `confirm()` nativo.** As confirmações de execução ainda
   usam o `confirm()` nativo do browser. Substituição por modal customizado
   está em `CTXEXECMODAL01` (pendente).

4. **Gap conhecido na cadeia hash-chain (GENESIS).** Linhas antigas
   (`origem=individual`) têm `prev_hash`/`chain_hash` vazios -- schema
   evoluiu depois que essas linhas existiam. A cadeia é criptograficamente
   válida a partir do `GENESIS` registrado no commit `db1d76e` em diante;
   não cobre retroativamente execuções anteriores a essa data.

---

## Nota de método

Nenhuma credencial, chave ou segredo aparece neste dossiê. Este documento
descreve **mecanismos**, não valores. Chaves reais permanecem cifradas na VPS.
