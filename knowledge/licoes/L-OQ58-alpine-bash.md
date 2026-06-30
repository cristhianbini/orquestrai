ID: L-OQ58-alpine-bash
TITULO: Container Alpine nao tem bash por padrao, scripts shebang #!/bin/bash falham
CONTEXTO: OQ58 LAVE backend quebrou em Alpine: /bin/bash not found.
REGRA: Em Alpine: usar #!/bin/sh OU instalar bash via apk add bash no Dockerfile.
COMO_APLICAR: Antes de escrever script para container, verificar base image. Preferir sh portavel.
TAGS: alpine,docker,shell
ORIGEM: seed-historico-B248
DATA: 2026-06-27
