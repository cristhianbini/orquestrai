# META FUTURA — DNA de Projeto: conhecimento estrutural por projeto (CTXPROJDNA01)

**Status:** backlog, nao iniciado -- depende de CTXPROJISO01 existir primeiro
**Registrado:** 2026-07-05
**Origem:** RFC de terceira IA (conversa externa do Bini), filtrada e adaptada por Claude

## Conceito (da RFC, adaptado)
Em vez de um projeto ser so codigo-fonte, cada projeto isolado (ver
CTXPROJISO01) carregaria um "DNA": arquitetura, padroes, convencoes,
decisoes, playbooks, prompts oficiais, templates, integracoes,
documentacao, historico e licoes -- o codigo seria consequencia desse DNA,
nao o proprio DNA.

## Estrutura proposta (adaptada da RFC original)
Projeto
└── DNA
    ├── Arquitetura
    ├── Padroes / Convencoes
    ├── Playbooks
    ├── Prompts oficiais
    ├── Componentes
    ├── Integracoes / Providers
    ├── Docker / Deploy
    ├── Documentacao
    └── Licoes aprendidas (especificas do projeto)

## Por que depende do CTXPROJISO01
Sem isolamento real de projeto (container proprio, banco proprio) ainda
nao existe "um projeto" de verdade pra anexar um DNA -- seria abstrair
em cima do vazio (mesmo erro ja visto na tela TITULAR/RESERVA, UI
construida antes de qualquer dado real por tras).

## Relacionado
CTXPROJISO01 (isolamento por container + import via GitHub) -- este item
e a evolucao natural dele, nao um substituto.
