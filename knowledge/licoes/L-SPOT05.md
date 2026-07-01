# L-SPOT05 — node --check não funciona em arquivos .html

**Data:** 2026-07-01

## Erro
`node --check src/dashboard.html` lança ERR_UNKNOWN_FILE_EXTENSION
mas o pipe com head retorna exit 0, printando falso positivo "sintaxe OK".

## Regra permanente
Para validar JS em dashboard.html: extrair scripts via grep/sed e
checar arquivo .js temporário. Ou simplesmente confirmar HTTP 200
após restart + comportamento visual no browser.
Nunca usar: node --check em arquivo .html
