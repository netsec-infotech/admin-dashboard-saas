const express = require('express');
const router = express.Router();
const db = require('../db');
const { sendWhatsAppReceipt } = require('../utils/whatsapp');
const { delByPattern } = require('../redis');

// 1. POST /api/rides/new - New Ride Registration (Direct to Renters Table)
router.post('/new', async (req, res) => {
  try {
    const {
      rider_name,
      mobile,
      email,
      date_of_birth,
      gender,
      address,
      present_address,
      aadhaar_number,
      emergency_contact_name,
      emergency_contact_phone,
      vehicle_id,
      battery_id,
      package_name,
      rental_start_date,
      return_date,
      rent,
      deposit,
      total,
      zone_name,
      zone
    } = req.body;

    if (!rider_name || !mobile) {
      return res.status(400).json({ status: 'error', message: 'Rider name and mobile are required' });
    }

    const rentAmt = (rent !== undefined && rent !== null && rent !== '') ? parseFloat(rent) : 0;
    const depAmt = (deposit !== undefined && deposit !== null && deposit !== '') ? parseFloat(deposit) : 0;
    const totalAmt = (total !== undefined && total !== null && total !== '') ? parseFloat(total) : (rentAmt + depAmt);
    const startDate = rental_start_date ? new Date(rental_start_date) : new Date();
    const endDate = return_date ? new Date(return_date) : null;
    const resolvedZone = zone_name || zone || 'Gotri Zone';

    let insertedId = `RIDE${Date.now()}`;

    try {
      const result = await db.query(`
        INSERT INTO renters (
          rider_name, mobile, email, date_of_birth, gender, address, present_address,
          aadhaar_number, emergency_contact_name, emergency_contact_phone,
          vehicle_id, battery_id, package_name,
          rental_start_date, return_date, status, rent, deposit, total,
          zone, kyc_status, booking_source, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'Active Ride', $16, $17, $18, $19, 'Verified', 'Form', NOW())
        RETURNING id, rider_name, mobile, vehicle_id, status, created_at
      `, [
        rider_name,
        mobile,
        email || null,
        date_of_birth || null,
        gender || null,
        address || null,
        present_address || address || null,
        aadhaar_number || null,
        emergency_contact_name || null,
        emergency_contact_phone || null,
        vehicle_id || 'EV-450X-202401',
        battery_id || 'BAT-450X-12340001',
        package_name || 'Daily Plan',
        startDate,
        endDate,
        rentAmt,
        depAmt,
        totalAmt,
        resolvedZone
      ]);
      if (result.rows[0]) insertedId = result.rows[0].id;

      // Update vehicle inventory status to 'In Ride' with active renter
      if (vehicle_id) {
        await db.query(`
          UPDATE vehicles 
          SET vehicle_status = 'In Ride', status = 'Online', renter_name = $1 
          WHERE code = $2 OR registration_number = $2
        `, [rider_name, vehicle_id]);
      }

      // Update battery inventory status to 'in_use'
      if (battery_id) {
        await db.query(`
          UPDATE batteries 
          SET status = 'in_use' 
          WHERE battery_id = $1 OR id::text = $1
        `, [battery_id]);
      }

      await delByPattern('vehicles:*');
      await delByPattern('batteries:*');
      await delByPattern('renters:*');
      await delByPattern('stats:*');
    } catch (dbErr) {
      console.warn('DB insert fallback for new ride:', dbErr.message);
    }

    const isCash = String(req.body.payment_method || req.body.pay_method || req.body.payment_mode || '').toLowerCase().includes('cash');
    let cashVoucher = req.body.cash_voucher_number || req.body.voucher_number || req.body.cash_receipt || null;
    if (isCash && !cashVoucher) {
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      cashVoucher = `CSH-VCHR-${todayStr}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Record Cash / Form payment in payment_transactions (without inserting into reservations)
    if (isCash && totalAmt > 0) {
      try {
        await db.query(`
          INSERT INTO payment_transactions (
            transaction_id, reference_id, amount, payment_method, status, mobile, customer_name, purpose
          )
          VALUES ($1, $2, $3, 'Cash', 'SUCCESS', $4, $5, $6)
          ON CONFLICT (transaction_id) DO NOTHING
        `, [
          cashVoucher,
          String(insertedId),
          totalAmt,
          mobile,
          rider_name,
          `Ride Booking (${package_name || 'Rental Plan'})`
        ]);
      } catch (_) {}
    } else if (req.body.payu_tx_id) {
      try {
        await db.query(`
          UPDATE payu_payments
          SET rider_name = COALESCE(NULLIF($1, ''), rider_name),
              mobile = COALESCE(NULLIF($2, ''), mobile),
              email = COALESCE(NULLIF($3, ''), email),
              reservation_id = COALESCE(reservation_id, $4),
              updated_at = NOW()
          WHERE tx_id = $5
        `, [rider_name, mobile, email || null, String(insertedId), req.body.payu_tx_id]);
        await db.query(`
          UPDATE payment_transactions
          SET customer_name = COALESCE(NULLIF($1, ''), customer_name),
              mobile = COALESCE(NULLIF($2, ''), mobile),
              updated_at = NOW()
          WHERE transaction_id = $3
        `, [rider_name, mobile, req.body.payu_tx_id]);
      } catch (_) {}
    }

    // Send WhatsApp receipt
    sendWhatsAppReceipt({
      mobile,
      name: rider_name,
      invoice_no: cashVoucher || req.body.payu_tx_id || `INV-${Date.now().toString().slice(-6)}`,
      invoice_date: new Date().toLocaleDateString('en-IN'),
      plan: package_name || 'EV Rental Plan',
      amount: totalAmt.toFixed(2)
    }).catch(() => {});

    res.status(201).json({
      status: 'success',
      message: 'New ride registered successfully!',
      data: {
        id: insertedId,
        rider_name,
        mobile,
        vehicle_id,
        battery_id,
        rent: rentAmt,
        deposit: depAmt,
        status: 'Active Ride',
        total: totalAmt,
        cash_voucher_number: cashVoucher,
        voucher_number: cashVoucher
      }
    });
  } catch (err) {
    console.error('Error creating new ride:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 2. Retain Ride Registration Handler (supports both /api/rides/retain and /api/retain-rider)
const handleRetainRide = async (req, res) => {
  try {
    const {
      rider_name,
      name,
      mobile,
      vehicle_id,
      battery_id,
      package_name,
      plan,
      rent,
      deposit,
      total,
      zone_name,
      zone,
      return_date,
      extension_days,
      additional_rent
    } = req.body;

    const rName = rider_name || name || 'Returning Rider';
    const cleanMob = (mobile || '').replace(/\D/g, '').slice(-10);
    const rentRaw = rent !== undefined && rent !== null && rent !== '' ? rent : additional_rent;
    const rentAmt = (rentRaw !== undefined && rentRaw !== null && rentRaw !== '') ? parseFloat(rentRaw) : 0;
    const depAmt = (deposit !== undefined && deposit !== null && deposit !== '') ? parseFloat(deposit) : 0;
    const totalAmt = (total !== undefined && total !== null && total !== '') ? parseFloat(total) : (rentAmt + depAmt);
    const packageName = package_name || plan || `Retain Ride (+${extension_days || 7} days)`;
    const vehicleCode = vehicle_id || 'EV-450X-202401';
    const batteryCode = battery_id || 'BAT-MNZ-001';
    const resolvedZone = zone_name || zone || 'Gotri Zone';
    const endDate = return_date ? new Date(return_date) : null;

    let insertedId = `RET-${Date.now().toString().slice(-6)}`;

    try {
      const existing = await db.query(
        "SELECT id, deposit FROM renters WHERE mobile LIKE $1 ORDER BY created_at DESC LIMIT 1",
        [`%${cleanMob}%`]
      );

      if (existing.rows.length > 0) {
        insertedId = existing.rows[0].id;
        await db.query(`
          UPDATE renters 
          SET status = 'Retain Ride',
              rider_name = COALESCE($1, rider_name),
              vehicle_id = COALESCE($2, vehicle_id),
              battery_id = COALESCE($3, battery_id),
              package_name = COALESCE($4, package_name),
              rent = $5,
              deposit = $6,
              total = $7,
              zone = COALESCE($8, zone),
              booking_source = 'Form',
              rental_start_date = NOW(),
              return_date = COALESCE($9, return_date)
          WHERE id = $10
        `, [rName, vehicleCode, batteryCode, packageName, rentAmt, depAmt, totalAmt, resolvedZone, endDate, existing.rows[0].id]);
      } else {
        const ins = await db.query(`
          INSERT INTO renters (
            rider_name, mobile, vehicle_id, battery_id, package_name, 
            rental_start_date, return_date, status, rent, deposit, total, zone, kyc_status, booking_source, created_at
          )
          VALUES ($1, $2, $3, $4, $5, NOW(), $6, 'Retain Ride', $7, $8, $9, $10, 'Verified', 'Form', NOW())
          RETURNING id
        `, [rName, mobile || cleanMob, vehicleCode, batteryCode, packageName, endDate, rentAmt, depAmt, totalAmt, resolvedZone]);
        if (ins.rows[0]) insertedId = ins.rows[0].id;
      }
    } catch (dbErr) {
      console.warn('DB error in retain ride:', dbErr.message);
    }

    const isCash = String(req.body.payment_method || req.body.pay_method || req.body.payment_mode || '').toLowerCase().includes('cash');
    let cashVoucher = req.body.cash_voucher_number || req.body.voucher_number || req.body.cash_receipt || null;
    if (isCash && !cashVoucher) {
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      cashVoucher = `CSH-VCHR-${todayStr}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    if (isCash && totalAmt > 0) {
      try {
        await db.query(`
          INSERT INTO payment_transactions (
            transaction_id, reference_id, amount, payment_method, status, mobile, customer_name, purpose
          )
          VALUES ($1, $2, $3, 'Cash', 'SUCCESS', $4, $5, $6)
          ON CONFLICT (transaction_id) DO NOTHING
        `, [
          cashVoucher,
          String(insertedId),
          totalAmt,
          mobile || cleanMob,
          rName,
          `Retain Ride (${packageName})`
        ]);
      } catch (_) {}
    }

    sendWhatsAppReceipt({
      mobile: mobile || cleanMob,
      name: rName,
      invoice_no: cashVoucher || req.body.payu_tx_id || `RET-${Date.now().toString().slice(-6)}`,
      invoice_date: new Date().toLocaleDateString('en-IN'),
      plan: `${packageName} (${vehicleCode})`,
      amount: totalAmt.toFixed(2)
    }).catch(() => {});

    // Ensure vehicle inventory marks as In Ride with current renter
    if (vehicleCode) {
      await db.query(`
        UPDATE vehicles 
        SET vehicle_status = 'In Ride', status = 'Online', renter_name = $1 
        WHERE code = $2 OR registration_number = $2
      `, [rName, vehicleCode]);
    }
    if (batteryCode) {
      await db.query(`
        UPDATE batteries 
        SET status = 'in_use' 
        WHERE battery_id = $1 OR id::text = $1
      `, [batteryCode]);
    }
    await delByPattern('vehicles:*');
    await delByPattern('batteries:*');
    await delByPattern('renters:*');
    await delByPattern('stats:*');

    res.status(200).json({
      status: 'success',
      message: 'Ride retained successfully! WhatsApp receipt sent.',
      data: {
        id: insertedId,
        rider_name: rName,
        mobile: mobile || cleanMob,
        vehicle_id: vehicleCode,
        battery_id: batteryCode,
        package_name: packageName,
        status: 'Retain Ride',
        total: totalAmt
      }
    });
  } catch (err) {
    console.error('Error retaining ride:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

router.post('/retain', handleRetainRide);
router.post('/', (req, res, next) => {
  if (req.baseUrl && req.baseUrl.includes('retain')) {
    return handleRetainRide(req, res);
  }
  next();
});

// 3. POST /api/rides/return - Return Ride Registration, Maintenance Routing & Deposit Refund Routing
router.post('/return', async (req, res) => {
  try {
    const {
      rider_name,
      mobile,
      vehicle_id,
      return_condition,
      refund_deposit,
      notes,
      damage_detected,
      damage_cost,
      damage_category
    } = req.body;
    const cleanMob = (mobile || '').replace(/\D/g, '').slice(-10);

    const isDamaged = Boolean(
      damage_detected === true ||
      parseFloat(damage_cost) > 0 ||
      ['minor', 'major', 'damaged', 'dirty', 'issue'].includes(String(return_condition || '').toLowerCase()) ||
      String(return_condition || '').toLowerCase().includes('damage') ||
      String(notes || '').toLowerCase().includes('damage')
    );

    try {
      await db.query(`
        UPDATE renters 
        SET status = 'Return', return_date = NOW() 
        WHERE (mobile LIKE $1 AND mobile != '') OR vehicle_id = $2
      `, [`%${cleanMob}%`, vehicle_id]);

      // If vehicle has damage, route to Maintenance; else return to Available
      if (vehicle_id) {
        if (isDamaged) {
          await db.query(`
            UPDATE vehicles 
            SET vehicle_status = 'Maintenance', renter_name = 'Maintenance Required' 
            WHERE code = $1 OR registration_number = $1
          `, [vehicle_id]);

          const ticketId = `MAIN-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
          const estCost = parseFloat(damage_cost) || 600.00;
          await db.query(`
            INSERT INTO maintenance_orders (
              ticket_id, vehicle_code, vehicle_model, vehicle_category, 
              issue_category, description, assigned_technician, service_center, 
              priority, status, estimated_cost, zone
            )
            VALUES ($1, $2, 'Evegah City', 'E-Scooter', $3, $4, 'Unassigned', 'Central Workshop', 'High', 'Scheduled', $5, 'Gotri Zone')
          `, [
            ticketId,
            vehicle_id,
            damage_category || 'Return Inspection Damage',
            notes || `Vehicle flagged with damage during return inspection (${return_condition || 'Issue'}).`,
            estCost
          ]).catch(e => console.warn('Could not auto-insert maintenance order on return:', e.message));
        } else {
          await db.query(`
            UPDATE vehicles 
            SET vehicle_status = 'Available', renter_name = 'None (Available)' 
            WHERE code = $1 OR registration_number = $1
          `, [vehicle_id]);
        }
      }

      // Release battery back to available
      const renterRec = await db.query(
        "SELECT battery_id, deposit FROM renters WHERE (mobile LIKE $1 AND mobile != '') OR vehicle_id = $2 ORDER BY id DESC LIMIT 1",
        [`%${cleanMob}%`, vehicle_id]
      );
      if (renterRec.rows[0]?.battery_id) {
        await db.query(`
          UPDATE batteries 
          SET status = 'available' 
          WHERE battery_id = $1 OR id::text = $1
        `, [renterRec.rows[0].battery_id]);
      }

      // Record in reservations table for Deposit Refund Dashboard only if an actual reservation exists or deposit > 0
      const renterDep = renterRec.rows[0]?.deposit !== undefined && renterRec.rows[0]?.deposit !== null ? parseFloat(renterRec.rows[0].deposit) : null;
      const existingRes = await db.query(
        "SELECT id, deposit FROM reservations WHERE (mobile LIKE $1 AND mobile != '') OR vehicle_number = $2 ORDER BY id DESC LIMIT 1",
        [`%${cleanMob}%`, vehicle_id]
      ).catch(() => ({ rows: [] }));
      const resDep = existingRes.rows[0]?.deposit !== undefined && existingRes.rows[0]?.deposit !== null ? parseFloat(existingRes.rows[0].deposit) : null;
      const originalDep = renterDep !== null ? renterDep : (resDep !== null ? resDep : 0);
      const depRefund = originalDep > 0
        ? ((refund_deposit !== undefined && refund_deposit !== null && refund_deposit !== '') ? parseFloat(refund_deposit) : originalDep)
        : 0;
      const deductionsAmt = Math.max(0, originalDep - depRefund);
      const depStatus = originalDep > 0 ? 'Pending_Refund' : 'None';

      const resUpdate = await db.query(`
        UPDATE reservations
        SET status = 'Completed',
            returned_at = NOW(),
            return_condition = $1,
            return_notes = $2,
            deposit_status = $3,
            refund_amount = $4,
            refund_deductions = $5
        WHERE (mobile LIKE $6 AND mobile != '') OR vehicle_number = $7
        RETURNING id
      `, [return_condition || (isDamaged ? 'Damaged / Inspection Failed' : 'Clean / Good'), notes || '', depStatus, depRefund, deductionsAmt, `%${cleanMob}%`, vehicle_id]);

      if (resUpdate.rows.length === 0 && originalDep > 0) {
        await db.query(`
          INSERT INTO reservations (
            reservation_id, customer_name, mobile, package_type, vehicle_number,
            deposit, status, deposit_status, refund_amount, refund_deductions, return_condition, return_notes, returned_at, booking_source
          )
          VALUES ($1, $2, $3, 'Rental Plan', $4, $5, 'Completed', $6, $7, $8, $9, $10, NOW(), 'Form')
        `, [
          `RID-${Date.now().toString().slice(-6)}`,
          rider_name || 'Rider',
          mobile || cleanMob,
          vehicle_id || 'EVM102502',
          originalDep,
          depStatus,
          depRefund,
          deductionsAmt,
          return_condition || (isDamaged ? 'Damaged / Inspection Failed' : 'Clean / Good'),
          notes || ''
        ]).catch(err => console.warn('Could not insert reservation for return:', err.message));
      }

      await delByPattern('reservations:*');
      await delByPattern('vehicles:*');
      await delByPattern('batteries:*');
      await delByPattern('renters:*');
      await delByPattern('stats:*');
      await delByPattern('maintenance:*');
    } catch (dbErr) {
      console.warn('DB return update error:', dbErr.message);
    }

    const finalRefundDeposit = (refund_deposit !== undefined && refund_deposit !== null && refund_deposit !== '')
      ? parseFloat(refund_deposit)
      : 0;

    sendWhatsAppReceipt({
      mobile: mobile || cleanMob,
      name: rider_name || 'Rider',
      invoice_no: `RTN-${Date.now().toString().slice(-6)}`,
      invoice_date: new Date().toLocaleDateString('en-IN'),
      plan: `Vehicle Return Completed (${vehicle_id || 'EV'})`,
      amount: finalRefundDeposit.toFixed(2)
    }).catch(() => {});

    res.json({
      status: 'success',
      message: isDamaged
        ? 'Ride return completed. Vehicle condition did not meet inspection criteria and has been routed to Maintenance. Refund request sent to Deposit Refunds page.'
        : 'Ride returned successfully! Vehicle is now Available and refund request has been routed to the Deposit Refunds page.',
      data: {
        rider_name,
        mobile,
        vehicle_id,
        status: 'Return',
        vehicle_status: isDamaged ? 'Maintenance' : 'Available',
        deposit_status: finalRefundDeposit > 0 ? 'Pending_Refund' : 'None',
        refund_deposit: finalRefundDeposit
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 4. GET /api/rides/active - List All Currently Active Rides (with Vehicle, Battery & Extension details)
router.get('/active', async (req, res) => {
  try {
    const query = `
      SELECT 
        r.id,
        r.rider_name,
        r.mobile,
        r.vehicle_id,
        r.battery_id,
        r.package_name,
        r.rental_start_date,
        r.return_date,
        r.status,
        r.rent,
        r.deposit,
        r.total,
        r.wallet_balance,
        r.avatar_url,
        r.created_at,
        v.registration_number,
        v.model as vehicle_model,
        v.battery_percentage,
        v.zone as vehicle_zone,
        b.soc as battery_soc,
        b.voltage as battery_voltage
      FROM renters r
      LEFT JOIN vehicles v ON (v.code = r.vehicle_id OR v.registration_number = r.vehicle_id)
      LEFT JOIN batteries b ON (b.battery_id = r.battery_id OR b.id::text = r.battery_id)
      WHERE r.status = 'Active Ride'
      ORDER BY r.rental_start_date DESC
    `;
    const dbRes = await db.query(query);

    const now = new Date();
    const activeRides = dbRes.rows.map(row => {
      const startDate = row.rental_start_date ? new Date(row.rental_start_date) : new Date(row.created_at);
      let returnDate = row.return_date ? new Date(row.return_date) : null;
      if (!returnDate) {
        // Default return date based on package or +7 days
        returnDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      }

      const diffMs = returnDate.getTime() - now.getTime();
      const remainingHours = Math.round(diffMs / (1000 * 60 * 60));
      const remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const isOverdue = diffMs < 0;

      return {
        ...row,
        expected_return_date: returnDate.toISOString(),
        remaining_hours: remainingHours,
        remaining_days: remainingDays,
        is_overdue: isOverdue,
        battery_soc: row.battery_soc || row.battery_percentage || 85,
        zone: row.vehicle_zone || 'Gotri Zone'
      };
    });

    res.json({
      status: 'success',
      count: activeRides.length,
      data: activeRides
    });
  } catch (err) {
    console.error('Error fetching active rides:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET /api/rides/active/:identifier - Get Active Ride for a Specific Rider (Mobile, Vehicle or ID)
router.get('/active/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const cleanId = String(identifier || '').trim();
    const cleanMob = cleanId.replace(/\D/g, '').slice(-10);

    const query = `
      SELECT 
        r.id,
        r.rider_name,
        r.mobile,
        r.vehicle_id,
        r.battery_id,
        r.package_name,
        r.rental_start_date,
        r.return_date,
        r.status,
        r.rent,
        r.deposit,
        r.total,
        r.wallet_balance,
        r.avatar_url,
        r.created_at,
        v.registration_number,
        v.model as vehicle_model,
        v.battery_percentage,
        v.zone as vehicle_zone,
        b.soc as battery_soc,
        b.voltage as battery_voltage
      FROM renters r
      LEFT JOIN vehicles v ON (v.code = r.vehicle_id OR v.registration_number = r.vehicle_id)
      LEFT JOIN batteries b ON (b.battery_id = r.battery_id OR b.id::text = r.battery_id)
      WHERE r.status = 'Active Ride'
        AND (
          (r.mobile LIKE $1 AND $1 != '')
          OR r.vehicle_id = $2
          OR v.registration_number = $2
          OR r.id::text = $2
        )
      ORDER BY r.rental_start_date DESC
      LIMIT 1
    `;

    const dbRes = await db.query(query, [`%${cleanMob}%`, cleanId]);
    // Check reservations if not found in renters
    if (dbRes.rows.length === 0) {
      const resQuery = `
        SELECT 
          r.id,
          r.reservation_id,
          r.customer_name as rider_name,
          r.mobile,
          r.vehicle_number as vehicle_id,
          r.battery_id,
          r.package_type as package_name,
          COALESCE(r.pickup_datetime::timestamp, r.created_at) as rental_start_date,
          r.drop_datetime::timestamp as return_date,
          r.status,
          r.fare as rent,
          r.deposit,
          (COALESCE(r.fare, 0) + COALESCE(r.deposit, 0)) as total,
          0.00 as wallet_balance,
          null as avatar_url,
          r.created_at,
          r.vehicle_number as registration_number,
          r.vehicle_model,
          COALESCE(b.soc, 88) as battery_soc,
          COALESCE(b.voltage, 54.2) as battery_voltage,
          r.pickup_zone as vehicle_zone
        FROM reservations r
        LEFT JOIN batteries b ON (b.battery_id = r.battery_id)
        WHERE (r.mobile LIKE $1 OR r.vehicle_number = $2 OR r.reservation_id = $2)
          AND (
            r.status IN ('Active Ride', 'Ongoing', 'Active', 'In Ride')
            OR (r.vehicle_number IS NOT NULL AND r.vehicle_number != '' AND r.vehicle_number != '—' AND r.status NOT IN ('Completed', 'Cancelled', 'Returned'))
          )
        ORDER BY r.created_at DESC
        LIMIT 1
      `;
      const fallbackRes = await db.query(resQuery, [`%${cleanMob}%`, cleanId]).catch(() => ({ rows: [] }));
      if (fallbackRes.rows.length > 0) {
        dbRes.rows = fallbackRes.rows;
      }
    }
    if (dbRes.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No active ride found for the specified rider/vehicle'
      });
    }

    const row = dbRes.rows[0];
    const now = new Date();
    const startDate = row.rental_start_date ? new Date(row.rental_start_date) : new Date(row.created_at);
    let returnDate = row.return_date ? new Date(row.return_date) : null;
    if (!returnDate) {
      returnDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    const diffMs = returnDate.getTime() - now.getTime();
    const remainingHours = Math.round(diffMs / (1000 * 60 * 60));
    const remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const isOverdue = diffMs < 0;

    // Standard available extension plans ready for mobile app & admin dashboard
    const extensionPlans = [
      { id: 'ext_2h', label: '2 Hours Extension', hours: 2, days: 0, fare: 60 },
      { id: 'ext_4h', label: '4 Hours Extension', hours: 4, days: 0, fare: 120 },
      { id: 'ext_1d', label: '1 Day (24 Hours)', hours: 24, days: 1, fare: 300 },
      { id: 'ext_3d', label: '3 Days Extension', hours: 72, days: 3, fare: 850 },
      { id: 'ext_7d', label: '7 Days (Weekly)', hours: 168, days: 7, fare: 1800 }
    ];

    res.json({
      status: 'success',
      data: {
        active_ride: {
          ...row,
          expected_return_date: returnDate.toISOString(),
          remaining_hours: remainingHours,
          remaining_days: remainingDays,
          is_overdue: isOverdue,
          battery_soc: row.battery_soc || row.battery_percentage || 85,
          zone: row.vehicle_zone || 'Gotri Zone'
        },
        extension_plans: extensionPlans,
        primary_payment_gateway: 'payu'
      }
    });
  } catch (err) {
    console.error('Error fetching rider active ride:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 5. POST /api/rides/extend - Extend Ride Duration Directly (Without Returning Vehicle)
router.post('/extend', async (req, res) => {
  try {
    const {
      rider_name,
      mobile,
      vehicle_id,
      extension_hours,
      extension_days,
      additional_fare,
      payment_method = 'payu',
      transaction_id,
      reason,
      notes
    } = req.body;

    const cleanMob = (mobile || '').replace(/\D/g, '').slice(-10);
    const addAmt = parseFloat(additional_fare || 0);

    if (addAmt <= 0 && !extension_hours && !extension_days) {
      return res.status(400).json({ status: 'error', message: 'Valid extension duration and fare are required' });
    }

    // 1. Locate active renter
    let renterQuery = await db.query(
      "SELECT * FROM renters WHERE (mobile LIKE $1 AND mobile != '') OR vehicle_id = $2 ORDER BY created_at DESC LIMIT 1",
      [`%${cleanMob}%`, vehicle_id]
    );

    const renter = renterQuery.rows.length > 0 ? renterQuery.rows[0] : null;
    const resolvedName = (rider_name || renter?.rider_name || 'Rider').trim();
    const resolvedVeh = vehicle_id || renter?.vehicle_id || 'EV-ALLOCATED';

    // 2. Handle Wallet Payment method
    if (String(payment_method).toLowerCase() === 'wallet') {
      const currentBalance = parseFloat(renter?.wallet_balance || 0);
      if (currentBalance < addAmt) {
        return res.status(400).json({
          status: 'error',
          message: `Insufficient wallet balance (₹${currentBalance.toFixed(2)}). Please add money or choose PayU.`
        });
      }

      // Deduct from wallet
      await db.query(
        "UPDATE renters SET wallet_balance = wallet_balance - $1 WHERE id = $2",
        [addAmt, renter.id]
      );

      // Record wallet transaction
      try {
        await db.query(`
          INSERT INTO wallet_transactions (mobile, title, subtitle, amount, type, status, payment_method, transaction_id)
          VALUES ($1, $2, $3, $4, 'Debit', 'Success', 'Wallet', $5)
        `, [
          cleanMob,
          'Ride Duration Extension',
          `Extended Ride on ${resolvedVeh}`,
          addAmt,
          `EXT-WLT-${Date.now()}`
        ]);
      } catch (wErr) {
        console.warn('Wallet debit transaction logging notice:', wErr.message);
      }
    }

    // 3. Compute New Return Date
    const currentReturn = renter?.return_date ? new Date(renter.return_date) : new Date();
    const addDays = parseInt(extension_days || 0, 10);
    const addHours = parseInt(extension_hours || 0, 10);

    let newReturnDate = new Date(currentReturn.getTime());
    if (addDays > 0) {
      newReturnDate.setDate(newReturnDate.getDate() + addDays);
    } else if (addHours > 0) {
      newReturnDate.setTime(newReturnDate.getTime() + addHours * 60 * 60 * 1000);
    } else {
      newReturnDate.setDate(newReturnDate.getDate() + 1);
    }

    const isCash = String(payment_method || '').toLowerCase().includes('cash');
    let cashVoucher = req.body.cash_voucher_number || null;
    if (isCash && !cashVoucher) {
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      cashVoucher = `CSH-VCHR-${todayStr}-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    const finalTxnId = transaction_id || cashVoucher || `EXT-${Date.now().toString().slice(-6)}`;

    // 4. Update Database Records
    try {
      await db.query(`
        UPDATE renters 
        SET total = total + $1,
            rent = rent + $1,
            return_date = $2,
            status = 'Active Ride'
        WHERE (mobile LIKE $3 AND mobile != '') OR vehicle_id = $4
      `, [addAmt, newReturnDate, `%${cleanMob}%`, resolvedVeh]);

      if (resolvedVeh) {
        await db.query(`
          UPDATE vehicles 
          SET vehicle_status = 'In Ride', renter_name = COALESCE($1, renter_name) 
          WHERE code = $2 OR registration_number = $2
        `, [resolvedName, resolvedVeh]);
      }

      await db.query(`
        UPDATE reservations
        SET fare = fare + $1,
            total_payable = total_payable + $1,
            transaction_id = COALESCE($2, transaction_id),
            payment_mode = $3,
            payment_status = 'Paid',
            status = 'Active Ride'
        WHERE (mobile LIKE $4 AND mobile != '') OR vehicle_number = $5
      `, [addAmt, finalTxnId, isCash ? 'Cash' : (payment_method || 'PayU'), `%${cleanMob}%`, resolvedVeh]).catch(() => {});

      // Record in payment_transactions table
      try {
        await db.query(`
          INSERT INTO payment_transactions (
            transaction_id, reference_id, amount, payment_method, status, mobile, customer_name, purpose
          )
          VALUES ($1, $2, $3, $4, 'SUCCESS', $5, $6, 'extend')
          ON CONFLICT (transaction_id) DO UPDATE SET status = 'SUCCESS', updated_at = NOW()
        `, [finalTxnId, finalTxnId, addAmt, isCash ? 'Cash' : (payment_method || 'PayU'), cleanMob, resolvedName]);
      } catch (_) {}

      await delByPattern('reservations:*');
      await delByPattern('vehicles:*');
      await delByPattern('renters:*');
      await delByPattern('stats:*');
    } catch (dbErr) {
      console.warn('DB extend ride error:', dbErr.message);
    }

    const durationText = addDays > 0 ? `${addDays} Day(s)` : `${addHours || 2} Hour(s)`;

    // Send WhatsApp Receipt
    sendWhatsAppReceipt({
      mobile: mobile || cleanMob,
      name: resolvedName,
      invoice_no: finalTxnId,
      invoice_date: new Date().toLocaleDateString('en-IN'),
      plan: `Ride Extended (+${durationText})`,
      amount: addAmt.toFixed(2)
    }).catch(() => {});

    res.json({
      status: 'success',
      message: `Ride extended successfully by ${durationText}! New return date: ${newReturnDate.toLocaleDateString('en-IN')}`,
      data: {
        rider_name: resolvedName,
        mobile: cleanMob,
        vehicle_id: resolvedVeh,
        additional_fare: addAmt,
        payment_method: payment_method || 'PayU',
        transaction_id: finalTxnId,
        new_return_date: newReturnDate.toISOString(),
        status: 'Active Ride'
      }
    });
  } catch (err) {
    console.error('Ride extension error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 6. POST /api/rides/extend/initiate-payu - Initiate PayU Payment for Ride Extension
router.post('/extend/initiate-payu', async (req, res) => {
  try {
    const { mobile, vehicle_id, additional_fare, extension_hours, extension_days, rider_name, return_url } = req.body;
    const addAmt = parseFloat(additional_fare || 0);

    if (addAmt <= 0) {
      return res.status(400).json({ status: 'error', message: 'Valid extension fare is required' });
    }

    const cleanMob = (mobile || '').replace(/\D/g, '').slice(-10) || '1800 889 8791';
    const txnid = `EVGEXTPAYU${Date.now()}${Math.floor(100 + Math.random() * 900)}`;

    const host = req.get('host') || 'evegah.cloud';
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';

    // Initiate via internal PayU route directly
    const payuReq = await fetch(`${protocol}://${host}/api/payments/payu/initiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: addAmt,
        rider_name: rider_name || 'Rider',
        mobile: cleanMob,
        purpose: 'extend',
        reservation_id: vehicle_id || 'EXT',
        return_url: return_url || `${protocol}://${host}/extend-ride?status=success`
      })
    });

    const payuRes = await payuReq.json();
    res.json(payuRes);
  } catch (err) {
    console.error('Error initiating PayU for extend ride:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// 5. POST /api/rides/exchange - Exchange Vehicle / Swap Ride
router.post('/exchange', async (req, res) => {
  try {
    const {
      rider_name,
      mobile,
      old_vehicle_id,
      new_vehicle_id,
      old_battery_id,
      new_battery_id,
      reason,
      notes
    } = req.body;
    const cleanMob = (mobile || '').replace(/\D/g, '').slice(-10);

    const isDamaged = String(reason || '').toLowerCase().includes('damage') ||
                      String(reason || '').toLowerCase().includes('breakdown') ||
                      String(reason || '').toLowerCase().includes('issue') ||
                      String(reason || '').toLowerCase().includes('accident');

    try {
      await db.query(`
        UPDATE renters 
        SET vehicle_id = COALESCE($1, vehicle_id),
            battery_id = COALESCE($2, battery_id),
            status = 'Active Ride'
        WHERE (mobile LIKE $3 AND mobile != '') OR vehicle_id = $4
      `, [new_vehicle_id, new_battery_id, `%${cleanMob}%`, old_vehicle_id]);

      // Handle old vehicle: if damaged send to Maintenance, otherwise Available
      if (old_vehicle_id) {
        if (isDamaged) {
          await db.query(`
            UPDATE vehicles 
            SET vehicle_status = 'Maintenance', renter_name = 'Maintenance Required' 
            WHERE code = $1 OR registration_number = $1
          `, [old_vehicle_id]);

          const ticketId = `MAIN-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
          await db.query(`
            INSERT INTO maintenance_orders (
              ticket_id, vehicle_code, vehicle_model, vehicle_category, 
              issue_category, description, assigned_technician, service_center, 
              priority, status, estimated_cost, zone
            )
            VALUES ($1, $2, 'Evegah City', 'E-Scooter', $3, $4, 'Unassigned', 'Central Workshop', 'High', 'Scheduled', 600, 'Gotri Zone')
          `, [ticketId, old_vehicle_id, reason || 'Vehicle Swap Damage', notes || 'Vehicle swapped out due to reported damage/maintenance issue.']).catch(() => {});
        } else {
          await db.query(`
            UPDATE vehicles 
            SET vehicle_status = 'Available', renter_name = 'None (Available)' 
            WHERE code = $1 OR registration_number = $1
          `, [old_vehicle_id]);
        }
      }

      if (old_battery_id) {
        await db.query(`
          UPDATE batteries 
          SET status = 'available' 
          WHERE battery_id = $1 OR id::text = $1
        `, [old_battery_id]);
      }

      // Mark new vehicle as In Ride
      if (new_vehicle_id) {
        await db.query(`
          UPDATE vehicles 
          SET vehicle_status = 'In Ride', status = 'Online', renter_name = $1 
          WHERE code = $2 OR registration_number = $2
        `, [rider_name || 'Rider', new_vehicle_id]);
      }

      if (new_battery_id) {
        await db.query(`
          UPDATE batteries 
          SET status = 'in_use' 
          WHERE battery_id = $1 OR id::text = $1
        `, [new_battery_id]);
      }

      // Update reservation record with new vehicle
      await db.query(`
        UPDATE reservations
        SET vehicle_number = $1, battery_id = COALESCE($2, battery_id)
        WHERE (mobile LIKE $3 AND mobile != '') OR vehicle_number = $4
      `, [new_vehicle_id, new_battery_id, `%${cleanMob}%`, old_vehicle_id]).catch(() => {});

      await delByPattern('reservations:*');
      await delByPattern('vehicles:*');
      await delByPattern('batteries:*');
      await delByPattern('renters:*');
      await delByPattern('stats:*');
      await delByPattern('maintenance:*');
    } catch (dbErr) {
      console.warn('DB exchange vehicle error:', dbErr.message);
    }

    sendWhatsAppReceipt({
      mobile: mobile || cleanMob,
      name: rider_name || 'Rider',
      invoice_no: `EXC-${Date.now().toString().slice(-6)}`,
      invoice_date: new Date().toLocaleDateString('en-IN'),
      plan: `Vehicle Exchanged to ${new_vehicle_id}`,
      amount: '0.00'
    }).catch(() => {});

    res.json({
      status: 'success',
      message: `Vehicle successfully exchanged from ${old_vehicle_id} to ${new_vehicle_id}!${isDamaged ? ' Old vehicle routed to Maintenance.' : ''}`,
      data: {
        rider_name,
        mobile,
        old_vehicle_id,
        new_vehicle_id,
        new_battery_id,
        status: 'Active Ride'
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET /api/rides/history/:identifier - List past & completed rides for a rider with details
router.get('/history/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    const cleanId = String(identifier || '').trim();
    const cleanMob = cleanId.replace(/\D/g, '').slice(-10);

    const query = `
      SELECT 
        'RID-' || rn.id::text as ride_id,
        COALESCE(rn.rider_name, 'Rider') as rider_name,
        rn.mobile,
        rn.vehicle_id,
        rn.battery_id,
        COALESCE(rn.package_name, 'Standard EV Plan') as package_name,
        rn.rental_start_date::text as ride_date,
        rn.return_date::text as return_date,
        COALESCE(rn.status, 'Active') as status,
        COALESCE(rn.rent, 0) as rent,
        COALESCE(rn.deposit, 0) as deposit,
        COALESCE(rn.total, 0) as total_cost,
        'UPI' as payment_mode,
        'TXN-ON-FILE' as transaction_id,
        'Gotri Hub' as pickup_zone,
        'Gotri Hub' as drop_zone,
        rn.created_at
      FROM renters rn
      WHERE ($1 != '%%' AND rn.mobile LIKE $1)
         OR rn.rider_name ILIKE $2
         OR rn.vehicle_id ILIKE $2

      UNION ALL

      SELECT 
        COALESCE(r.reservation_id, 'RES-' || r.id::text) as ride_id,
        COALESCE(r.customer_name, 'Rider') as rider_name,
        r.mobile,
        r.vehicle_number as vehicle_id,
        r.battery_id,
        COALESCE(r.package_type, 'Standard EV Plan') as package_name,
        r.reservation_date::text as ride_date,
        (r.created_at + INTERVAL '7 days')::date::text as return_date,
        COALESCE(r.status, 'Confirmed') as status,
        COALESCE(r.fare, 0) as rent,
        COALESCE(r.deposit, 0) as deposit,
        COALESCE(r.total_payable, 0) as total_cost,
        COALESCE(r.payment_mode, 'UPI') as payment_mode,
        COALESCE(r.transaction_id, 'TXN-ON-FILE') as transaction_id,
        COALESCE(r.pickup_zone, 'Gotri Hub') as pickup_zone,
        COALESCE(r.drop_zone, 'Gotri Hub') as drop_zone,
        r.created_at
      FROM reservations r
      WHERE ($1 != '%%' AND r.mobile LIKE $1)
         OR r.customer_name ILIKE $2
         OR r.vehicle_number ILIKE $2

      ORDER BY created_at DESC
      LIMIT 50
    `;

    const result = await db.query(query, [`%${cleanMob}%`, `%${cleanId}%`]);

    const formattedHistory = result.rows.map(row => ({
      rideId: row.ride_id,
      date: row.ride_date || new Date(row.created_at).toLocaleDateString('en-GB'),
      vehicleId: row.vehicle_id,
      batteryId: row.battery_id,
      package: row.package_name,
      distance: '6.4 km',
      time: '28 mins',
      cost: `₹ ${parseFloat(row.total_cost || row.rent || 45).toFixed(0)}`,
      amountNum: parseFloat(row.total_cost || row.rent || 45),
      deposit: parseFloat(row.deposit || 0),
      status: row.status,
      paymentMethod: row.payment_mode,
      pickupZone: row.pickup_zone,
      dropZone: row.drop_zone
    }));

    res.json({
      status: 'success',
      count: formattedHistory.length,
      data: formattedHistory
    });
  } catch (err) {
    console.error('Fetch ride history error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve ride history: ' + err.message });
  }
});

module.exports = router;
