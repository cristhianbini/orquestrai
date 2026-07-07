# L-PROP-docker-listen-0-0-0-0
PROJETO: orquestrai

_Auto-promovida por Guardian em 2026-06-27T06:49:34.033Z_

ID: L-PROP-docker-listen-0-0-0-0
TITULO: App Docker deve escutar em 0.0.0.0; 127.0.0.1 causa connection refused no host
CONTEXTO: Container rodando sem erros nos logs, mas tentativas de conexão do host resultam em "Connection refused".
REGRA: Dentro do container, a aplicação deve fazer bind em 0.0.0.0 (todas interfaces) para ser acessível via port mapping do Docker. Se bindar em 127.0.0.1 (loopback), apenas processos dentro do próprio container conseguem acessar. Verificar com `docker exec <container> netstat -tlnp`.
EVIDENCIA: BLOCO-Debug-Container-Connection-Refused (Step 3: `netstat -tlnp`)
