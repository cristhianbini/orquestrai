# META-CTXAGTUNIFY01 — Fonte unica do agente (card .md alimenta tudo)

**Registrado:** 2026-07-05 (Chat6)
**Prioridade:** ~~ALTA~~ CONCLUIDA 2026-07-05/07 (cadeia fechada no commit 62dac7e; ver git log CTXAGTUNIFY01 F1-F4)
**Depende de:** nada (e a fundacao, deve vir antes das 3 ideias abaixo)

## Problema (fonte dupla que desincroniza)
O nome/definicao de cada agente vive em DOIS lugares que nao conversam:
1. AGENT_CARD-<slug>.md  -> lido pelo modal AGENTES (/api/agents/cards)
2. array AGS (dashboard.html:266) + role (mas/agents.mjs:~50) -> o que o
   dashboard RENDERIZA e o que o MAS realmente USA na run.

PROVA (Chat6): editei AUDITOR -> "AUDITOR X" pelo lapis. Salvou no .md (modal
reflete). Mas a coluna direita/Mesh do cockpit continuou "AUDITOR" -- porque
renderiza do AGS, nao do .md. Editar o card NAO afeta o que roda nem o que
aparece no dashboard.

## Solucao proposta (unificar em fonte unica: o .md)
- mas/agents.mjs: montar role/model LENDO o AGENT_CARD-<slug>.md (system_prompt
  passa a vir do card -> editar/treinar/seed viram REAIS na run).
- dashboard AGS: derivar de /api/agents/cards em vez de hardcode na linha 266.
- Resultado: 1 fonte (.md). Editar card = muda modal + dashboard + comportamento
  na run, tudo junto.

## Impacto que DESTRAVA (por isso e ALTA prioridade)
- Seed dos 11 papeis (definicao base por posicao) passa a ter efeito real.
- Botao Treinar (IA melhora o card) passa a mudar o agente de verdade.
- Escalar reserva -> titular reflete em todo lugar.

## Cuidado (LAVE+F)
Tarefa GRANDE (backend+frontend). Fracionar: (1) agents.mjs le prompt do card
com fallback pro role atual; (2) testar 1 agente; (3) AGS deriva do endpoint;
(4) so entao remover o hardcode. Nunca em lote -- e a espinha do sistema.
Checar mas_run status='running' antes de qualquer restart de agents.mjs.

## Referencias
- Fonte dupla e o padrao que combatemos no plano (roadmap->indice).
- Ver knowledge/licoes/L-CTXHANDOFFVERIFY01.md (fonte da verdade = sistema real).
TAGS: arquitetura,agentes,fonte-unica,fundacao,chat6
