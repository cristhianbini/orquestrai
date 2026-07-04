# 🔒 Segurança

## O que já está protegido

| Camada | Implementação |
|---|---|
| Autenticação | JWT (Bearer token) |
| Segundo fator | 2FA TOTP |
| Rotas MAS | **Todas as 10 rotas** de `mas/routes.mjs` autenticadas via `mas/auth.mjs` (verificação JWT) |
| SSE | `authMiddlewareSSE` — variante que lê o token de `?_t=` (SSE não envia header Authorization) |
| Segredos em repouso | API keys cifradas com **AES-256-GCM** at rest |
| Auditoria | **hash-chain** (log encadeado por hash — detecção de adulteração) |
| Login | **Cloudflare Turnstile** (anti-bot) |
| Execução no PTY root | **R6-15**: checkpoint de confirmação humana (`window.__b94Confirm(cmd)`) antes de executar scripts no terminal root — unificou dois caminhos antes desprotegidos (`oq71z-exec` em `wireCard` e `sendDirect` no B94) |

---

## Detalhe importante sobre cobertura de auth (lição aprendida)

A verificação de cobertura de autenticação **não pode depender só de string
matching**. A regra que adotamos:

> Contar o total de ocorrências de rota **versus** ocorrências com header
> `Authorization`. Um patch parcial de auth já deixou vários call-sites
> desprotegidos e causou um **loop de 401** em produção.

---

## Riscos conhecidos (declarados por transparência)

Preferimos listar honestamente a esconder:

1. **PTY root fora do Docker.** O `oqterm` roda como root fora de container.
   Mitigado pelo checkpoint humano (R6-15), mas o isolamento continua sendo um
   risco arquitetural. Auditor: recomendações de sandboxing são bem-vindas.

2. **Caminhos de execução ainda não totalmente unificados.** Existem caminhos
   distintos (`execBloco` protegido vs. caminho interativo do `oqterm`).
   A unificação está registrada como `CTXEXEC01` (ver `05-PENDENCIAS`).

3. **Confirmação via `confirm()` nativo.** As confirmações de execução ainda
   usam o `confirm()` nativo do browser. Substituição por modal customizado está
   em `CTXEXECMODAL01`.

4. **Endpoint de auditoria do oqterm pendente.** (registro em pendências)

---

## Nota de método

Nenhuma credencial, chave ou segredo aparece neste dossiê. Este documento
descreve **mecanismos**, não valores. Chaves reais permanecem cifradas na VPS.
