---
documento: skill
nome: proveniencia-conteudo
ultima_atualizacao: 2026-06-30
status: vivo
---

# Proveniencia de conteudo gerado por agente

Todo arquivo .md novo criado por um agente (lessons, contexto, relatorio) DEVE
comecar com este frontmatter YAML:

```yaml
---
agente: NOME_DA_POSICAO     # BATEDOR, AUDITOR, DETETIVE, etc
modelo: nome-do-modelo
provider: anthropic|zai|openai|groq|...
gerado_em: ISO8601
origem_conversation_id: N   # liga a tabela conversations
status: rascunho            # rascunho | validado-humano | validado-teste
revisado_por: null          # preenchido na validacao
---
```

Motivo: permite que qualquer agente futuro (ou consulta RAG) filtre conteudo
por confianca (status=validado), origem (qual posicao/modelo gerou) e
rastreie de volta a conversa que originou. Sem isso, a knowledge base
acumula conteudo sem dono e sem nivel de confianca verificavel -- mesmo
problema que tinhamos com o historico de chat antes de CTXMEM01.
