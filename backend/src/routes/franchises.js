const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate, requireRoles, enforceTenantScope } = require('../middleware/auth');

// Helper to sanitize text
const clean = (val) => (val !== undefined && val !== null ? String(val).trim() : '');

// 1. GET /api/franchises - List all franchise hubs (filtered by zone if requested)
router.get('/', async (req, res) => {
  try {
    const { zone, search, status } = req.query;
    let query = 'SELECT * FROM franchises WHERE 1=1';
    const params = [];

    if (zone && zone !== 'All Zones' && zone !== 'Multiple Zones') {
      params.push(`%${zone}%`);
      query += ` AND zone ILIKE $${params.length}`;
    }

    if (status && status !== 'All') {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (name ILIKE $${params.length} OR code ILIKE $${params.length} OR owner_name ILIKE $${params.length})`;
    }

    query += ' ORDER BY created_at DESC';
    const result = await db.query(query, params);

    res.json({
      status: 'success',
      data: result.rows,
      count: result.rows.length,
    });
  } catch (err) {
    console.error('Fetch franchises error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve franchises: ' + err.message });
  }
});

// 2. GET /api/franchises/:id - Single franchise detail with fleet metrics
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM franchises WHERE id::text = $1 OR code = $1 LIMIT 1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Franchise not found' });
    }

    const franchise = result.rows[0];

    // Get live vehicle count in franchise zone
    const vehicleCountRes = await db.query(
      'SELECT COUNT(*)::int as count FROM vehicles WHERE zone ILIKE $1',
      [`%${franchise.zone}%`]
    ).catch(() => ({ rows: [{ count: franchise.assigned_vehicles || 0 }] }));

    // Get live battery count in franchise zone
    const batteryCountRes = await db.query(
      'SELECT COUNT(*)::int as count FROM batteries WHERE zone ILIKE $1',
      [`%${franchise.zone}%`]
    ).catch(() => ({ rows: [{ count: franchise.assigned_batteries || 0 }] }));

    franchise.live_vehicles = vehicleCountRes.rows[0]?.count || 0;
    franchise.live_batteries = batteryCountRes.rows[0]?.count || 0;

    res.json({ status: 'success', data: franchise });
  } catch (err) {
    console.error('Fetch franchise detail error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve franchise details' });
  }
});

// 3. POST /api/franchises - Create a new franchise hub (Admins only)
router.post('/', authenticate, requireRoles('admin', 'superadmin'), async (req, res) => {
  try {
    const {
      name,
      owner_name,
      email,
      mobile,
      hub_address,
      city,
      state,
      zone,
      revenue_share,
      assigned_vehicles,
      assigned_batteries,
      operating_hours,
    } = req.body;

    if (!name || !owner_name || !mobile || !hub_address) {
      return res.status(400).json({
        status: 'error',
        message: 'Name, owner name, mobile number, and hub address are required.',
      });
    }

    const code = req.body.code || `FR-${clean(city || 'HUB').slice(0, 4).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    const insertRes = await db.query(
      `INSERT INTO franchises (
        code, name, owner_name, email, mobile, hub_address, city, state, zone,
        revenue_share, assigned_vehicles, assigned_batteries, operating_hours
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        code,
        clean(name),
        clean(owner_name),
        clean(email) || null,
        clean(mobile),
        clean(hub_address),
        clean(city || 'Vadodara'),
        clean(state || 'Gujarat'),
        clean(zone || 'Gotri Zone'),
        parseFloat(revenue_share || 80.0),
        parseInt(assigned_vehicles || 0),
        parseInt(assigned_batteries || 0),
        clean(operating_hours || '08:00 AM - 10:00 PM'),
      ]
    );

    res.status(201).json({
      status: 'success',
      message: 'Franchise created successfully',
      data: insertRes.rows[0],
    });
  } catch (err) {
    console.error('Create franchise error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to create franchise: ' + err.message });
  }
});

// 4. GET /api/franchises/expenses/all - Retrieve expenses across hubs or for specific hub
router.get('/expenses/all', authenticate, enforceTenantScope('franchise_id'), async (req, res) => {
  try {
    let { franchise_id, category, search, start_date, end_date } = req.query;
    if (req.scopedFranchiseId) {
      franchise_id = req.scopedFranchiseId;
    }
    let query = 'SELECT * FROM franchise_expenses WHERE 1=1';
    const params = [];

    if (franchise_id) {
      params.push(franchise_id);
      query += ` AND franchise_id::text = $${params.length}`;
    }

    if (category && category !== 'All' && category !== 'All Categories') {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    if (start_date) {
      params.push(start_date);
      query += ` AND expense_date >= $${params.length}`;
    }

    if (end_date) {
      params.push(end_date);
      query += ` AND expense_date <= $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (title ILIKE $${params.length} OR franchise_name ILIKE $${params.length} OR invoice_number ILIKE $${params.length})`;
    }

    query += ' ORDER BY expense_date DESC, created_at DESC';
    const result = await db.query(query, params);

    // Summary calculations
    let totalExpense = 0;
    const categoryTotals = {};

    result.rows.forEach((r) => {
      const amt = parseFloat(r.amount || 0);
      totalExpense += amt;
      categoryTotals[r.category] = (categoryTotals[r.category] || 0) + amt;
    });

    res.json({
      status: 'success',
      data: result.rows,
      summary: {
        totalExpense,
        count: result.rows.length,
        categoryTotals,
      },
    });
  } catch (err) {
    console.error('Fetch franchise expenses error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve expenses: ' + err.message });
  }
});

// 5. POST /api/franchises/expenses - Record a new franchise expense
router.post('/expenses', authenticate, enforceTenantScope('franchise_id'), async (req, res) => {
  try {
    let {
      franchise_id,
      franchise_name,
      category,
      title,
      amount,
      expense_date,
      payment_mode,
      invoice_number,
      notes,
      created_by,
    } = req.body;

    if (req.scopedFranchiseId) {
      franchise_id = req.scopedFranchiseId;
    }

    const numAmount = parseFloat(amount);
    if (!category || !title || isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Category, title, and a valid positive amount are required.',
      });
    }

    // Resolve franchise record if franchise_id provided, otherwise fallback
    let resolvedFranchiseId = franchise_id || null;
    let resolvedFranchiseName = franchise_name || 'Gotri Central Hub';

    if (franchise_id) {
      const frRes = await db.query('SELECT id, name FROM franchises WHERE id::text = $1 LIMIT 1', [franchise_id]);
      if (frRes.rows[0]) {
        resolvedFranchiseId = frRes.rows[0].id;
        resolvedFranchiseName = frRes.rows[0].name;
      }
    } else {
      // Pick first active franchise as association if none passed
      const frFallback = await db.query('SELECT id, name FROM franchises LIMIT 1');
      if (frFallback.rows[0]) {
        resolvedFranchiseId = frFallback.rows[0].id;
        resolvedFranchiseName = frFallback.rows[0].name;
      }
    }

    const insertRes = await db.query(
      `INSERT INTO franchise_expenses (
        franchise_id, franchise_name, category, title, amount,
        expense_date, payment_mode, invoice_number, notes, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        resolvedFranchiseId,
        resolvedFranchiseName,
        clean(category),
        clean(title),
        numAmount,
        expense_date || new Date().toISOString().split('T')[0],
        clean(payment_mode || 'UPI'),
        clean(invoice_number || `INV-${Date.now().toString().slice(-6)}`),
        clean(notes || ''),
        clean(created_by || req.user?.name || 'Admin'),
      ]
    );

    res.status(201).json({
      status: 'success',
      message: 'Expense recorded successfully',
      data: insertRes.rows[0],
    });
  } catch (err) {
    console.error('Create expense error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to record expense: ' + err.message });
  }
});

// 6. DELETE /api/franchises/expenses/:id - Delete an expense record
router.delete('/expenses/:id', authenticate, requireRoles('admin', 'superadmin', 'franchise'), async (req, res) => {
  try {
    const { id } = req.params;
    let query = 'DELETE FROM franchise_expenses WHERE id::text = $1';
    const params = [id];

    if (req.franchiseId) {
      query += ' AND franchise_id::text = $2';
      params.push(req.franchiseId);
    }

    query += ' RETURNING id';
    const deleteRes = await db.query(query, params);
    if (deleteRes.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Expense record not found or access denied' });
    }
    res.json({ status: 'success', message: 'Expense deleted successfully' });
  } catch (err) {
    console.error('Delete expense error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to delete expense' });
  }
});

module.exports = router;
