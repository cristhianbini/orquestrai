# L-OQSHELL01 — shell de abas com registry: adotar DOM, mount-1x/onShow-N, header fora do pane
PROJETO: orquestrai
DATA: 2026-07-12

Contexto: Rodada 8 etapa G — painel Configuracoes (r8SetModal) virou
oqShell generico (registry de abas) depois de 3 telas migradas no braco
(Provedores/Telemetria/Seguranca). Commits b9621af (G3a) e 276fb80 (G3b).

Padroes que funcionaram (reusar em telas futuras):
1. register({id,label,icon,accent,desc,mount,onShow}) ADOTA botao/pane
   estaticos do HTML quando existem, e so cria para abas novas. NUNCA
   recriar DOM por string ao mover tela existente — appendChild dos nos
   reais preserva referencias JS vivas (CTXFIXPROV01, licao do E3).
2. Contrato de carga: mount(paneEl) roda 1x; onShow() roda a CADA
   exibicao (reload-on-show) — dado fresco sem F5, guard por typeof
   quando o provider nasce em build tardio.
3. Cabecalho padronizado do pane vive FORA do pane: builds legados e
   reloads fazem pane.innerHTML=..., que apagaria qualquer coisa
   injetada dentro. Estrutura: .r8set-content = coluna flex com header
   fixo + wrapper .r8set-panes como scrollport.
4. Sticky dentro de pane migrado: recalibrar pro scrollport NOVO
   (padding/offset) e conferir se compensacoes (scroll-margin-top)
   apontam pro seletor vivo — a do B361 ficou morta 1 rodada inteira.
5. Alias de compat (oqSettings===oqShell) permite renomear API sem
   tocar callers inline.

Decisoes: fica INLINE no monolito (hook pre-commit ja quebrou .js 2x;
checador de blocos cobre); PROJETOS nao migra (modal dedicado);
candidatas: Manual/Licoes/Elenco, 1 por vez com gate da CBini.
