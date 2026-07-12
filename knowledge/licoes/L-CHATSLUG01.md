ID: L-CHATSLUG01
PROJETO: orquestrai
TITULO: Run do chat nao vinculava ao projeto ativo (so o wizard mandava project_slug)
CONTEXTO: R9 - CBini nao conseguiu criar pagina "Sobre" no cafe-real por chat nem MAS. Causa raiz: dashboard:1795 mandava so {goal,mas_mode} pro /api/mas/run; o UNICO caller que enviava project_slug era o wizard (~3995). Runs do chat nasciam soltas (sem DNA, sem docs/), e o unico codigo que grava site (CTXPROJRUN02) so dispara com goal /^BUILD novo projeto/ do wizard e so REGENERA o index inteiro - "adicionar pagina" nao existia.
REGRA: Toda acao do chat que deveria afetar um projeto precisa enviar o project_slug do projeto ATIVO (localStorage oq_proj_current); alem disso, escrever arquivo num projeto exige um caminho EXPLICITO (comando /construir), nunca esperar que o pipeline read-only de auditoria grave (contrato do Guardian).
COMO_APLICAR: Ao criar acao nova no chat que toca projeto, (1) inclua project_slug no body; (2) se grava arquivo, roteie p/ endpoint dedicado (ex: /api/mas/construir -> buildProjectPage) fora do pipeline MAS. Ver [[orquestrai-rodada-9]].
TAGS: chat,project-slug,mas,construir,static-html
ORIGEM: R9-FATIA-A + R9-CONSTRUIR01 (commit d950910)
DATA: 2026-07-12
