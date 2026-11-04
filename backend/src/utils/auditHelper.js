const db = require('../db');

/**
 * Persist a security/financial audit record. Never throws to callers.
 */
async function writeAudit({
  req,
  action,
  module,
  details,
  entity_type = null,
  entity_id = null,
  before = null,
  after = null,
  outcome = 'success',
}) {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(100),
        user_name VARCHAR(150),
        action VARCHAR(100) NOT NULL,
        module VARCHAR(100) NOT NULL,
        details TEXT,
        performed_by VARCHAR(150),
        ip_address VARCHAR(100),
        entity_type VARCHAR(100),
        entity_id VARCHAR(100),
        outcome VARCHAR(50),
        before_state JSONB,
        after_state JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `).catch(() => {});

    // Best-effort column adds for older schemas
    await db.query(`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS entity_type VARCHAR(100)`).catch(() => {});
    await db.query(`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS entity_id VARCHAR(100)`).catch(() => {});
    await db.query(`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS outcome VARCHAR(50)`).catch(() => {});
    await db.query(`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS before_state JSONB`).catch(() => {});
    await db.query(`ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS after_state JSONB`).catch(() => {});

    const actor =
      req?.user?.email ||
      req?.user?.mobile ||
      req?.userRole ||
      req?.user?.role ||
      'System';
    const userId = req?.userId || req?.user?.userId || req?.user?.sub || null;
    const ip = (req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || '127.0.0.1')
      .toString()
      .split(',')[0]
      .trim();

    const detailPayload = typeof details === 'string'
      ? details
      : JSON.stringify({
          ...(details || {}),
          entity_type,
          entity_id,
          outcome,
        });

    const result = await db.query(
      `
      INSERT INTO audit_logs (
        user_id, user_name, action, module, details, performed_by, ip_address,
        entity_type, entity_id, outcome, before_state, after_state
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING id, created_at
      `,
      [
        userId,
        actor,
        action,
        module,
        detailPayload,
        actor,
        ip,
        entity_type,
        entity_id != null ? String(entity_id) : null,
        outcome,
        before ? JSON.stringify(before) : null,
        after ? JSON.stringify(after) : null,
      ]
    );
    return result.rows[0];
  } catch (err) {
    console.warn('audit write failed:', err.message);
    return null;
  }
}

module.exports = { writeAudit };
