# OrquestraAI - Conhecimento do Sistema

## Visao Geral
OrquestraAI e um cockpit humano-no-loop para operacao de sistemas em producao.
O humano coordena multiplas IAs para auditar, diagnosticar e modificar sistemas.
A IA propoe, o humano decide. Protocolo LAVE: Ler, Avaliar, Verificar, Executar.

## Infraestrutura Atual
- VPS: Hostinger KVM2 (Ubuntu 24.04, 2 vCPU, 8GB RAM, 200GB NVMe)
- IP: 76.13.166.207
- Dominio: orquestrai.cbini.com.br
- DNS: Cloudflare (DNS only, sem proxy)
- SSL: Let's Encrypt via Certbot

## Stack Tecnica
- Frontend: HTML/CSS/JS puro + Tailwind CDN + Iconify Lucide
- Backend: Node.js 20 (Express, ESM) rodando em container Docker
- Proxy: Nginx (SSL termination, gzip, security headers)
- Containers: Docker Compose (web, api, proxy)
- IA Ativa: GLM 5.2 (ZhipuAI) com modo pensamento

## Estrutura de Diretorios
/var/www/orquestrai/
  docker-compose.yml    # Orquestracao dos containers
  .env                  # Secrets (JWT_SECRET, GLM_API_KEY)
  nginx/proxy.conf      # Config do proxy reverso com SSL
  api/                  # Backend Node.js
    server.js           # API (login, chat, execute)
    Dockerfile          # Build da API
    package.json        # Dependencias
  src/                  # Frontend estatico
    index.html          # Tela de login
    dashboard.html      # Dashboard principal
    js/login.js         # Login real com API
    js/chat.js          # Chat com execucao de comandos
    js/                 # Outros scripts JS
  knowledge/            # Base de conhecimento (33 diretorios)
    README.md
    metas/              # Metas estrategicas
    pendencias/         # Sprint corrente
    licoes/             # Aprendizados imortais
    decisoes/           # ADRs assinados
    blocos/             # Blocos LAVE
    agentes/            # Conhecimento por papel
    gateways/           # Config de provedores
    avaliacoes/         # Score por IA
    custo/              # Rastreamento de custo
    skills/             # Habilidades importaveis
    workflows/          # Definicoes de workflow
    loops/              # Loops autonomos
    templates/          # Templates de projeto
    contextos/          # Contextos imortais
    prompts/            # Biblioteca de prompts
    contexto-cliente/   # Docs do cliente
    snippets/           # Codigo reutilizavel
    incidentes/         # Registro de incidentes
    audit-logs/         # Log de acoes
    sessoes/            # Historico de sessoes
  scripts/              # Scripts de automacao
  monitoring/           # Configuracao de monitoramento

## API Endpoints
POST /api/login       - Autenticacao (email + senha) -> JWT
GET  /api/me          - Verificar token -> dados do usuario
GET  /api/health      - Health check
POST /api/chat        - Chat com GLM 5.2 (requer JWT)
POST /api/execute     - Executar comando no servidor (requer JWT + role admin)

## Seguranca
- Comandos bloqueados: rm -rf /, mkfs, dd if=, shutdown, reboot, passwd, fork bomb
- Rate limit: 30 req/min por IP
- JWT com expiracao 24h
- UFW: apenas portas 22, 80, 443
- Fail2ban: 3 tentativas SSH = ban 1h

## Credenciais Atuais
- Login: admin@cbini.com.br / OrquestrAI@2025
- GLM API: ZhipuAI (glm-5.2 com thinking enabled)

## Licoes Aprendidas
- Node.js Alpine usa /bin/ash, nao /bin/sh (ver licoes/001-alpine-shell.md)
- Terminal do Linux trunca linhas longas - usar append (>>) em blocos pequenos
- Sempre verificar arquivos criados com heredoc (wc -l + tail)

## Protocolo LAVE
L (Ler): Leitura de estado, logs, diff. Kind=R. Automatico.
A (Avaliar): IA diagnostica, classifica risco, propoe acao. Automatico.
V (Verificar): Segundo bloco R confirma estado antes de acao. Automatico.
E (Executar): Acao aplicada com snapshot + rollback pronto. HUMANO aprova.

## Modos de Operacao
- Cauteloso: Humano aprova cada bloco. Padrao para producao.
- Auto-escopo: Humano pre-autoriza um escopo. Loop roda livre dentro da cerca.

## Roadmap
- Release 0.1: Cockpit + LAVE manual + execucao local (ATUAL)
- Release 0.2: Runner remoto, snapshots
- Release 0.3: Cadastro de provedores + workflows
- Release 0.4: Loops (paralelo, ReAct, auto-escopo)
- Release 0.5: RAG com sqlite-vss
- Release 0.6: Voz JARVIS
- Release 1.0: Multi-tenant, billing, GA
