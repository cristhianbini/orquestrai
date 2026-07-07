---
tipo: licao-automatica
bloco: BLOCO-20
title: "Auto: Tenta encontrar o diretorio (verifica root / primeiro, depois busca geral)"
sha256: d94439892463bb9a2dd37dc17fab86dbac838da84b5e056227bc21fb2b477119
created: 2026-06-23T00:44:10.354Z
---

# BLOCO-20 - Tenta encontrar o diretorio (verifica root / primeiro, depois busca geral)

## O que ficou aprendido
Bloco LAVE persistido automaticamente para consulta futura.

## Script completo
~~~bash
set +e; set +H

# Tenta encontrar o diretorio (verifica root / primeiro, depois busca geral)
if [ -d "/xmonex-teste" ]; then
  TARGET_DIR="/xmonex-teste"
else
  TARGET_DIR=$(find / -maxdepth 4 -type d -name "xmonex-teste" 2>/dev/null | head -n 1)
fi

if [ -z "$TARGET_DIR" ]; then
  echo "ERRO: Diretorio 'xmonex-teste' nao encontrado."
  exit 1
fi

echo "Diretorio Localizado: $TARGET_DIR"
echo "Listando arquivos .bkp:"
find "$TARGET_DIR" -maxdepth 1 -type f -name "*.bkp" -exec ls -lh {} \;
~~~
