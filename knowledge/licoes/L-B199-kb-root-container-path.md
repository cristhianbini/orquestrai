ID: L-B199-kb-root-container-path
TITULO: KB_ROOT no codigo deve refletir path DO CONTAINER, nao do host
CONTEXTO: B198 funcionou em dev local mas B199 revelou que dentro do container KB_ROOT=/app/knowledge, nao /var/www/orquestrai/knowledge.
REGRA: Toda referencia de filesystem em codigo que roda em container deve usar path do container (geralmente /app/*).
COMO_APLICAR: Validar com 'docker exec <c> ls <path>' antes de assumir.
TAGS: container,filesystem,kb
ORIGEM: seed-historico-B248
DATA: 2026-06-27
