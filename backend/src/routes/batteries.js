const express = require('express');
const router = express.Router();
const db = require('../db');
const { getCache, setCache, delByPattern } = require('../redis');
const XLSX = require('xlsx');

// GET /api/batteries - List batteries
router.get('/', async (req, res) => {
  try {
    const { status, search, zone } = req.query;
    const cacheKey = `batteries:list:${zone || 'all'}:${status || 'all'}:${search || 'none'}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    let queryText = 'SELECT * FROM batteries WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (zone && String(zone).trim() && String(zone).trim().toLowerCase() !== 'all zones') {
      queryText += ` AND zone ILIKE $${paramCount}`;
      params.push(`%${String(zone).trim()}%`);
      paramCount++;
    }

    if (status && status !== 'all') {
      queryText += ` AND LOWER(status) = LOWER($${paramCount})`;
      params.push(status);
      paramCount++;
    }

    if (search) {
      queryText += ` AND battery_id ILIKE $${paramCount}`;
      params.push(`%${search}%`);
      paramCount++;
    }

    queryText += ' ORDER BY battery_id ASC';

    const result = await db.bmsQuery(queryText, params);
    const rows = result.rows || [];

    res.json(rows);
    setCache(cacheKey, rows, 30);
  } catch (err) {
    console.error('Fetch batteries error:', err);
    res.json([]);
  }
});

// GET /api/batteries/stats - Aggregated real metrics directly from PostgreSQL
router.get('/stats', async (req, res) => {
  try {
    const { zone } = req.query;
    let zoneFilter = '';
    const params = [];
    if (zone && String(zone).trim() && String(zone).trim().toLowerCase() !== 'all zones') {
      zoneFilter = ' WHERE zone ILIKE $1';
      params.push(`%${String(zone).trim()}%`);
    }

    const queryText = `
      SELECT 
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE LOWER(status) = 'available')::int as available,
        COUNT(*) FILTER (WHERE LOWER(status) IN ('in_use', 'in use'))::int as in_use,
        COUNT(*) FILTER (WHERE LOWER(status) = 'charging')::int as charging,
        COUNT(*) FILTER (WHERE LOWER(status) = 'maintenance')::int as maintenance,
        COALESCE(ROUND(AVG(COALESCE(soh, health, 100))), 100)::int as avg_soh,
        COALESCE(ROUND(AVG(COALESCE(soc, 85))), 85)::int as avg_soc,
        COUNT(*) FILTER (WHERE soc < 20)::int as low_soc
      FROM batteries
      ${zoneFilter}
    `;

    const result = await db.bmsQuery(queryText, params);
    const stats = result.rows[0] || {
      total: 0,
      available: 0,
      in_use: 0,
      charging: 0,
      maintenance: 0,
      avg_soh: 100,
      avg_soc: 85,
      low_soc: 0
    };

    res.json(stats);
  } catch (err) {
    console.error('Fetch battery stats error:', err);
    res.status(500).json({ error: 'Failed to fetch battery stats' });
  }
});

// GET /api/batteries/swap-history - List real battery swap records
router.get('/swap-history', async (req, res) => {
  try {
    const { search, status, zone } = req.query;
    let queryText = 'SELECT * FROM battery_swaps WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (zone && String(zone).trim() && String(zone).trim().toLowerCase() !== 'all zones') {
      queryText += ` AND zone ILIKE $${paramCount}`;
      params.push(`%${String(zone).trim()}%`);
      paramCount++;
    }

    if (status && status !== 'all' && status !== 'All') {
      queryText += ` AND LOWER(status) = LOWER($${paramCount})`;
      params.push(status);
      paramCount++;
    }

    if (search && String(search).trim()) {
      const s = `%${String(search).trim()}%`;
      queryText += ` AND (swap_id ILIKE $${paramCount} OR rider_name ILIKE $${paramCount} OR vehicle_number ILIKE $${paramCount} OR old_battery_id ILIKE $${paramCount} OR new_battery_id ILIKE $${paramCount} OR station ILIKE $${paramCount})`;
      params.push(s);
      paramCount++;
    }

    queryText += ' ORDER BY created_at DESC LIMIT 200';

    const result = await db.bmsQuery(queryText, params);
    const rows = result.rows || [];

    // Also get KPI metrics for swap history
    const statsResult = await db.bmsQuery(`
      SELECT 
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE status = 'Completed')::int as completed,
        COUNT(*) FILTER (WHERE status = 'Ongoing')::int as ongoing,
        COUNT(*) FILTER (WHERE status = 'Failed')::int as failed,
        COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE)::int as today
      FROM battery_swaps
    `);
    const stats = statsResult.rows[0] || { total: rows.length, completed: rows.length, ongoing: 0, failed: 0, today: 0 };

    res.json({
      data: rows,
      stats
    });
  } catch (err) {
    console.error('Fetch swap history error:', err);
    res.json({ data: [], stats: { total: 0, completed: 0, ongoing: 0, failed: 0, today: 0 } });
  }
});

// POST /api/batteries/swap - Record a battery swap and update battery and rider states
router.post('/swap', async (req, res) => {
  try {
    const {
      rider_name,
      rider_mobile,
      vehicle_number,
      old_battery_id,
      old_battery_soc,
      new_battery_id,
      new_battery_soc,
      amount,
      payment_mode,
      payment_ref,
      zone,
      station,
      operator,
      notes
    } = req.body;

    if (!new_battery_id) {
      return res.status(400).json({ error: 'new_battery_id is required' });
    }

    const swapId = `SW-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const insertSql = `
      INSERT INTO battery_swaps (
        swap_id, rider_name, rider_mobile, vehicle_number, old_battery_id, old_battery_soc,
        new_battery_id, new_battery_soc, amount, payment_mode, payment_ref, zone,
        station, operator, duration, swap_type, status, notes
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
      RETURNING *
    `;

    const swapResult = await db.bmsQuery(insertSql, [
      swapId,
      rider_name || 'Rider',
      rider_mobile || '',
      vehicle_number || '',
      old_battery_id || '',
      parseInt(old_battery_soc) || 15,
      new_battery_id,
      parseInt(new_battery_soc) || 98,
      parseFloat(amount) || 150.00,
      payment_mode || 'UPI',
      payment_ref || '',
      zone || 'Gotri Zone',
      station || `${zone || 'Gotri'} Station`,
      operator || 'Station Staff',
      '42s',
      'Automated',
      'Completed',
      notes || 'Battery swapped at station'
    ]);

    // Update old battery status -> charging
    if (old_battery_id) {
      await db.bmsQuery(`
        UPDATE batteries SET 
          status = 'charging', 
          soc = $1, 
          vehicle_number = NULL, 
          rider_name = NULL,
          updated_at = NOW()
        WHERE battery_id = $2
      `, [parseInt(old_battery_soc) || 15, old_battery_id]).catch(() => {});
    }

    // Update new battery status -> in_use
    if (new_battery_id) {
      await db.bmsQuery(`
        UPDATE batteries SET 
          status = 'in_use', 
          vehicle_number = $1, 
          rider_name = $2,
          updated_at = NOW()
        WHERE battery_id = $3
      `, [vehicle_number || null, rider_name || null, new_battery_id]).catch(() => {});
    }

    // Update active rider in renters table if vehicle or rider matches
    if (vehicle_number || rider_name) {
      await db.query(`
        UPDATE renters SET 
          battery_id = $1 
        WHERE (vehicle_id = $2 OR rider_name ILIKE $3) AND status ILIKE '%active%'
      `, [new_battery_id, vehicle_number || '', rider_name || '']).catch(() => {});
    }

    try {
      await delByPattern('batteries:*');
      await delByPattern('renters:*');
    } catch (e) {}

    // Dispatch push notification to rider
    try {
      const { sendBatterySwapNotification } = require('./notifications');
      await sendBatterySwapNotification({
        mobile: rider_mobile,
        riderName: rider_name,
        vehicleId: vehicle_number,
        newBatteryId: new_battery_id,
        oldBatterySoc: old_battery_soc,
        newBatterySoc: new_battery_soc,
        amount
      }).catch(notifErr => console.warn('Battery swap push notification notice:', notifErr.message));
    } catch (_) {}

    res.status(201).json({
      status: 'success',
      message: 'Battery swap processed and recorded successfully',
      swap: swapResult.rows[0]
    });
  } catch (err) {
    console.error('Execute battery swap error:', err);
    res.status(500).json({ error: 'Failed to record battery swap', details: err.message });
  }
});

// POST /api/batteries/bulk-delete - Delete multiple batteries
router.post('/bulk-delete', async (req, res) => {
  try {
    const { battery_ids } = req.body;
    if (!Array.isArray(battery_ids) || battery_ids.length === 0) {
      return res.status(400).json({ error: 'battery_ids array is required' });
    }

    await db.bmsQuery('DELETE FROM batteries WHERE battery_id = ANY($1)', [battery_ids]);
    try {
      await delByPattern('batteries:*');
    } catch (e) {}

    res.json({
      status: 'success',
      message: `Deleted ${battery_ids.length} batteries successfully`,
      deleted_ids: battery_ids
    });
  } catch (err) {
    console.error('Bulk delete batteries error:', err);
    res.status(500).json({ error: 'Failed to bulk delete batteries', details: err.message });
  }
});

// DELETE /api/batteries/:battery_id - Delete single battery
router.delete('/:battery_id', async (req, res) => {
  const { battery_id } = req.params;
  try {
    const result = await db.bmsQuery('DELETE FROM batteries WHERE battery_id = $1 RETURNING *', [battery_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Battery not found' });
    }

    try {
      await delByPattern('batteries:*');
    } catch (e) {}

    res.json({
      status: 'success',
      message: `Battery ${battery_id} deleted successfully`
    });
  } catch (err) {
    console.error('Delete battery error:', err);
    res.status(500).json({ error: 'Failed to delete battery', details: err.message });
  }
});

// ============================================================
// DOWNLOAD SAMPLE READY EXCEL TEMPLATE FOR BATTERIES
// GET /api/batteries/sample-excel
// ============================================================
router.get('/sample-excel', (req, res) => {
  try {
    const sampleBatteries = [
      {
        'Battery ID *': 'BAT-GT-60V-01',
        'Battery Type': 'Li-ion NMC',
        'Capacity': '60V / 30Ah',
        'Voltage': 67.2,
        'SOC (%)': 98,
        'SOH (%)': 99,
        'Cycles': 25,
        'Temp (°C)': 28,
        'Status': 'available',
        'Zone': 'Gotri Zone',
        'Location': 'Gotri Station Dock #01',
        'Make': 'Trontek',
        'Model': 'TR-6030N',
        'Serial Number': 'SN-GT-881920',
        'Supplier': 'Trontek Power Ltd',
        'Cost': 24000,
        'Purchase Date (YYYY-MM-DD)': '2026-01-10',
        'Warranty Valid Till (YYYY-MM-DD)': '2028-01-10',
      },
      {
        'Battery ID *': 'BAT-MJ-60V-01',
        'Battery Type': 'Li-ion NMC',
        'Capacity': '60V / 30Ah',
        'Voltage': 66.8,
        'SOC (%)': 95,
        'SOH (%)': 98,
        'Cycles': 40,
        'Temp (°C)': 28,
        'Status': 'available',
        'Zone': 'Manjalpur Zone',
        'Location': 'Manjalpur Hub Dock #01',
        'Make': 'Trontek',
        'Model': 'TR-6030N',
        'Serial Number': 'SN-MJ-881921',
        'Supplier': 'Trontek Power Ltd',
        'Cost': 24000,
        'Purchase Date (YYYY-MM-DD)': '2026-01-10',
        'Warranty Valid Till (YYYY-MM-DD)': '2028-01-10',
      },
      {
        'Battery ID *': 'BAT-GT-72V-01',
        'Battery Type': 'Li-ion LFP',
        'Capacity': '72V / 40Ah',
        'Voltage': 84.0,
        'SOC (%)': 100,
        'SOH (%)': 100,
        'Cycles': 14,
        'Temp (°C)': 26,
        'Status': 'available',
        'Zone': 'Gotri Zone',
        'Location': 'Gotri Station Dock #03',
        'Make': 'Exide Leoch',
        'Model': 'EL-7240P',
        'Serial Number': 'SN-GT-881922',
        'Supplier': 'Exide Industries',
        'Cost': 32000,
        'Purchase Date (YYYY-MM-DD)': '2026-01-15',
        'Warranty Valid Till (YYYY-MM-DD)': '2028-01-15',
      },
    ];

    const guideRows = [
      { 'Field Name': 'Battery ID *', 'Required': 'YES', 'Description': 'Unique battery code / asset identifier', 'Sample / Allowed Values': 'BAT-GT-60V-01' },
      { 'Field Name': 'Battery Type', 'Required': 'NO', 'Description': 'Battery chemistry type', 'Sample / Allowed Values': 'Li-ion NMC, Li-ion LFP, LiFePO4' },
      { 'Field Name': 'Capacity', 'Required': 'NO', 'Description': 'Rated capacity & voltage', 'Sample / Allowed Values': '60V / 30Ah, 72V / 40Ah, 60V / 34Ah' },
      { 'Field Name': 'Voltage', 'Required': 'NO', 'Description': 'Present open-circuit voltage', 'Sample / Allowed Values': '67.2, 84.0' },
      { 'Field Name': 'SOC (%)', 'Required': 'NO', 'Description': 'State of Charge percentage (0-100)', 'Sample / Allowed Values': '98' },
      { 'Field Name': 'SOH (%)', 'Required': 'NO', 'Description': 'State of Health percentage (0-100)', 'Sample / Allowed Values': '99' },
      { 'Field Name': 'Cycles', 'Required': 'NO', 'Description': 'Number of completed charge cycles', 'Sample / Allowed Values': '25' },
      { 'Field Name': 'Temp (°C)', 'Required': 'NO', 'Description': 'Operating cell temperature in Celsius', 'Sample / Allowed Values': '28' },
      { 'Field Name': 'Status', 'Required': 'NO', 'Description': 'Current operational state', 'Sample / Allowed Values': 'available, in_use, charging, maintenance' },
      { 'Field Name': 'Zone', 'Required': 'NO', 'Description': 'Assigned operating hub / station', 'Sample / Allowed Values': 'Gotri Zone, Manjalpur Zone, KPGU Zone, Aatapi Zone, Moti Daman Zone' },
      { 'Field Name': 'Location', 'Required': 'NO', 'Description': 'Specific dock slot or vehicle assigned', 'Sample / Allowed Values': 'Gotri Station Dock #01' },
      { 'Field Name': 'Make', 'Required': 'NO', 'Description': 'Battery manufacturer', 'Sample / Allowed Values': 'Trontek, Exide, Okaya' },
      { 'Field Name': 'Model', 'Required': 'NO', 'Description': 'Manufacturer model identifier', 'Sample / Allowed Values': 'TR-6030N' },
      { 'Field Name': 'Serial Number', 'Required': 'NO', 'Description': 'Hardware serial number barcode', 'Sample / Allowed Values': 'SN-GT-881920' },
      { 'Field Name': 'Supplier', 'Required': 'NO', 'Description': 'Vendor or supplying entity', 'Sample / Allowed Values': 'Trontek Power Ltd' },
      { 'Field Name': 'Cost', 'Required': 'NO', 'Description': 'Asset acquisition cost in INR', 'Sample / Allowed Values': '24000' },
      { 'Field Name': 'Purchase Date', 'Required': 'NO', 'Description': 'Format: YYYY-MM-DD', 'Sample / Allowed Values': '2026-01-10' },
      { 'Field Name': 'Warranty Valid Till', 'Required': 'NO', 'Description': 'Format: YYYY-MM-DD', 'Sample / Allowed Values': '2028-01-10' },
    ];

    const wb = XLSX.utils.book_new();
    const wsTemplate = XLSX.utils.json_to_sheet(sampleBatteries);
    wsTemplate['!cols'] = [
      { wch: 20 }, { wch: 16 }, { wch: 16 }, { wch: 12 }, { wch: 12 },
      { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 14 }, { wch: 18 },
      { wch: 25 }, { wch: 16 }, { wch: 16 }, { wch: 20 }, { wch: 20 },
      { wch: 12 }, { wch: 25 }, { wch: 25 }
    ];

    const wsGuide = XLSX.utils.json_to_sheet(guideRows);
    wsGuide['!cols'] = [{ wch: 24 }, { wch: 10 }, { wch: 45 }, { wch: 35 }];

    XLSX.utils.book_append_sheet(wb, wsTemplate, 'Batteries_Template');
    XLSX.utils.book_append_sheet(wb, wsGuide, 'Instructions & Reference');

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename="Evegah_Batteries_Bulk_Import_Template.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(buf);
  } catch (err) {
    console.error('Error generating battery sample excel:', err);
    return res.status(500).json({ error: 'Failed to generate battery sample excel' });
  }
});

// ============================================================
// BULK IMPORT BATTERIES
// POST /api/batteries/bulk-import
// ============================================================
router.post('/bulk-import', async (req, res) => {
  try {
    const { batteries } = req.body || {};
    if (!Array.isArray(batteries) || batteries.length === 0) {
      return res.status(400).json({ status: 'error', message: 'No batteries provided for bulk import' });
    }

    let inserted = 0;
    let updated = 0;
    const errors = [];

    for (let i = 0; i < batteries.length; i++) {
      const b = batteries[i];
      const batteryId = String(
        b.battery_id ||
        b.id ||
        b['Battery ID *'] ||
        b['Battery ID'] ||
        b['battery_id'] ||
        ''
      ).trim();

      if (!batteryId) {
        errors.push({ row: i + 1, error: 'Missing Battery ID' });
        continue;
      }

      const batteryType = String(b.battery_type || b['Battery Type'] || b['battery_type'] || 'Li-ion NMC').trim();
      const capacity = String(b.capacity || b['Capacity'] || b['capacity'] || '60V / 30Ah').trim();
      const voltage = parseFloat(b.voltage ?? b['Voltage'] ?? 67.2) || 67.2;
      const soc = parseInt(b.soc ?? b['SOC (%)'] ?? b['soc'] ?? 95, 10) || 95;
      const soh = parseInt(b.soh ?? b['SOH (%)'] ?? b['soh'] ?? 98, 10) || 98;
      const cycles = parseInt(b.cycles ?? b['Cycles'] ?? b['cycles'] ?? 10, 10) || 10;
      const temp = parseFloat(b.temp ?? b['Temp (°C)'] ?? b['temp'] ?? 28) || 28;
      const status = String(b.status || b['Status'] || 'available').trim().toLowerCase();
      const zone = String(b.zone || b['Zone'] || 'Gotri Zone').trim();
      const location = String(b.location || b['Location'] || `${zone} Dock`).trim();
      const make = String(b.make || b['Make'] || 'Trontek').trim();
      const model = String(b.model || b['Model'] || 'TR-6030N').trim();
      const serialNumber = String(b.serial_number || b['Serial Number'] || '').trim();
      const supplier = String(b.supplier || b['Supplier'] || '').trim();
      const cost = parseFloat(b.cost ?? b['Cost'] ?? 0) || null;
      const purchaseDate = b.purchase_date || b['Purchase Date (YYYY-MM-DD)'] || b['Purchase Date'] || null;
      const warrantyDate = b.warranty_valid_till || b['Warranty Valid Till (YYYY-MM-DD)'] || b['Warranty Valid Till'] || null;

      try {
        const check = await db.bmsQuery('SELECT id FROM batteries WHERE battery_id = $1', [batteryId]);
        if (check.rows.length > 0) {
          await db.bmsQuery(`
            UPDATE batteries SET
              battery_type = $1,
              capacity = $2,
              voltage = $3,
              soc = $4,
              soh = $5,
              health = $5,
              cycles = $6,
              temp = $7,
              status = $8,
              zone = $9,
              location = $10,
              make = $11,
              model = $12,
              serial_number = COALESCE($13, serial_number),
              supplier = COALESCE($14, supplier),
              cost = COALESCE($15, cost),
              purchase_date = COALESCE($16, purchase_date),
              warranty_valid_till = COALESCE($17, warranty_valid_till),
              updated_at = NOW()
            WHERE battery_id = $18
          `, [
            batteryType, capacity, voltage, soc, soh, cycles, temp, status,
            zone, location, make, model,
            serialNumber || null, supplier || null, cost,
            purchaseDate || null, warrantyDate || null,
            batteryId
          ]);
          updated++;
        } else {
          await db.bmsQuery(`
            INSERT INTO batteries (
              battery_id, battery_type, capacity, voltage, soc, soh, health, cycles, temp,
              status, zone, location, make, model, serial_number, supplier, cost,
              purchase_date, warranty_valid_till, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW())
          `, [
            batteryId, batteryType, capacity, voltage, soc, soh, cycles, temp,
            status, zone, location, make, model, serialNumber || null, supplier || null, cost,
            purchaseDate || null, warrantyDate || null
          ]);
          inserted++;
        }
      } catch (rowErr) {
        errors.push({ battery_id: batteryId, error: rowErr.message });
      }
    }

    try {
      await delByPattern('batteries:*');
    } catch (e) {}

    return res.json({
      status: 'success',
      message: `Bulk import completed: ${inserted} added, ${updated} updated`,
      inserted,
      updated,
      total: batteries.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error('Bulk import batteries error:', err);
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET /api/batteries/:battery_id - Detail view
router.get('/:battery_id', async (req, res) => {
  const { battery_id } = req.params;
  try {
    const cacheKey = `batteries:detail:${battery_id}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const result = await db.bmsQuery('SELECT * FROM batteries WHERE battery_id = $1', [battery_id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Battery not found' });
    }
    setCache(cacheKey, result.rows[0], 60);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Fetch battery detail error:', err);
    res.json(null);
  }
});

// GET /api/batteries/:battery_id/logs - Historical logs
router.get('/:battery_id/logs', async (req, res) => {
  const { battery_id } = req.params;
  try {
    const result = await db.bmsQuery(`
      SELECT * FROM battery_logs 
      WHERE battery_id = $1 
      ORDER BY created_at ASC 
      LIMIT 100
    `, [battery_id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch battery logs error:', err);
    res.json([]);
  }
});

// POST /api/batteries - Upsert battery telemetry and log it
router.post('/', async (req, res) => {
  const {
    battery_id,
    status,
    soc,
    voltage,
    current,
    temp,
    cycles,
    health,
    lat,
    lng,
    serial_number,
    battery_type,
    capacity,
    make,
    model,
    location,
    zone,
    assigned_to,
    vehicle_number,
    rider_name,
    purchase_date,
    warranty_valid_till,
    supplier,
    cost,
    invoice_number,
    notes,
    cells
  } = req.body;

  if (!battery_id) {
    return res.status(400).json({ error: 'battery_id is required' });
  }

  try {
    const cellsJson = cells ? JSON.stringify(cells) : '[]';

    // 1. Upsert battery
    const upsertQuery = `
      INSERT INTO batteries (
        battery_id, status, soc, voltage, current, temp, cycles, health, lat, lng,
        serial_number, battery_type, capacity, make, model, location, zone, assigned_to,
        vehicle_number, rider_name, purchase_date, warranty_valid_till, supplier, cost,
        invoice_number, notes, cells
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18,
        $19, $20, $21, $22, $23, $24,
        $25, $26, $27
      )
      ON CONFLICT (battery_id) DO UPDATE SET
        status = COALESCE(EXCLUDED.status, batteries.status),
        soc = COALESCE(EXCLUDED.soc, batteries.soc),
        voltage = COALESCE(EXCLUDED.voltage, batteries.voltage),
        current = COALESCE(EXCLUDED.current, batteries.current),
        temp = COALESCE(EXCLUDED.temp, batteries.temp),
        cycles = COALESCE(EXCLUDED.cycles, batteries.cycles),
        health = COALESCE(EXCLUDED.health, batteries.health),
        lat = COALESCE(EXCLUDED.lat, batteries.lat),
        lng = COALESCE(EXCLUDED.lng, batteries.lng),
        serial_number = COALESCE(EXCLUDED.serial_number, batteries.serial_number),
        battery_type = COALESCE(EXCLUDED.battery_type, batteries.battery_type),
        capacity = COALESCE(EXCLUDED.capacity, batteries.capacity),
        make = COALESCE(EXCLUDED.make, batteries.make),
        model = COALESCE(EXCLUDED.model, batteries.model),
        location = COALESCE(EXCLUDED.location, batteries.location),
        zone = COALESCE(EXCLUDED.zone, batteries.zone),
        assigned_to = COALESCE(EXCLUDED.assigned_to, batteries.assigned_to),
        vehicle_number = COALESCE(EXCLUDED.vehicle_number, batteries.vehicle_number),
        rider_name = COALESCE(EXCLUDED.rider_name, batteries.rider_name),
        purchase_date = COALESCE(EXCLUDED.purchase_date, batteries.purchase_date),
        warranty_valid_till = COALESCE(EXCLUDED.warranty_valid_till, batteries.warranty_valid_till),
        supplier = COALESCE(EXCLUDED.supplier, batteries.supplier),
        cost = COALESCE(EXCLUDED.cost, batteries.cost),
        invoice_number = COALESCE(EXCLUDED.invoice_number, batteries.invoice_number),
        notes = COALESCE(EXCLUDED.notes, batteries.notes),
        cells = COALESCE(EXCLUDED.cells, batteries.cells),
        updated_at = NOW()
      RETURNING *
    `;

    const batteryResult = await db.bmsQuery(upsertQuery, [
      battery_id,
      status || 'idle',
      soc !== undefined && soc !== null ? parseInt(soc) : 100,
      voltage !== undefined && voltage !== null ? parseFloat(voltage) : null,
      current !== undefined && current !== null ? parseFloat(current) : null,
      temp !== undefined && temp !== null ? parseFloat(temp) : null,
      cycles !== undefined && cycles !== null ? parseInt(cycles) : 0,
      health !== undefined && health !== null ? parseInt(health) : 100,
      lat !== undefined && lat !== null ? parseFloat(lat) : null,
      lng !== undefined && lng !== null ? parseFloat(lng) : null,
      serial_number || null,
      battery_type || 'Li-ion',
      capacity || null,
      make || null,
      model || null,
      location || null,
      zone || null,
      assigned_to || null,
      vehicle_number || null,
      rider_name || null,
      purchase_date || null,
      warranty_valid_till || null,
      supplier || null,
      cost !== undefined && cost !== null && cost !== '' ? parseFloat(cost) : null,
      invoice_number || null,
      notes || null,
      cellsJson
    ]);

    // 2. Insert telemetry log
    const logQuery = `
      INSERT INTO battery_logs (battery_id, soc, voltage, current, temp, lat, lng, status, cells)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    await db.bmsQuery(logQuery, [
      battery_id,
      soc !== undefined && soc !== null ? parseInt(soc) : null,
      voltage !== undefined && voltage !== null ? parseFloat(voltage) : null,
      current !== undefined && current !== null ? parseFloat(current) : null,
      temp !== undefined && temp !== null ? parseFloat(temp) : null,
      lat !== undefined && lat !== null ? parseFloat(lat) : null,
      lng !== undefined && lng !== null ? parseFloat(lng) : null,
      status || 'idle',
      cellsJson
    ]);

    res.status(201).json({
      message: 'Telemetry stored successfully',
      battery: batteryResult.rows[0]
    });
    delByPattern('batteries:*');
  } catch (err) {
    console.error('Store battery telemetry error:', err);
    res.status(500).json({ error: 'Database update failed', details: err.message });
  }
});

// PATCH /api/batteries/:battery_id/zone - Update battery zone assignment
router.patch('/:battery_id/zone', async (req, res) => {
  const { battery_id } = req.params;
  const { zone } = req.body;
  try {
    const result = await db.bmsQuery(
      'UPDATE batteries SET zone = $1 WHERE battery_id = $2 RETURNING *',
      [zone || 'Unassigned', battery_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Battery not found' });
    }
    delByPattern('batteries:*');
    res.json({
      status: 'success',
      message: 'Battery zone updated successfully',
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Failed to update battery zone:', err);
    res.status(500).json({ error: 'Database update failed', details: err.message });
  }
});

module.exports = router;
