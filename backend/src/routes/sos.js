/**
 * RIDE-03 — Emergency SOS queue with acknowledgement and resolution audit.
 */
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate, requireRoles } = require('../middleware/auth');
const { writeAudit } = require('../utils/auditHelper');

async function ensureSosTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS sos_events (
      id SERIAL PRIMARY KEY,
      rider_name VARCHAR(150),
      rider_mobile VARCHAR(20),
      ride_id VARCHAR(100),
      vehicle_code VARCHAR(100),
      lat DECIMAL(10,7),
      lng DECIMAL(10,7),
      location_updated_at TIMESTAMPTZ DEFAULT NOW(),
      status VARCHAR(30) DEFAULT 'open',
      priority VARCHAR(20) DEFAULT 'high',
      acknowledged_by VARCHAR(150),
      acknowledged_at TIMESTAMPTZ,
      resolved_by VARCHAR(150),
      resolved_at TIMESTAMPTZ,
      resolution_notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `).catch(() => {});

  const count = await db.query('SELECT COUNT(*)::int AS c FROM sos_events').catch(() => ({ rows: [{ c: 0 }] }));
  if ((count.rows[0]?.c || 0) === 0) {
    await db.query(`
      INSERT INTO sos_events (rider_name, rider_mobile, ride_id, vehicle_code, lat, lng, status, priority)
      VALUES
        ('Aarav Shah', '9876500011', 'RIDE-9041', 'EVG-1024', 22.3072, 73.1812, 'open', 'high'),
        ('Neha Patel', '9876500022', 'RIDE-9055', 'EVG-1180', 22.3225, 73.1650, 'acknowledged', 'high')
    `).catch(() => {});
  }
}
ensureSosTable();

router.get(
  '/',
  authenticate,
  requireRoles('Super Admin', 'Franchise Owner', 'Franchise Manager', 'Zone Operator', 'Zone Admin', 'Operations Manager'),
  async (req, res) => {
    try {
      const { status } = req.query;
      let q = 'SELECT * FROM sos_events WHERE 1=1';
      const params = [];
      if (status && status !== 'all') {
        params.push(status);
        q += ` AND status = $${params.length}`;
      }
      q += ' ORDER BY CASE status WHEN \'open\' THEN 0 WHEN \'acknowledged\' THEN 1 ELSE 2 END, created_at DESC LIMIT 200';
      const result = await db.query(q, params);
      const freshnessMs = 5 * 60 * 1000;
      const data = result.rows.map((row) => {
        const locAge = Date.now() - new Date(row.location_updated_at || row.created_at).getTime();
        return {
          ...row,
          location_fresh: locAge <= freshnessMs,
          location_age_seconds: Math.floor(locAge / 1000),
          dial_url: row.rider_mobile ? `tel:+91${String(row.rider_mobile).replace(/\D/g, '').slice(-10)}` : null,
        };
      });
      res.json({ status: 'success', data });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
);

router.post('/ingest', async (req, res) => {
  try {
    const { rider_name, rider_mobile, ride_id, vehicle_code, lat, lng } = req.body || {};
    if (!rider_mobile && !vehicle_code) {
      return res.status(400).json({ status: 'error', message: 'rider_mobile or vehicle_code required' });
    }
    const result = await db.query(
      `
      INSERT INTO sos_events (rider_name, rider_mobile, ride_id, vehicle_code, lat, lng, status, priority, location_updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,'open','high',NOW())
      RETURNING *
      `,
      [rider_name || null, rider_mobile || null, ride_id || null, vehicle_code || null, lat || null, lng || null]
    );
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

router.post(
  '/:id/acknowledge',
  authenticate,
  requireRoles('Super Admin', 'Franchise Owner', 'Franchise Manager', 'Zone Operator', 'Zone Admin', 'Operations Manager'),
  async (req, res) => {
    try {
      const actor = req.user?.email || req.userRole || 'operator';
      const result = await db.query(
        `
        UPDATE sos_events
        SET status = 'acknowledged', acknowledged_by = $1, acknowledged_at = NOW()
        WHERE id = $2 AND status = 'open'
        RETURNING *
        `,
        [actor, req.params.id]
      );
      if (!result.rows.length) {
        return res.status(404).json({ status: 'error', message: 'Open SOS event not found' });
      }
      await writeAudit({
        req,
        action: 'SOS_ACKNOWLEDGE',
        module: 'RideSafety',
        entity_type: 'sos_event',
        entity_id: req.params.id,
        details: result.rows[0],
        outcome: 'success',
      });
      res.json({ status: 'success', data: result.rows[0] });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
);

router.post(
  '/:id/resolve',
  authenticate,
  requireRoles('Super Admin', 'Franchise Owner', 'Franchise Manager', 'Zone Operator', 'Zone Admin', 'Operations Manager'),
  async (req, res) => {
    try {
      const actor = req.user?.email || req.userRole || 'operator';
      const notes = (req.body?.notes || '').toString().slice(0, 1000);
      const result = await db.query(
        `
        UPDATE sos_events
        SET status = 'resolved', resolved_by = $1, resolved_at = NOW(), resolution_notes = $2
        WHERE id = $3 AND status IN ('open','acknowledged')
        RETURNING *
        `,
        [actor, notes, req.params.id]
      );
      if (!result.rows.length) {
        return res.status(404).json({ status: 'error', message: 'Active SOS event not found' });
      }
      await writeAudit({
        req,
        action: 'SOS_RESOLVE',
        module: 'RideSafety',
        entity_type: 'sos_event',
        entity_id: req.params.id,
        details: { notes, event: result.rows[0] },
        outcome: 'success',
      });
      res.json({ status: 'success', data: result.rows[0] });
    } catch (err) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  }
);

module.exports = router;
