# L-PROP-audit-security-orquestrai
PROJETO: orquestrai

_Auto-promovida por Guardian em 2026-07-01T01:58:20.886Z_

ID: L-PROP-audit-security-orquestrai
TITULO: Auditoria de Segurança do OrquestrAI (RCE e Credenciais)
CONTEXTO: Investigação de vulnerabilidades no diretório do sistema OrquestrAI (/var/www/orquestrai).
REGRA: Executar varredura read-only buscando por padrões de injeção de comando (`eval`, `` ` ``, `$()`) em arquivos JS/SH, validar permissões restritivas (600) em arquivos .env e identificar diretórios com permissão de escrita global (world-writable) para prevenir RCE e vazamento de dados.
EVIDENCIA: Script BLOCO-AUDIT-SECURITY-ORQUESTRAI (agente SMITH)
