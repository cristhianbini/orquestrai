---
tipo: licao-automatica
bloco: BLOCO-83
title: "Auto: Release 0.4 - Agentes"
sha256: 5fb71f3243b766fee7b1a347a79dafbcb3630dc2102ac9b465dc8c36d1c09f5d
created: 2026-06-29T04:59:53.518Z
---

# BLOCO-83 - Release 0.4 - Agentes

## O que ficou aprendido
Bloco LAVE persistido automaticamente para consulta futura.

## Script completo
~~~bash
set +e; set -H
KNOW_DIR="/var/www/orquestrai/knowledge"
FILE_PATH="$KNOW_DIR/roadmap.md"

mkdir -p "$KNOW_DIR"

if [ -f "$FILE_PATH" ]; then
  cp -a "$FILE_PATH" "$FILE_PATH.bak-$(date +%s)"
fi

cat > "$FILE_PATH" << 'EOF'
## Release 0.4 - Agentes
- [ ] Loop paralelo (fan-out/fan-in)
- [ ] Loop ReAct (condicional)
- [ ] Guardrails e cerca eletronica
- [ ] Kill-switch

## Release 0.5 - RAG
- [ ] Indexacao automatica da knowledge base
- [ ] Consulta antes de responder
- [ ] Nao repetir erros registrados em licoes/
- [ ] Embeddings com sqlite-vss

## Release 0.6 - JARVIS
- [ ] Wake-word "OrquestrAI"
- [ ] Whisper STT on-premise
- [ ] Piper TTS on-premise
- [ ] Voz so para leitura (nunca execucao)

## Release 1.0 - GA
- [ ] Multi-tenant
- [ ] Painel de billing
- [ ] DPA e LGPD
- [ ] Docs publicas
- [ ] Hardening total
EOF
~~~
