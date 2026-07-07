ID: L-B226-env-file-restart
PROJETO: orquestrai
TITULO: .env nao recarrega com docker restart, exige force-recreate
CONTEXTO: B226 atualizou chaves API no .env do host mas container via 0 chars ate force-recreate.
REGRA: env_file e injetado na criacao do container. docker restart NAO relê. Use 'docker compose up -d --force-recreate <service>'.
COMO_APLICAR: Sempre validar com 'docker exec <c> sh -c "echo \$VAR | wc -c"' que variavel chegou ANTES de testar API.
TAGS: docker,env,compose
ORIGEM: seed-historico-B248
DATA: 2026-06-27
