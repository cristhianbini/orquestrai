ID: L-B235-sed-parenteses
TITULO: sed com aspas e parenteses gera SyntaxError silencioso em JS
CONTEXTO: B235 injetou console.log via sed mas escapou mal os parenteses, quebrou agents.mjs sem aviso, API 502.
REGRA: PROIBIDO patch JS/MJS multi-linha com sed. Use Python com pathlib + read_text/write_text e regex compilada, OU heredoc com EOF.
COMO_APLICAR: Sempre validar com 'node --check arquivo.mjs' ANTES de restart. Se erro: rollback via .bak imediato.
TAGS: sed,javascript,patch,syntax
ORIGEM: seed-historico-B248
DATA: 2026-06-27
