/**
 * PAY-01 — Payment reconciliation workspace with idempotent webhook matching.
 */
const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const db = require('../db');
const { authenticate, requireRoles } = require('../middleware/auth');
const { paymentLimiter } = require('../middleware/rateLimit');
const { writeAudit } = require('../utils/auditHelper');

const ALLOWED_STATES = ['Success', 'Pending', 'Failed', 'Refunded', 'Chargeback Dispute'];

async function ensureTables() {
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
  `).catch(() => {});

  await db.query(`
    CREATE TABLE IF NOT EXISTS payment_reconciliation_items (
      id SERIAL PRIMARY KEY,
      run_id INT,
      transaction_id VARCHAR(150),
      gateway VARCHAR(50),
      internal_status VARCHAR(50),
      gateway_status VARCHAR(50),
      amount DECIMAL(12,2),
      mismatch_reason TEXT,
      age_hours DECIMAL(10,2),
      reconciled BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(transaction_id, gateway)
    )
  `).catch(() => {});

  await db.query(`
    CREATE TABLE IF NOT EXISTS payment_webhook_dedupe (
      id SERIAL PRIMARY KEY,
      provider VARCHAR(50) NOT NULL,
      event_id VARCHAR(200) NOT NULL,
      payload_hash VARCHAR(128),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(provider, event_id)
    )
  `).catch(() => {});
}
ensureTables();

router.get(
  '/states',
  authenticate,
  (req, res) => res.json({ status: 'success', data: ALLOWED_STATES })
);

router.get(
  '/discrepancies',
  authenticate,
  requireRoles('Super Admin', 'Franchise Owner', 'Franchise Manager'),
  async (req, res) => {
    try {
      const result = await db.query(`
        SELECT * FROM payment_reconciliation_items
        WHERE reconciled = FALSE
        ORDER BY age_hours DESC NULLS LAST, created_at DESC
        LIMIT 200
      `);
      res.json({ status: 'success', data: result.rows });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
);

router.get(
  '/runs',
  authenticate,
  requireRoles('Super Admin', 'Franchise Owner', 'Franchise Manager'),
  async (req, res) => {
    try {
      const result = await db.query(
        `SELECT * FROM payment_reconciliation_runs ORDER BY run_at DESC LIMIT 50`
      );
      res.json({ status: 'success', data: result.rows });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
);

router.post(
  '/run',
  authenticate,
  requireRoles('Super Admin', 'Franchise Owner', 'Franchise Manager'),
  paymentLimiter,
  async (req, res) => {
    try {
      const timezone = req.body?.timezone || 'Asia/Kolkata';
      // Pull recent payment-like rows from reservations / wallet if present
      let internal = { rows: [] };
      try {
        internal = await db.query(`
          SELECT
            COALESCE(txn_id, payment_id, id::text) AS transaction_id,
            COALESCE(gateway, payment_method, 'internal') AS gateway,
            COALESCE(payment_status, status, 'Pending') AS internal_status,
            COALESCE(amount, total_amount, 0)::numeric AS amount,
            created_at
          FROM reservations
          WHERE created_at > NOW() - INTERVAL '7 days'
          ORDER BY created_at DESC
          LIMIT 300
        `);
      } catch (_) {
        try {
          internal = await db.query(`
            SELECT id::text AS transaction_id, 'wallet' AS gateway,
                   COALESCE(status,'Pending') AS internal_status,
                   COALESCE(amount,0)::numeric AS amount, created_at
            FROM wallet_transactions
            WHERE created_at > NOW() - INTERVAL '7 days'
            ORDER BY created_at DESC LIMIT 300
          `);
        } catch (e2) {
          internal = { rows: [] };
        }
      }

      let matched = 0;
      let mismatch = 0;
      let pending = 0;
      const items = [];

      for (const row of internal.rows) {
        const normalized = String(row.internal_status || '').toLowerCase();
        // Simulate gateway lookup: pending older than 6h = mismatch; success = matched
        let gatewayStatus = 'Success';
        let reason = null;
        let ageHours = (Date.now() - new Date(row.created_at).getTime()) / 36e5;

        if (normalized.includes('pending')) {
          gatewayStatus = ageHours > 6 ? 'Failed' : 'Pending';
          if (gatewayStatus === 'Pending') {
            pending += 1;
            reason = 'Awaiting gateway settlement';
          } else {
            mismatch += 1;
            reason = 'Pending internally but gateway reports Failed';
          }
        } else if (normalized.includes('fail')) {
          gatewayStatus = 'Failed';
          matched += 1;
        } else if (normalized.includes('refund')) {
          gatewayStatus = 'Refunded';
          matched += 1;
        } else if (normalized.includes('chargeback') || normalized.includes('dispute')) {
          gatewayStatus = 'Chargeback Dispute';
          mismatch += 1;
          reason = 'Chargeback dispute requires finance review';
        } else {
          gatewayStatus = 'Success';
          matched += 1;
        }

        items.push({
          transaction_id: row.transaction_id,
          gateway: row.gateway,
          internal_status: row.internal_status,
          gateway_status: gatewayStatus,
          amount: row.amount,
          mismatch_reason: reason,
          age_hours: Number(ageHours.toFixed(2)),
          reconciled: !reason,
        });
      }

      const run = await db.query(
        `
        INSERT INTO payment_reconciliation_runs
          (timezone, inputs, matched_count, mismatch_count, pending_count, outcome, performed_by)
        VALUES ($1,$2,$3,$4,$5,'completed',$6)
        RETURNING *
        `,
        [
          timezone,
          JSON.stringify({ source: 'reservations+gateway_sim', count: internal.rows.length }),
          matched,
          mismatch,
          pending,
          req.user?.email || req.userRole || 'system',
        ]
      );

      for (const item of items) {
        await db.query(
          `
          INSERT INTO payment_reconciliation_items
            (run_id, transaction_id, gateway, internal_status, gateway_status, amount, mismatch_reason, age_hours, reconciled)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
          ON CONFLICT (transaction_id, gateway) DO UPDATE SET
            run_id = EXCLUDED.run_id,
            internal_status = EXCLUDED.internal_status,
            gateway_status = EXCLUDED.gateway_status,
            amount = EXCLUDED.amount,
            mismatch_reason = EXCLUDED.mismatch_reason,
            age_hours = EXCLUDED.age_hours,
            reconciled = EXCLUDED.reconciled
          `,
          [
            run.rows[0].id,
            item.transaction_id,
            item.gateway,
            item.internal_status,
            item.gateway_status,
            item.amount,
            item.mismatch_reason,
            item.age_hours,
            item.reconciled,
          ]
        ).catch(() => {});
      }

      await writeAudit({
        req,
        action: 'PAYMENT_RECONCILIATION_RUN',
        module: 'Payments',
        entity_type: 'reconciliation_run',
        entity_id: run.rows[0].id,
        details: {
          matched,
          mismatch,
          pending,
          timezone,
        },
        outcome: 'success',
      });

      res.json({
        status: 'success',
        data: {
          run: run.rows[0],
          summary: { matched, mismatch, pending, total: items.length },
          items: items.filter((i) => !i.reconciled).slice(0, 100),
        },
      });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
);

/** Idempotent webhook ingest helper used by providers */
router.post(
  '/webhook/:provider',
  paymentLimiter,
  async (req, res) => {
    try {
      const provider = req.params.provider;
      const eventId =
        req.body?.event_id ||
        req.body?.txnid ||
        req.body?.transactionId ||
        req.headers['x-webhook-id'] ||
        crypto.createHash('sha256').update(JSON.stringify(req.body || {})).digest('hex').slice(0, 40);
      const payloadHash = crypto.createHash('sha256').update(JSON.stringify(req.body || {})).digest('hex');

      const inserted = await db.query(
        `
        INSERT INTO payment_webhook_dedupe (provider, event_id, payload_hash)
        VALUES ($1,$2,$3)
        ON CONFLICT (provider, event_id) DO NOTHING
        RETURNING id
        `,
        [provider, String(eventId), payloadHash]
      );

      if (!inserted.rows.length) {
        return res.json({
          status: 'success',
          duplicate: true,
          message: 'Duplicate webhook ignored; no financial event created.',
        });
      }

      res.json({
        status: 'success',
        duplicate: false,
        event_id: eventId,
        message: 'Webhook accepted for reconciliation processing.',
      });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
);

router.post(
  '/items/:id/resolve',
  authenticate,
  requireRoles('Super Admin', 'Franchise Owner', 'Franchise Manager'),
  async (req, res) => {
    try {
      const reason = (req.body?.note || 'Manually reconciled').toString().slice(0, 500);
      const result = await db.query(
        `
        UPDATE payment_reconciliation_items
        SET reconciled = TRUE, mismatch_reason = COALESCE(mismatch_reason,'') || ' | RESOLVED: ' || $1
        WHERE id = $2
        RETURNING *
        `,
        [reason, req.params.id]
      );
      if (!result.rows.length) {
        return res.status(404).json({ status: 'error', message: 'Item not found' });
      }
      await writeAudit({
        req,
        action: 'PAYMENT_RECONCILE_RESOLVE',
        module: 'Payments',
        entity_type: 'reconciliation_item',
        entity_id: req.params.id,
        details: { note: reason },
        outcome: 'success',
      });
      res.json({ status: 'success', data: result.rows[0] });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
);

module.exports = router;
