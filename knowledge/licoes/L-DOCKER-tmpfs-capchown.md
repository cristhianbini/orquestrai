# L-DOCKER-tmpfs-capchown — tmpfs nasce root-owned; nginx hardened exige --user + uid/gid no tmpfs
PROJETO: orquestrai

**Data:** 2026-07-11 (Rodada 7, Fase B2 — container static do project-supervisor)

## Erro
Container nginx com hardening completo (`--read-only` + `--cap-drop ALL`)
nao subia. Causa: todo tmpfs montado pelo Docker nasce com dono root:root,
e o nginx master (rodando como root dentro do container) faz chown dos
dirs de cache/tmp para o worker (uid 101) — chown exige CAP_CHOWN, que o
`--cap-drop ALL` removeu. Sintoma tipico: erro de permissao em
/var/cache/nginx ou /tmp no boot do container.

## Correcao (validada em teste real, B2)
Nao devolver CAP_CHOWN. Em vez disso, eliminar a necessidade do chown:
- `--user 101:101` (processo inteiro ja nasce como o worker, sem master root);
- cada tmpfs montado com `uid=101,gid=101` explicito
  (ex: `--tmpfs /var/cache/nginx:uid=101,gid=101`).
Assim `--read-only` + `--cap-drop ALL` ficam intactos.

## Regra
Container read-only + cap-drop ALL que precise escrever em tmpfs: SEMPRE
alinhar `--user` com `uid=,gid=` do tmpfs. Se a imagem faz chown no
entrypoint, rodar direto como o uid final em vez de devolver capability.
Aplicado no template de stack `static` do project-supervisor
(services/project-supervisor/).
