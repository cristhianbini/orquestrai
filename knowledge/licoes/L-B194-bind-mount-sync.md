ID: L-B194-bind-mount-sync
TITULO: Arquivo bind-mounted no container nao reflete edicoes do host sem restart
CONTEXTO: Editar mas/agents.mjs no host nao atualiza container ate docker restart. Para .env precisa force-recreate.
REGRA: Apos editar arquivo bind-mounted: docker restart <container>. Apos editar .env ou env_file: docker compose up -d --force-recreate <service>.
COMO_APLICAR: Validar com 'docker exec <c> cat <path>' que mudanca chegou, ANTES de testar comportamento.
TAGS: docker,mount,env
ORIGEM: seed-historico-B248
DATA: 2026-06-27
