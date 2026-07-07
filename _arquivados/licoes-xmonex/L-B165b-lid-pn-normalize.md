ID: L-B165b-lid-pn-normalize
TITULO: Baileys usa LID (Linked Device ID), mas API espera PN (Phone Number)
CONTEXTO: B165b47-52: msg never chegava porque LID nao casava com fila de PN normalizada.
REGRA: Sempre converter LID->PN antes de match. Normalizar telefone com DDI 55 para BR.
COMO_APLICAR: Funcao normalizeJid: strip :*@s.whatsapp.net, prefix 55 se faltando.
TAGS: whatsapp,baileys,jid
ORIGEM: seed-historico-B248
DATA: 2026-06-27
