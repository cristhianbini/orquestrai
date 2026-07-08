---
PROJETO: orquestrai
APROVADA: 2026-07-08 (curadoria humana)
---
# L-PROP-naming-sources-priority

_Proposta por Memorialista, pre-aprovada por Guardian em 2026-07-08T19:55:44.530Z. Aguardando revisao humana._

ID: L-PROP-naming-sources-priority
TITULO: Nome do sistema: order de confiabilidade entre package.json, domínio, path e containers
CONTEXTO: Quando assumir o nome de um projeto em VPS existente, existem até 5 fontes: domain (DNS), filesystem path, package.json name, docker-compose service names, .env PROJECT_NAME. Cada uma pode estar desalinhada com as outras em refatorações lentas.
REGRA: Validar na ordem (1) docker-compose.yml services (fonte runtime MAIS confiavel), (2) package.json name, (3) filesystem path, (4) domain registrado. Se houver divergencia, o service name do compose prevalece: e o que docker realmente usa pra networking e volumes. Nunca assuma que path==name ou domain==code-name.
EVIDENCIA: mas_dc8ab3a99048 — OrquestrAI confirmado via 4 fontes alinhadas (dominio orquestrai.cbini.com.br, path /var/www/orquestrai, containers orquestrai-api/proxy/web, esperado package.json). Sem divergencia neste caso, mas padrao salva tempo em systems fragmentados.
