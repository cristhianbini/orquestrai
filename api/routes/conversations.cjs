const express = require('express');
const db = require('../db.cjs');
const router = express.Router();
router.get('/', (req,res)=>{
  const rows = db.prepare('SELECT * FROM conversations ORDER BY updated_at DESC LIMIT 200').all();
  res.json(rows);
});
router.post('/', (req,res)=>{
  const { title, agent_id, provider, model } = req.body || {};
  const info = db.prepare('INSERT INTO conversations (title,agent_id,provider,model) VALUES (?,?,?,?)').run(title||'Nova conversa', agent_id||null, provider||null, model||null);
  res.json(db.prepare('SELECT * FROM conversations WHERE id=?').get(info.lastInsertRowid));
});
router.patch('/:id', (req,res)=>{
  const { title, agent_id, provider, model } = req.body || {};
  db.prepare(`UPDATE conversations SET title=COALESCE(?,title), agent_id=COALESCE(?,agent_id), provider=COALESCE(?,provider), model=COALESCE(?,model), updated_at=datetime('now') WHERE id=?`).run(title||null, agent_id||null, provider||null, model||null, req.params.id);
  res.json(db.prepare('SELECT * FROM conversations WHERE id=?').get(req.params.id));
});
router.delete('/:id', (req,res)=>{
  db.prepare('DELETE FROM conversations WHERE id=?').run(req.params.id);
  res.json({ok:true});
});
router.get('/:id/messages', (req,res)=>{
  const rows = db.prepare('SELECT * FROM messages WHERE conversation_id=? ORDER BY id ASC').all(req.params.id);
  res.json(rows);
});
router.post('/:id/messages', (req,res)=>{
  const { role, content, tokens_in, tokens_out } = req.body || {};
  if(!role || !content) return res.status(400).json({error:'role e content obrigatorios'});
  const info = db.prepare('INSERT INTO messages (conversation_id,role,content,tokens_in,tokens_out) VALUES (?,?,?,?,?)').run(req.params.id, role, content, tokens_in||0, tokens_out||0);
  db.prepare(`UPDATE conversations SET updated_at=datetime('now') WHERE id=?`).run(req.params.id);
  res.json(db.prepare('SELECT * FROM messages WHERE id=?').get(info.lastInsertRowid));
});
module.exports = router;
