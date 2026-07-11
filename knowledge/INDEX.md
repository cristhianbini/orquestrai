# INDEX OrquestrAI KB

Total: 114 arquivos em licoes/ (inclui BLOCO-* auto-gerados; ~80 lições curadas).

> Reconciliado 2026-07-11: contagem antiga (41) estava desatualizada. A lista
> abaixo também está defasada — regeneração automática do índice pendente
> (item de higiene, Sprint 6).

## Licoes
- **001-alpine-shell** —  `[]`
- **BLOCO-0037486C-20260622-050227** —  `[]`
- **BLOCO-1-pe-a-algo-no-chat-a-ia-gera-um-bloco-rea-20260622-050630** —  `[]`
- **BLOCO-17-busca-o-diret-rio-xmonex-teste-em-locais-20260623-003550** —  `[]`
- **BLOCO-20-tenta-encontrar-o-diretorio-verifica-roo-20260623-004410** —  `[]`
- **BLOCO-26D6B63E-20260622-050020** —  `[]`
- **BLOCO-34-verificar-se-a-conex-o-ssl-tls-est-funci-20260623-031655** —  `[]`
- **BLOCO-35-usr-bin-env-bash-20260623-032106** —  `[]`
- **BLOCO-39-bloco-audit-drift-backend-audita-drift-e-20260623-034033** —  `[]`
- **BLOCO-43-bloco-list-dir-001-listar-diret-rio-atua-20260623-041033** —  `[]`
- **BLOCO-51-backup-apenas-se-ainda-n-o-existir-um-ba-20260627-023108** —  `[]`
- **BLOCO-53-npm-install-xterm-ou-verifique-se-j-est--20260627-023412** —  `[]`
- **BLOCO-54-scout-investigar-endpoints-de-upload-e-s-20260627-023532** —  `[]`
- **BLOCO-63-bloco-diagnostic-vps-diagn-stico-complet-20260627-032325** —  `[]`
- **BLOCO-9DC86A9E-20260622-050341** —  `[]`
- **BLOCO-A2F28E46-20260622-050309** —  `[]`
- **BLOCO-DBC71707-20260622-045954** —  `[]`
- **L-B109-comentario-parcial-quebra** — Comentar parcialmente JSX/TSX deixa tags orfas e quebra build `[tsx,jsx,build,comentarios]`
- **L-B131-baileys-wrap-recursivo** — Mensagens WhatsApp via Baileys vem aninhadas em wrappers (ephemeral, viewOnce, etc) `[whatsapp,baileys,extractor]`
- **L-B141-css-selector-fragil** — Selector CSS errado quebra MutationObserver inteiro `[dom,selector,debug]`
- **L-B165b-lid-pn-normalize** — Baileys usa LID (Linked Device ID), mas API espera PN (Phone Number) `[whatsapp,baileys,jid]`
- **L-B194-bind-mount-sync** — Arquivo bind-mounted no container nao reflete edicoes do host sem restart `[docker,mount,env]`
- **L-B199-kb-root-container-path** — KB_ROOT no codigo deve refletir path DO CONTAINER, nao do host `[container,filesystem,kb]`
- **L-B226-env-file-restart** — .env nao recarrega com docker restart, exige force-recreate `[docker,env,compose]`
- **L-B227-service-name-vs-container** — Service name no compose != container name `[docker,compose,naming]`
- **L-B235-sed-paren-hell** —  `[]`
- **L-B235-sed-parenteses** — sed com aspas e parenteses gera SyntaxError silencioso em JS `[sed,javascript,patch,syntax]`
- **L-B236-backup-restore-pattern** — Backup .bak ANTES de qualquer patch destrutivo permite rollback rapido `[backup,rollback,seguranca]`
- **L-B243-guardian-vs-memorialista** — Guardian valida codigo, Memorialista valida conhecimento — papeis ortogonais `[mas,kb,promocao,papeis]`
- **L-B244-sqlite-wal-flush** — Hook que le sqlite imediatamente apos write pode pegar 0 rows (WAL nao flushado) `[sqlite,wal,race,hook]`
- **L-B246-compose-ro-flag** — Flag :ro no docker-compose torna mount somente-leitura — silencioso ate tentar escrever `[docker,compose,permissions]`
- **L-B70-mutationobserver-loop** — MutationObserver em document.body com subtree gera loop infinito `[dom,observer,loop,dashboard]`
- **L-B82k-pageheader-ssr** — Componentes complexos com hooks de client quebram SSR/build `[ssr,nextjs,react]`
- **L-LAVE-protocolo** — Protocolo LAVE humano sempre executa `[lave,protocolo,seguranca]`
- **L-OQ58-alpine-bash** — Container Alpine nao tem bash por padrao, scripts shebang #!/bin/bash falham `[alpine,docker,shell]`
- **L-OQ65-executar-body** —  `[]`
- **L-OQ66-sse-token** —  `[]`
- **L-PROP-safe-bak-cleanup** — Política de retenção e validação prévia para remoção de arquivos .bak `[]`
- **L-XMonex-mesmo-numero-loop** — Bot WhatsApp no mesmo numero do usuario gera loop 515 stream conflict `[whatsapp,arquitetura,bot]`
- **L-bloco-ordem-array** — Blocos append-only no array BLOCKS `[ux,blocos,ordem]`
- **L-router-mount-ordem** — Rotas Express especificas antes de fallback 404 `[express,router,ordem]`
