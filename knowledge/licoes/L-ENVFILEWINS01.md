ID: L-ENVFILEWINS01
PROJETO: orquestrai
TITULO: EnvironmentFile do systemd VENCE as linhas Environment= da unit
CONTEXTO: S3/CTXOQTERMBIND01 -- patch de OQTERM_HOST na unit nao surtiu efeito; /etc/oqterm.env redefinia a variavel e ganhava. Custou 1 rodada de diagnostico.
REGRA: Variavel definida em EnvironmentFile sobrescreve Environment= da unit. Manter FONTE UNICA: se existe env file, a variavel vive SO la.
COMO_APLICAR: Antes de patchear unit, checar 'cat <env_file>' por redefinicao. Validar com: cat /proc/$(systemctl show -p MainPID --value <svc>)/environ | tr '\0' '\n' -- o env do PROCESSO e a verdade, nao o da unit.
TAGS: systemd,environment,env-file,debug
DATA: 2026-07-07
