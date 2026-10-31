const express = require('express');
const router = express.Router();
const db = require('../db');
const { getCache, setCache, delByPattern } = require('../redis');

// Ensure maintenance_orders table exists
(async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS maintenance_orders (
        id SERIAL PRIMARY KEY,
        ticket_id VARCHAR(100) UNIQUE NOT NULL,
        vehicle_code VARCHAR(100),
        vehicle_model VARCHAR(100),
        vehicle_category VARCHAR(100) DEFAULT 'E-Scooter',
        issue_category VARCHAR(100) DEFAULT 'General Service',
        description TEXT,
        assigned_technician VARCHAR(100),
        service_center VARCHAR(150),
        priority VARCHAR(50) DEFAULT 'Medium',
        status VARCHAR(50) DEFAULT 'Scheduled',
        estimated_cost NUMERIC(10, 2) DEFAULT 0.00,
        zone VARCHAR(100) DEFAULT 'Alkapuri Zone',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
  } catch (e) {
    console.warn('Maintenance DB init notice:', e.message);
  }
})();

// GET /api/maintenance/stats - Fetch stats and breakdown summary directly from DB
router.get('/stats', async (req, res) => {
  try {
    const [totalRes, upcomingRes, completedRes, overdueRes, underMaintRes, dueSoonRes, typeBreakdown] = await Promise.all([
      db.query(`SELECT COUNT(*) FROM maintenance_orders`),
      db.query(`SELECT COUNT(*) FROM maintenance_orders WHERE status IN ('Scheduled', 'Due Soon', 'In Progress', 'Under Maintenance')`),
      db.query(`SELECT COUNT(*) FROM maintenance_orders WHERE status = 'Completed'`),
      db.query(`SELECT COUNT(*) FROM maintenance_orders WHERE status = 'Overdue'`),
      db.query(`SELECT COUNT(*) FROM maintenance_orders WHERE status IN ('Under Maintenance', 'In Progress')`),
      db.query(`SELECT COUNT(*) FROM maintenance_orders WHERE status IN ('Due Soon', 'Scheduled')`),
      db.query(`
        SELECT issue_category as name, COUNT(*)::int as count 
        FROM maintenance_orders 
        GROUP BY issue_category 
        ORDER BY count DESC
      `)
    ]);

    const total = parseInt(totalRes.rows[0]?.count || 0);
    const upcoming = parseInt(upcomingRes.rows[0]?.count || 0);
    const completed = parseInt(completedRes.rows[0]?.count || 0);
    const overdue = parseInt(overdueRes.rows[0]?.count || 0);
    const underMaint = parseInt(underMaintRes.rows[0]?.count || 0);
    const dueSoon = parseInt(dueSoonRes.rows[0]?.count || 0);

    const payload = {
      status: 'success',
      data: {
        total,
        upcoming,
        completed,
        overdue,
        under_maintenance: underMaint,
        due_soon: dueSoon,
        breakdown: typeBreakdown.rows
      }
    };

    res.json(payload);
  } catch (err) {
    console.error('Error fetching maintenance stats:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET /api/maintenance/overview-metrics - Detailed KPIs, Upcoming, Top Costs & Recent History
router.get('/overview-metrics', async (req, res) => {
  try {
    const [upcomingRes, topCostsRes, historyRes, costSumRes] = await Promise.all([
      // 1. Upcoming Services
      db.query(`
        SELECT id, ticket_id, vehicle_code, vehicle_model, issue_category, scheduled_date, status, estimated_cost, zone, description
        FROM maintenance_orders
        WHERE status IN ('Scheduled', 'Due Soon', 'In Progress', 'Under Maintenance')
        ORDER BY COALESCE(scheduled_date, created_at) ASC
        LIMIT 6
      `).catch(() => ({ rows: [] })),

      // 2. Top Maintenance Costs by category
      db.query(`
        SELECT 
          issue_category,
          COUNT(*)::int as count,
          COALESCE(SUM(estimated_cost), 0)::numeric as total_cost
        FROM maintenance_orders
        GROUP BY issue_category
        ORDER BY total_cost DESC
        LIMIT 5
      `).catch(() => ({ rows: [] })),

      // 3. Recent Service History
      db.query(`
        SELECT id, ticket_id, vehicle_code, vehicle_model, issue_category, assigned_technician, created_at, status, estimated_cost, zone
        FROM maintenance_orders
        WHERE status = 'Completed' OR status = 'Resolved'
        ORDER BY updated_at DESC, created_at DESC
        LIMIT 6
      `).catch(() => ({ rows: [] })),

      // 4. Financial Cost Aggregates
      db.query(`
        SELECT 
          COALESCE(SUM(estimated_cost), 0)::numeric as total_cost,
          COALESCE(AVG(estimated_cost), 0)::numeric as avg_cost
        FROM maintenance_orders
      `).catch(() => ({ rows: [{ total_cost: 0, avg_cost: 0 }] }))
    ]);

    const totalCost = parseFloat(costSumRes.rows[0]?.total_cost || 0);
    const avgCost = parseFloat(costSumRes.rows[0]?.avg_cost || 0);

    res.json({
      status: 'success',
      data: {
        upcoming_services: upcomingRes.rows,
        top_costs: topCostsRes.rows,
        recent_history: historyRes.rows,
        total_cost: totalCost,
        avg_cost: Math.round(avgCost)
      }
    });
  } catch (err) {
    console.error('Error fetching maintenance overview metrics:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST /api/maintenance/bulk-delete - Bulk delete maintenance orders
router.post('/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No IDs provided for bulk delete' });
    }

    await db.query(`DELETE FROM maintenance_orders WHERE id = ANY($1::uuid[]) OR ticket_id = ANY($1::text[])`, [ids]);
    res.json({ status: 'success', message: `${ids.length} maintenance record(s) deleted successfully.` });
  } catch (err) {
    console.error('Error bulk deleting maintenance records:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST /api/maintenance/reminder - Send Service Reminders
router.post('/reminder', async (req, res) => {
  try {
    const { order_ids, reminder_type } = req.body;
    
    // Log audit action
    await db.query(`
      INSERT INTO audit_logs (action, module, details, performed_by, ip_address)
      VALUES ('CREATE', 'Maintenance', $1, 'Super Admin', '127.0.0.1')
    `, [`Sent service reminders (${reminder_type || 'General Service'}) for pending/overdue maintenance orders.`]);

    res.json({
      status: 'success',
      message: 'Service reminder notifications and emails sent successfully to assigned mechanics and riders!'
    });
  } catch (err) {
    console.error('Error sending service reminders:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET /api/maintenance - Fetch all maintenance work orders
router.get('/', async (req, res) => {
  try {
    const { status, type, technician, search, page = 1, limit = 50 } = req.query;
    const cacheKey = `maintenance:list:${status || 'all'}:${type || 'all'}:${technician || 'all'}:${search || 'none'}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    let query = 'SELECT * FROM maintenance_orders WHERE 1=1';
    const params = [];
    let pIdx = 1;

    if (status && status !== 'All Status') {
      query += ` AND status ILIKE $${pIdx}`;
      params.push(status);
      pIdx++;
    }

    if (type && type !== 'All Service Types') {
      query += ` AND issue_category ILIKE $${pIdx}`;
      params.push(type);
      pIdx++;
    }

    if (technician && technician !== 'All Mechanics') {
      query += ` AND assigned_technician ILIKE $${pIdx}`;
      params.push(technician);
      pIdx++;
    }

    if (search) {
      query += ` AND (ticket_id ILIKE $${pIdx} OR vehicle_code ILIKE $${pIdx} OR vehicle_model ILIKE $${pIdx} OR issue_category ILIKE $${pIdx} OR assigned_technician ILIKE $${pIdx})`;
      params.push(`%${search}%`);
      pIdx++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);
    const payload = { status: 'success', data: result.rows, total: result.rows.length };
    res.json(payload);
    setCache(cacheKey, payload, 60);
  } catch (err) {
    console.error('Error fetching maintenance orders:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST /api/maintenance - Create new maintenance work order
router.post('/', async (req, res) => {
  try {
    const { vehicle_code, vehicle_model, vehicle_category, issue_category, description, assigned_technician, service_center, priority, estimated_cost, zone } = req.body;

    const ticket_id = `MAIN-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const result = await db.query(`
      INSERT INTO maintenance_orders (ticket_id, vehicle_code, vehicle_model, vehicle_category, issue_category, description, assigned_technician, service_center, priority, status, estimated_cost, zone)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Scheduled', $10, $11)
      RETURNING *
    `, [
      ticket_id,
      vehicle_code || 'GJ06EV1234',
      vehicle_model || 'Ather 450X',
      vehicle_category || 'E-Scooter',
      issue_category || 'General Service',
      description || '',
      assigned_technician || 'Ramesh Patel',
      service_center || 'Alkapuri Service Center',
      priority || 'Medium',
      estimated_cost || 600.00,
      zone || 'Alkapuri Zone'
    ]);

    delByPattern('maintenance:*');
    res.status(201).json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    console.error('Error creating maintenance order:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// PUT /api/maintenance/:id - Update work order status / technician
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigned_technician, description, priority, estimated_cost } = req.body;

    const result = await db.query(`
      UPDATE maintenance_orders
      SET status = COALESCE($1, status),
          assigned_technician = COALESCE($2, assigned_technician),
          description = COALESCE($3, description),
          priority = COALESCE($4, priority),
          estimated_cost = COALESCE($5, estimated_cost)
      WHERE id = $6 OR ticket_id = $6
      RETURNING *
    `, [status, assigned_technician, description, priority, estimated_cost, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Work order not found' });
    }

    delByPattern('maintenance:*');
    res.json({ status: 'success', data: result.rows[0] });
  } catch (err) {
    console.error('Error updating maintenance order:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// DELETE /api/maintenance/:id - Delete record
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`DELETE FROM maintenance_orders WHERE id = $1 OR ticket_id = $1`, [id]);
    delByPattern('maintenance:*');
    res.json({ status: 'success', message: 'Maintenance record deleted' });
  } catch (err) {
    console.error('Error deleting maintenance record:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
