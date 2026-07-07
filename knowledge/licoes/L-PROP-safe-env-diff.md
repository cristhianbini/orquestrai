# L-PROP-safe-env-diff
PROJETO: orquestrai

_Auto-promovida por Guardian em 2026-06-27T20:09:47.028Z_

ID: L-PROP-safe-env-diff
TITULO: Diff estrutural de .env (apenas chaves) para não vazar secrets
CONTEXTO: Comparar configurações entre ambientes (PROD/TESTE) onde logs podem ser públicos ou apenas a estrutura das variáveis importa.
REGRA: Evite `diff file_a file_b` em .envs. Use `grep -E '^[A-Z_]+' file | cut -d= -f1 | sort` para comparar o nome das variáveis, ocultando senhas/tokens.
EVIDENCIA: BLOCO-SCOUT-001 (Hipótese 2 - Divergência de configuração)
