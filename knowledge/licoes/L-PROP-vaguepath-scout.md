# L-PROP-vaguepath-scout
PROJETO: orquestrai

_Auto-promovida por Guardian em 2026-06-27T19:45:00.215Z_

ID: L-PROP-vaguepath-scout
TITULO: Inputs vagos ou curtos exigem SCOUT prévio
CONTEXTO: Usuário envia objetivo ambíguo ou curto (ex: "/mas", "/tmp", "x") que pode ser typo, path absoluto, flag ou variável de ambiente.
REGRA: NUNCA assuma operação direta (deploy, edição, deleção) baseando-se apenas no texto literal. Gere um bloco SCOUT (find/grep/read-only) para mapear e esclarecer o alvo real antes de qualquer ação destrutiva.
EVIDENCIA: BLOCO-SCOUT-MAS-001
