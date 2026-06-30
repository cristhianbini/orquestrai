---
documento: skill
nome: automacao-por-padrao
ultima_atualizacao: 2026-06-30
status: vivo
---

# Automacao por padrao

Principio do projeto (definido por Cristhian, 2026-06-30): qualquer tarefa que
dependa de um humano (ou IA) lembrar de fazer algo manualmente, sempre que
tecnicamente viavel, deve ser automatizada dentro da propria infraestrutura
do OrquestrAI -- nao depender de disciplina, depender de mecanismo.

## Exemplos ja implementados
- Cabecalho de data/hora em arquivos alterados: hook git pre-commit
  (scripts/update_headers.py), nao depende de lembrar de adicionar na mao.
- Versionamento (SemVer + Keep-a-Changelog): scripts/bump-version.sh faz
  changelog + commit + tag num passo so.
- Licoes aprendidas: promoteFromRun() (mas/promote-lessons.mjs) roda
  automatico ao fim de toda run do MAS, sem acao manual.
- Memoria de conversa/run: persistida automaticamente (CTXMEM01, CTXMAS01),
  nao depende do usuario clicar "salvar".

## Regra ao propor nova feature
Antes de desenhar algo que dependa de "lembrar de fazer X", perguntar:
da pra fazer o sistema garantir isso sozinho? Se sim, preferir essa rota,
mesmo que de mais trabalho inicial -- o ganho composto ao longo do tempo
(nunca mais esquecido, nunca mais inconsistente) compensa.
