ID: L-B131-baileys-wrap-recursivo
TITULO: Mensagens WhatsApp via Baileys vem aninhadas em wrappers (ephemeral, viewOnce, etc)
CONTEXTO: B131 extractor antigo gerava [midia] porque parava no primeiro wrapper.
REGRA: Para extrair texto/caption de msg Baileys, desempacotar recursivamente: ephemeralMessage.message, viewOnceMessage.message, etc.
COMO_APLICAR: Loop while(msg.<wrapper>) msg=msg.<wrapper>.message. Sempre testar com viewOnce/ephemeral.
TAGS: whatsapp,baileys,extractor
ORIGEM: seed-historico-B248
DATA: 2026-06-27
