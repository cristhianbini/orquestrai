# META-CTXPIPECLOSE01 — Fechamento da esteira (#10 TESTADOR, #11 VERIFICADOR)
PROJETO: orquestrai
STATUS: registrada 2026-07-08 | EXECUTAR EM: pos-S4, via PENEIRA, um por vez
## Problema
O pipeline 1-9 inteiro trabalha ANTES da execucao humana. Depois do
EXECUTAR, nenhum agente consome o resultado: block_executed registra QUE
rodou, ninguem avalia SE funcionou. A esteira e' uma linha, nao um loop.
## Proposta
### #10 TESTADOR — ultimo portao antes do humano
Validacao MECANICA do BLOCO aprovado: bash -n/shellcheck, read-only
quando declarado, paths citados existem, tabelas/colunas batem com schema
real (L-SCHEMA01 virando agente). Fronteiras: GUARDIAO avalia risco,
REVISOR avalia qualidade do raciocinio, TESTADOR RODA verificacoes reais
em modo seguro -- o unico que executa algo. Candidato natural: VALIDADOR
(R2) via PENEIRA.
### #11 VERIFICADOR (renomear PUBLICADOR) — fecha o ciclo
Roda DEPOIS da execucao humana: le o output do terminal (ja volta via
COLAR/CHAT), compara com o que o RELATOR prometeu, emite veredito
sucesso/parcial/falhou. O veredito alimenta: (a) Harness Score com
resultado REAL, (b) MEMORIALISTA com a melhor materia-prima de licao,
(c) transforma a esteira de linha em LOOP.
DEPENDENCIA: encanamento p/ injetar output da execucao num mini-run
(conversa com CTXMASRUNID01/S17).
## Sequencia (disciplina do projeto)
1. Terminar S4 (falta METRICO 13.8, REVISOR 13.9 -- RELATOR em validacao)
2. TESTADOR via PENEIRA (run padronizada, promocao por merito)
3. VERIFICADOR so depois do encanamento S17
