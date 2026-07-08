---
PROJETO: orquestrai
APROVADA: 2026-07-08 (curadoria humana; 1a proposta do ciclo haiku+FORMATO CRU)
---
# L-PROP-docker-uptime-drift-audit

_Proposta por Memorialista, pre-aprovada por Guardian em 2026-07-08T14:46:03.280Z. Aguardando revisao humana._

ID: L-PROP-docker-uptime-drift-audit
TITULO: Auditoria integrada docker ps + inspect + logs + systemctl mapeia uptime anômalo e restart-policy drift
CONTEXTO: Container docker roda mas uptime suspeito (ex. 2min quando deveria estar "Up 30d"); restart policy declarada no compose não bate com estado real; causa pode ser SyntaxError silencioso ou crash-loop mascarado por restart: always
REGRA: Sempre executar docker ps --all (overview), docker inspect -f (uptime+RestartCount+policy), docker logs --tail 50 (causa), e systemctl status (se fora docker). Cruzar 4 fontes antes de culpar infra. Se RestartCount > 3 e uptime < 10min, inspecionar logs para SyntaxError/ENOENT/crash. Comparar docker-compose.yml (declarado) vs docker inspect (real) para detectar drift.
EVIDENCIA: BLOCO-306 descobriu orquestrai-api com uptime 2min desencadeando suspeita de SyntaxError recente (L-B235 caso-uso direto); comando consolidado confirmou anomalia via 4 fontes sem ambiguidade
