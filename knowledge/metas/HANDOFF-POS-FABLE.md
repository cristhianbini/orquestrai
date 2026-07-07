# HANDOFF — Estado pós-sessão Fable 5 (2026-07-07)
PROJETO: orquestrai
> Para Opus/Sonnet retomarem: leia INDICE-MESTRE-SPRINTS.md (fila S1-S25) e
> este arquivo (pendências finas). Regra de ouro: L-CTXHANDOFFVERIFY01 --
> verifique o estado pelo terminal, não confie só neste texto.

## Fila imediata (ordem)
1. VERIFICAR CTXMEMKB01: rodar 1 run MAS -- memorialista deve concluir NO
   cerebras sem AGENT_ERROR 400 e COM tokens no card. Se falhar de novo:
   plano B = trocar modelo do memorialista p/ claude-haiku (ROUTING em
   mas/agents.mjs L174) -- o fallback informal ja provou que haiku funciona.
2. S4 continua: AUDITOR (13.2) via botao Treinar -- fluxo: lapis > Treinar >
   revisar sugestao do Opus ANTES de Cadastrar (checar: papel L2 sem invadir
   DETETIVE, limites de tamanho, KB por ID, ancora em evidencia p/ nao
   repetir L-AUDITOR01). Depois 13.3-13.9, UM POR VEZ, run de teste entre cada.
3. CTXBLOCONUM01 (SUBIU DE PRIORIDADE): 3 contadores de bloco dessincronizados
   confundem o operador diariamente -- #N do card (localStorage), BLOCO-N no
   texto (LLM inventa), arquivos em knowledge/blocos/. Unificar: fonte unica
   = contador persistido no backend, injetado no prompt do Smith.

## Backlog tecnico (registrado, sem urgencia)
- A8: JWT_SECRET placeholder ('orquestrai-secret-change-me-2025') no
  /etc/oqterm.env -- trocar exige sincronizar com o secret da API (senao
  todo token invalida). Fracao dedicada.
- CTXEXECMODAL01: confirm() nativo -> modal custom (design do sistema).
  E o checkpoint de seguranca R6-15 -- trocar com calma, nunca com pressa.
- Fallback [B222] so cobre 429; erros 400 vazam 2x antes de algo assumir.
  Avaliar fallback tambem p/ 4xx de contexto (com log explicito).
- Telemetria do caminho de fallback nao registra tokens (card mostra '--').
- Memorialista errou schema do cluster.db em run (created_at vs criado_em):
  candidata a licao L-SCHEMA01 + garantir que KB a sirva aos agentes.
- Slot #10/#11 vagos: preencher via PENEIRA (avaliacao antes da promocao),
  nunca por 'usar' direto. Fix do usar ja materializa card (L-PROMOTESEMCARD01).

## O que foi entregue nesta sessao (nao redescobrir)
Auditoria Fable (7 achados, 2 rebaixados com evidencia) | S1 KB limpa +
filtro projeto | S2 mas_run_id ponta a ponta + block_executed no harness +
portao EXECUTAR agora auditado (nunca foi antes) | S3 oqterm bind 172.18.0.1
+ nginx sem query string + 2247 tokens eliminados | S4: BATEDOR curado,
esteira 1-9 justificada no codigo, reserva R1-R15 tatica, PENEIRA visual,
fix promocao-cria-card, CTXMEMCTX01+CTXMEMKB01 (400 do memorialista).
Licoes novas: L-PORTTEST01, L-ENVFILEWINS01, L-DATASETVOLATIL01,
L-PROMOTESEMCARD01 (+2 da auditoria). ~30 commits, todos com o porque.

## VISAO DE MENTOR — observacoes do Fable p/ Opus/Sonnet (nao sao tarefas; sao direcoes)

### Estabilidade
- O padrao .bak-manual acumula (dashboard.html ja tem varios da sessao) --
  quarentenar periodicamente em _arquivados/ (regra do projeto) ou criar
  script scripts/quarentena-baks.sh que roda semanal.
- docker restart e' o unico deploy da API -- sem healthcheck pos-restart
  automatizado. Sugestao barata: script restart-api.sh = restart + curl
  /healthz + check de run ativa ANTES (o comando ja existe na KB).
- SQLite em WAL segura bem 1 operador; o teto real chega com multi-user
  (R6-19). Nao migrar antes -- Litestream ja cobre o risco de perda.

### Seguranca (alem do backlog)
- kb.cjs PROIBE no STACK_CTX comandos destrutivos em BLOCO, mas a defesa
  real e' o hardVeto do guardian -- os dois nao estao sincronizados (listas
  diferentes). Unificar num unico modulo de regras (fonte unica).
- localStorage guarda o JWT (oq_token) -- XSS = token roubado. Mitigacao
  futura: cookie httpOnly p/ sessao + token curto so p/ SSE. Custo alto,
  so vale junto do multi-user.
- Rate limit de /api/agents/* usa kbLimiter -- conferir se train (chama
  Opus, custo real) tem limite proprio mais apertado.

### Funcionalidades com maior razao valor/esforco (na minha leitura)
1. CTXMASRUNID01 push (S17): SSE unico com run-started mata o polling 2s
   e simplifica 3 pontos do frontend. ~1 sessao.
2. Score por agente: a PENDENCIA DE PRODUTO do R6-11 continua sendo o
   desbloqueio mais valioso -- agora que block_executed existe, a formula
   pode nascer simples: taxa de blocos executados+aprovados por agente.
3. PENEIRA funcional (S7): 1 run de teste padronizada (mesmo goal fixo)
   por candidato + comparativo de custo/qualidade = promocao por merito.
4. CTXBLOCONUM01: contador unico no backend (tabela counters), injetado
   no prompt do Smith e exibido no card -- 3 fontes viram 1.

### Qualidade dos agentes (p/ a curadoria 13.2-13.9)
- Padrao que funcionou no BATEDOR: papel + fronteira anti-drift explicita
  ("sem interpretar logica") + limites duros (max linhas, sem bash) + KB
  por ID. Repetir esse esqueleto nos 8.
- METRICO e AUDITOR rodam em free tier (cerebras/groq) -- mesmos riscos de
  limite do memorialista. Se aparecer 400 neles, a solucao CTXMEMKB01
  (opts no loadKB) ja esta pronta p/ reusar por agentId.
- REVISOR (Opus) e' o mais caro do run ($0.12 de $0.19 total observado) --
  quando o score por agente existir, avaliar se todo run precisa dele ou
  so runs que geram bloco (pipeline adaptativo, Q10).

### Dividas que NAO vale pagar agora (anti-tarefas)
- Nao migrar agtPane pro React antes de terminar R6-13/14 (wrappers) --
  ordem inversa dobra o risco.
- Nao mexer na formula do harness (pesos) sem decisao de produto registrada.
- Nao trocar confirm() sem redesenhar o fluxo de seguranca junto (R6-15).

