// B374 — retention TTL para blackboard.db
const express = require('express');
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.BLACKBOARD_DB || path.join(__dirname, '..', 'data', 'blackboard.db');

// TTL em dias
const TTL = {
  mas_event: 14,
  mas_run:   30,
  // licoes: NUNCA apagar (memória)
};

function runRetention({ dry = false } = {}) {
  const db = new Database(DB_PATH);
  const report = { dry, started_at: new Date().toISOString(), deleted: {}, before: {}, after: {} };

  try {
    for (const t of Object.keys(TTL)) {
      report.before[t] = db.prepare(`SELECT COUNT(*) c FROM ${t}`).get().c;
    }

    // mas_event: ts é INTEGER (epoch ms). Cutoff = agora - 14d em ms.
    const evCutoffMs = Date.now() - TTL.mas_event * 24 * 3600 * 1000;
    const evSel = db.prepare(`SELECT COUNT(*) c FROM mas_event WHERE ts < ?`).get(evCutoffMs).c;
    report.deleted.mas_event = evSel;

    // mas_run: started_at INTEGER ms; cutoff = agora - 30d em ms.
    const runCutoffMs = Date.now() - TTL.mas_run * 24 * 3600 * 1000;
    const runSel = db.prepare(`SELECT COUNT(*) c FROM mas_run WHERE started_at < ?`).get(runCutoffMs).c;
    report.deleted.mas_run = runSel;

    if (!dry) {
      db.exec('BEGIN');
      db.prepare(`DELETE FROM mas_event WHERE ts < ?`).run(evCutoffMs);
      db.prepare(`DELETE FROM mas_run   WHERE started_at < ?`).run(runCutoffMs);
      // mas_event órfãos (run apagada): limpa cascata manual
      db.prepare(`DELETE FROM mas_event WHERE run_id NOT IN (SELECT id FROM mas_run)`).run();
      db.exec('COMMIT');
      db.exec('VACUUM');
    }

    for (const t of Object.keys(TTL)) {
      report.after[t] = db.prepare(`SELECT COUNT(*) c FROM ${t}`).get().c;
    }
    report.finished_at = new Date().toISOString();
    return report;
  } finally {
    db.close();
  }
}

const router = express.Router();

router.get('/status', (req, res) => {
  const db = new Database(DB_PATH, { readonly: true });
  try {
    const out = { ttl_days: TTL, counts: {} };
    for (const t of ['mas_event', 'mas_run', 'licoes']) {
      out.counts[t] = db.prepare(`SELECT COUNT(*) c FROM ${t}`).get().c;
    }
    res.json(out);
  } finally { db.close(); }
});

router.post('/run', (req, res) => {
  const dry = String(req.query.dry || '') === '1';
  try { res.json(runRetention({ dry })); }
  catch (e) { res.status(500).json({ error: String(e.message || e) }); }
});

module.exports = router;
module.exports.runRetention = runRetention;
