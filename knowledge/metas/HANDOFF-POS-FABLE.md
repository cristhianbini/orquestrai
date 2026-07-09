# HANDOFF — Estado pós-sessão Fable 5 (2026-07-07)
PROJETO: orquestrai
> Para Opus/Sonnet retomarem: leia INDICE-MESTRE-SPRINTS.md (fila S1-S25) e
> este arquivo (pendências finas). Regra de ouro: L-CTXHANDOFFVERIFY01 --
> verifique o estado pelo terminal, não confie só neste texto.

## RESOLVIDO nesta continuacao (nao refazer)
- Bug "usar reserva" (CTXUSARFIX02): slot promovido nascia com slug fake
  'pos9' -> lapis nao achava card + cor cinza. Fix: slug derivado do label
  (mesmo normalize do backend) + cor do card real. Testado: CRITICO promovido,
  lapis abre o card. Commit 84d7b2d/aafeec0.
- Layout da reserva: R# movido pra dentro do dot, labels longos nao cortam.
- Decisoes de arquitetura (R# relativo + pipeline por merito) registradas em
  META-CTXESTEIRA01.

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


## ADENDO — Sessao 2026-07-08 (Fable, continuacao)
### Fila imediata ATUALIZADA (substitui a anterior)
1. FIX METRICO (13.8 reprovado, mapa pronto): (a) clonar buildMemorialistaContext
   (mas/agents.mjs L253) -> buildMetricoContext injetando tokens_in/out,
   cost_usd, latency_ms REAIS por agente; (b) enxertar no loop L265-269
   (if ag.id==='metrico'); (c) descobrir nome real da var de results
   (grep retornou vazio p/ 'results.push' -- procurar como os done events
   sao acumulados); (d) adicionar clausula ao card: "Se os numeros nao
   estiverem disponiveis, escreva DADOS_INDISPONIVEIS -- NUNCA estime";
   (e) RESTART obrigatorio; (f) run de validacao: 2 linhas secas, zero bash,
   numeros batendo com o blackboard.
   EVIDENCIA da reprova: run mas_70fbd96f7e42 -- inventou "200tk/$0.00/0.3s/
   metrico mais pesado" quando o real era revisor 14.1k/$0.095.
2. FIX B246: mas/promote-lessons.mjs L50 retorna {skipped} e o evento done
   do memorialista grava vazio -- persistir o texto do modelo mesmo no skip.
3. 13.9 REVISOR (ultimo do S4) + decisao Q10 junto: $0.09/run em TODO run
   ou so runs com BLOCO executavel? (telemetria: revisor $2.05 em 22 runs
   vs smith $2.44 em 90).
### Novidades desta sessao (nao redescobrir)
- METAs novas: CTXROSTERUX01 (rebaixar+drag+UX modal), CTXPIPECLOSE01
  (#10 TESTADOR #11 VERIFICADOR), CTXSELFKNOW01 (tese autoconhecimento).
- CRITICO: treinado, card ok, REBAIXADO (agent_positions vazia = correto;
  titulares 1-9 vem do codigo; tabela e' so overrides, 0-based).
- 3 L-PROP aprovadas -> licoes/ (1o ciclo propor->guardian->humano->KB ok).
- LICAO DA REPROVA (vale p/ #11 VERIFICADOR futuro): agente de sintese L5
  SEM dado injetado = alucinacao garantida. Encanamento vem ANTES do prompt.
- DeepSeek + MiniMax: candidatos PENEIRA com $5-10 do Bini (comparativo
  preco/contexto/rate-limit/qualidade-PTBR pendente).

## ADENDO 2 — Continuacao 2026-07-08 (patch CTXMETRICTELEM01 + ideias Bini)
### Estado do patch (commit do codigo APOS validacao em run)
CTXMETRICTELEM01 aplicado em mas/agents.mjs (5 edits, backup .bak-telem-*):
__telem acumulador + __inj (memorialista=textual, metrico=tabela numerica)
+ enxerto no callLLM + guard morto B238 neutralizado. DESCOBERTA: B238 era
codigo morto ('results' nunca existiu) -- memorialista NUNCA recebeu run
summary; done vazio nao era bug do promote-lessons, era prompt sem material.
### Licao nova p/ KB: L-REPLACEDOLLAR01
String.replace() com substituicao contendo $' / $& / $` injeta pedacos do
proprio arquivo (footgun JS). Em patch programatico: replace(a, ()=>b) ou
split/join. Padrao consolidado dos patches: ancora unica + abort por
contagem (salvou o arquivo 3x nesta sessao).
### Ideias do Bini registradas (decisoes de produto)
1. REDESIGN DE TELAS (adendo S9-S11): padrao "Provedores de IA" (modal
   com abas SECAO) aprovado como referencia -- replicar p/ Manual, Licoes,
   Projetos. Telas separadas consistentes > hub centralizado. Fazer APOS
   S8/score (design com dado vivo > estetica com dado morto).
2. LOVABLE->GITHUB->VPS (adendo S20/S21/S25): OrquestrAI como plataforma
   de operacao da CBini. Projetos proprios: manual de exportacao padrao
   (estrutura de dirs, compose, README, envs) p/ chegar no formato ideal.
   Projetos de terceiros: BATEDOR + import GitHub reconhecem qualquer
   estrutura. Cada projeto em container proprio (S20) ou VPS dedicada.
   Modo automatizado de implantacao: so quando plataforma ~100%.
3. Sequencia mestre confirmada: S4 completo -> score -> PENEIRA
   (DeepSeek/MiniMax $5-10) -> L-SELF* -> redesign -> plataforma CBini.

## ADENDO 3 — Rodada 2026-07-08 (parte 2): ideias Bini + Q10 municiado
### Ideias registradas
1. QWEN 3.6 27B: 3o candidato PENEIRA (junto DeepSeek+MiniMax) -- Bini ouviu
   bom custo/beneficio. Comparativo dos 3: preco/1M, contexto, rate-limit,
   qualidade PT-BR. Entrada SEMPRE via PENEIRA com run padronizada.
2. DOCUMENTACAO VISUAL DO SCORE (adendo ao redesign S9-S11): quando as telas
   novas nascerem (padrao Provedores-com-abas), incluir tela/aba explicando
   COMO o score de cada agente e' pontuado -- formula visivel, interativa,
   moderna. Idem p/ fluxo da esteira, treinamento dos agentes, manuais.
   Principio: o operador deve COMPREENDER o sistema olhando pra tela
   (transparencia = confianca = CTXSELFKNOW01 na camada visual).
### Q10 municiado (decisao pendente do Bini)
127 runs / revisor 27x / \$2.54 / so 3 runs (2%) com bloco executado
(ressalva: mas_run_id e' novo, taxa real maior, mas mesmo 20% cortaria
~80% do maior custo). Proposta de implementacao quando decidir: revisor
condicional -- so convocado se smith produziu BLOCO executavel no run.

### CTXCHATUX01 — Chat narra, Mesh processa (ideia Bini 2026-07-08, refinada)
PROBLEMA: chat exibe 1 msg por agente = duplica o painel mesh (que ja mostra
status/tk/custo por agente ao vivo) e nao escala (26 agentes = 26 gritos).
DESENHO: chat = 5 marcos fixos (goal | pipeline iniciado | EXCECOES: veto/
erro | sintese do RELATOR | bloco pronto). O RELATOR curado no S4 ja E' a
voz oficial (1 frase + semver) -- o chat so precisa promove-lo. Detalhe por
agente: mesh (existe) + clique no card -> modal output completo (B339 ja
faz metade). Toggle 'modo verboso' p/ debug.
QUANDO: quick-win possivel antes do redesign (filtrar msgs de agente no
ponto de injecao SSE->chat = 1 condicional); versao completa junto S9-S11.

### CTXCHATUX01 refinamento 2 (Bini): rotulo do chat MENTE o modelo
BUG CONFIRMADO: toda msg de agente no chat sai carimbada com o MODELO ATIVO
do seletor do chat individual (ex. 'Claude Sonnet 4 5'), ignorando d.model
que JA CHEGA em cada evento SSE (bus.emit envia model real por agente).
Metrico rodou groq, auditor cerebras FREE -- chat disse Sonnet p/ tudo.
Mesma classe do confirm() mentiroso: dado certo viaja, apresentacao erra.
FIX (entra no quick-win CTXCHATUX01): marco no formato
'<emoji/cor do card> AGENTE · modelo-real' + texto. Persona = nome do
agente; cracha = modelo. Cor herdada do card (consistencia com mesh).

### CTXLEARNTEST01 — Teste de regressao de aprendizado (ideia Bini 2026-07-08)
CONCEITO: aprendizado so e' REAL se muda comportamento. Ciclo: erro ->
licao -> KB -> REPETIR O MESMO ESTIMULO -> medir se a resposta mudou.
E' a Fase 3 do harness que o codigo ja reservava ('reincidencia').
CASO DE TESTE INAUGURAL (ja engatilhado): perguntar de novo 'qual o nome
do sistema?' apos L-nome-sistema-nao-precisa-bloco entrar na KB --
sucesso = pipeline responde SEM gerar bloco (ou router nem aciona o MAS).
DESENHO FUTURO: suite de goals-gatilho (1 por licao critica) rodada
periodicamente; reincidencia detectada = licao nao absorvida = sinal de
KB scoring falho ou prompt fraco. Metrica: taxa de reincidencia por licao.
Conecta: PENEIRA (run padronizada e' o mesmo mecanismo), Fase 2 score,
CTXSELFKNOW01 (a prova final do autoconhecimento e' nao repetir o erro).

### ACHADO CRITICO fim-de-rodada (2026-07-08): gate B271 bypassado desde sempre
Frontend L1613 manda mas_mode:true HARDCODED em toda msg -> masModeExplicit
sempre true -> classifyIntent NUNCA consultado. Patch CTXROUTER01 (triggers)
esta correto e no ar, mas inerte. FIX (proxima rodada, 1a fracao): remover
o hardcode ou ligar a toggle real; VALIDACAO = 1o CTXLEARNTEST01 (repetir
'nome do sistema na VPS' -> deve responder via quickChat ~\$0.001).
Defesa em profundidade 3 aneis: porta(router, fix pendente) + meio(SMITH
nao gerar bloco p/ fato consolidado -- licao ja na KB) + fim(Q10, ok).

### CTXEARLYEXIT01 — Early-exit do pipeline (ideia Bini 2026-07-08)
'Se a resposta ja sair no batedor, nao tem porque os outros seguirem.'
Diferente do router (decide NA PORTA): early-exit decide DURANTE o run.
Desenho candidato: apos scout/auditor, um check barato (haiku ou heuristica)
avalia 'o goal ja esta respondido?' -- se sim, pula direto p/ relator
(sintese) + memorialista (licao) e encerra. Smith/guardian/revisor so
rodam se ha algo a CONSTRUIR. Conecta com Q10 (mesma familia: convocacao
por necessidade) e com a matematica do Bini: pergunta de \$0.19 viraria
~\$0.04 (scout+auditor+relator). PRE-REQUISITO: validar CTXROUTER01-fix
primeiro (a porta resolve 80% dos casos; early-exit pega o resto).
### CORRECAO de honestidade: commit 3c8ddd7 disse 'CTXLEARNTEST01 VALIDADO'
mas a run da evidencia era PRE-fix (mas_663ec anterior ao patch). O teste
real: repetir a pergunta POS Ctrl+Shift+R. Registrado p/ nao enganar o futuro.

### CTXDESIGNGUIDE01 — Diretrizes visuais do redesign (Bini 2026-07-08)
1. CONTEUDO DITA O LAYOUT: cada tela (Manual, Projetos, Licoes, Telemetria)
   tem volume de informacao diferente -- o design nasce do inventario do
   conteudo, nao o contrario. Antes de codar cada aba: listar O QUE precisa
   caber, DEPOIS escolher grid/densidade.
2. ALINHAMENTO E' PRIORIDADE #1 declarada: 'bem encaixado, bem alinhado
   principalmente'. Grid consistente entre abas (mesmo gap, mesmo raio,
   mesma tipografia de label) -- padrao ja aprovado: tela AGENTES (cards
   coloridos, dots numerados, badges).
3. REFERENCIA CANONICA: modal Provedores (b356: barra SECAO + panes) e o
   mesh lateral (cards com cor por agente). Toda tela nova herda esses tokens.
4. VOLUMES CONHECIDOS p/ planejar: Manual (longo, precisa de indice/scroll),
   Licoes (100 itens, precisa busca+filtro), Projetos (poucos, cards
   grandes), Telemetria (9-11 agentes + 3 resumos, cabe sem scroll).

### CTXCLEANURL01 — URL limpa (ideia Bini 2026-07-08)
'dashboard.html na barra da a impressao de sistema feito so de HTML.'
DESEJO: orquestrai.cbini.com.br/ (raiz) em qualquer tela.
FIX (barato, nginx): location = / { try_files /dashboard.html ... } ou
rewrite interno -- o arquivo continua onde esta, a URL fica limpa; +
redirect 301 de /dashboard.html -> / (links antigos nao quebram).
ATENCAO: validar que assets relativos (favicon.svg, /api/*) seguem
funcionando; e' mudanca de NGINX (fora do container da API), fracao
propria com backup do conf + nginx -t antes do reload.
BONUS futuro: quando vierem telas separadas (manual/projetos/licoes),
rotas limpas /manual /projetos /licoes via mesmo mecanismo -- o sistema
passa a ter cara de app, nao de pasta de arquivos.

## FECHAMENTO 2026-07-08 (rodadas 1+2+3 -- dia recorde)
### Entregue e VALIDADO em producao
S4 9/9 | S5+S6 | Trilogia da economia 3/3 (chat limpo CTXCHATUX01-v2 +
Q10 revisor condicional + porta CTXROUTER01-fix2 texto puro) |
S8 v1 NO AR (aba TELEMETRIA: 3 cards-mestre + ranking salarial + economia
Q10 visivel + score-- reservado) | endpoint /api/mas/telemetry |
CTXLEARNTEST01 inaugurado (janela anonima, \$0.19 -> \$0.001) |
9 licoes aprovadas (KB=100) | favicon | confirm() honesto.
### Fila da proxima sessao (ordem)
1. Polir TELEMETRIA: auto-refresh ao abrir aba, clique no agente ->
   detalhe (ultimas runs dele), tooltip nas barras.
2. Cosmeticos do router: 'iniciando agentes' antes do fetch em modo chat
   (mover pushChat p/ depois da decisao) + quickChat com manifesto no
   system prompt (responderia 'OrquestrAI' em vez de instruir comandos).
3. Console limpo: insertBefore (L1318) + send is not defined (L1473/3609).
4. CTXCLEANURL01 (nginx try_files, fracao propria com nginx -t).
5. Fase 2 do Score -- PERGUNTA ABERTA AO BINI: o que e' 'sucesso' de run?
   (bloco executado? aprovado? sem retrabalho?) A formula nasce da resposta.
6. Telas irmas: LICOES (100 itens = busca+filtro obrigatorios), MANUAL
   (indice+scroll) -- padrao b356, diretrizes CTXDESIGNGUIDE01.
### Backlog vivo (nao esquecer)
CTXEARLYEXIT01 (resposta no meio = encerra) | PENEIRA + DeepSeek/MiniMax/
QWEN \$5-10 | CTXBLOCONUM01 | CTXPIPECLOSE01 (#10/#11) | L-SELF* |
CTXLEARNTEST01 suite completa | ADMIN_PASSWORD placeholder (primo do A8).

## HANDOFF CHAT 7 -> CHAT 8 (2026-07-09)
### Estado REAL da tela LICOES (leia antes de mexer!)
- Backend PRONTO e VALIDADO: /api/licoes/list filtra BLOCO-* (80 limpas),
  GET /read/:id criado (sanitizado, \n literais tratados). NAO refazer.
- Frontend: render premium (CTXLICPREMIUM01) esta NO ARQUIVO dentro do
  openModal do B258 -- mas o B258 NUNCA ganha o clique. O botao real do
  header (#lic-card, L1491) chama licOpen(); o chip (#lic-chip, script
  L3015) tem sync com setInterval(2500) que REPINTAVA a lista crua.
- Tentativa CTXLICFIX01 (wrapper global) REVERTIDA: o fechamento do
  wrapper usou ancora '}; });' que era unica NO ARQUIVO mas nao
  necessariamente no script certo -- licPremiumRender ficou undefined
  (script morre em runtime). Backup: .bak-licfix-*.
### O FIX CERTO p/ o Chat 8 (desenho pronto, so executar com calma)
1. Localizar a funcao licOpen() REAL (grep -n "function licOpen").
2. Extrair o corpo premium do B258 p/ um <script> NOVO e independente
   (id proprio, ex CTXLIC2), definindo window.licPremiumRender la --
   sem wrapper por ancora textual: script novo inteiro, colado antes
   do </body>, com o codigo ja pronto no B258 como fonte.
3. licOpen() e o chip chamam window.licPremiumRender(mlist).
4. Manter o poll do L3015 SO como contador (o edit A do CTXLICFIX01
   estava CERTO -- reaplicar so ele).
LICAO: L-SINGLEOWNER01 (3 scripts donos do mesmo modal = ultimo interval
vence) + L-WRAPPERANCHOR01 (nunca fechar funcao por ancora textual --
criar script novo inteiro e' mais seguro que envolver codigo existente).
### Rodada de hoje (Chat 7 parte 2) -- ENTREGUE
b358 duplicada desativada | cabecalho premium CTXPROJSCREEN01 no wizard |
CTXLICCLEAN01 backend (80 licoes limpas) | GET /read/:id | inventario
completo PROJETOS Fase A (S20/S21/S25 + multi-cloud + Lovable->GitHub)
### PROJETOS Fase A (a tela que o Bini mais espera) -- desenho fechado
Cards mini-cockpit (nome/stack/container/custo/deploy) + secao EM BREVE
honesta: Import GitHub (S25) | Container isolado (S20) | VPS dedicada
(multi-cloud) | DNA de projeto (S21) | Deploy automatizado (~100%).

## HANDOFF CHAT 8 -> CHAT 9 (2026-07-09)
### ENTREGUE nesta rodada
1. LICOES premium NO AR: CTXLIC2 (script novo antes do </body>, dono
   unico -- redefinicao de licOpen vence B265/B268 por ordem de carga).
   Causa raiz achada: licOpen definida 2x + premium do B258 apontava p/
   #lic-modal-list que NAO EXISTE no DOM (nunca rodou). Chip b169 virou
   contador puro e delega clique. Busca+filtros familia funcionando.
2. CTXPROJPERSIST01: /api/projects agora persiste em DISCO
   (projects/{slug}/project.json, escrita atomica tmp+rename, 409 p/
   duplicata). O Map em memoria do B315 perdia TUDO a cada restart e o
   wizard prometia gravar mas a rota nunca gravava. PROVADO: projeto
   sobreviveu a docker compose restart. Dir orfao projectsRoutes.cjs/
   (raiz) removido -- fonte real e api/projectsRoutes.cjs.
3. CTXPROJ2: tela PROJETOS Fase A no ar -- lista mini-cockpit +
   '+Novo Projeto' (wizard B273 intacto como 2a camada) + EM BREVE
   honesto (S25/S20/multi-cloud/S21/deploy).
### LICOES da rodada
- L-BUSYBOXLOCALHOST01: busybox wget resolve localhost -> ::1 (IPv6);
  node escuta 0.0.0.0 (IPv4). Healthcheck em container SEMPRE 127.0.0.1.
- L-ACTIVEWAIT01: pos docker compose restart, espera ATIVA com retry
  (for+wget+sleep 2), nunca sleep fixo -- sleep 4 deu falso negativo.
- Padrao dono-unico consolidado (CTXLIC2/CTXPROJ2): script novo
  independente antes do </body> captura/redefine o global; nunca
  wrapper por ancora, nunca editar script legado por dentro.
### PROXIMOS PASSOS sugeridos
- GET /api/projects esta SEM auth pela borda (herdado do B315) --
  avaliar na proxima passada de seguranca.
- Wizard dispara /api/mas/run mas o run nao vincula projeto (prompt
  solto) -- quando S21/DNA chegar, amarrar run <-> slug.
- MEMORIALISTA context budget continua aberto (da rodada anterior).
- Fase B da tela: acoes por card (abrir docs/, disparar mesh do
  projeto, arquivar) -- so quando houver projeto real de uso.

## HANDOFF CHAT 8 -> CHAT 9 (2026-07-09) — VERSAO FINAL DA SESSAO
### ENTREGUE
1. LICOES premium (CTXLIC2 dono unico + CTXLIC3 badge de familia por card).
2. /api/projects persiste em DISCO (CTXPROJPERSIST01, provado em restart);
   dir orfao projectsRoutes.cjs/ da raiz removido; fonte = api/projectsRoutes.cjs.
3. Tela PROJETOS Fase A (CTXPROJ2: lista mini-cockpit + EM BREVE honesto) +
   contador no header (CTXPROJCOUNT01) + wizard premium (CTXWIZ1 stack/db em
   cards; CTXWIZ2 Confirmar = card-preview identico ao da lista).
4. GOVERNANCA: PROTOCOLO-ANTICONTAMINACAO (PARE TUDO) + L-CONTAMINACAO01 +
   DECISAO-XMONEX-EXPURGO (censo completo; ativo=zero; antidoto+historico
   preservados). Protocolo JA PEGOU 1 caso real na 1a execucao (oq288
   semeava xmonex/hello-world-vps no seletor -> CTXPROJSEL01 sincroniza
   com /api/projects). 4 docs do Project Knowledge classificados
   NAO-CANONICOS (EscopoV6.0, Mega-Brain, Evolucao Colaborativa, AIOX).
5. Dogfooding: projects/orquestrai/project.json (status producao) e o 1o card.
6. Roadmap absorveu do Plano Mestre CBini v3.0 SO padroes: CTXDNA01(=S21),
   CTXIMPORT01(!=CTXRAG01, =S25), CTXOPSCHECK01 (TESTE RESTORE LITESTREAM
   PENDENTE — risco alto), gatilho duro p/ S20. Numeracao S* -> CTX*.
### INCIDENTE DA SESSAO (resolvido, licoes na KB)
CTXPROJSEL01 foi injetado DENTRO do comentario do CTXPROJ2 (comentario
continha token literal de fechamento de body; replace 1a ocorrencia sem
re-contar). Tela PROJETOS regrediu ao wizard; consertado (CTXFIXBODY01).
Licoes: L-ANCORACOMENT01 (unicidade se verifica A CADA insercao; comentarios
sem tokens estruturais; validacao = visao-do-browser com simbolo-chave) +
L-BASHHIST01 (patch NUNCA via node -e inline; sempre arquivo heredoc 'EOF').
### PENDENTE P/ CHAT 9
- E2E do wizard: criar lab-teste PELO BROWSER (cobaia p/ S20/DNA) — o Bini
  ia fazer ao fim da sessao; conferir projects/lab-teste/project.json.
- Polir passo 1 (Nome) do wizard p/ fechar uniformidade visual.
- Fase B da tela PROJETOS: clique no card abre painel de detalhes.
- GET /api/projects sem auth pela borda (avaliar); MEMORIALISTA context
  budget (aberto desde Rodada 6); teste de restore do Litestream (URGENTE).

## ADENDO FINAL CHAT 8 (2026-07-09, encerramento)
### E2E COMPLETO PROVADO (1a vez na vida do sistema)
lab-teste criado PELO BROWSER: wizard premium -> POST -> disco -> mesh
9 agentes ate o REVISOR -> card na lista -> seletor namespaceia blocos
(Bini validou: trocar p/ lab-teste trocou os BLOCOs do cockpit).
Mesh PROPOS LICAO SOZINHO (L-PROP-audit-cascata-scout-guardian, pre-aprovada
pelo Guardian, aguardando curadoria do Bini em _pending). Placar do
aprendizado: 9 licoes APROVADAS ciclo completo + 1 pendente.
### GAP CONFIRMADO COM PROVA (prioridade do CTXDNA01)
projects/lab-teste/docs/ VAZIO: o mesh gera o plano mas nao grava no
projeto — run nao conhece o slug, agentes nao tem canal de escrita em
projects/. Requisito nº1 do vinculo run<->projeto: (a) /api/mas/run aceita
{project_slug}, (b) saida do ARQUITETO/RELATOR persiste em
projects/{slug}/docs/. Sem isso a esteira trabalha mas nao entrega.
### FASE B DA TELA PROJETOS (espec refinada com o Bini)
Clique no card -> painel: descricao/features completas + arquivos de docs/
+ botao ATIVAR NO COCKPIT (seta oq_proj_current+reload, via UI o que o
seletor ja faz) + botao PREVIEW p/ static-html (alias nginx
/projects/{slug}/ -> nova aba) + caminho no disco.
### FIX DA SESSAO (pos-handoff anterior)
CTXWIZ3: submit do wizard sem await no mesh (botao ficava "Criando..."
pelos minutos do pipeline — visto no 1o E2E); modal fecha, mesh em
background, lista reabre com o card.
### LIXEIRA DO HEADER (avaliada, decisao p/ chat 9)
oq-proj-trash (L3653): remove projeto do seletor + blocos do localStorage.
PROBLEMA: nao toca projects/{slug}/ no disco nem a API — pos-CTXPROJSEL01
o projeto "removido" RESSUSCITA no proximo sync. Fase B deve unificar:
arquivar de verdade (API move p/ _arquivados) ou remover o botao.

## ADENDO 2 CHAT 8 (2026-07-09, fechamento do expediente estendido)
### ENTREGUE na extensao
- CTXTRASH01: lixeira B289 removida (decisao Bini: historia do projeto e sagrada).
- CTXPROJRUN01 f1: run<->projeto PROVADO (plano-{runid}.md gravado em docs/).
- CTXGOALFIX01: BUG HISTORICO -- wizard enviava {prompt}, rota le goal; todo
  mesh de projeto rodava 'Auditoria geral rapida' desde o B273. Corrigido;
  AINDA NAO REVALIDADO com projeto novo (fazer lab-teste-3 no chat 9).
- CTXPROJDOCS01: GET /:slug (detalhe+docs) e /:slug/docs/:file (anti-traversal).
- CTXPROJCARD01+V2: cards com rodape grid FIXO 3 colunas (docs N/ativar|ativo/
  excluir; cockpit='fixo'), badge 'mesh trabalhando' (docs=0+<15min), desc 1
  linha ellipsis, visualizador de docs inline.
- CTXPROJDEL01: DELETE com quarentena (_arquivados), orquestrai imune,
  {confirm:slug} obrigatorio. PROVADO: 400/403/200 via node fetch.
- Licao L-BUSYBOXVERBS01 (wget so GET/POST; DELETE/PUT = node fetch;
  saida tipo usage = comando NEM RODOU).
### GOSTO DO BINI (aplicar em toda UI futura)
Alinhamento rigido (grids fixos) | frases 1 linha | menos texto mais botoes |
acoes rapidas visiveis no card | confirmacao digitada p/ acao irreversivel.
### PROXIMO GRANDE PASSO (pedido explicito do Bini, empolgado p/ ver)
CTXPROJRUN02 (fracao 2): mesh MATERIALIZA CODIGO no projeto --
p/ goal BUILD + stack static-html, SMITH gera index.html e o run persiste
em projects/{slug}/site/ (mesmo mecanismo provado do f1). DEPOIS disso:
botao PREVIEW no card (alias nginx /projects/{slug}/ -> nova aba).
CUIDADOS: prompt do SMITH muda (Guardian deve validar codigo destinado a
disco); escrita atomica; nunca sobrescrever site/ existente sem versionar.
NAO criar o botao Preview antes do conteudo existir (sem mentira na UI).
### ABERTOS (herdados)
E2E do goal fix (lab-teste-3) | passo 1 do wizard | GET /api/projects sem
auth | MEMORIALISTA context budget | TESTE RESTORE LITESTREAM (o mais
critico da fila -- nao deixar p/ depois de novo).

## ADENDO 3 CHAT 8 — pergunta do Bini vira requisito do S20 (terminal por projeto)
ESTADO ATUAL (sem ilusao): seletor de projeto muda SO o namespace dos BLOCOs
no localStorage; o terminal (oqterm, /opt/oqterm:7654) e SEMPRE um PTY root
na VPS inteira, independente do projeto ativo. Nao ha isolamento hoje.
Aceitavel enquanto: 1 operador (Bini) + mesh NUNCA toca o PTY (agentes so
geram BLOCO; humano executa -- gate LAVE e a protecao real).
REQUISITO NOVO DO S20 (container por projeto):
1. Terminal de projeto = docker exec no container do projeto: usuario
   nao-root, ve so /app do projeto, sem docker socket, sem rede p/ outros
   containers alem do necessario.
2. Terminal root de admin continua existindo mas SEPARADO e rotulado
   explicitamente na UI ("VPS - root" vs "{slug} - container").
3. REGRA DE OURO: automacao (mesh/runs/deploy) jamais usa PTY -- canais
   proprios com validacao do Guardian.
4. UI: ao trocar projeto no seletor, o painel TERMINAL deve indicar o
   escopo atual (evitar a ilusao de que ja esta isolado -- sem mentira na UI).
