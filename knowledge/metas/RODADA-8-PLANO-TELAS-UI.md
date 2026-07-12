PROJETO: orquestrai
TIPO: plano-de-sprint
CRIADO: 2026-07-11
STATUS: EM EXECUCAO (aprovado 2026-07-11; A3 = opcao i). Concluidos e
        validados pela CBini: E1a+E1b (5d352c0), E2 (ddd734a),
        E3+E3a-fix1 (04c3c34), E4a+E4b (validacao visual 12/07,
        commit E4d). Proximo: E5 (aba Seguranca)
CONECTA: ROADMAP-FUTURO.md item #8 (UI padrao janelas), CTXDESIGNGUIDE01
         (HANDOFF-POS-FABLE.md), TELEM01 (telemetria por projeto, 2026-07-11)

# RODADA 8 — Telas/UI: nav por icones + modal Configuracoes (rodada dupla)

Decisoes JA tomadas pelo Bini (congeladas, nao rediscutir):
- NAO e' redesign radical: reorganizacao de navegacao sobre o visual atual.
- Nav superior (PROJETOS/LICOES/MANUAL/AGENTES em texto) vira icones
  minimalistas com tooltip on-hover, centralizados na barra superior.
- Area nova "Configuracoes" (engrenagem): painel modal com sidebar de abas
  a esquerda, padrao visual Claude.ai (fundo escuro, abas a esquerda,
  conteudo a direita, X fecha).
- Abas: Provedores de IA, Telemetria/Uso, Seguranca. ESCOPO FECHADO
  (sem Conta/Perfil por enquanto).

---

## 1. ESTADO ATUAL (reconhecimento read-only 2026-07-11)

### 1a. Header/nav (dashboard.html ~1526-1534)
Botoes texto+emoji no canto direito do header (nao centralizados):
- `🚀 PROJETOS` (#proj-btn, projOpen) — abre wizard CTXPROJSCREEN01
- `📚 LICOES <n>` (#lic-card, licOpen) — painel de licoes com contador
- `📖 Manual` (#b83Btn, b83Open) — modal b83Manual
- `sair` (logout)
- `🤖 AGENTES` (#oq10ProvBtn) e' um botao FLUTUANTE separado (position
  fixed, right:10px) — NAO esta no header. Abre o modal oq10Prov.
CSS: sem classe .hdr-btn definida (so .chip/.btn genericos + inline style).

### 1b. Modal Provedores (oq10ProvModal) — o "quase-Configuracoes" que ja existe
Overlay click-fora-fecha + .oq10-shell (role=dialog) + header com titulo e
X + sub-barra de abas HORIZONTAL (b356-subhdr, adicionada via JS que MOVE
os nos reais — CTXFIXPROV01: mover com appendChild, NUNCA recriar por
string, senao quebra referencias js ja capturadas):
- PROVEDORES (chaves de API, teste de conexao — OpenAI etc ja configurado)
- MODELOS (selecao por posicao do elenco)
- AGENTES (elenco/cards + form do agw-modal)
- TELEMETRIA (telPane: investimento total/tokens/economia Q10 + barras por
  agente + card cru CUSTO POR PROJETO TELEM01-E4, adicionado 2026-07-11)
ROADMAP #8 diz "manter modal Provedores como esta" — decisao anterior a
esta rodada; ver secao 3 (A3) para o conflito e opcoes.

### 1c. Seguranca hoje
- tfa.html: pagina isolada "Ativar 2FA (TOTP)" (QR local, CTXAUTH2FA01).
- Login com senha (.env) + Turnstile + TOTP. Nao ha tela de status de
  seguranca no dashboard (2FA ativo? desde quando? regenerar?).

### 1d. Tokens de design (skill frontend-design NAO disponivel na VPS;
usar os tokens da casa — fonte da verdade e' o proprio dashboard):
`:root{--bg:#06080c; --panel:#0b1018; --line:#1a2230; --green:#7CFFB2;
--cyan:#7CE7FF; --amber:#FFD27C; --mute:#6b7a8c; --text:#cbd6e4}` +
JetBrains Mono + labels 10px monospace letter-spacing .08em (padrao dos
cards TELEMETRIA). Diretrizes CTXDESIGNGUIDE01: (1) conteudo dita o
layout — inventariar ANTES de codar cada aba; (2) alinhamento e'
prioridade #1 — mesmo gap/raio/tipografia entre abas.

### 1e. Fatos tecnicos que moldam a execucao
- dashboard.html: monolito com 71 blocos <script> inline. Typo em 1 bloco
  derruba o dashboard inteiro. Mitigacao ja validada na TELEM01-E4:
  checador de sintaxe (new Function por bloco, baseline vs editado).
- src/ e' bind-mount VIVO no container web: cada save vai direto pra
  producao. Mudanca visivel = construir OCULTO (display:none/flag) e
  ligar por ultimo, num passo proprio.
- Todo passo: .bak antes + L-BINDMOUNT nao se aplica (src/ e' diretorio,
  rename ok) + smoke visual pela CBini apos cada E.

---

## 2. TELAS — inventario exaustivo ate o "portal" completo (A4)

Legenda: [EXISTE] mantem como esta | [REFORMA] muda nesta rodada |
[NOVA] nasce nesta rodada | [FUTURA] fica para rodada posterior.

| # | Tela | Estado | Nesta rodada? |
|---|------|--------|---------------|
| T1 | Header/nav com icones centralizados | REFORMA | SIM (nucleo) |
| T2 | Modal Configuracoes (shell: overlay+sidebar+conteudo+X) | NOVA | SIM (nucleo) |
| T3 | Aba Provedores de IA (dentro de T2) | REFORMA (mover conteudo do oq10Prov) | SIM |
| T4 | Aba Telemetria/Uso (dentro de T2) | REFORMA (telPane + card TELEM01 estilizado) | SIM |
| T5 | Aba Seguranca (dentro de T2) | NOVA (status 2FA + link/embed do fluxo tfa.html) | SIM |
| T6 | Wizard PROJETOS | EXISTE | NAO (so ganha icone na nav) |
| T7 | Painel LICOES | EXISTE | NAO (so icone) |
| T8 | Modal MANUAL (b83) | EXISTE | NAO (so icone) |
| T9 | Elenco AGENTES (abas MODELOS/AGENTES do oq10Prov) | EXISTE | NAO (decisao A3 define onde mora) |
| T10 | Login/index + tfa.html | EXISTE | NAO (Seguranca T5 so APONTA para ele) |
| T11 | Telemetria com graficos/series temporais | FUTURA | NAO (depende de mais dados; roadmap #4) |
| T12 | Menu lateral estilo janelas (roadmap #8 completo) | FUTURA | NAO (esta rodada e' um passo NA DIRECAO dele) |

## 3. AVALIACAO (A) — pontos que precisam de decisao ou registro

### A1. Icones da nav (2-3 opcoes por item; todos SVG inline stroke,
padrao do icone de robo que ja existe no header — emoji atual e'
inconsistente entre OS/fontes; SVG e' o "minimalista" pedido):
- PROJETOS: (a) pasta, (b) grid 2x2 de janelas, (c) foguete (continuidade
  com o 🚀 atual). RECOMENDO (a) pasta — universal, e o foguete vira
  ruido quando reduzido a 16px.
- LICOES: (a) lampada, (b) livro aberto, (c) capelo. RECOMENDO (a)
  lampada + badge numerico (o contador atual e' util, manter como badge).
- MANUAL: (a) circulo com "?", (b) livro, (c) boia salva-vidas.
  RECOMENDO (a) "?" — distingue de LICOES-livro; "ajuda" e' o mental
  model universal.
- AGENTES: (a) rede de nos (3 circulos conectados), (b) robo (atual),
  (c) grupo de pessoas. RECOMENDO (a) rede — e' literalmente o mesh.
- CONFIGURACOES: engrenagem (decidido pelo Bini).
- sair: manter texto pequeno ou icone porta/seta — decidir no E1.
Tooltip: CSS puro (:hover + ::after com attr(data-tip)), sem lib.

### A2. Estrutura do modal Configuracoes: REAPROVEITAR o padrao oq10
(overlay + shell + head com X), trocando a sub-barra horizontal b356 por
SIDEBAR VERTICAL a esquerda (lista de abas, estilo Claude.ai). Nenhum
framework novo; mesmo idioma de pane on/off por data-attr que o b356 usa.

### A3. DECIDIDO pela CBini em 2026-07-11: opcao (i), congelada.
Configuracoes ABSORVE Provedores + Telemetria (mover os panes reais via
appendChild, padrao CTXFIXPROV01). MODELOS + AGENTES continuam no modal
oq10ProvModal antigo, REBATIZADO "Elenco", aberto pelo icone de rede da
nav. NAO TOCAR no form de Agentes (fragil, sem necessidade). Isso
SUBSTITUI a nota do roadmap #8 "manter modal Provedores como esta" —
o modal continua existindo, mas como Elenco, sem as abas absorvidas.
(Opcoes (ii) duplicar e (iii) absorver tudo: descartadas.)

### A4. Aba Telemetria/Uso vs card cru TELEM01-E4: MESMO dado, casa nova.
Fontes: GET /api/mas/telemetry (por agente) + /telemetry/projects (por
projeto). A aba apresenta os DOIS na apresentacao boa (cards de total +
tabela por projeto estilizada + barras por agente ja existentes). O card
cru e' SUBSTITUIDO pela versao estilizada quando a aba nascer — nao
coexistir, uma fonte visual so. Visao "mais detalhada" (por run, series
temporais) = T11 FUTURA, fora desta rodada.

---

## 4. WIREFRAMES TEXTUAIS

### T1 — Header (depois)
```
+----------------------------------------------------------------------+
| OrquestrAI v0.x · cockpit   [pasta][lampada·3][?][rede][engrenagem]  |
|                                            ● online  user@x   sair   |
+----------------------------------------------------------------------+
   icones centralizados, 18px, stroke var(--mute), hover var(--cyan)
   + tooltip embaixo; badge numerico so em LICOES.
```

### T2 — Modal Configuracoes (shell)
```
+------------------- overlay (click fora fecha) ----------------------+
|   +--------------------------- shell -------------------------+     |
|   | Configuracoes                                        [X]  |     |
|   | +-------------+  +------------------------------------+  |     |
|   | | Provedores  |  |                                    |  |     |
|   | | Telemetria  |  |   conteudo da aba selecionada      |  |     |
|   | | Seguranca   |  |   (pane on/off, scroll proprio)    |  |     |
|   | +-------------+  +------------------------------------+  |     |
|   +------------------------------------------------------------+   |
|     sidebar ~180px, aba ativa: fundo --panel + borda --cyan          |
+----------------------------------------------------------------------+
```

### T4 — Aba Telemetria/Uso
```
| [INVESTIMENTO TOTAL] [TOKENS] [ECONOMIA Q10]   <- cards que ja existem
| POR PROJETO                                    <- tabela TELEM01 c/ layout
|   projeto | runs | tokens | custo | ultima run    da casa (grid alinhado)
| POR AGENTE                                     <- barras existentes
```

### T5 — Aba Seguranca
```
| 2FA (TOTP)      [ATIVO desde ...]   [Reconfigurar -> tfa.html]
| Senha admin     definida via .env   (sem edicao aqui — so status)
| Sessao          token exp. em ...   [Encerrar sessao]
```
(dado cru dos endpoints que ja existem; nada de gestao nova de segredo)

---

## 5. ORDEM DE IMPLEMENTACAO + FRACIONAMENTO (proposta, ~7 E-steps)

- E1 — Icones da nav, fracionado em DOIS sub-passos (gate entre eles):
  - E1a (PILOTO, menor unidade testavel): CSS do tooltip (:hover +
    ::after attr(data-tip)) + classe .hdr-ico + converter SO o botao
    PROJETOS (emoji+texto -> SVG pasta + tooltip). Nada se move de
    lugar. Validacao visual da CBini no botao piloto ANTES de replicar:
    tamanho, cor hover, tooltip, clique abrindo o wizard como antes.
  - E1b (replicacao): LICOES (lampada+badge), MANUAL (?), AGENTES
    (rede — botao flutuante ENTRA pro header, rebatizado Elenco no
    title), sair; centralizar o grupo. So depois do OK no piloto.
  [risco baixo; reversivel .bak; checador de 71 blocos nos dois passos]
- E1c — REGISTRADO 12/07 (pedido CBini no smoke do E1b, fazer APOS E1):
  padronizar os botoes do bloco terminal (COLAR/CHAT, CLEAR, CONECTAR)
  no mesmo idioma visual dos icones do header (.hdr-ico), em tamanho
  menor — consistencia visual em toda a interface.
- E1d — REGISTRADO 12/07 (durante E3, NAO executar sem OK; CBini decide
  quando entra): reordenar icones do topo direito para (esq->dir):
  Perfil, Sair, Elenco, Provedores de IA, Manual, Licoes, Projetos,
  Preview, Cafe. ABERTOS a definir na hora: (a) inverte a decisao
  anterior "Avatar/Sair nas pontas da direita" — confirmar intencional;
  (b) "Provedores de IA" vira atalho proprio na nav (presumivel:
  window.oqSettings.open('provedores')); (c) "Cafe" e item NOVO sem
  funcao definida — perguntar o que abre/faz.
- NOTA DE DESIGN — REGISTRADA 12/07 (rodada futura de UI, nao nesta):
  modal Configuracoes esta pequeno (~880x560); Bini quer MAIOR, com
  mais espaco para o menu lateral + abas internas. Considerar junto
  com T12 (menu lateral estilo janelas).
- ACHADO E3c (12/07): .oq10-bar (status + Recarregar/Testar configurados)
  ja era display:none ANTES do E3 — ocultada por B343-POLISH e B356
  (regras globais) e B341D (escopada), decisao antiga "teste e por card".
  O E3a moveu um no invisivel (paridade, nao regressao). reload() so
  dispara via oq10Prov.open()/B367/salvar-chave — aba Provedores do
  Configuracoes precisa de gatilho proprio (fix E3a-fix1).
- E2 — Shell do modal Configuracoes OCULTO (engrenagem ainda invisivel):
  overlay+sidebar+panes vazios, padrao oq10. [risco baixo]
- E3 — Aba Provedores: MOVER pane real do oq10Prov (CTXFIXPROV01).
  [risco MEDIO — referencias js vivas; testar todos os fluxos de chave]
- E4 — Aba Telemetria/Uso: mover telPane + estilizar tabela por projeto
  (substitui card cru TELEM01-E4). [risco baixo]
  CONCLUIDO 12/07 (validacao visual CBini OK; commit E4d):
  - E4a: telPane movido para o pane 'telemetria' do Configuracoes; aba
    TELEMETRIA removida da sub-barra do Elenco (que vira so
    MODELOS+AGENTES, fechando a A3-i); carga sai do build-time para
    window.oqTelem.reload(), disparado pelo oqSettings.show('telemetria')
    a cada exibicao (mesmo idioma do E3a-fix1 — dados frescos sem F5);
    fallback body.appendChild se o shell E2 faltar; localStorage
    oq_agt_tab==='tel' salvo de antes cai em 'mod' (mesmo tratamento
    do 'prov' no E3a).
  - E4b: card cru TELEM01_E4_RAW substituido pela tabela POR PROJETO
    estilizada em slot proprio data-telem=TELEM01_PROJ ENTRE os cards
    e as barras por agente (ordem do wireframe T4; o append no final
    do pane saiu). Header maiusculo 10px, numericos alinhados a
    direita, custo em ambar #fbbf24, linhas com borda #14202e, estado
    vazio "sem runs com projeto ainda". Mantidos: cadeia
    buildTelPane->loadProjTelemRaw (race do innerHTML) e a garantia de
    slug seguro p/ innerHTML (validacao ^[a-z0-9-]{1,60}$ no backend).
  - Checador: 72 blocos, 0 erros (baseline .bak-r8e4a idem).
    .bak-r8e4a-20260712-0123 e .bak-r8e4b-20260712-0127 criados.
- E5 — Aba Seguranca (status 2FA + links). Precisa confirmar quais
  endpoints de status existem; se faltar, dado "cru" minimo. [baixo]
- E6 — LIGAR: engrenagem visivel no header; smoke completo da CBini.
- E7 — Docs/licoes/roadmap da rodada (padrao B6) + limpeza .bak.
Cada E: .bak + checador de 71 blocos + aprovacao CBini antes do proximo.

## 6. FORA DE ESCOPO (nao misturar)
- Conta/Perfil nas Configuracoes (decisao Bini).
- T11 telemetria com graficos/series; T12 menu lateral janelas completo.
- Qualquer mudanca de backend (os endpoints atuais bastam).
- Redesign de PROJETOS/LICOES/MANUAL alem do icone na nav.
- Mobile/responsivo alem do que o dashboard ja faz.
