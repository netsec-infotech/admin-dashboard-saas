const express = require('express');
const router = express.Router();
const db = require('../db');
const { createNotification } = require('./notifications');
const { getCache, setCache, delByPattern } = require('../redis');
const { sendWhatsAppReceipt } = require('../utils/whatsapp');

// ──────────────────────────────────────────────────────────────
// Ensure reservations columns exist
// ──────────────────────────────────────────────────────────────
(async () => {
  try {
    await db.query(`ALTER TABLE reservations ADD COLUMN IF NOT EXISTS vehicle_model VARCHAR(100)`);
    await db.query(`ALTER TABLE reservations ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(100)`);
    await db.query(`ALTER TABLE reservations ADD COLUMN IF NOT EXISTS discount NUMERIC(10,2) DEFAULT 0.00`);
    await db.query(`ALTER TABLE reservations ADD COLUMN IF NOT EXISTS pickup_datetime VARCHAR(100)`);
    await db.query(`ALTER TABLE reservations ADD COLUMN IF NOT EXISTS drop_datetime VARCHAR(100)`);
    await db.query(`ALTER TABLE reservations ADD COLUMN IF NOT EXISTS total_payable NUMERIC(10,2)`);
    await db.query(`ALTER TABLE reservations ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(150)`);
    await db.query(`ALTER TABLE reservations ADD COLUMN IF NOT EXISTS cash_voucher_number VARCHAR(100)`);
    await db.query(`ALTER TABLE reservations ADD COLUMN IF NOT EXISTS cash_collected_by VARCHAR(100)`);
    await db.query(`ALTER TABLE reservations ADD COLUMN IF NOT EXISTS booking_source VARCHAR(50) DEFAULT 'Rider App'`);
  } catch (e) {
    console.warn('Reservations DB column init notice:', e.message);
  }
})();

// ──────────────────────────────────────────────────────────────
// GET /api/reservations
// ──────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const mobile = req.query.mobile || '';

    const cacheKey = `reservations:list:${page}:${limit}:${search}:${status}:${mobile}`;
    const cachedData = await getCache(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    let query = `
      SELECT 
        r.*,
        COALESCE(r.vehicle_model, v.evegah_model_name, v.vehicle_model, r.vehicle_category, 'Evegah City') AS vehicle_model,
        COALESCE(v.evegah_model_name, r.vehicle_model, 'Evegah City') AS evegah_model_name,
        COALESCE(b.soc, v.battery_pct, 85) as battery_pct,
        COALESCE(v.speed, '0.00') as speed,
        COALESCE(b.health, 100) as battery_health,
        COALESCE(b.status, 'In Use') as bms_status
      FROM reservations r
      LEFT JOIN vehicles v ON (v.code = r.vehicle_number OR v.registration_number = r.vehicle_number)
      LEFT JOIN batteries b ON (b.battery_id = r.battery_id)
      WHERE COALESCE(r.booking_source, 'Rider App') != 'Form'
        AND COALESCE(r.gov_id, '') != 'GOV-ON-FILE'
    `;
    let countQuery = `SELECT COUNT(*) as total FROM reservations WHERE COALESCE(booking_source, 'Rider App') != 'Form' AND COALESCE(gov_id, '') != 'GOV-ON-FILE'`;
    const params = [];
    const countParams = [];
    let pIdx = 1;

    if (search) {
      query += ` AND (r.customer_name ILIKE $${pIdx} OR r.mobile ILIKE $${pIdx} OR r.reservation_id ILIKE $${pIdx})`;
      countQuery += ` AND (customer_name ILIKE $${pIdx} OR mobile ILIKE $${pIdx} OR reservation_id ILIKE $${pIdx})`;
      params.push(`%${search}%`);
      countParams.push(`%${search}%`);
      pIdx++;
    }

    if (mobile) {
      const cleanMobile = mobile.replace(/\D/g, '');
      const last10 = cleanMobile.length >= 10 ? cleanMobile.slice(-10) : cleanMobile;
      if (last10) {
        query += ` AND (r.mobile LIKE $${pIdx} OR r.mobile LIKE $${pIdx + 1})`;
        countQuery += ` AND (mobile LIKE $${pIdx} OR mobile LIKE $${pIdx + 1})`;
        params.push(`%${last10}%`, `%${cleanMobile}%`);
        countParams.push(`%${last10}%`, `%${cleanMobile}%`);
        pIdx += 2;
      }
    }

    if (req.query.payment_status) {
      query += ` AND r.payment_status = $${pIdx}`;
      countQuery += ` AND payment_status = $${pIdx}`;
      params.push(req.query.payment_status);
      countParams.push(req.query.payment_status);
      pIdx++;
    }

    if (status) {
      if (status.toLowerCase() === 'upcoming' || status.toLowerCase() === 'confirmed' || status.toLowerCase() === 'reserved') {
        query += ` AND r.status IN ('Upcoming', 'Confirmed') AND r.payment_status = 'Paid'`;
        countQuery += ` AND status IN ('Upcoming', 'Confirmed') AND payment_status = 'Paid'`;
      } else {
        query += ` AND r.status = $${pIdx}`;
        countQuery += ` AND status = $${pIdx}`;
        params.push(status);
        countParams.push(status);
        pIdx++;
      }
    }

    query += ` ORDER BY r.created_at DESC LIMIT $${pIdx} OFFSET $${pIdx + 1}`;
    params.push(limit, offset);

    const [rowsResult, countResult] = await Promise.all([
      db.query(query, params),
      db.query(countQuery, countParams)
    ]);

    const total = parseInt(countResult.rows[0].total);

    const statsResult = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status IN ('Upcoming', 'Confirmed') AND payment_status = 'Paid' THEN 1 END) as upcoming,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'Cancelled' THEN 1 END) as cancelled
      FROM reservations
      WHERE COALESCE(booking_source, 'Rider App') != 'Form'
        AND COALESCE(gov_id, '') != 'GOV-ON-FILE'
    `);
    const stats = {
      total: parseInt(statsResult.rows[0].total) || 0,
      upcoming: parseInt(statsResult.rows[0].upcoming) || 0,
      completed: parseInt(statsResult.rows[0].completed) || 0,
      cancelled: parseInt(statsResult.rows[0].cancelled) || 0
    };

    const mappedRows = rowsResult.rows.map(r => ({
      ...r,
      vehicle_model: (r.vehicle_model && r.vehicle_model !== 'E-Scooter' && r.vehicle_model !== 'Evegah Pro') ? r.vehicle_model : 'Evegah City',
      range_km: Math.round(((parseFloat(r.battery_pct || 85) / 100.0) * 110))
    }));

    const responsePayload = {
      status: 'success',
      data: mappedRows,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
    await setCache(cacheKey, responsePayload, 60);
    res.json(responsePayload);
  } catch (err) {
    console.error('Failed to fetch reservations:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch reservations from database.'
    });
  }
});

// ──────────────────────────────────────────────────────────────
// GET /api/reservations/available-vehicles (zone-filtered)
// ──────────────────────────────────────────────────────────────
router.get('/available-vehicles', async (req, res) => {
  try {
    const { zone } = req.query;
    let query = `SELECT code, evegah_model_name, vehicle_category, zone FROM vehicles WHERE vehicle_status = 'Available'`;
    const params = [];
    if (zone) {
      query += ` AND (zone ILIKE $1 OR zone = 'Unassigned' OR zone IS NULL)`;
      params.push(`%${zone}%`);
    }
    query += ` ORDER BY code`;
    const result = await db.query(query, params);
    res.json({ status: 'success', data: result.rows });
  } catch (err) {
    console.error('Failed to fetch available vehicles:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch available vehicles.' });
  }
});

// ──────────────────────────────────────────────────────────────
// GET /api/reservations/deposits
// ──────────────────────────────────────────────────────────────
router.get('/deposits', async (req, res) => {
  try {
    const resResult = await db.query(`
      SELECT 
        id,
        reservation_id,
        customer_name,
        mobile,
        package_type,
        vehicle_number,
        battery_id,
        deposit,
        fare,
        total_payable,
        status,
        deposit_status,
        refund_amount,
        refund_deductions,
        refund_mode,
        refund_tx_id,
        refund_date,
        returned_at,
        return_condition,
        return_notes,
        created_at
      FROM reservations
      ORDER BY COALESCE(returned_at, created_at) DESC
    `);

    const rentersResult = await db.query(`
      SELECT 
        id,
        rider_name,
        mobile,
        vehicle_id,
        battery_id,
        deposit,
        rent,
        total,
        status,
        rental_start_date,
        return_date,
        created_at
      FROM renters
      WHERE deposit > 0
    `).catch(() => ({ rows: [] }));

    const resRows = resResult.rows;
    const renterRows = rentersResult.rows;

    const pendingList = [];
    const completedList = [];
    let totalDepositsHeld = 0;
    let totalRefunded = 0;
    let totalDeductions = 0;
    let pendingAmount = 0;
    let pendingCount = 0;

    const processedMobiles = new Set();

    resRows.forEach(r => {
      const dep = parseFloat(r.deposit !== null && r.deposit !== undefined ? r.deposit : 0);
      const refAmt = parseFloat(r.refund_amount !== null && r.refund_amount !== undefined ? r.refund_amount : dep);
      const ded = parseFloat(r.refund_deductions) || 0;
      const st = r.status || '';
      const depSt = r.deposit_status || '';
      const cleanMob = (r.mobile || '').replace(/\D/g, '').slice(-10);

      if (depSt === 'Refunded' && (refAmt > 0 || dep > 0)) {
        completedList.push({
          id: r.id,
          reservation_id: r.reservation_id,
          rider: {
            name: r.customer_name || 'Rider',
            code: r.reservation_id || `RID-${r.id?.toString().slice(0, 6)}`,
            avatar: ''
          },
          mobile: r.mobile,
          vehicle: r.vehicle_number || '',
          refundDate: r.refund_date || r.returned_at || r.created_at,
          txId: r.refund_tx_id || `REF-${r.id?.toString().slice(0, 8)}`,
          deposit: dep,
          deductions: ded,
          refundAmount: refAmt,
          method: r.refund_mode || 'UPI Instant Refund',
          status: 'Successful',
          returnCondition: r.return_condition || 'Clean',
          notes: r.return_notes || ''
        });
        totalRefunded += refAmt;
        totalDeductions += ded;
        if (cleanMob) processedMobiles.add(cleanMob);
      } else if (dep > 0 && depSt !== 'None' && depSt !== 'Refunded' && depSt !== 'Dismissed') {
        const isReturned = Boolean(r.returned_at || ['Completed', 'Return'].includes(st));
        const canRefund = isReturned;

        if (cleanMob) processedMobiles.add(cleanMob);

        if (isReturned) {
          pendingAmount += Math.max(0, dep - ded);
          totalDeductions += ded;
          pendingCount++;
        } else {
          totalDepositsHeld += dep;
        }

        pendingList.push({
          id: r.id,
          reservation_id: r.reservation_id,
          rider: {
            name: r.customer_name || 'Rider',
            code: r.reservation_id || `RID-${r.id?.toString().slice(0, 6)}`,
            avatar: ''
          },
          mobile: r.mobile,
          vehicle: r.vehicle_number || '',
          returnDate: isReturned ? (r.returned_at || r.created_at) : null,
          bookingDate: r.created_at,
          deposit: dep,
          condition: isReturned ? ((r.return_condition && r.return_condition.toLowerCase() !== 'clean') ? 'Damage Charged' : 'No Damage') : 'Vehicle In Ride',
          conditionDetail: isReturned ? (r.return_condition || 'Clean') : (st === 'Upcoming' ? 'Upcoming Ride (Awaiting Pickup)' : 'Active Ride (Awaiting Return)'),
          deductions: isReturned ? ded : 0,
          refundAmount: Math.max(0, dep - (isReturned ? ded : 0)),
          deposit_status: isReturned ? 'Pending_Refund' : 'Held',
          notes: r.return_notes || '',
          is_returned: isReturned,
          can_refund: canRefund,
          ride_status: st
        });
      }
    });

    renterRows.forEach(r => {
      const dep = parseFloat(r.deposit || 0);
      const cleanMob = (r.mobile || '').replace(/\D/g, '').slice(-10);
      if (dep > 0 && r.status !== 'Dismissed' && (!cleanMob || !processedMobiles.has(cleanMob))) {
        if (cleanMob) processedMobiles.add(cleanMob);
        const isReturned = ['Return', 'Completed'].includes(r.status);
        const canRefund = isReturned;

        if (isReturned) {
          pendingAmount += dep;
          pendingCount++;
        } else if (['Active Ride', 'Retain Ride', 'Active'].includes(r.status)) {
          totalDepositsHeld += dep;
        }

        pendingList.push({
          id: r.id,
          reservation_id: `RET-${r.id?.toString().slice(0, 6)}`,
          rider: {
            name: r.rider_name || 'Rider',
            code: `EVR-${r.id?.toString().slice(0, 6)}`,
            avatar: ''
          },
          mobile: r.mobile,
          vehicle: r.vehicle_id || '',
          returnDate: isReturned ? (r.return_date || r.created_at || new Date()) : null,
          bookingDate: r.rental_start_date || r.created_at,
          deposit: dep,
          condition: isReturned ? 'No Damage' : 'Vehicle In Ride',
          conditionDetail: isReturned ? 'Good Condition' : 'Active Ride (Awaiting Return)',
          deductions: 0,
          refundAmount: dep,
          deposit_status: isReturned ? 'Pending_Refund' : 'Held',
          is_returned: isReturned,
          can_refund: canRefund,
          ride_status: r.status
        });
      }
    });

    res.json({
      status: 'success',
      kpis: {
        total_held: Math.round(totalDepositsHeld * 100) / 100,
        pending_refunds_count: pendingCount,
        pending_refunds_amount: Math.round(pendingAmount * 100) / 100,
        total_refunded_amount: Math.round(totalRefunded * 100) / 100,
        total_deductions_amount: Math.round(totalDeductions * 100) / 100,
      },
      data: {
        pending: pendingList,
        completed: completedList
      }
    });
  } catch (err) {
    console.error('Error fetching deposits dashboard:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ──────────────────────────────────────────────────────────────
// DELETE /api/reservations/deposits — bulk delete/dismiss
// ──────────────────────────────────────────────────────────────
router.delete('/deposits', async (req, res) => {
  const ids = req.body?.ids || req.body?.data?.ids || (req.query?.ids ? String(req.query.ids).split(',') : []);
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ status: 'error', message: 'No deposit IDs provided' });
  }

  try {
    let affected = 0;
    for (const id of ids) {
      const idStr = String(id);
      const rRes = await db.query(`
        UPDATE reservations 
        SET deposit_status = 'Dismissed', deposit = 0, refund_amount = 0 
        WHERE id::text = $1 OR reservation_id = $1
      `, [idStr]).catch(() => ({ rowCount: 0 }));
      affected += rRes.rowCount || 0;

      const renterRes = await db.query(`
        UPDATE renters 
        SET deposit = 0, status = 'Dismissed' 
        WHERE id::text = $1
      `, [idStr]).catch(() => ({ rowCount: 0 }));
      affected += renterRes.rowCount || 0;
    }

    await delByPattern('reservations:*');
    await delByPattern('renters:*');

    if (txnIdToSave) {
      await db.query(
        "UPDATE payu_payments SET reservation_id = $1, status = 'Success', updated_at = NOW() WHERE tx_id = $2 OR payu_id = $2",
        [reservation_id, txnIdToSave]
      ).catch(() => {});
    }
    await delByPattern('stats:*');

    res.json({
      status: 'success',
      message: `Successfully deleted/dismissed ${ids.length} deposit record(s).`,
      affected
    });
  } catch (err) {
    console.error('Error deleting deposit records:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ──────────────────────────────────────────────────────────────
// DELETE /api/reservations/deposits/:id — single delete/dismiss
// ──────────────────────────────────────────────────────────────
router.delete('/deposits/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const idStr = String(id);
    await db.query(`
      UPDATE reservations 
      SET deposit_status = 'Dismissed', deposit = 0, refund_amount = 0 
      WHERE id::text = $1 OR reservation_id = $1
    `, [idStr]).catch(() => {});

    await db.query(`
      UPDATE renters 
      SET deposit = 0, status = 'Dismissed' 
      WHERE id::text = $1
    `, [idStr]).catch(() => {});

    await delByPattern('reservations:*');
    await delByPattern('renters:*');
    await delByPattern('stats:*');

    res.json({
      status: 'success',
      message: 'Deposit record deleted/dismissed successfully.'
    });
  } catch (err) {
    console.error('Error deleting deposit record:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ──────────────────────────────────────────────────────────────
// GET /api/reservations/active-ride
// ──────────────────────────────────────────────────────────────
router.get('/active-ride', async (req, res) => {
  const { mobile } = req.query;
  const cleanMobile = (mobile || '').replace(/\D/g, '');
  if (!cleanMobile) {
    return res.json({ status: 'success', has_active_ride: false });
  }

  try {
    const result = await db.query(`
      SELECT 
        r.*,
        COALESCE(b.soc, v.battery_pct, 85) as battery_pct,
        COALESCE(v.speed, '0.00') as speed,
        COALESCE(b.health, 100) as battery_health,
        COALESCE(b.status, 'In Use') as bms_status
      FROM reservations r
      LEFT JOIN vehicles v ON (v.code = r.vehicle_number OR v.registration_number = r.vehicle_number)
      LEFT JOIN batteries b ON (b.battery_id = r.battery_id)
      WHERE (r.mobile LIKE $1 OR r.mobile LIKE $2) 
        AND (r.status IN ('Ongoing', 'Active', 'Active Ride', 'In Ride') OR (r.status IN ('Confirmed', 'Upcoming') AND r.vehicle_number IS NOT NULL AND r.vehicle_number != '' AND r.vehicle_number != '—' AND r.vehicle_number != 'EV-DEFAULT')) 
      ORDER BY r.created_at DESC 
      LIMIT 1
    `, [`%${cleanMobile}%`, `%${mobile}%`]);

    if (result.rows.length > 0) {
      const row = result.rows[0];
      row.vehicle_model = (row.vehicle_model && row.vehicle_model !== 'E-Scooter' && row.vehicle_model !== 'Evegah Pro') ? row.vehicle_model : 'Evegah City';
      row.range_km = Math.round(((parseFloat(row.battery_pct || 85) / 100.0) * 110));
      return res.json({ status: 'success', has_active_ride: true, data: row });
    }
    return res.json({ status: 'success', has_active_ride: false });
  } catch (err) {
    console.error('Failed to check active ride:', err);
    return res.status(500).json({ status: 'error', has_active_ride: false, message: 'Failed to check active ride.' });
  }
});

// ──────────────────────────────────────────────────────────────
// POST /api/reservations/check-conflict
// ──────────────────────────────────────────────────────────────
router.all('/check-conflict', async (req, res) => {
  try {
    const params = req.method === 'GET' ? req.query : req.body;
    const {
      mobile,
      pickup_datetime,
      drop_datetime,
      reservation_date,
      reservation_time,
      package_type
    } = params || {};

    const cleanMobile = (mobile || '').replace(/\D/g, '').slice(-10);
    if (!cleanMobile) {
      return res.json({ conflict: false, message: 'No mobile provided' });
    }

    const activeCheck = await db.query(
      `SELECT reservation_id, status, reservation_date, reservation_time, pickup_datetime, drop_datetime, vehicle_category, vehicle_number
       FROM reservations
       WHERE mobile LIKE $1
         AND status IN ('Confirmed', 'Ongoing', 'Active', 'Active Ride', 'Upcoming')
       ORDER BY created_at DESC`,
      [`%${cleanMobile}%`]
    );

    if (activeCheck.rows.length === 0) {
      return res.json({ conflict: false, message: 'No conflicting active or upcoming rides' });
    }

    const toDateString = (val) => {
      if (!val) return '';
      if (val instanceof Date) return val.toISOString().slice(0, 10);
      const str = String(val).trim();
      const d = new Date(str);
      if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
      return str;
    };

    const parseTs = (val, timeVal) => {
      if (!val) return null;
      if (val instanceof Date) {
        const d = new Date(val);
        if (timeVal) {
          const timeParts = String(timeVal).split(':');
          if (timeParts.length >= 2) {
            d.setHours(parseInt(timeParts[0], 10) || 0, parseInt(timeParts[1], 10) || 0, 0, 0);
          }
        }
        return d.getTime();
      }
      const str = String(val).trim();
      const combined = timeVal ? `${str} ${timeVal}` : str;
      const ms = new Date(combined).getTime();
      if (!isNaN(ms)) return ms;
      const d2 = new Date(str);
      return isNaN(d2.getTime()) ? null : d2.getTime();
    };

    const reqStartMs = parseTs(pickup_datetime || reservation_date, reservation_time);
    const reqEndMs = parseTs(drop_datetime, null) || (reqStartMs ? reqStartMs + 86400000 : null);
    const reqDateStr = toDateString(reservation_date || pickup_datetime);

    for (const existing of activeCheck.rows) {
      const exStartMs = parseTs(existing.pickup_datetime || existing.reservation_date, existing.reservation_time);
      const exEndMs = parseTs(existing.drop_datetime, null) || (exStartMs ? exStartMs + 86400000 : null);
      const exDateStr = toDateString(existing.reservation_date || existing.pickup_datetime);

      let conflict = false;
      if (reqStartMs && reqEndMs && exStartMs && exEndMs) {
        if (reqStartMs < exEndMs && reqEndMs > exStartMs) {
          conflict = true;
        }
      }
      if (!conflict && reqDateStr && exDateStr && reqDateStr === exDateStr) {
        conflict = true;
      }

      if (conflict) {
        return res.json({
          conflict: true,
          message: `Time Conflict! You already have an active/booked ride (${existing.reservation_id}) for this selected date and time.`,
          conflicting_reservation: {
            reservation_id: existing.reservation_id,
            status: existing.status,
            pickup_datetime: existing.pickup_datetime,
            drop_datetime: existing.drop_datetime,
            vehicle_category: existing.vehicle_category,
            vehicle_number: existing.vehicle_number
          }
        });
      }
    }

    return res.json({ conflict: false, message: 'Time slot is available' });
  } catch (err) {
    console.error('Check conflict endpoint error:', err);
    return res.status(500).json({ conflict: false, message: 'Conflict check failed' });
  }
});

// ──────────────────────────────────────────────────────────────
// POST /api/reservations — create new reservation
// ──────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const {
    customer_name,
    mobile,
    gov_id,
    reservation_date,
    reservation_time,
    package_type,
    vehicle_category,
    vehicle_model,
    evegah_model_name,
    fare,
    deposit,
    payment_mode,
    payment_status,
    pickup_zone,
    drop_zone,
    coupon_code,
    discount,
    total_payable
  } = req.body;

  const cleanMobile = (mobile || '').replace(/\D/g, '');

  const reqStartRaw = req.body.pickup_datetime || req.body.start_datetime || `${reservation_date || ''} ${reservation_time || ''}`.trim();
  const reqEndRaw = req.body.drop_datetime || req.body.end_datetime || reqStartRaw;

  // 🚨 Conflict detection — block new reservation if its date/time slot overlaps an active ride
  if (cleanMobile.length > 0) {
    try {
      const activeCheck = await db.query(
        "SELECT reservation_id, status, reservation_date, reservation_time, pickup_datetime, drop_datetime FROM reservations WHERE (mobile LIKE $1 OR mobile LIKE $2) AND status IN ('Confirmed', 'Ongoing', 'Active', 'Active Ride', 'Upcoming')",
        [`%${cleanMobile}%`, `%${mobile}%`]
      );

      const toDateString = (val) => {
        if (!val) return '';
        if (val instanceof Date) return val.toISOString().slice(0, 10);
        const str = String(val).trim();
        const d = new Date(str);
        if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
        return str;
      };

      const parseTs = (val, timeVal) => {
        if (!val) return null;
        if (val instanceof Date) {
          const d = new Date(val);
          if (timeVal) {
            const timeParts = String(timeVal).split(':');
            if (timeParts.length >= 2) {
              d.setHours(parseInt(timeParts[0], 10) || 0, parseInt(timeParts[1], 10) || 0, 0, 0);
            }
          }
          return d.getTime();
        }
        const str = String(val).trim();
        const combined = timeVal ? `${str} ${timeVal}` : str;
        const ms = new Date(combined).getTime();
        if (!isNaN(ms)) return ms;
        const d2 = new Date(str);
        return isNaN(d2.getTime()) ? null : d2.getTime();
      };

      const reqStartMs = parseTs(req.body.pickup_datetime || req.body.start_datetime || reservation_date, reservation_time);
      const reqEndMs = parseTs(req.body.drop_datetime || req.body.end_datetime, null) || (reqStartMs ? reqStartMs + 86400000 : null);
      const reqDateStr = toDateString(reservation_date);

      for (const existing of activeCheck.rows) {
        const exStartMs = parseTs(existing.pickup_datetime || existing.reservation_date, existing.reservation_time);
        const exEndMs = parseTs(existing.drop_datetime, null) || (exStartMs ? exStartMs + 86400000 : null);
        const exDateStr = toDateString(existing.reservation_date);

        let conflict = false;
        if (reqStartMs && reqEndMs && exStartMs && exEndMs) {
          if (reqStartMs < exEndMs && reqEndMs > exStartMs) {
            conflict = true;
          }
        }
        if (!conflict && reqDateStr && exDateStr && reqDateStr === exDateStr) {
          conflict = true;
        }

        if (conflict) {
          const isPaid = (payment_status && String(payment_status).toLowerCase() === 'paid') ||
                         Boolean(req.body.transaction_id && String(req.body.transaction_id).trim() !== '') ||
                         Boolean(req.body.payNow || req.body.pay_now);

          if (isPaid) {
            console.log(`[Conflict Safety] Booking for ${mobile} has overlapping slot with ${existing.reservation_id}, but payment is completed (${req.body.transaction_id || payment_mode}). Preserving paid ride.`);
            break;
          } else {
            return res.status(400).json({
              status: 'error',
              has_active_ride: true,
              message: `Time Conflict! You already have an active/booked ride (${existing.reservation_id}) for this selected date and time.`
            });
          }
        }
      }
    } catch (e) {
      console.warn('Active ride date overlap check error:', e.message);
    }
  }

  // Generate unique reservation ID
  const randomSuffix = String(Math.floor(100 + Math.random() * 900));
  const year = new Date().getFullYear();
  const reservation_id = `RID-${year}-${randomSuffix}${String(Date.now()).slice(-3)}`;

  const isCash = String(payment_mode || '').trim().toLowerCase() === 'cash' || Boolean(req.body.is_cash);
  let cashVoucherNumber = req.body.cash_voucher_number || req.body.voucher_number || null;
  if (isCash && !cashVoucherNumber) {
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randCode = Math.floor(1000 + Math.random() * 9000);
    cashVoucherNumber = `CSH-VCHR-${todayStr}-${randCode}`;
  }

  const txnIdToSave = req.body.transaction_id || cashVoucherNumber || null;
  const isPaymentSuccess = (payment_status && String(payment_status).toLowerCase() === 'paid') ||
                           Boolean(req.body.transaction_id && String(req.body.transaction_id).trim() !== '') ||
                           isCash;

  const finalPaymentStatus = isPaymentSuccess ? 'Paid' : 'Pending';
  const finalStatus = isPaymentSuccess ? 'Upcoming' : 'Pending';
  const finalPaymentMode = isCash ? 'Cash' : (payment_mode || 'UPI');

  const modelToSave = vehicle_model || evegah_model_name || vehicle_category || 'Evegah City';
  const totalPayableNum = parseFloat(total_payable) || (parseFloat(fare) || 0) + (parseFloat(deposit) || 0);

  let cleanResTime = '00:00:00';
  if (reservation_time) {
    const rawTime = String(reservation_time).replace(/[\u202f\u00a0]/g, ' ').trim();
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(rawTime)) {
      cleanResTime = rawTime.length === 5 ? `${rawTime}:00` : rawTime;
    } else {
      const dt = new Date(`1970-01-01 ${rawTime}`);
      if (!isNaN(dt.getTime())) {
        cleanResTime = dt.toTimeString().slice(0, 8);
      } else {
        cleanResTime = new Date().toTimeString().slice(0, 8);
      }
    }
  }

  try {
    const result = await db.query(`
      INSERT INTO reservations (
        reservation_id, customer_name, mobile, gov_id, reservation_date,
        reservation_time, package_type, vehicle_category, vehicle_model, fare, deposit,
        payment_mode, status, payment_status, pickup_zone, drop_zone,
        transaction_id, cash_voucher_number, pickup_datetime, drop_datetime,
        coupon_code, discount, total_payable, booking_source, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, NOW())
      RETURNING *
    `, [
      reservation_id,
      customer_name || 'Guest Rider',
      mobile || '',
      gov_id || '',
      reservation_date || new Date().toISOString().split('T')[0],
      cleanResTime,
      package_type || 'Day',
      vehicle_category || 'E-Scooter',
      modelToSave,
      parseFloat(fare) || 0,
      parseFloat(deposit) || 0,
      finalPaymentMode,
      finalStatus,
      finalPaymentStatus,
      pickup_zone || '',
      drop_zone || '',
      txnIdToSave,
      cashVoucherNumber,
      reqStartRaw || null,
      reqEndRaw || null,
      coupon_code || null,
      parseFloat(discount) || 0,
      totalPayableNum,
      req.body.booking_source || 'Rider App'
    ]);

    await delByPattern('reservations:*');
    await delByPattern('renters:*');

    if (isPaymentSuccess) {
      if (isCash) {
        createNotification('💵 Cash Payment Collected', `Cash voucher ${cashVoucherNumber} generated for ${customer_name || 'Customer'} (₹${totalPayableNum.toFixed(2)}) for reservation ${reservation_id} in ${pickup_zone || 'Station'}.`, 'payment');
      } else {
        createNotification('🎉 New Ride Booking Confirmed', `${customer_name || 'Customer'} created a new ${package_type || 'Day'} reservation (${reservation_id}) in ${pickup_zone || 'Gotri Zone'}.`, 'booking');
      }

      const savedRes = result.rows[0];
      if (savedRes?.mobile) {
        sendWhatsAppReceipt({
          mobile: savedRes.mobile,
          name: savedRes.customer_name || 'Rider',
          invoice_no: savedRes.cash_voucher_number || savedRes.transaction_id || savedRes.reservation_id,
          plan: `${savedRes.package_type || 'Day'} Plan (${savedRes.vehicle_model || 'Evegah City'})`,
          amount: (Number(savedRes.fare || 0) + Number(savedRes.deposit || 0)).toFixed(2)
        }).catch(err => console.error('[WhatsApp] Booking receipt send notice:', err.message));
      }
    }

    res.json({
      status: 'success',
      message: isPaymentSuccess ? 'Reservation confirmed successfully' : 'Reservation created (Pending Payment)',
      data: {
        ...result.rows[0],
        cash_voucher_number: cashVoucherNumber,
        voucher_number: cashVoucherNumber,
        transaction_id: txnIdToSave
      }
    });
  } catch (err) {
    console.error('Failed to create reservation:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create reservation. Please try again.'
    });
  }
});

// ──────────────────────────────────────────────────────────────
// POST /api/reservations/:id/pay
// ──────────────────────────────────────────────────────────────
router.post('/:id/pay', async (req, res) => {
  const { id } = req.params;
  const { payment_method } = req.body;

  try {
    const updateResult = await db.query(`
      UPDATE reservations
      SET payment_status = 'Paid', deposit_status = 'Paid', status = 'Upcoming', payment_mode = $1
      WHERE id::text = $2 OR reservation_id = $3
      RETURNING *
    `, [payment_method || 'ICICI UPI', id, id]);

    await delByPattern('reservations:*');
    await delByPattern('renters:*');

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Reservation not found.' });
    }

    createNotification('🎉 New Ride Booking Confirmed', `Payment received for reservation (${id}). Booking is now confirmed!`, 'booking');

    const paidRow = updateResult.rows[0];
    if (paidRow?.mobile) {
      sendWhatsAppReceipt({
        mobile: paidRow.mobile,
        name: paidRow.customer_name || 'Rider',
        invoice_no: paidRow.transaction_id || paidRow.reservation_id,
        plan: `${paidRow.package_type || 'Day'} Plan (${paidRow.vehicle_model || 'Evegah City'})`,
        amount: (Number(paidRow.fare || 0) + Number(paidRow.deposit || 0)).toFixed(2)
      }).catch(err => console.error('[WhatsApp] Pay verification receipt notice:', err.message));
    }

    res.json({
      status: 'success',
      message: 'Payment verified and booking confirmed',
      data: paidRow
    });
  } catch (err) {
    console.error('Failed to update reservation payment:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update payment. Please try again.'
    });
  }
});

// ──────────────────────────────────────────────────────────────
// POST /api/reservations/:id/cancel
// ──────────────────────────────────────────────────────────────
router.post('/:id/cancel', async (req, res) => {
  const { id } = req.params;

  try {
    const dbRes = await db.query('SELECT * FROM reservations WHERE id = $1 OR reservation_id = $2', [id, id]);
    if (dbRes.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Reservation not found' });
    }

    const reservation = dbRes.rows[0];

    const now = new Date();
    const resDateStr = new Date(reservation.reservation_date).toISOString().split('T')[0];
    const resDateTime = new Date(`${resDateStr}T${reservation.reservation_time}`);
    const timeDiffMs = resDateTime - now;
    const timeDiffHours = timeDiffMs / (1000 * 60 * 60);

    let refundPercent = 0;
    if (timeDiffHours >= 24) {
      refundPercent = 100;
    } else if (timeDiffHours >= 12) {
      refundPercent = 90;
    } else if (timeDiffHours >= 4) {
      refundPercent = 50;
    }

    const fareNum = parseFloat(reservation.fare);
    const refundAmt = ((fareNum * refundPercent) / 100).toFixed(2);
    const paymentStatus = refundPercent > 0 ? 'Refunded' : 'Paid';

    const updateResult = await db.query(`
      UPDATE reservations
      SET status = 'Cancelled', payment_status = $1
      WHERE id = $2 OR reservation_id = $3
      RETURNING *
    `, [paymentStatus, id, id]);

    // Release vehicle and battery inventory back to Available if allocated
    if (reservation?.vehicle_number) {
      await db.query(`UPDATE vehicles SET vehicle_status = 'Available', renter_name = 'None (Available)' WHERE code = $1 OR registration_number = $1`, [reservation.vehicle_number]).catch(() => {});
      await db.query(`UPDATE renters SET status = 'Return', return_date = NOW() WHERE vehicle_id = $1`, [reservation.vehicle_number]).catch(() => {});
    }
    if (reservation?.battery_id) {
      await db.query(`UPDATE batteries SET status = 'available' WHERE battery_id = $1 OR id::text = $1`, [reservation.battery_id]).catch(() => {});
    }

    await delByPattern('reservations:*');
    await delByPattern('vehicles:*');
    await delByPattern('renters:*');
    await delByPattern('stats:*');
    await delByPattern('batteries:*');

    res.json({
      status: 'success',
      message: `Reservation cancelled. Refunded ${refundPercent}% (₹${refundAmt})`,
      refundPercent,
      refundAmount: refundAmt,
      data: updateResult.rows[0]
    });

  } catch (err) {
    console.error('Failed to cancel reservation:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ──────────────────────────────────────────────────────────────
// POST /api/reservations/:id/allocate
// ──────────────────────────────────────────────────────────────
router.post('/:id/allocate', async (req, res) => {
  const { id } = req.params;
  const { vehicle_number, battery_id } = req.body;

  if (!vehicle_number) {
    return res.status(400).json({ status: 'error', message: 'Vehicle number is required' });
  }

  try {
    const dbRes = await db.query(
      'SELECT * FROM reservations WHERE id = $1 OR reservation_id = $2',
      [id, id]
    );
    if (dbRes.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Reservation not found' });
    }
    const reservation = dbRes.rows[0];

    const updateResult = await db.query(`
      UPDATE reservations
      SET vehicle_number = $1, battery_id = $2, status = 'Active Ride'
      WHERE id = $3 OR reservation_id = $4
      RETURNING *
    `, [vehicle_number, battery_id || null, id, id]);

    const updatedReservation = updateResult.rows[0] || reservation;

    const rawPkg = updatedReservation.package_type || 'Day';
    const normalizedPkg = (rawPkg === 'Rider Plan' || rawPkg === 'Standard Plan' || rawPkg.toLowerCase().includes('custom')) ? 'Custom' : rawPkg;

    const renterPayload = {
      rider_name: updatedReservation.customer_name,
      mobile: updatedReservation.mobile,
      vehicle_id: vehicle_number,
      battery_id: battery_id || '',
      package_name: normalizedPkg,
      rental_start_date: updatedReservation.reservation_date || new Date().toISOString().split('T')[0],
      return_date: null,
      status: 'Active Ride',
      rent: parseFloat(updatedReservation.fare || 0).toFixed(2),
      deposit: parseFloat(updatedReservation.deposit || 0).toFixed(2),
      total: (parseFloat(updatedReservation.fare || 0) + parseFloat(updatedReservation.deposit || 0)).toFixed(2),
      avatar_url: null,
      booking_source: updatedReservation.booking_source || 'App'
    };

    try {
      await db.query(`
        INSERT INTO renters (
          rider_name, mobile, vehicle_id, battery_id, package_name,
          rental_start_date, return_date, status, rent, deposit, total, avatar_url, booking_source, created_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW())
        ON CONFLICT DO NOTHING
      `, [
        renterPayload.rider_name,
        renterPayload.mobile,
        renterPayload.vehicle_id,
        renterPayload.battery_id,
        renterPayload.package_name,
        renterPayload.rental_start_date,
        renterPayload.return_date,
        renterPayload.status,
        renterPayload.rent,
        renterPayload.deposit,
        renterPayload.total,
        renterPayload.avatar_url,
        renterPayload.booking_source
      ]);
    } catch (renterErr) {
      console.warn('Could not auto-create renters record (non-fatal):', renterErr.message);
    }

    try {
      if (vehicle_number) {
        await db.query(`
          UPDATE vehicles 
          SET vehicle_status = 'In Ride', status = 'Online', renter_name = $1 
          WHERE code = $2 OR registration_number = $2
        `, [renterPayload.rider_name || 'Reserved Rider', vehicle_number]);
      }
      if (battery_id) {
        await db.query(`
          UPDATE batteries 
          SET status = 'in_use' 
          WHERE battery_id = $1 OR id::text = $1
        `, [battery_id]);
      }
    } catch (invErr) {
      console.warn('Could not update vehicle/battery inventory status:', invErr.message);
    }

    await delByPattern('reservations:*');
    await delByPattern('renters:*');
    await delByPattern('vehicles:*');
    await delByPattern('batteries:*');
    await delByPattern('stats:*');

    res.json({
      status: 'success',
      message: `Vehicle ${vehicle_number} allocated. Rider moved to Active Rides.`,
      data: updatedReservation
    });
  } catch (err) {
    console.error('Failed to allocate reservation:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ──────────────────────────────────────────────────────────────
// DELETE /api/reservations — bulk delete
// ──────────────────────────────────────────────────────────────
router.delete('/', async (req, res) => {
  const { ids } = req.body || {};
  const targetIds = Array.isArray(ids) ? ids : (req.query.ids ? req.query.ids.split(',') : []);

  if (targetIds.length === 0) {
    return res.status(400).json({ status: 'error', message: 'No reservation IDs provided' });
  }

  try {
    await delByPattern('reservations:*');
    await delByPattern('renters:*');

    await db.query('DELETE FROM reservations WHERE id::text = ANY($1::text[]) OR reservation_id = ANY($1::text[])', [targetIds]);

    res.json({
      status: 'success',
      message: 'Selected reservation(s) deleted successfully.'
    });
  } catch (err) {
    console.error('Failed to bulk delete reservations:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ──────────────────────────────────────────────────────────────
// DELETE /api/reservations/:id — single delete
// ──────────────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await delByPattern('reservations:*');
    await delByPattern('renters:*');

    const result = await db.query('DELETE FROM reservations WHERE id = $1 OR reservation_id = $2', [id, id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ status: 'error', message: 'Reservation not found.' });
    }

    res.json({
      status: 'success',
      message: `Reservation ${id} deleted successfully.`
    });
  } catch (err) {
    console.error('Failed to delete reservation:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ──────────────────────────────────────────────────────────────
// POST /api/reservations/:id/return
// ──────────────────────────────────────────────────────────────
router.post('/:id/return', async (req, res) => {
  const { id } = req.params;
  await delByPattern('reservations:*');
  await delByPattern('renters:*');
  await delByPattern('vehicles:*');
  await delByPattern('batteries:*');
  await delByPattern('stats:*');

  try {
    const updateRes = await db.query(`
      UPDATE reservations
      SET status = 'Completed',
          payment_status = 'Paid',
          returned_at = NOW(),
          deposit_status = CASE WHEN COALESCE(deposit, 0) > 0 THEN 'Pending_Refund' ELSE 'None' END,
          refund_amount = COALESCE(deposit, 0),
          refund_deductions = 0
      WHERE id::text = $1 OR reservation_id = $2
      RETURNING *
    `, [id, id]);

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Reservation not found.' });
    }

    const reservation = updateRes.rows[0];

    try {
      if (reservation.vehicle_number) {
        await db.query(
          `UPDATE vehicles SET vehicle_status = 'Available', renter_name = 'None (Available)' WHERE code = $1 OR registration_number = $1`,
          [reservation.vehicle_number]
        );
      }
      if (reservation.battery_id) {
        await db.query(
          `UPDATE batteries SET status = 'available' WHERE battery_id = $1 OR id::text = $1`,
          [reservation.battery_id]
        );
      }
      const vNum = reservation?.vehicle_number;
      const cleanMob = reservation?.mobile ? reservation.mobile.replace(/\D/g, '').slice(-10) : '';
      await db.query(`
        UPDATE renters 
        SET status = 'Return', return_date = NOW() 
        WHERE (mobile LIKE $1 AND mobile != '') 
           OR ($2 != '' AND vehicle_id = $2)
      `, [`%${cleanMob}%`, vNum || '']).catch((rErr) => {
        console.warn('Renters update on return notice:', rErr.message);
      });

      await delByPattern('vehicles:*');
      await delByPattern('renters:*');
      await delByPattern('reservations:*');
      await delByPattern('stats:*');
      await delByPattern('batteries:*');
    } catch (relErr) {
      console.error('Error releasing vehicle/battery on return:', relErr.message);
    }

    res.json({
      status: 'success',
      message: `Ride ${id} ended/returned successfully. Vehicle & battery released. Deposit pending refund.`,
      data: reservation
    });
  } catch (err) {
    console.error('Failed to return ride:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ──────────────────────────────────────────────────────────────
// POST /api/reservations/:id/refund-deposit
// ──────────────────────────────────────────────────────────────
router.post('/:id/refund-deposit', async (req, res) => {
  const { id } = req.params;
  const {
    refund_amount,
    deductions = 0,
    notes = '',
    method
  } = req.body;

  const refundAmt = parseFloat(refund_amount || 0);
  const dedAmt = parseFloat(deductions || 0);
  const refTxId = `REF-${Date.now().toString().slice(-8)}`;

  try {
    let target = null;
    let isFromRenters = false;
    try {
      const dbRes = await db.query(
        'SELECT * FROM reservations WHERE id::text = $1 OR reservation_id = $1 LIMIT 1',
        [id]
      );
      if (dbRes.rows.length > 0) target = dbRes.rows[0];
    } catch (_) {}

    if (!target) {
      try {
        const renterRes = await db.query(
          'SELECT * FROM renters WHERE id::text = $1 OR vehicle_id = $1 LIMIT 1',
          [id]
        );
        if (renterRes.rows.length > 0) {
          target = renterRes.rows[0];
          isFromRenters = true;
        }
      } catch (_) {}
    }

    if (!target) {
      return res.status(404).json({
        status: 'error',
        message: `Ride reservation or rental record (${id}) not found.`
      });
    }

    const payuRouter = require('./payu');
    let payuResult = null;

    if (refundAmt > 0) {
      try {
        payuResult = await payuRouter.processPayURefund({
          payuId: target.transaction_id || target.payu_id || '',
          txnid: target.transaction_id || '',
          reservationId: target.reservation_id || id,
          mobile: target.mobile || '',
          amount: refundAmt,
          refundTxId: refTxId
        });
      } catch (payuErr) {
        console.warn('PayU deposit refund notice (falling back to ledger settlement):', payuErr.message);
      }
    }

    const finalRefundTxId = (payuResult && payuResult.success)
      ? (payuResult.payu_request_id || payuResult.refund_tx_id || refTxId)
      : refTxId;
    const resolvedMethod = method || ((payuResult && payuResult.success) ? 'PayU' : (target.payment_mode || 'PayU'));

    try {
      const updRes = await db.query(`
        UPDATE reservations
        SET deposit_status = 'Refunded',
            refund_amount = $1,
            refund_deductions = $2,
            refund_mode = $3,
            refund_tx_id = $4,
            refund_date = NOW(),
            return_notes = COALESCE($5, return_notes)
        WHERE id::text = $6 OR reservation_id = $6
        RETURNING id
      `, [refundAmt, dedAmt, resolvedMethod, finalRefundTxId, notes, id]);

      if (updRes.rows.length === 0 && isFromRenters && refundAmt > 0) {
        await db.query(`
          INSERT INTO reservations (
            reservation_id, customer_name, mobile, package_type, vehicle_number,
            deposit, status, deposit_status, refund_amount, refund_deductions,
            refund_mode, refund_tx_id, refund_date, return_notes, returned_at, booking_source
          )
          VALUES ($1, $2, $3, $4, $5, $6, 'Completed', 'Refunded', $7, $8, $9, $10, NOW(), $11, NOW(), 'Form')
        `, [
          `RET-${String(id).slice(0, 6).toUpperCase()}`,
          target.rider_name || target.customer_name || 'Rider',
          target.mobile || '',
          target.package_name || 'Rental Plan',
          target.vehicle_id || target.vehicle_number || '',
          parseFloat(target.deposit || refundAmt),
          refundAmt,
          dedAmt,
          resolvedMethod,
          finalRefundTxId,
          notes || ''
        ]).catch(() => {});
      }
    } catch (dbErr) {
      console.warn('DB reservations refund status update error:', dbErr.message);
    }

    try {
      const cleanMob = (target.mobile || '').replace(/\D/g, '').slice(-10);
      await db.query(`
        UPDATE renters
        SET status = 'Refunded',
            deposit = 0
        WHERE id::text = $1 OR vehicle_id = $1 OR ($2 != '' AND mobile LIKE $3)
      `, [id, cleanMob, `%${cleanMob}%`]);
    } catch (_) {}

    const riderMob = (target.mobile || '').replace(/\D/g, '').slice(-10);
    if (refundAmt > 0) {
      await db.query(`
        INSERT INTO wallet_transactions (
          mobile, title, subtitle, amount, type, status, payment_method, transaction_id
        )
        VALUES ($1, $2, $3, $4, 'Debit', 'Success', $5, $6)
      `, [
        riderMob || '0000000000',
        `Security Deposit Refund (${resolvedMethod})`,
        `Refunded ₹${refundAmt} to customer account (Ref: ${finalRefundTxId})`,
        refundAmt,
        resolvedMethod,
        finalRefundTxId
      ]).catch(err => console.warn('Wallet transaction insert error:', err.message));
    }

    await delByPattern('reservations:*');
    await delByPattern('renters:*');
    await delByPattern('stats:*');

    res.json({
      status: 'success',
      message: (payuResult && payuResult.success)
        ? `Security deposit of ₹${refundAmt} refunded successfully to original source account via PayU Gateway (Request ID: ${finalRefundTxId}).`
        : `Security deposit refund of ₹${refundAmt} processed and settled successfully (Reference ID: ${finalRefundTxId}).`,
      data: {
        tx_id: finalRefundTxId,
        refund_amount: refundAmt,
        deductions: dedAmt,
        refund_mode: resolvedMethod,
        refund_date: new Date().toISOString(),
        payu_response: payuResult
      }
    });
  } catch (err) {
    console.error('Failed to process refund:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ──────────────────────────────────────────────────────────────
// POST /api/reservations/:id/start
// ──────────────────────────────────────────────────────────────
router.post('/:id/start', async (req, res) => {
  const { id } = req.params;
  const { vehicle_number } = req.body || {};
  await delByPattern('reservations:*');
  await delByPattern('renters:*');
  await delByPattern('vehicles:*');

  try {
    let query = `
      UPDATE reservations
      SET status = 'Ongoing'
    `;
    const params = [id, id];
    if (vehicle_number) {
      query += `, vehicle_number = COALESCE(vehicle_number, $3)`;
      params.push(vehicle_number);
    }
    query += ` WHERE id::text = $1 OR reservation_id = $2 RETURNING *`;

    const updateRes = await db.query(query, params);
    if (updateRes.rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Reservation not found.' });
    }

    const reservation = updateRes.rows[0];

    const targetVehicle = vehicle_number || reservation?.vehicle_number;
    if (targetVehicle) {
      await db.query(`
        UPDATE vehicles 
        SET vehicle_status = 'In Ride', renter_name = $1 
        WHERE code = $2 OR registration_number = $2
      `, [reservation?.customer_name || 'Active Rider', targetVehicle]).catch(() => {});
    }

    await delByPattern('reservations:*');
    await delByPattern('vehicles:*');
    await delByPattern('renters:*');
    await delByPattern('stats:*');

    res.json({
      status: 'success',
      message: `Ride ${id} started successfully! Ongoing ride active. 🛵`,
      data: reservation
    });
  } catch (err) {
    console.error('Failed to start ride:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;