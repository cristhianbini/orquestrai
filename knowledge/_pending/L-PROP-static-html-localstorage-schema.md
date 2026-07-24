# L-PROP-static-html-localstorage-schema

_Proposta por Memorialista, pre-aprovada por Guardian em 2026-07-14T13:30:00.778Z. Aguardando revisao humana._

ID: L-PROP-static-html-localstorage-schema
TITULO: Static-html com persistencia: schema JSON validado em localStorage antes de code, fonte de dados externa explicitada no roadmap
CONTEXTO: Projetos OrquestrAI com stack=static-html e db=none que exigem historico/inventario/calculos (ex: mycriptos, carrinho, dashboard pessoal). Risco: implementador escolhe storage (localStorage vs IndexedDB vs cookies) ou fonte de preco (API vs manual) DURANTE code, nao no planejamento, causando refactor ou divergencia entre paginas.
REGRA: (1) Scout identifica se projeto static-html tem persistencia; se sim, delegue a Detetive validar schema JSON em localStorage. (2) Smith define schema com 3 campos obrigatorios (id timestamp, ativo/tipo, valor), valida tipos e limites no modulo storage.js. (3) Roadmap DECLARA fonte de dados (API publik com fallback manual) ou entrada manual pura. (4) Se API externa: testar CORS e timeout em MVP; fallback manual (input user) em fase 1. (5) Exportacao CSV e sincronizacao cross-tab (localStorage events) vao para fase 2, nao MVP. Isso evita 2+ sprints descobrindo schema durante implementacao.
EVIDENCIA: run BUILD mycriptos (2026-01-XX) — Smith gerou schema JSON completo com validacoes (quantidade > 0, data <= hoje) + 3 modulos JS (storage.js, precos.js, calculos.js) + decisao CoinGecko API + fallback manual, tudo antes de codigo. Guardiao aprovou. Isso previne implementacao divergente de "preco atual" em diferentes paginas (cadastro.html vs historico.html) que apareceria em fase 2 como bug de sync.

---

**Status proposta:** Aguardando aprovação humana (Cris / Guardião curador). Regra acionável, evidência mapeável em git + runs futuros static-html + localStorage.
