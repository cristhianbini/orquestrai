# Roadmap Futuro — OrquestrAI
Ultima atualizacao: 2026-07-10. Ordem = alicerce antes do acabamento.

## ALICERCE
1. [x] Token efemero de preview — feito 2026-07-10 (CTXPREVIEWTOKEN02/03)
2. [ ] Import GitHub + container isolado — proximo passo concreto, habilita metade das metas
3. [ ] Telemetria por projeto (custo/tokens) — DO ZERO (project_slug nao existe em runs/mas_run; ver correcao 2026-07-10)

## ESTRUTURA
4. [ ] Telemetria expandida (disco/memoria/CPU) — depende do container isolado
5. [ ] PLANEJADOR + ORQUESTRADOR — pipeline dinamico, conecta com CTXEARLYEXIT01/CTXROUTER01

## ACABAMENTO
6. [ ] Agente DESIGNER dedicado no pipeline
7. [ ] Curadoria de elenco premium (GLM-5.2, MiniMax, OpenAI, Anthropic) — comparar custo x qualidade
8. [ ] UI padrao janelas (menu lateral + conteudo a direita, estilo Claude) — manter modal Provedores como esta

## EXPANSAO (bem pro final)
9. [ ] Cotas/multi-tenancy ("VPS dentro da VPS") — depende de container isolado maduro
10. [ ] Cluster multi-VPS / datacenter proprio

## OUTROS (dashboard "EM BREVE")
- [ ] DNA de projeto
- [ ] Deploy automatizado

## Ferramentas discutidas (sem prioridade de rodada ainda)
- Claude Code na VPS — instalar quando houver janela dedicada
- Auditoria com modelo forte — script pronto (scripts/gerar-dossie-auditoria.py)
