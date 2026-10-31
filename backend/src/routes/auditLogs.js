const express = require('express');
const router = express.Router();
const db = require('../db');

// Ensure audit_logs table exists
(async () => {
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
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
  } catch (e) {
    console.warn('Audit logs DB init notice:', e.message);
  }
})();

// GET /api/audit-logs - List audit logs with optional filters
router.get('/', async (req, res) => {
  try {
    const { user_id, action, module: modName, search, limit = 50 } = req.query;

    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];
    let pIdx = 1;

    if (user_id) {
      query += ` AND (user_id = $${pIdx} OR performed_by IN (SELECT name FROM users WHERE id = $${pIdx}))`;
      params.push(user_id);
      pIdx++;
    }

    if (action && action !== 'All Actions') {
      query += ` AND UPPER(action) = UPPER($${pIdx})`;
      params.push(action);
      pIdx++;
    }

    if (modName && modName !== 'All Modules') {
      query += ` AND UPPER(module) = UPPER($${pIdx})`;
      params.push(modName);
      pIdx++;
    }

    if (search) {
      query += ` AND (details ILIKE $${pIdx} OR performed_by ILIKE $${pIdx} OR module ILIKE $${pIdx})`;
      params.push(`%${search}%`);
      pIdx++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${pIdx}`;
    params.push(limit);

    const result = await db.query(query, params);
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST /api/audit-logs - Create audit log entry
router.post('/', async (req, res) => {
  try {
    const { user_id, user_name, action, module: modName, details, performed_by, ip_address } = req.body;

    const result = await db.query(`
      INSERT INTO audit_logs (user_id, user_name, action, module, details, performed_by, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      user_id || null,
      user_name || null,
      action || 'INFO',
      modName || 'System',
      details || 'Action performed',
      performed_by || 'System User',
      ip_address || req.ip || '127.0.0.1'
    ]);

    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    console.error('Error creating audit log:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
