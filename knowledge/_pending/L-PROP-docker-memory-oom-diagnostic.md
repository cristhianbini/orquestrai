# L-PROP-docker-memory-oom-diagnostic

_Proposta por Memorialista, pre-aprovada por Guardian em 2026-07-08T19:40:19.631Z. Aguardando revisao humana._

ID: L-PROP-docker-memory-oom-diagnostic
TITULO: Docker memory limit vs. real consumption — sintomas de OOM e diagnóstico via stats+inspect+logs
CONTEXTO: Containers Node.js (orquestrai-api, orquestrai-web, orquestrai-proxy) podem rodar sem limite configurado ou com limite subdimensionado em relacao ao consumo real da aplicacao, levando a risco de OOM kills ou crash silencioso.
REGRA: (1) Sempre inspeccionar limite com docker inspect --format '{{.HostConfig.Memory}}' (0 bytes = sem capping); (2) Capturar stats com docker stats --no-stream e calcular percentual real vs. limite; (3) Se MemPerc > 90% consistentemente, investigar vazamento de heap em Node.js via logs (grep -iE 'heap|gc|fatal' docker logs); (4) Limite subdimensionado exige docker-compose.yml edit com mem_limit, seguido de docker-compose up -d orquestrai-api (nao restart, exige recreate).
EVIDENCIA: mas_run-objetivo-bloco-67-memoria (SCOUT reconheceu 3 hipoteses, AUDITOR mapeou 2 anomalias reais, SMITH gerou BLOCO-67 3-seções com stats+inspect+logs, GUARDIAO aprovou read-only)
