# L-PROP-STATIC-PROJECT-BINDMOUNT

_Proposta por Memorialista, pre-aprovada por Guardian em 2026-07-09T10:27:00.851Z. Aguardando revisao humana._

ID: L-PROP-STATIC-PROJECT-BINDMOUNT
TITULO: Novo projeto estático no bind-mount existente segue padrão /src/<projeto>/ + marker idempotente + validacao curl
CONTEXTO: Criacao de landing pages/projetos static-html na VPS orquestrai — caso cafe-real. Bind-mount /src:/usr/share/nginx/html:ro ja existe, mas novo subdir nao reflete em nginx automaticamente se location nao declarado.
REGRA: (1) Criar projeto em /var/www/orquestrai/src/<nome>/index.html (respeita bind-mount existente). (2) Adicionar marker HTML (<!-- MARKER:PROJETO-NOME -->) para idempotencia. (3) Validar com grep no arquivo criado. (4) Testar servimento com curl http://<host>/<nome>/ — se 404, verificar nginx.conf location ou adicionar novo location block. (5) NAO editar docker-compose.yml nem recriar container para novo projeto estático.
EVIDENCIA: Run mas_5d69ac7db5ec + atual — BLOCO-CAFE-REAL-INIT gerado com marker + validacao curl no Guardian. Padrão reutilizavel para proximos projetos static.
