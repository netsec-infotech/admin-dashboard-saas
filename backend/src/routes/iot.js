const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate, requireRoles } = require('../middleware/auth');

const clean = (val) => (val !== undefined && val !== null ? String(val).trim() : '');

// 1. GET /api/iot/inward - List all inward batches with search & filters
router.get('/inward', async (req, res) => {
  try {
    const { search, status, type, supplier, limit = 50, offset = 0 } = req.query;
    let query = 'SELECT * FROM iot_inward_batches WHERE 1=1';
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (inward_no ILIKE $${params.length} OR invoice_no ILIKE $${params.length} OR device_model ILIKE $${params.length} OR supplier ILIKE $${params.length})`;
    }

    if (status && status !== 'all') {
      params.push(status);
      query += ` AND status ILIKE $${params.length}`;
    }

    if (type && type !== 'all') {
      params.push(type);
      query += ` AND device_type ILIKE $${params.length}`;
    }

    if (supplier && supplier !== 'all') {
      params.push(`%${supplier}%`);
      query += ` AND supplier ILIKE $${params.length}`;
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(parseInt(limit), parseInt(offset));

    const result = await db.query(query, params);
    const countRes = await db.query('SELECT COUNT(*) FROM iot_inward_batches');

    res.json({
      status: 'success',
      total: parseInt(countRes.rows[0].count),
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    console.error('Fetch IoT inward error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 2. POST /api/iot/inward - Log Inward batch and register serialized devices
router.post('/inward', authenticate, requireRoles('admin', 'superadmin', 'operator'), async (req, res) => {
  const client = await db.getClient();
  try {
    const {
      supplier,
      invoice_no,
      invoice_date,
      po_no,
      device_type,
      device_model,
      devices = [], // array of { serial, type, model, vehiclePlate }
      notes,
      created_by = 'Admin'
    } = req.body;

    if (!supplier || !invoice_no) {
      return res.status(400).json({ status: 'error', message: 'Supplier and invoice number are required.' });
    }

    const inwardNo = `INW-${Date.now().toString().slice(-4)}`;
    const quantity = Array.isArray(devices) && devices.length > 0 ? devices.length : (parseInt(req.body.quantity) || 1);

    await client.query('BEGIN');

    // Insert inward batch record
    const batchRes = await client.query(`
      INSERT INTO iot_inward_batches (
        inward_no, invoice_no, invoice_date, supplier, po_no,
        device_type, device_model, quantity, status, qc_status, notes, created_by, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Completed', 'Accepted', $9, $10, NOW())
      RETURNING *
    `, [
      inwardNo,
      clean(invoice_no),
      invoice_date || new Date().toISOString().slice(0, 10),
      clean(supplier),
      clean(po_no || ''),
      clean(device_type || devices[0]?.type || 'GPS Tracker'),
      clean(device_model || devices[0]?.model || 'GLX-GT06'),
      quantity,
      clean(notes || ''),
      clean(created_by)
    ]);

    const batch = batchRes.rows[0];
    const registeredDevices = [];

    // Register individual serialized devices
    if (Array.isArray(devices) && devices.length > 0) {
      for (const d of devices) {
        const serialNo = clean(d.serial_number || d.serial);
        if (!serialNo) continue;
        const vehiclePlate = clean(d.assigned_vehicle_code || d.vehiclePlate || d.vehicle_code);
        const isBound = Boolean(vehiclePlate);
        const devRes = await client.query(`
          INSERT INTO iot_devices (
            serial_number, device_type, device_model, supplier, invoice_no,
            inward_batch_id, inward_no, status, qc_status,
            assigned_vehicle_code, installed_at, is_simulated, notes, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Accepted', $9, $10, false, $11, NOW())
          ON CONFLICT (serial_number) DO UPDATE SET
            assigned_vehicle_code = COALESCE(EXCLUDED.assigned_vehicle_code, iot_devices.assigned_vehicle_code),
            status = EXCLUDED.status,
            installed_at = COALESCE(EXCLUDED.installed_at, iot_devices.installed_at)
          RETURNING *
        `, [
          serialNo,
          clean(d.device_type || d.type || batch.device_type),
          clean(d.device_model || d.model || batch.device_model),
          clean(d.supplier || supplier),
          clean(invoice_no),
          batch.id,
          batch.inward_no,
          isBound ? 'Installed' : 'In Stock',
          isBound ? vehiclePlate : null,
          isBound ? new Date() : null,
          clean(d.notes || '')
        ]);
        registeredDevices.push(devRes.rows[0]);
      }
    }

    // Record audit log
    await client.query(`
      INSERT INTO audit_logs (action, module, details, performed_by, created_at)
      VALUES ('CREATE', 'IoT Management', $1, $2, NOW())
    `, [
      `Logged inward batch ${inwardNo} with ${registeredDevices.length} devices from ${supplier} (Invoice: ${invoice_no})`,
      created_by
    ]);

    await client.query('COMMIT');

    res.status(201).json({
      status: 'success',
      message: 'Inward batch logged and devices registered successfully',
      batch,
      registeredCount: registeredDevices.length,
      devices: registeredDevices
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create IoT inward batch error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to log inward batch: ' + err.message });
  } finally {
    client.release();
  }
});

// 3. GET /api/iot/devices - List devices with KPI stats & filters
router.get('/devices', async (req, res) => {
  try {
    const { status, type, search, limit = 100, offset = 0 } = req.query;
    let query = 'SELECT * FROM iot_devices WHERE 1=1';
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (serial_number ILIKE $${params.length} OR assigned_vehicle_code ILIKE $${params.length} OR device_model ILIKE $${params.length})`;
    }

    if (status && status !== 'all') {
      params.push(status);
      query += ` AND status ILIKE $${params.length}`;
    }

    if (type && type !== 'all') {
      params.push(type);
      query += ` AND device_type ILIKE $${params.length}`;
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(parseInt(limit), parseInt(offset));

    const result = await db.query(query, params);

    // KPI Metrics calculation
    const [totalRes, activeRes, stockRes] = await Promise.all([
      db.query('SELECT COUNT(*) FROM iot_devices'),
      db.query("SELECT COUNT(*) FROM iot_devices WHERE status ILIKE 'Installed' AND last_heartbeat > NOW() - INTERVAL '15 minutes'"),
      db.query("SELECT COUNT(*) FROM iot_devices WHERE status ILIKE 'In Stock'"),
    ]);

    const totalCount = parseInt(totalRes.rows[0].count);
    const activeSignalCount = parseInt(activeRes.rows[0].count);
    const inStockCount = parseInt(stockRes.rows[0].count);

    res.json({
      status: 'success',
      kpis: {
        totalInstalled: totalCount,
        activeSignals: activeSignalCount,
        inStock: inStockCount,
        noSignal: Math.max(0, totalCount - activeSignalCount - inStockCount),
      },
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    console.error('Fetch IoT devices error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 4. POST /api/iot/devices/assign - Assign device to vehicle or battery
router.post('/devices/assign', authenticate, requireRoles('admin', 'superadmin', 'operator'), async (req, res) => {
  try {
    const { serial_number, vehicle_code, battery_id, performed_by = 'Admin' } = req.body;

    if (!serial_number) {
      return res.status(400).json({ status: 'error', message: 'Device serial number is required' });
    }

    const updateRes = await db.query(`
      UPDATE iot_devices
      SET 
        assigned_vehicle_code = $1::text,
        assigned_battery_id = $2::text,
        status = CASE WHEN $1::text IS NOT NULL OR $2::text IS NOT NULL THEN 'Installed' ELSE 'In Stock' END,
        installed_at = CASE WHEN $1::text IS NOT NULL OR $2::text IS NOT NULL THEN NOW() ELSE NULL END
      WHERE serial_number = $3::text
      RETURNING *
    `, [vehicle_code || null, battery_id || null, serial_number]);

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Device not found' });
    }

    // Record audit log
    await db.query(`
      INSERT INTO audit_logs (action, module, details, performed_by, created_at)
      VALUES ('UPDATE', 'IoT Management', $1, $2, NOW())
    `, [
      `Assigned IoT device ${serial_number} to vehicle ${vehicle_code || 'None'} / battery ${battery_id || 'None'}`,
      performed_by
    ]).catch(() => {});

    res.json({
      status: 'success',
      message: 'Device assignment updated successfully',
      data: updateRes.rows[0],
      device: updateRes.rows[0],
    });
  } catch (err) {
    console.error('Device assignment error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 5. POST /api/iot/devices/heartbeat - Record real or simulated hardware heartbeat
router.post('/devices/heartbeat', async (req, res) => {
  try {
    const { serial_number, is_simulated = false, notes } = req.body;

    if (!serial_number) {
      return res.status(400).json({ status: 'error', message: 'serial_number is required' });
    }

    const result = await db.query(`
      UPDATE iot_devices
      SET 
        last_heartbeat = NOW(),
        is_simulated = $1,
        notes = COALESCE($2, notes)
      WHERE serial_number = $3
      RETURNING *
    `, [Boolean(is_simulated), notes || null, serial_number]);

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Device not found' });
    }

    res.json({
      status: 'success',
      message: 'Device heartbeat recorded',
      data: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
