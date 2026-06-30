-- MAS schema v1 — OrquestrAI Multi-Agent System
-- Idempotente: tudo CREATE IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS schema_version(
  v INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT (datetime('now')),
  note TEXT
);

-- runs: uma execução do pipeline (Explorador → Auditor → ... → Relator)
CREATE TABLE IF NOT EXISTS runs(
  id TEXT PRIMARY KEY,                   -- uuid
  goal TEXT NOT NULL,                    -- pedido humano em linguagem natural
  status TEXT NOT NULL DEFAULT 'pending',-- pending|running|awaiting_human|vetoed|done|failed
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  finished_at TEXT,
  created_by TEXT,                       -- email/user
  tokens_in INTEGER DEFAULT 0,
  tokens_out INTEGER DEFAULT 0,
  cost_usd REAL DEFAULT 0,
  meta_json TEXT                         -- json livre
);
CREATE INDEX IF NOT EXISTS idx_runs_status ON runs(status);
CREATE INDEX IF NOT EXISTS idx_runs_created ON runs(created_at DESC);

-- messages: trace cronológico de toda comunicação entre agentes
CREATE TABLE IF NOT EXISTS messages(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL,
  step INTEGER NOT NULL,                 -- ordem 1,2,3...
  agent TEXT NOT NULL,                   -- explorador|auditor|codificador|guardiao|relator|supervisor|human
  role TEXT NOT NULL,                    -- system|user|assistant|tool
  content TEXT NOT NULL,
  provider TEXT,
  model TEXT,
  tokens_in INTEGER DEFAULT 0,
  tokens_out INTEGER DEFAULT 0,
  cost_usd REAL DEFAULT 0,
  latency_ms INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(run_id) REFERENCES runs(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_messages_run ON messages(run_id, step);
CREATE INDEX IF NOT EXISTS idx_messages_agent ON messages(agent);

-- facts: coisas que o Explorador descobriu (ls, ps, logs, etc)
CREATE TABLE IF NOT EXISTS facts(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL,
  source TEXT NOT NULL,                  -- agente que descobriu
  key TEXT NOT NULL,                     -- ex: 'docker.ps', 'file:/etc/nginx/...'
  value_json TEXT NOT NULL,              -- json com payload
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(run_id) REFERENCES runs(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_facts_run_key ON facts(run_id, key);

-- tasks: subtarefas que o Supervisor distribui
CREATE TABLE IF NOT EXISTS tasks(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL,
  assignee TEXT NOT NULL,                -- agente responsável
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'todo',   -- todo|doing|done|failed
  input_json TEXT,
  output_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  finished_at TEXT,
  FOREIGN KEY(run_id) REFERENCES runs(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_tasks_run_status ON tasks(run_id, status);

-- artifacts: blocos LAVE, diffs, .md, qualquer entregável
CREATE TABLE IF NOT EXISTS artifacts(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL,
  kind TEXT NOT NULL,                    -- bloco_lave|diff|md|json|sql
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  produced_by TEXT NOT NULL,             -- agente
  approved INTEGER DEFAULT 0,            -- 0=pendente, 1=guardião OK, -1=vetado
  executed INTEGER DEFAULT 0,            -- humano clicou EXECUTAR
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(run_id) REFERENCES runs(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_artifacts_run ON artifacts(run_id);

-- decisions: log de decisões do Supervisor (próximo agente, razão)
CREATE TABLE IF NOT EXISTS decisions(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL,
  step INTEGER NOT NULL,
  decided TEXT NOT NULL,                 -- ex: 'route:auditor', 'stop:done', 'loop:codificador'
  reason TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(run_id) REFERENCES runs(id) ON DELETE CASCADE
);

-- vetoes: regras que o Guardião disparou
CREATE TABLE IF NOT EXISTS vetoes(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL,
  artifact_id INTEGER,
  rule TEXT NOT NULL,                    -- ex: 'rm-rf-root', 'hardcoded-domain', 'secret-leak'
  severity TEXT NOT NULL DEFAULT 'block',-- warn|block
  details TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(run_id) REFERENCES runs(id) ON DELETE CASCADE,
  FOREIGN KEY(artifact_id) REFERENCES artifacts(id) ON DELETE CASCADE
);

-- licoes: lições aprendidas (Relator escreve no final da run)
CREATE TABLE IF NOT EXISTS licoes(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT,
  codigo TEXT NOT NULL UNIQUE,           -- ex: 'L-MAS-001'
  titulo TEXT NOT NULL,
  corpo TEXT NOT NULL,
  tags TEXT,                             -- csv
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(run_id) REFERENCES runs(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_licoes_tags ON licoes(tags);

-- marca versão
INSERT OR IGNORE INTO schema_version(v,note) VALUES(1,'MAS Fase 1 — blackboard inicial');
