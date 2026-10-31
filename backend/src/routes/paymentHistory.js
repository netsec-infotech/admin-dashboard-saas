const express = require('express');
const router = express.Router();
const db = require('../db');

// Helper to sanitize mobile
const cleanMob = (m) => (m || '').replace(/\D/g, '').slice(-10);

/**
 * GET /api/payments/history
 * Unified payment history across ICICI UPI, PayU, Wallet transactions, and Deposit Refunds.
 * Returns live records and aggregated KPI metrics.
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const offset = (page - 1) * limit;
    const search = (req.query.search || '').trim().toLowerCase();
    const typeFilter = (req.query.type || 'all').toLowerCase();
    const statusFilter = (req.query.status || 'all').toLowerCase();
    const fromDate = req.query.from_date;
    const toDate = req.query.to_date;

    // Build unified UNION query
    const unionQuery = `
      WITH unified_transactions AS (
        -- 1. ICICI Payments
        SELECT 
          'icici_' || ip.id::text AS id,
          ip.tx_id,
          COALESCE(ip.upi_ref_no, ip.merchant_id, 'ICICI-UPI') AS reference_id,
          COALESCE(
            NULLIF(ip.rider_name, 'Rider'),
            r.customer_name,
            (SELECT rider_name FROM renters WHERE mobile LIKE '%' || RIGHT(REGEXP_REPLACE(ip.mobile, '\\D', '', 'g'), 10) LIMIT 1),
            'Evegah Rider'
          ) AS rider_name,
          COALESCE(
            NULLIF(ip.mobile, ''),
            r.mobile,
            ''
          ) AS mobile,
          COALESCE(r.fare, CASE WHEN ip.amount >= 10 THEN (ip.amount - COALESCE(r.deposit, 5)) ELSE ip.amount END)::numeric AS rent_amount,
          COALESCE(r.deposit, CASE WHEN ip.amount >= 10 THEN 5 ELSE 0 END)::numeric AS deposit_amount,
          ip.amount::numeric AS amount,
          'Credit' AS type,
          CASE 
            WHEN UPPER(ip.status) = 'SUCCESS' THEN 'Successful'
            WHEN UPPER(ip.status) = 'PENDING' THEN 'Pending'
            ELSE 'Failed'
          END AS status,
          'ICICI UPI' AS payment_method,
          COALESCE(ip.purpose, 'Ride / Booking') AS purpose,
          ip.created_at
        FROM icici_payments ip
        LEFT JOIN reservations r ON (r.transaction_id = ip.tx_id OR r.reservation_id = ip.reservation_id)

        UNION ALL

        -- 2. PayU Payments (Collections only - refunds are recorded in Section 4 below)
        SELECT 
          'payu_' || pp.id::text AS id,
          pp.tx_id,
          COALESCE(pp.payu_id, pp.bank_ref_num, pp.tx_id) AS reference_id,
          COALESCE(
            NULLIF(pp.rider_name, 'Rider'),
            r.customer_name,
            (SELECT rider_name FROM renters WHERE mobile LIKE '%' || RIGHT(REGEXP_REPLACE(pp.mobile, '\\D', '', 'g'), 10) LIMIT 1),
            'Evegah Rider'
          ) AS rider_name,
          COALESCE(
            NULLIF(pp.mobile, ''),
            r.mobile,
            ''
          ) AS mobile,
          COALESCE(r.fare, pp.amount)::numeric AS rent_amount,
          COALESCE(r.deposit, 0)::numeric AS deposit_amount,
          pp.amount::numeric AS amount,
          'Credit' AS type,
          CASE 
            WHEN UPPER(pp.status) = 'SUCCESS' THEN 'Successful'
            WHEN UPPER(pp.status) = 'PENDING' THEN 'Pending'
            ELSE 'Failed'
          END AS status,
          'PayU India' AS payment_method,
          COALESCE(pp.purpose, 'Ride Payment') AS purpose,
          pp.created_at
        FROM payu_payments pp
        LEFT JOIN reservations r ON (r.transaction_id = pp.tx_id OR r.reservation_id = pp.reservation_id)
        WHERE pp.status NOT IN ('Refund_Failed', 'Refunded')
          AND pp.purpose NOT ILIKE '%refund%'
          AND pp.tx_id NOT LIKE 'REF-%'

        UNION ALL

        -- 3. Wallet Transactions (Razorpay / Wallet Top-Up / Ride deductions)
        SELECT 
          'wallet_' || wt.id::text AS id,
          COALESCE(wt.transaction_id, 'TXN-W' || wt.id::text) AS tx_id,
          COALESCE(wt.transaction_id, 'WLT-' || wt.id::text) AS reference_id,
          COALESCE(
            (SELECT rider_name FROM renters WHERE mobile LIKE '%' || RIGHT(REGEXP_REPLACE(wt.mobile, '\\D', '', 'g'), 10) LIMIT 1),
            (SELECT name FROM users WHERE mobile LIKE '%' || RIGHT(REGEXP_REPLACE(wt.mobile, '\\D', '', 'g'), 10) LIMIT 1),
            'Rider (' || wt.mobile || ')'
          ) AS rider_name,
          COALESCE(wt.mobile, '') AS mobile,
          wt.amount::numeric AS rent_amount,
          0.00::numeric AS deposit_amount,
          wt.amount::numeric AS amount,
          CASE 
            WHEN LOWER(wt.type) = 'debit' THEN 'Debit'
            ELSE 'Credit'
          END AS type,
          CASE 
            WHEN UPPER(wt.status) IN ('SUCCESS', 'SUCCESSFUL') THEN 'Successful'
            WHEN UPPER(wt.status) = 'PENDING' THEN 'Pending'
            ELSE 'Failed'
          END AS status,
          COALESCE(wt.payment_method, 'Wallet') AS payment_method,
          COALESCE(wt.title, wt.subtitle, 'Wallet Transaction') AS purpose,
          wt.created_at
        FROM wallet_transactions wt
        WHERE wt.title NOT ILIKE '%deposit refund%' 
          AND wt.subtitle NOT ILIKE '%deposit refund%'
          AND (wt.transaction_id IS NULL OR (wt.transaction_id NOT LIKE 'DEP-%' AND wt.transaction_id NOT LIKE 'RENT-%' AND wt.transaction_id NOT LIKE 'REF-%'))

        UNION ALL

        -- 4. Completed Deposit Refunds from Reservations
        SELECT 
          'refund_' || id::text AS id,
          COALESCE(refund_tx_id, 'REF-' || SUBSTRING(id::text, 1, 8)) AS tx_id,
          reservation_id AS reference_id,
          COALESCE(customer_name, 'Rider') AS rider_name,
          COALESCE(mobile, '') AS mobile,
          0.00::numeric AS rent_amount,
          COALESCE(refund_amount, deposit, 0)::numeric AS deposit_amount,
          COALESCE(refund_amount, deposit, 0)::numeric AS amount,
          'Debit' AS type,
          'Successful' AS status,
          COALESCE(refund_mode, 'PayU') AS payment_method,
          'Security Deposit Refund' AS purpose,
          COALESCE(refund_date, returned_at, created_at) AS created_at
        FROM reservations
        WHERE deposit_status = 'Refunded' AND COALESCE(refund_amount, deposit, 0) > 0

        UNION ALL

        -- 5. Direct / Cash / Offline Booking Payments only (avoid double-counting PayU, ICICI, Wallet)
        SELECT
          'res_' || id::text AS id,
          COALESCE(cash_voucher_number, transaction_id, 'CSH-VCHR-' || SUBSTRING(id::text, 1, 8)) AS tx_id,
          COALESCE(cash_voucher_number, transaction_id, reservation_id) AS reference_id,
          COALESCE(customer_name, 'Rider') AS rider_name,
          COALESCE(mobile, '') AS mobile,
          COALESCE(fare, 0)::numeric AS rent_amount,
          COALESCE(deposit, 0)::numeric AS deposit_amount,
          COALESCE(total_payable, (COALESCE(fare, 0) + COALESCE(deposit, 0)), fare)::numeric AS amount,
          'Credit' AS type,
          'Successful' AS status,
          CASE 
            WHEN payment_mode ILIKE '%cash%' THEN 'Cash'
            ELSE COALESCE(payment_mode, 'Cash')
          END AS payment_method,
          'Ride Booking (' || COALESCE(package_type, 'Rental Plan') || ')' AS purpose,
          created_at
        FROM reservations
        WHERE payment_status = 'Paid' AND COALESCE(fare, 0) > 0
          AND (payment_mode IS NULL OR payment_mode NOT IN ('PayU', 'PayU India', 'ICICI UPI', 'UPI', 'Wallet', 'Evegah Wallet'))
          AND NOT EXISTS (
            SELECT 1 FROM payu_payments pp 
            WHERE pp.tx_id = reservations.transaction_id 
               OR pp.reservation_id = reservations.id::text 
               OR pp.reservation_id = reservations.reservation_id
          )
          AND NOT EXISTS (
            SELECT 1 FROM icici_payments ip 
            WHERE ip.tx_id = reservations.transaction_id 
               OR ip.reservation_id = reservations.id::text 
               OR ip.reservation_id = reservations.reservation_id
          )
          AND NOT EXISTS (
            SELECT 1 FROM wallet_transactions wt 
            WHERE wt.transaction_id = reservations.transaction_id
          )
      )
      SELECT * FROM unified_transactions
    `;

    // Query all records for accurate KPI metrics
    const allRecordsRes = await db.query(unionQuery);
    const allRecords = allRecordsRes.rows;

    // Compute live KPI metrics over all records
    let totalCredit = 0;
    let totalDebit = 0;
    let successfulCount = 0;
    let pendingCount = 0;
    let failedCount = 0;

    allRecords.forEach(rec => {
      const amt = parseFloat(rec.amount) || 0;
      const st = (rec.status || '').toLowerCase();
      const tp = (rec.type || '').toLowerCase();

      if (st === 'successful') {
        successfulCount++;
        if (tp === 'credit') {
          totalCredit += amt;
        } else if (tp === 'debit') {
          totalDebit += amt;
        }
      } else if (st === 'pending') {
        pendingCount++;
      } else {
        failedCount++;
      }
    });

    const netBalance = totalCredit - totalDebit;

    // Filter records for pagination
    let filtered = allRecords.filter(rec => {
      if (search) {
        const q = search;
        const name = (rec.rider_name || '').toLowerCase();
        const mob = (rec.mobile || '').toLowerCase();
        const tx = (rec.tx_id || '').toLowerCase();
        const ref = (rec.reference_id || '').toLowerCase();
        const pm = (rec.payment_method || '').toLowerCase();
        if (!name.includes(q) && !mob.includes(q) && !tx.includes(q) && !ref.includes(q) && !pm.includes(q)) {
          return false;
        }
      }

      if (typeFilter !== 'all' && (rec.type || '').toLowerCase() !== typeFilter) {
        return false;
      }

      if (statusFilter !== 'all' && (rec.status || '').toLowerCase() !== statusFilter) {
        return false;
      }

      if (fromDate) {
        const recDate = new Date(rec.created_at);
        if (recDate < new Date(fromDate)) return false;
      }

      if (toDate) {
        const recDate = new Date(rec.created_at);
        const endDay = new Date(toDate);
        endDay.setHours(23, 59, 59, 999);
        if (recDate > endDay) return false;
      }

      return true;
    });

    // Sort by created_at DESC
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const total = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);

    res.json({
      status: 'success',
      kpis: {
        total_credit: Math.round(totalCredit * 100) / 100,
        total_debit: Math.round(totalDebit * 100) / 100,
        net_balance: Math.round(netBalance * 100) / 100,
        total_transactions: allRecords.length,
        successful_count: successfulCount,
        pending_count: pendingCount,
        failed_count: failedCount
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1
      },
      data: paginated
    });
  } catch (err) {
    console.error('Error fetching payment history:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

/**
 * GET /api/payments/cash-collection
 * Dedicated Cash Collection Report & Vouchers Ledger
 */
router.get('/cash-collection', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = (page - 1) * limit;
    const search = (req.query.search || '').trim().toLowerCase();
    const zone = (req.query.zone || '').trim();
    const fromDate = req.query.from_date;
    const toDate = req.query.to_date;

    let whereClause = `WHERE (payment_mode ILIKE '%cash%' OR cash_voucher_number IS NOT NULL)`;
    const params = [];

    if (zone && zone !== 'All Zones') {
      params.push(`%${zone}%`);
      whereClause += ` AND (pickup_zone ILIKE $${params.length} OR drop_zone ILIKE $${params.length})`;
    }

    if (search) {
      params.push(`%${search}%`);
      const idx = params.length;
      whereClause += ` AND (
        customer_name ILIKE $${idx} OR 
        mobile ILIKE $${idx} OR 
        reservation_id ILIKE $${idx} OR 
        cash_voucher_number ILIKE $${idx} OR 
        transaction_id ILIKE $${idx}
      )`;
    }

    if (fromDate) {
      params.push(fromDate);
      whereClause += ` AND created_at >= $${params.length}::date`;
    }

    if (toDate) {
      params.push(toDate);
      whereClause += ` AND created_at <= ($${params.length}::date + interval '1 day')`;
    }

    // Aggregates for KPI cards
    const summaryRes = await db.query(`
      SELECT
        COUNT(*)::int AS total_vouchers,
        COALESCE(SUM(COALESCE(total_payable, (COALESCE(fare, 0) + COALESCE(deposit, 0)))), 0)::numeric AS total_cash_collected,
        COALESCE(SUM(CASE WHEN created_at::date = CURRENT_DATE THEN COALESCE(total_payable, (COALESCE(fare, 0) + COALESCE(deposit, 0))) ELSE 0 END), 0)::numeric AS today_cash_collected,
        COALESCE(SUM(CASE WHEN created_at >= DATE_TRUNC('month', CURRENT_DATE) THEN COALESCE(total_payable, (COALESCE(fare, 0) + COALESCE(deposit, 0))) ELSE 0 END), 0)::numeric AS this_month_cash_collected
      FROM reservations
      ${whereClause}
    `, params);

    const summary = summaryRes.rows[0] || {
      total_vouchers: 0,
      total_cash_collected: 0,
      today_cash_collected: 0,
      this_month_cash_collected: 0
    };

    // List of vouchers
    const listRes = await db.query(`
      SELECT
        id,
        reservation_id,
        COALESCE(cash_voucher_number, transaction_id, 'CSH-VCHR-' || SUBSTRING(id::text, 1, 8)) AS voucher_number,
        transaction_id,
        customer_name AS rider_name,
        mobile,
        fare::numeric,
        deposit::numeric,
        COALESCE(total_payable, (COALESCE(fare, 0) + COALESCE(deposit, 0)))::numeric AS total_amount,
        payment_mode,
        payment_status,
        status,
        package_type,
        vehicle_model,
        pickup_zone,
        drop_zone,
        COALESCE(cash_collected_by, 'Counter Cashier') AS collected_by,
        created_at
      FROM reservations
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `, params);

    res.json({
      status: 'success',
      summary: {
        total_vouchers: parseInt(summary.total_vouchers) || 0,
        total_cash_collected: parseFloat(summary.total_cash_collected) || 0,
        today_cash_collected: parseFloat(summary.today_cash_collected) || 0,
        this_month_cash_collected: parseFloat(summary.this_month_cash_collected) || 0
      },
      pagination: {
        page,
        limit,
        total: parseInt(summary.total_vouchers) || 0,
        pages: Math.ceil((parseInt(summary.total_vouchers) || 0) / limit)
      },
      data: listRes.rows
    });
  } catch (err) {
    console.error('Error fetching cash collection report:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Helper to delete a single transaction by composite id
const deleteSingleTransaction = async (compositeId) => {
  const str = String(compositeId || '');
  if (str.startsWith('icici_')) {
    const rawId = str.replace('icici_', '');
    return db.query('DELETE FROM icici_payments WHERE id::text = $1', [rawId]).catch(() => ({ rowCount: 0 }));
  } else if (str.startsWith('payu_')) {
    const rawId = str.replace('payu_', '');
    return db.query('DELETE FROM payu_payments WHERE id::text = $1', [rawId]).catch(() => ({ rowCount: 0 }));
  } else if (str.startsWith('wallet_')) {
    const rawId = str.replace('wallet_', '');
    return db.query('DELETE FROM wallet_transactions WHERE id::text = $1', [rawId]).catch(() => ({ rowCount: 0 }));
  } else if (str.startsWith('refund_')) {
    const rawId = str.replace('refund_', '');
    return db.query("UPDATE reservations SET deposit_status = 'Dismissed', refund_amount = 0 WHERE id::text = $1 OR reservation_id = $1", [rawId]).catch(() => ({ rowCount: 0 }));
  } else if (str.startsWith('res_')) {
    const rawId = str.replace('res_', '');
    return db.query("UPDATE reservations SET payment_status = 'Cancelled' WHERE id::text = $1 OR reservation_id = $1", [rawId]).catch(() => ({ rowCount: 0 }));
  } else {
    await db.query('DELETE FROM payu_payments WHERE id::text = $1 OR tx_id = $1', [str]).catch(() => {});
    await db.query('DELETE FROM icici_payments WHERE id::text = $1 OR tx_id = $1', [str]).catch(() => {});
    await db.query('DELETE FROM wallet_transactions WHERE id::text = $1 OR transaction_id = $1', [str]).catch(() => {});
    return { rowCount: 1 };
  }
};

/**
 * DELETE /api/payments/history
 * Bulk delete payment transactions
 */
router.delete('/', async (req, res) => {
  const ids = req.body?.ids || req.body?.data?.ids || (req.query?.ids ? String(req.query.ids).split(',') : []);
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ status: 'error', message: 'No transaction IDs provided' });
  }

  try {
    let affected = 0;
    for (const id of ids) {
      const resDel = await deleteSingleTransaction(id);
      affected += resDel?.rowCount || 0;
    }

    res.json({
      status: 'success',
      message: `Successfully deleted ${ids.length} transaction record(s).`,
      affected
    });
  } catch (err) {
    console.error('Error deleting transactions:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

/**
 * DELETE /api/payments/history/:id
 * Delete a single payment transaction
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await deleteSingleTransaction(id);
    res.json({
      status: 'success',
      message: 'Transaction deleted successfully.'
    });
  } catch (err) {
    console.error('Error deleting transaction:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

/**
 * GET /api/payments/history/export
 * Export all unified payment transactions and deposit history as CSV or JSON
 */
router.get('/export', async (req, res) => {
  try {
    const format = (req.query.format || 'csv').toLowerCase();
    const query = `
      WITH unified_transactions AS (
        -- 1. ICICI Payments
        SELECT 
          'icici_' || ip.id::text AS id,
          ip.tx_id,
          COALESCE(ip.upi_ref_no, ip.merchant_id, 'ICICI-UPI') AS reference_id,
          COALESCE(
            NULLIF(ip.rider_name, 'Rider'),
            r.customer_name,
            (SELECT rider_name FROM renters WHERE mobile LIKE '%' || RIGHT(REGEXP_REPLACE(ip.mobile, '\\D', '', 'g'), 10) LIMIT 1),
            'Evegah Rider'
          ) AS rider_name,
          COALESCE(NULLIF(ip.mobile, ''), r.mobile, '') AS mobile,
          COALESCE(r.fare, CASE WHEN ip.amount >= 10 THEN (ip.amount - COALESCE(r.deposit, 5)) ELSE ip.amount END)::numeric AS rent_amount,
          COALESCE(r.deposit, CASE WHEN ip.amount >= 10 THEN 5 ELSE 0 END)::numeric AS deposit_amount,
          ip.amount::numeric AS amount,
          'Credit' AS type,
          CASE 
            WHEN UPPER(ip.status) = 'SUCCESS' THEN 'Successful'
            WHEN UPPER(ip.status) = 'PENDING' THEN 'Pending'
            ELSE 'Failed'
          END AS status,
          'ICICI UPI' AS payment_method,
          COALESCE(ip.purpose, 'Ride / Booking') AS purpose,
          ip.created_at
        FROM icici_payments ip
        LEFT JOIN reservations r ON (r.transaction_id = ip.tx_id OR r.reservation_id = ip.reservation_id)

        UNION ALL

        -- 2. PayU Payments
        SELECT 
          'payu_' || pp.id::text AS id,
          pp.tx_id,
          COALESCE(pp.payu_id, pp.bank_ref_num, pp.tx_id) AS reference_id,
          COALESCE(
            NULLIF(pp.rider_name, 'Rider'),
            r.customer_name,
            (SELECT rider_name FROM renters WHERE mobile LIKE '%' || RIGHT(REGEXP_REPLACE(pp.mobile, '\\D', '', 'g'), 10) LIMIT 1),
            'Evegah Rider'
          ) AS rider_name,
          COALESCE(NULLIF(pp.mobile, ''), r.mobile, '') AS mobile,
          COALESCE(r.fare, pp.amount)::numeric AS rent_amount,
          COALESCE(r.deposit, 0)::numeric AS deposit_amount,
          pp.amount::numeric AS amount,
          'Credit' AS type,
          CASE 
            WHEN UPPER(pp.status) = 'SUCCESS' THEN 'Successful'
            WHEN UPPER(pp.status) = 'PENDING' THEN 'Pending'
            ELSE 'Failed'
          END AS status,
          'PayU India' AS payment_method,
          COALESCE(pp.purpose, 'Ride Payment') AS purpose,
          pp.created_at
        FROM payu_payments pp
        LEFT JOIN reservations r ON (r.transaction_id = pp.tx_id OR r.reservation_id = pp.reservation_id)
        WHERE pp.status NOT IN ('Refund_Failed', 'Refunded')
          AND pp.purpose NOT ILIKE '%refund%'
          AND pp.tx_id NOT LIKE 'REF-%'

        UNION ALL

        -- 3. Wallet Transactions
        SELECT 
          'wallet_' || wt.id::text AS id,
          COALESCE(wt.transaction_id, 'TXN-W' || wt.id::text) AS tx_id,
          COALESCE(wt.transaction_id, 'WLT-' || wt.id::text) AS reference_id,
          COALESCE(
            (SELECT rider_name FROM renters WHERE mobile LIKE '%' || RIGHT(REGEXP_REPLACE(wt.mobile, '\\D', '', 'g'), 10) LIMIT 1),
            (SELECT name FROM users WHERE mobile LIKE '%' || RIGHT(REGEXP_REPLACE(wt.mobile, '\\D', '', 'g'), 10) LIMIT 1),
            'Rider (' || wt.mobile || ')'
          ) AS rider_name,
          COALESCE(wt.mobile, '') AS mobile,
          wt.amount::numeric AS rent_amount,
          0.00::numeric AS deposit_amount,
          wt.amount::numeric AS amount,
          CASE 
            WHEN LOWER(wt.type) = 'debit' THEN 'Debit'
            ELSE 'Credit'
          END AS type,
          CASE 
            WHEN UPPER(wt.status) IN ('SUCCESS', 'SUCCESSFUL') THEN 'Successful'
            WHEN UPPER(wt.status) = 'PENDING' THEN 'Pending'
            ELSE 'Failed'
          END AS status,
          COALESCE(wt.payment_method, 'Wallet') AS payment_method,
          COALESCE(wt.title, wt.subtitle, 'Wallet Transaction') AS purpose,
          wt.created_at
        FROM wallet_transactions wt
        WHERE wt.title NOT ILIKE '%deposit refund%' 
          AND wt.subtitle NOT ILIKE '%deposit refund%'
          AND (wt.transaction_id IS NULL OR (wt.transaction_id NOT LIKE 'DEP-%' AND wt.transaction_id NOT LIKE 'RENT-%' AND wt.transaction_id NOT LIKE 'REF-%'))

        UNION ALL

        -- 4. Completed Deposit Refunds from Reservations
        SELECT 
          'refund_' || id::text AS id,
          COALESCE(refund_tx_id, 'REF-' || SUBSTRING(id::text, 1, 8)) AS tx_id,
          reservation_id AS reference_id,
          COALESCE(customer_name, 'Rider') AS rider_name,
          COALESCE(mobile, '') AS mobile,
          0.00::numeric AS rent_amount,
          COALESCE(refund_amount, deposit, 0)::numeric AS deposit_amount,
          COALESCE(refund_amount, deposit, 0)::numeric AS amount,
          'Debit' AS type,
          'Successful' AS status,
          COALESCE(refund_mode, 'PayU') AS payment_method,
          'Security Deposit Refund' AS purpose,
          COALESCE(refund_date, returned_at, created_at) AS created_at
        FROM reservations
        WHERE deposit_status = 'Refunded' AND COALESCE(refund_amount, deposit, 0) > 0

        UNION ALL

        -- 5. Direct / Cash / Offline Bookings
        SELECT
          'res_' || id::text AS id,
          COALESCE(cash_voucher_number, transaction_id, 'CSH-VCHR-' || SUBSTRING(id::text, 1, 8)) AS tx_id,
          COALESCE(cash_voucher_number, transaction_id, reservation_id) AS reference_id,
          COALESCE(customer_name, 'Rider') AS rider_name,
          COALESCE(mobile, '') AS mobile,
          COALESCE(fare, 0)::numeric AS rent_amount,
          COALESCE(deposit, 0)::numeric AS deposit_amount,
          COALESCE(total_payable, (COALESCE(fare, 0) + COALESCE(deposit, 0)), fare)::numeric AS amount,
          'Credit' AS type,
          'Successful' AS status,
          CASE 
            WHEN payment_mode ILIKE '%cash%' THEN 'Cash'
            WHEN payment_mode ILIKE '%upi%' THEN 'UPI'
            WHEN payment_mode ILIKE '%card%' THEN 'Card'
            ELSE COALESCE(payment_mode, 'Offline / Counter')
          END AS payment_method,
          COALESCE(package_type || ' Booking', 'Counter Booking') AS purpose,
          created_at
        FROM reservations
        WHERE NOT EXISTS (
          SELECT 1 FROM payu_payments pp 
          WHERE pp.tx_id = reservations.transaction_id 
             OR (pp.reservation_id IS NOT NULL AND pp.reservation_id = reservations.reservation_id)
        )
        AND NOT EXISTS (
          SELECT 1 FROM icici_payments ip 
          WHERE ip.tx_id = reservations.transaction_id 
             OR (ip.reservation_id IS NOT NULL AND ip.reservation_id = reservations.reservation_id)
        )
      )
      SELECT * FROM unified_transactions ORDER BY created_at DESC;
    `;

    const txRes = await db.query(query);
    const rows = txRes.rows;

    if (format === 'json') {
      return res.json({ status: 'success', count: rows.length, data: rows });
    }

    // CSV format
    if (rows.length === 0) {
      return res.send('No transactions found');
    }

    const headers = ['Transaction ID', 'Reference ID', 'Rider Name', 'Mobile', 'Rent (INR)', 'Deposit (INR)', 'Total Amount (INR)', 'Type', 'Status', 'Payment Method', 'Purpose', 'Date Time'];
    const csvLines = [headers.join(',')];

    for (const r of rows) {
      const line = [
        `"${String(r.tx_id || '').replace(/"/g, '""')}"`,
        `"${String(r.reference_id || '').replace(/"/g, '""')}"`,
        `"${String(r.rider_name || '').replace(/"/g, '""')}"`,
        `"${String(r.mobile || '').replace(/"/g, '""')}"`,
        `"${Number(r.rent_amount || 0).toFixed(2)}"`,
        `"${Number(r.deposit_amount || 0).toFixed(2)}"`,
        `"${Number(r.amount || 0).toFixed(2)}"`,
        `"${String(r.type || '').replace(/"/g, '""')}"`,
        `"${String(r.status || '').replace(/"/g, '""')}"`,
        `"${String(r.payment_method || '').replace(/"/g, '""')}"`,
        `"${String(r.purpose || '').replace(/"/g, '""')}"`,
        `"${r.created_at ? new Date(r.created_at).toISOString() : ''}"`
      ];
      csvLines.push(line.join(','));
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="transactions_export_${Date.now()}.csv"`);
    return res.send(csvLines.join('\n'));
  } catch (err) {
    console.error('Error exporting transactions:', err);
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;

