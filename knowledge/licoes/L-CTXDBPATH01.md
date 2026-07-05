# L-CTXDBPATH01 — DB_PATH real e /app/data/blackboard.db, NAO /app/mas/

**Data:** 2026-07-05
**Contexto:** Checagens de "run MAS ativa" antes de restart usaram
`sqlite3 /app/mas/blackboard.db` a sessao inteira. Esse arquivo NUNCA
existiu -- confirmado por `ls` (No such file or directory).

## REGRA
sqlite3 CLI aponta pra arquivo inexistente = cria banco VAZIO silenciosamente,
sem erro. Uma query "sem resultado" NAO prova "sem run ativa" -- pode provar
so que o path esta errado. Path real (confirmado em mas/agents.mjs, const
DB_PATH): /app/data/blackboard.db

## COMO APLICAR
Antes de QUALQUER restart, checar run ativa com:
  docker exec orquestrai-api node -e "const D=require('better-sqlite3');const d=new D('/app/data/blackboard.db',{readonly:true});console.log(d.prepare(\"SELECT id FROM mas_run WHERE status='running'\").all());d.close()"
Prefira better-sqlite3 via node (o mesmo driver que a app usa) a sqlite3 CLI,
que pode nao estar instalado no container (confirmado: sh: sqlite3: not found)
e mascara erro de path.

## Achado colateral (nao urgente, registrado p/ nao perder)
memorialista roteado p/ cerebras/zai-glm-4.7 (ROUTING em agents.mjs) estoura
janela de contexto (~8192 tokens) quando o ctx acumulado do pipeline sequencial
chega grande (visto: 9282 e 9035 tokens em runs distintas, AMBAS anteriores ao
patch CTXAGTUNIFY01 -- nao relacionado). Pipeline sobrevive via try/catch, mas
memorialista falha silenciosamente nessas runs. Candidato a: (a) resumir/truncar
ctx antes do memorialista, ou (b) trocar pra modelo com janela maior.

TAGS: sqlite,path,restart,producao,memorialista,contexto
ORIGEM: Chat6-2026-07-05
