# ✅ Como validar (para o auditor reproduzir)

> Um dossiê sem verificação é só palavra. Aqui estão passos concretos para você
> reproduzir o que afirmamos. Ajuste caminhos conforme o acesso concedido.

---

## 1. Autenticação das rotas MAS

Confirme que as 10 rotas de `mas/routes.mjs` estão protegidas:

```bash
# contar rotas declaradas
grep -cE "router\.(get|post|put|delete)" mas/routes.mjs
# conferir que o middleware de auth é aplicado (JWT + variante SSE)
grep -nE "authMiddleware(SSE)?" mas/routes.mjs mas/auth.mjs
```

Uma chamada sem token deve retornar **401**; com token válido, **200**.

---

## 2. SSE autenticado por query param

```bash
# sem token -> deve falhar
curl -N "https://orquestrai.cbini.com.br/api/mas/events/<run_id>"
# com token -> deve abrir o stream
curl -N "https://orquestrai.cbini.com.br/api/mas/events/<run_id>?_t=<token>"
```

---

## 3. Confirmação humana no PTY root (R6-15)

No dashboard, dispare uma execução de bloco. **Deve aparecer um checkpoint de
confirmação** antes de qualquer coisa rodar no terminal root. Sem confirmação,
o comando não executa.

---

## 4. Console limpo em produção (R6-16)

Abra o dashboard com `Ctrl+Shift+R` (hard reload) e o DevTools. O console deve
ficar **sem** os logs de debug (`[B162]`, `[B339]`, `[B163]`, etc). Devem restar
apenas erros/avisos legítimos (ex.: favicon 404 — pré-existente e mapeado).

---

## 5. Painel de agentes React ao vivo

Confirme que o painel visível é `#oq-agent-panel-island` (React), **não**
`#agentes` (legado oculto). Durante uma execução MAS, os cards devem transitar
de estado (`aguardando` → `executando` → `concluído`) com animação, alimentados
por SSE.

```bash
# o source das ilhas
ls frontend-vite/src/
# o artefato buildado (com verificação de hash)
cat scripts/build-island.sh | grep -i sha256
```

---

## 6. Backup contínuo (Litestream)

```bash
systemctl status litestream   # ou o método de execução usado
# confirmar replicação dos .db (blackboard.db, cluster.db)
```

---

## Observação

Se algum passo divergir do afirmado nos demais arquivos, **o erro é nosso** —
reporte e corrigimos o dossiê. A intenção é que este documento seja
reproduzível, não retórico.
