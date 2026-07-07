ID: L-B227-service-name-vs-container
PROJETO: orquestrai
TITULO: Service name no compose != container name
CONTEXTO: B227 falhou recreate porque chamou 'orquestrai-api' (container) ao inves de 'api' (service).
REGRA: docker compose comandos usam SERVICE name (do yml). docker run/exec/inspect usam CONTAINER name.
COMO_APLICAR: Descobrir com 'docker compose config --services' antes de up/recreate.
TAGS: docker,compose,naming
ORIGEM: seed-historico-B248
DATA: 2026-06-27
