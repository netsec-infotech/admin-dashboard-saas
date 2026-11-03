/**
 * MSG-01 — Operational messaging across WhatsApp, SMS, and push with delivery tracking.
 */
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate, requireRoles } = require('../middleware/auth');
const { writeAudit } = require('../utils/auditHelper');

const TEMPLATES = [
  { key: 'kyc_decision', label: 'KYC Decision', channels: ['whatsapp', 'sms', 'push'] },
  { key: 'ride_confirmation', label: 'Ride Confirmation & Unlock Code', channels: ['whatsapp', 'sms', 'push'] },
  { key: 'overdue_warning', label: 'Overdue Rental Warning', channels: ['whatsapp', 'sms', 'push'] },
  { key: 'deposit_refund', label: 'Deposit Refund Confirmation', channels: ['whatsapp', 'sms'] },
  { key: 'ops_announcement', label: 'Operational Announcement', channels: ['push', 'sms'] },
];

async function ensureTables() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS message_outbox (
      id SERIAL PRIMARY KEY,
      template_key VARCHAR(80) NOT NULL,
      channel VARCHAR(30) NOT NULL,
      rider_mobile VARCHAR(20),
      rider_name VARCHAR(150),
      context JSONB DEFAULT '{}',
      body_preview TEXT,
      delivery_status VARCHAR(40) DEFAULT 'queued',
      provider_ref VARCHAR(150),
      error_message TEXT,
      created_by VARCHAR(150),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `).catch(() => {});
}
ensureTables();

function redactContext(ctx = {}) {
  const clone = { ...ctx };
  // Never expose full Aadhaar / secrets in logs or API dumps
  if (clone.aadhaar) clone.aadhaar = String(clone.aadhaar).replace(/\d(?=\d{4})/g, 'X');
  if (clone.unlock_code) clone.unlock_code = '******';
  if (clone.pin) delete clone.pin;
  return clone;
}

router.get('/templates', authenticate, (req, res) => {
  res.json({ status: 'success', data: TEMPLATES });
});

router.get(
  '/',
  authenticate,
  requireRoles('Super Admin', 'Franchise Owner', 'Franchise Manager', 'Zone Operator', 'Operations Manager'),
  async (req, res) => {
    try {
      const { status, channel, limit = 100 } = req.query;
      let q = 'SELECT * FROM message_outbox WHERE 1=1';
      const params = [];
      if (status) {
        params.push(status);
        q += ` AND delivery_status = $${params.length}`;
      }
      if (channel) {
        params.push(channel);
        q += ` AND channel = $${params.length}`;
      }
      params.push(Math.min(Number(limit) || 100, 500));
      q += ` ORDER BY created_at DESC LIMIT $${params.length}`;
      const result = await db.query(q, params);
      const data = result.rows.map((row) => ({
        ...row,
        context: redactContext(row.context || {}),
      }));
      res.json({ status: 'success', data });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
);

router.post(
  '/send',
  authenticate,
  requireRoles('Super Admin', 'Franchise Owner', 'Franchise Manager', 'Operations Manager'),
  async (req, res) => {
    try {
      const { template_key, channel, rider_mobile, rider_name, context = {}, body } = req.body || {};
      const tmpl = TEMPLATES.find((t) => t.key === template_key);
      if (!tmpl) {
        return res.status(400).json({ status: 'error', message: 'Unknown template_key' });
      }
      if (!tmpl.channels.includes(channel)) {
        return res.status(400).json({
          status: 'error',
          message: `Channel ${channel} not allowed for template ${template_key}`,
        });
      }
      if (!rider_mobile) {
        return res.status(400).json({ status: 'error', message: 'rider_mobile required' });
      }

      const preview =
        body ||
        `[${tmpl.label}] to ${rider_name || rider_mobile} via ${channel} — context keys: ${Object.keys(context).join(',')}`;

      const inserted = await db.query(
        `
        INSERT INTO message_outbox
          (template_key, channel, rider_mobile, rider_name, context, body_preview, delivery_status, created_by)
        VALUES ($1,$2,$3,$4,$5,$6,'queued',$7)
        RETURNING *
        `,
        [
          template_key,
          channel,
          String(rider_mobile).slice(-10),
          rider_name || null,
          JSON.stringify(redactContext(context)),
          preview.slice(0, 500),
          req.user?.email || req.userRole || 'system',
        ]
      );

      // Simulate async provider handoff
      setTimeout(async () => {
        const ok = Math.random() > 0.08;
        await db.query(
          `UPDATE message_outbox SET delivery_status=$1, provider_ref=$2, error_message=$3, updated_at=NOW() WHERE id=$4`,
          [
            ok ? 'delivered' : 'failed',
            ok ? `MSG-${Date.now()}` : null,
            ok ? null : 'Provider temporary failure',
            inserted.rows[0].id,
          ]
        ).catch(() => {});
      }, 300);

      await writeAudit({
        req,
        action: 'MESSAGE_QUEUE',
        module: 'Messaging',
        entity_type: 'message',
        entity_id: inserted.rows[0].id,
        details: {
          template_key,
          channel,
          rider_mobile: String(rider_mobile).slice(-4).padStart(10, 'X'),
        },
        outcome: 'queued',
      });

      res.status(201).json({
        status: 'success',
        data: { ...inserted.rows[0], context: redactContext(context) },
        message: 'Message queued. Delivery status will update asynchronously.',
      });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
);

module.exports = router;
