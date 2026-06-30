---
tipo: licao-automatica
bloco: BLOCO-17
title: "Auto: Busca o diretório xmonex-teste em locais comuns (/var/www, /home) e lista os .bkp"
sha256: 1c6750ab4ffa7e68a6204c2d388ea9d34148026ea6c47fdc72216ac7a9a59300
created: 2026-06-23T00:35:50.848Z
---

# BLOCO-17 - Busca o diretório xmonex-teste em locais comuns (/var/www, /home) e lista os .bkp

## O que ficou aprendido
Bloco LAVE persistido automaticamente para consulta futura.

## Script completo
~~~bash
set +e; set +H
# Busca o diretório xmonex-teste em locais comuns (/var/www, /home) e lista os .bkp
SEARCH_PATHS="/var/www /home /opt"
TARGET_DIR=$(find $SEARCH_PATHS -maxdepth 4 -type d -name "xmonex-teste" 2>/dev/null | head -n 1)

if [ -n "$TARGET_DIR" ]; then
  echo "[LAVE] Diretorio encontrado: $TARGET_DIR"
  find "$TARGET_DIR" -type f -name "*.bkp" -exec ls -lh {} \;
else
  echo "[LAVE] Diretorio 'xmonex-teste' nao encontrado nos caminhos definidos."
  # Fallback caso esteja exatamente na raiz (incomum)
  if [ -d "/xmonex-teste" ]; then
     echo "[LAVE] Encontrado na raiz: /xmonex-teste"
     find "/xmonex-teste" -type f -name "*.bkp"
  fi
fi
~~~
