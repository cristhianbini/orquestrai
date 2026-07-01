# L-DURATION03 — Heredoc bash quebra com backtick no conteudo

**Data:** 2026-07-01
**Contexto:** Escrita de licoes via heredoc

## Erro cometido
Heredoc bash (cat << 'EOF') com conteudo contendo backtick (`)
causa interpretacao como command substitution mesmo com EOF aspas simples
em alguns contextos interativos. Resultado: conteudo garbled no arquivo.

## Regra permanente
Para escrever arquivos com conteudo tecnico (backtick, $, aspas):
usar sempre python3 com string multilinha.
Nunca usar heredoc bash para conteudo que contenha caracteres especiais.
