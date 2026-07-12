# L-SINGLEOWNER02 — buscar botao por TEXTO quebra quando o botao vira icone
PROJETO: orquestrai
DATA: 2026-07-12

Sintoma: nav do header nascia certa (a direita) e "pulava" pro centro
~300ms/1.5s apos o load (Rodada 8, pos-E1b). BUG-NAVJUMP.

Causa: script legado b89header procurava o botao Sair por texto
/^sair$/i. Quando o E1b trocou texto por icone SVG, a busca falhou
SILENCIOSAMENTE e o fallback (header inteiro) criou span.b89-actions no
fim do header, movendo Manual+Elenco pra dentro. O novo :last-child
ganhou margin-left:auto!important (OQ16) e, com DOIS auto-margins na
mesma linha flex, o navegador dividiu o espaco livre — grupo estacionou
no CENTRO. Cumplices: 2 place() legados (OQ15/OQ16, setInterval 250ms)
moviam o Elenco; o seletor [class*="action" i] deles casava com o
proprio span.b89-actions. 3 "donos" disputando o mesmo DOM.

Regras:
1. NUNCA localizar elemento por textContent — usar id/data-* estavel.
   Texto muda (icone, i18n, rebrand) e a falha e silenciosa quando ha
   fallback que "faz algo".
2. Ao redesenhar um elemento, grep por TODOS os scripts que o tocam
   (getElementById/querySelector/appendChild) e desarmar os legados no
   MESMO passo — dono unico por elemento DOM.
3. Layout "pulando" pos-load = procurar setTimeout/setInterval/
   DOMContentLoaded reposicionando; 2 margin-left:auto na mesma linha
   flex = centralizacao por acidente.

Fix: commit 923e186 (F1-F3). Detalhe: secao BUG-NAVJUMP em
knowledge/metas/RODADA-8-PLANO-TELAS-UI.md.
