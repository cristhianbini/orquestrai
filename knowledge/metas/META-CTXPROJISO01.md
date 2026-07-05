# META FUTURA — Isolamento de projetos por container Docker (CTXPROJISO01)

**Status:** backlog, nao iniciado -- direcao ja desenhada em discussao de sessao
**Registrado:** 2026-07-05
**Origem:** preocupacao do Bini sobre misturar multiplos sistemas dentro
da mesma infraestrutura do OrquestrAI

## Problema
Tela "Novo Projeto" (cockpit, aba Projetos) cria hoje so um diretorio em
projects/<nome>/, sem isolamento real de execucao. Se sistemas gerados
rodassem soltos no mesmo host (processos, portas, dependencias
compartilhadas -- like PM2/XMonex antigo), um bug ou vulnerabilidade num
projeto poderia alcancar outros projetos ou o proprio OrquestrAI.

## Desenho recomendado

| Camada | Hoje (OrquestrAI) | Proposta (projeto novo) |
|---|---|---|
| Codigo-fonte | src/ bind-mount no orquestrai-web | projects/<nome>/ bind-mount no container proprio |
| Runtime | Container Docker proprio | Container Docker proprio, isolado |
| Banco | blackboard.db/cluster.db, so do OrquestrAI | Banco proprio do projeto, nunca compartilhado |
| Rede/rota | orquestrai-proxy (nginx) roteia | Mesmo nginx ganha rota nova por projeto |
| Execucao privilegiada | oqterm root, unico, sem distincao de projeto | Usuario/capacidades restritas por projeto, NAO root |

## Por que nao reaproveitar o oqterm root direto (risco identificado)
Se o agente continuasse root no host e so "escopasse" via texto do
comando (`docker exec projeto-x ...`), nada impediria estruturalmente um
bug ou instrucao mal-entendida gerar um comando que pule o container e
toque o host direto. Isolamento por convencao de comportamento e fragil
-- precisa ser garantido pela estrutura (usuario Linux restrito, ou
futuramente API interna dedicada que valida antes de qualquer shell).

## Bootstrap: import via URL do GitHub (ideia do Bini, incorporada aqui)
- v1 (simples, baixo risco): so aceitar repos que ja trazem seu proprio
  Dockerfile/docker-compose.yml -- so empacota o que o dono do repo ja
  preparou, dentro do isolamento.
- v2 (mais ambiciosa, fica pra depois de validar v1): auto-deteccao de
  stack pra repos sem Docker (package.json -> Dockerfile Node,
  requirements.txt -> Dockerfile Python, etc).
- Risco a lembrar: codigo de terceiros rodando na infraestrutura --
  mesmo isolado, e categoricamente diferente de rodar so codigo gerado
  pelo proprio MAS. Reforca ainda mais a necessidade do isolamento real.

## Relacionado
CTXPROJDNA01 (DNA de projeto) -- e a evolucao natural deste item, so
faz sentido depois que o isolamento estiver solido e houver projetos
reais rodando.
