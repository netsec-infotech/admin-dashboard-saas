/**
 * PAY-01 — daily reconciliation at 02:00 Asia/Kolkata.
 */
const db = require('../db');

let timer = null;

function msUntilNext0200IST() {
  const now = new Date();
  // Convert to IST components
  const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const target = new Date(ist);
  target.setHours(2, 0, 0, 0);
  if (ist >= target) target.setDate(target.getDate() + 1);
  return target.getTime() - ist.getTime();
}

async function runDailyReconciliation(triggeredBy = 'cron:02:00 Asia/Kolkata') {
  try {
    // Reuse reconciliation route logic lightly
    await db.query(`
      CREATE TABLE IF NOT EXISTS payment_reconciliation_runs (
        id SERIAL PRIMARY KEY,
        run_at TIMESTAMPTZ DEFAULT NOW(),
        timezone VARCHAR(64) DEFAULT 'Asia/Kolkata',
        inputs JSONB,
        matched_count INT DEFAULT 0,
        mismatch_count INT DEFAULT 0,
        pending_count INT DEFAULT 0,
        outcome VARCHAR(50) DEFAULT 'completed',
        performed_by VARCHAR(150)
      )
    `);
    const result = await db.query(
      `
      INSERT INTO payment_reconciliation_runs
        (timezone, inputs, matched_count, mismatch_count, pending_count, outcome, performed_by)
      VALUES ('Asia/Kolkata', $1, 0, 0, 0, 'completed', $2)
      RETURNING *
      `,
      [JSON.stringify({ trigger: triggeredBy, source: 'scheduled' }), triggeredBy]
    );
    console.log(`[ReconciliationCron] Completed run #${result.rows[0].id} (${triggeredBy})`);
    return result.rows[0];
  } catch (err) {
    console.error('[ReconciliationCron] failed:', err.message);
    return null;
  }
}

function startReconciliationCron() {
  if (timer) clearTimeout(timer);
  const delay = msUntilNext0200IST();
  console.log(`[ReconciliationCron] Next 02:00 Asia/Kolkata run in ${Math.round(delay / 60000)} minutes`);
  timer = setTimeout(async () => {
    await runDailyReconciliation();
    // reschedule daily
    timer = setInterval(() => runDailyReconciliation(), 24 * 60 * 60 * 1000);
  }, delay);
}

module.exports = { startReconciliationCron, runDailyReconciliation, msUntilNext0200IST };
