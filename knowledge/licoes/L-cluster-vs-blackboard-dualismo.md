---
PROJETO: orquestrai
APROVADA: 2026-07-08 (curadoria humana)
---
# L-PROP-cluster-vs-blackboard-dualismo

_Proposta por Memorialista, pre-aprovada por Guardian em 2026-07-08T19:25:27.274Z. Aguardando revisao humana._

ID: L-PROP-cluster-vs-blackboard-dualismo
TITULO: Dois bancos SQLite por separacao de responsabilidade — cluster (auditoria hash-chain) vs blackboard (telemetria SSE)
CONTEXTO: Manutencao de OrquestrAI; consultores/admins frequentemente confundem qual banco registra o quê, levando a queries erradas, patches no lugar errado, ou perda de auditoria. L-CTXUNIFY01 explica dualidade de execucao, mas nao diferencia os bancos de dados por propósito.
REGRA: cluster.db = execucoes auditadas via execBloco protegido (/api/blocos), hash-chain CTXAUDIT01, imutável, crítico para compliance. blackboard.db = eventos SSE em tempo real (transições de agente, animações painel), volátil, pode ser limpo periodicamente. Nunca misture queries de auditoria em blackboard, nem tente auditar telemetria em cluster. Se um query retorna vazio, confirme qual banco está consultando (sqlite3 .tables).
EVIDENCIA: run mas_objetivo-cluster-vs-blackboard; Smith confirmou diferenca via schema (execucoes vs events) e proposito arquitetural; Scout citou L-CTXUNIFY01; Detetive provou que blackboard nasceu do pipeline MAS (SSE relay) e R6-13.5.x
