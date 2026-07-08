# META-CTXROSTERUX01 — UX de gestao do roster (rebaixar + arrastar)
PROJETO: orquestrai
STATUS: registrada 2026-07-08 | EXECUTAR EM: S7 (rebaixar) e S9+ (drag)

## Contexto
Rebaixamento do CRITICO (2026-07-08) exigiu DELETE manual em
agent_positions (cluster.db) -- a UI promove via botao "usar" mas nao
tem caminho de volta. Assimetria classica: feature nasceu no caminho feliz.
Descoberta da sessao: agent_positions guarda apenas OVERRIDES (posicoes
0-8 = titulares vem do codigo); position e' 0-based (9 = 10o slot TESTADOR).

## Itens
1. Botao "rebaixar" simetrico ao "usar" (S7, junto da PENEIRA -- promocao
   por merito EXIGE caminho de volta). Backend: DELETE na agent_positions.
2. Drag-and-drop para reordenar roster (ideia do Bini 2026-07-08).
   CONDICIONADA a migracao React do roster (S9+, Bloco B) -- nao implementar
   no dashboard legado (dobra o trabalho).
   PERGUNTA DE PRODUTO ABERTA: posicao = funcao no pipeline (BATEDOR abre,
   REVISOR fecha -- arrastar quebraria a semantica?) ou preferencia livre?
   Decidir junto com META-CTXESTEIRA01 antes de codar.
3. Relacionada: CTXGOVAGENT01 (S22) -- governanca do time.

## Decisao de mentor registrada (Fable, 2026-07-08)
CRITICO: card mantido (treino preservado), rebaixado da titularidade.
Motivo: pipeline ja tem 3 juizes (AUDITOR/GUARDIAO/REVISOR); 4o juiz em
todo run = custo+latencia sem dado que justifique. Reavaliar quando o
Harness Score tiver historico por agente (Q10, pipeline adaptativo):
candidato natural = camada opcional so em runs que geram BLOCO executavel.

## Adendo 2026-07-08 (sessao 13.8)
4. Modal de agente PERDE o formulario quando cadastro falha por token
   expirado (401) -- treino do Opus (custo real) quase perdido. Fix:
   preservar estado do form no erro + mensagem "faca login e tente de novo".
5. Posicao no time devia vir PRE-SELECIONADA ao editar agente existente
   via lapis -- campo vazio quase criou 2o fantasma do dia (METRICO ia
   pro slot 10 TESTADOR por hover acidental).
