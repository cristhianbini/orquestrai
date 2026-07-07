ID: L-B246-compose-ro-flag
PROJETO: orquestrai
TITULO: Flag :ro no docker-compose torna mount somente-leitura — silencioso ate tentar escrever
CONTEXTO: B246 descobriu ./knowledge:/app/knowledge:ro impedia escrita de licao .md.
REGRA: Mounts que precisam de WRITE (KB que se auto-alimenta, data/, uploads/) NAO podem ter :ro no compose.
COMO_APLICAR: Auditar compose com 'grep :ro docker-compose.yml' e questionar cada um.
TAGS: docker,compose,permissions
ORIGEM: seed-historico-B248
DATA: 2026-06-27
