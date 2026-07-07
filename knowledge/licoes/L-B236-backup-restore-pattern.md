ID: L-B236-backup-restore-pattern
PROJETO: orquestrai
TITULO: Backup .bak ANTES de qualquer patch destrutivo permite rollback rapido
CONTEXTO: B236 conseguiu rollback em segundos porque B235 deixou .bak datado.
REGRA: TODO bloco que edita arquivo critico (.mjs/.js/.tsx/.yml) DEVE comecar com: cp -a <file> <file>.bak-B<N>-$(date +%Y%m%d-%H%M%S).
COMO_APLICAR: Nomear .bak com BLOCO e timestamp permite trilha de auditoria e rollback granular.
TAGS: backup,rollback,seguranca
ORIGEM: seed-historico-B248
DATA: 2026-06-27
