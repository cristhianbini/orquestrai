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
