# META — Redesign da barra superior + telas (CTXNAVREDESIGN01)
PROJETO: orquestrai
**Status:** DESENHO 2026-07-07 (Bini) -- EXECUTAR NO FIM (polish, nao bloqueia evolucao)
**Referencia aprovada pelo Bini:** a tela AGENTES (modal Provedores) -- abas
no topo (SECAO: Provedores/Modelos/Agentes), cards mini uniformes com badge
numerado no dot, secoes tituladas (TITULAR/RESERVA/PENEIRA). Esse e' o
PADRAO VISUAL a replicar nas outras telas.

## Objetivo
Barra superior (navbar) mais moderna e PADRONIZADA. Hoje os botoes (Projetos,
Licoes, Manual, Agentes, Sair) tem estilos herdados/inconsistentes. Unificar
sob o mesmo sistema visual da tela Agentes.

## Escopo (telas a modernizar sob o padrao Agentes)
1. NAVBAR: botoes uniformes (mesmo formato/hover/spacing), agrupamento logico
   (acoes de conteudo vs conta), indicador de ativo.
2. MANUAL: pagina com abas por tema (Agentes / Esteira / Score / LAVE+F /
   Reserva-Peneira) -- cards mini explicativos, mesmo visual dos cards de agente.
3. LICOES APRENDIDAS: hoje lista simples -> grid de cards mini (id, titulo,
   tag, projeto), filtro por tag/projeto no topo (aba-style).
4. PROJETOS: mesma linguagem de cards + abas se houver categorias.

## Principios de design (do que ja funciona na tela Agentes)
- Abas no topo (SECAO) p/ navegar sub-areas sem trocar de modal.
- Cards mini uniformes: dot colorido + badge, titulo, meta em linhas curtas.
- Secoes tituladas com contador (ex: "LICOES (76)").
- Cor por categoria (consistente com o dot dos agentes).
- Densidade alta mas legivel (grid auto-fill minmax ~175px).

## Restricoes (LAVE+F -- nao repetir erros da sessao)
- agtPane e' LEGADO (strangler fig): telas novas nascem em React island
  (frontend-vite/), NAO em dashboard.html. Ver R6-13/14.
- Rebuild via build-island.sh + verificar hash + Ctrl+Shift+R (nunca bind-mount
  p/ ilha). Ver processo validado no CTXAGENTSCORE01 FASE 1.
- Fazer 1 TELA POR VEZ, fracionado. Navbar primeiro (menor risco), depois
  Licoes (mais usada), Manual, Projetos.
- Nao quebrar o que funciona: cada tela migrada testada isolada antes da proxima.

## Ordem sugerida (quando chegar a vez)
navbar -> licoes -> manual -> projetos. Manual pode ser gerado pelo agente
DOCUMENTADOR curado (conteudo) + esta tela (apresentacao).
