# LAVE-F — Fracionamento Adaptativo (extensao do LAVE)

Antes de EXECUTAR, escolher a granularidade pelo risco:
- Baixo (arquivo novo, funcao isolada) -> bloco normal
- Medio (editar arquivo vivo, remover codigo) -> fraciona em .x (1 alvo/passo)
- Alto (codigo entrelacado, elemento visivel, multiplas remocoes) -> .x.y
  (1 artefato por passo)

REGRAS DE OURO:
1. Remocao em arquivo com <script>: validar SINTAXE REAL (extrair scripts +
   node --check) ANTES do commit. Nunca so grep/tags.
2. Nunca commitar antes da verificacao no ambiente real (navegador/output).
3. Remover por CONTEUDO (regex ancorado), nunca sed por numero de linha.
4. 1 alvo -> validar -> confirmar -> commit. So entao o proximo.
Origem: SyntaxError do R6-13.2 (sed removeu })(); junto). Fracionar teria
isolado o erro em 4 linhas obvias.
