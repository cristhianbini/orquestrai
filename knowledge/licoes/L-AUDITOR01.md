# L-AUDITOR01 — Agente Auditor relatou vulnerabilidade que nao existia
PROJETO: orquestrai

**Data:** 2026-07-01
**Contexto:** achado ao vivo durante debug do CTXVITE02

## O que aconteceu
Run do MAS retornou relato do Auditor descrevendo .env com permissao 777
e credenciais expostas. Verificacao real na VPS: .env esta em 644 (correto),
nenhum arquivo world-writable encontrado, .env retorna 404 via web.

## Por que importa
Confirma com dado real que agentes do MAS podem alucinar/relatar riscos
inexistentes com detalhes especificos e convincentes (paths exatos,
permissoes exatas). Reforca a decisao do CTXKBCURATOR01 (fila de revisao
humana antes de qualquer proposta de licao virar KB permanente).

## Regra permanente
Nunca tratar relato de agente como fato ate verificacao direta no sistema
real. Especialmente para achados de seguranca -- specifico e convincente
nao e o mesmo que verdadeiro.
