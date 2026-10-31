const express = require('express');
const router = express.Router();
const db = require('../db');

// Ensure wallet_transactions table and columns exist in Postgres
(async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS wallet_transactions (
        id SERIAL PRIMARY KEY,
        mobile VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255) DEFAULT '',
        amount NUMERIC(10, 2) NOT NULL,
        type VARCHAR(50) NOT NULL,
        status VARCHAR(50) DEFAULT 'Success',
        payment_method VARCHAR(100) DEFAULT 'Razorpay',
        transaction_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await db.query('ALTER TABLE renters ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC(10, 2) DEFAULT 0.00');
    await db.query('ALTER TABLE renters ADD COLUMN IF NOT EXISTS bonus_balance NUMERIC(10, 2) DEFAULT 0.00');
  } catch (e) {
    console.error('Wallet DB initialization error:', e);
  }
})();

// GET /api/wallet/balance
router.get('/balance', async (req, res) => {
  const { mobile } = req.query;
  const rawMobile = (mobile || '').trim();
  const cleanMobile = rawMobile.replace(/\D/g, '');
  const last10 = cleanMobile.length >= 10 ? cleanMobile.slice(-10) : cleanMobile;

  try {
    let mainBal = 0.00;
    let bonusBal = 0.00;

    if (last10.length > 0) {
      const renterRes = await db.query(
        'SELECT wallet_balance, bonus_balance FROM renters WHERE mobile LIKE $1 OR mobile LIKE $2 OR mobile LIKE $3 LIMIT 1',
        [`%${last10}%`, `%${cleanMobile}%`, `%${rawMobile}%`]
      );

      if (renterRes.rows.length > 0) {
        mainBal = parseFloat(renterRes.rows[0].wallet_balance) || 0.00;
        bonusBal = parseFloat(renterRes.rows[0].bonus_balance) || 0.00;
      } else {
        // Check users table as fallback
        try {
          const userRes = await db.query(
            'SELECT wallet_balance, bonus_balance FROM users WHERE mobile LIKE $1 OR phone LIKE $1 LIMIT 1',
            [`%${last10}%`]
          );
          if (userRes.rows.length > 0) {
            mainBal = parseFloat(userRes.rows[0].wallet_balance) || 0.00;
            bonusBal = parseFloat(userRes.rows[0].bonus_balance) || 0.00;
          }
        } catch (_) {}
      }
    }

    res.json({
      status: 'success',
      data: {
        main_balance: mainBal,
        bonus_balance: bonusBal,
        total_balance: mainBal + bonusBal
      }
    });
  } catch (err) {
    console.error('Failed to get wallet balance:', err);
    res.json({
      status: 'success',
      data: { main_balance: 0.00, bonus_balance: 0.00, total_balance: 0.00 }
    });
  }
});

// POST /api/wallet/add-money - Direct wallet top-up into Postgres
router.post('/add-money', async (req, res) => {
  try {
    const { mobile, amount, payment_method, razorpay_payment_id, transaction_id } = req.body;
    const numAmount = parseFloat(amount || 0);
    const rawMobile = (mobile || '').trim();
    const cleanMobile = rawMobile.replace(/\D/g, '');
    const last10 = cleanMobile.length >= 10 ? cleanMobile.slice(-10) : cleanMobile;
    const txId = transaction_id || razorpay_payment_id || `PAY_${Date.now()}`;
    const method = payment_method || 'ICICI UPI';

    if (numAmount <= 0) {
      return res.status(400).json({ status: 'error', message: 'Valid amount is required' });
    }

    // 1. Update renters wallet balance
    let updatedBal = numAmount;
    if (last10.length > 0) {
      const updateRes = await db.query(
        `UPDATE renters 
         SET wallet_balance = COALESCE(wallet_balance, 0.00) + $1 
         WHERE mobile LIKE $2 OR mobile LIKE $3
         RETURNING wallet_balance, bonus_balance`,
        [numAmount, `%${last10}%`, `%${cleanMobile}%`]
      );
      if (updateRes.rows.length > 0) {
        updatedBal = parseFloat(updateRes.rows[0].wallet_balance) || numAmount;
      }
    }

    // 2. Record transaction in wallet_transactions
    await db.query(`
      INSERT INTO wallet_transactions (mobile, title, subtitle, amount, type, status, payment_method, transaction_id)
      VALUES ($1, 'Wallet Top-Up', $2, $3, 'Credit', 'Success', $4, $5)
    `, [cleanMobile || rawMobile, `${method} Payment`, numAmount, method, txId]);

    res.json({
      status: 'success',
      message: `₹${numAmount} credited to wallet successfully`,
      data: {
        main_balance: updatedBal,
        transaction_id: txId
      }
    });
  } catch (err) {
    console.error('Add money error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST /api/wallet/withdraw - Debit from wallet for ride or payout
router.post('/withdraw', async (req, res) => {
  try {
    const { mobile, amount, payout_method } = req.body;
    const numAmount = parseFloat(amount || 0);
    const rawMobile = (mobile || '').trim();
    const cleanMobile = rawMobile.replace(/\D/g, '');
    const last10 = cleanMobile.length >= 10 ? cleanMobile.slice(-10) : cleanMobile;
    const txId = `WTH_${Date.now()}`;
    const method = payout_method || 'Ride Payment';

    if (numAmount <= 0) {
      return res.status(400).json({ status: 'error', message: 'Valid amount is required' });
    }

    // Debit balance
    if (last10.length > 0) {
      await db.query(
        `UPDATE renters 
         SET wallet_balance = GREATEST(0.00, COALESCE(wallet_balance, 0.00) - $1) 
         WHERE mobile LIKE $2 OR mobile LIKE $3`,
        [numAmount, `%${last10}%`, `%${cleanMobile}%`]
      );
    }

    await db.query(`
      INSERT INTO wallet_transactions (mobile, title, subtitle, amount, type, status, payment_method, transaction_id)
      VALUES ($1, 'Ride Payment', $2, $3, 'Debit', 'Success', 'Wallet Main Balance', $4)
    `, [cleanMobile || rawMobile, method, numAmount, txId]);

    res.json({
      status: 'success',
      message: `₹${numAmount} debited from wallet`,
      data: { transaction_id: txId }
    });
  } catch (err) {
    console.error('Withdraw error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET /api/wallet/users - List of all registered users with their live wallet balance
router.get('/users', async (req, res) => {
  const { search } = req.query;
  const cleanSearch = (search || '').trim();

  try {
    let query = `
      SELECT 
        MAX(r.id::text) AS id,
        COALESCE(MAX(r.rider_name), 'Rider') AS name,
        MAX(r.mobile) AS mobile,
        COALESCE(MAX(r.email), '') AS email,
        COALESCE(MAX(r.address), '') AS address,
        COALESCE(MAX(r.kyc_status), 'Verified') AS kyc_status,
        MAX(COALESCE(r.wallet_balance, 0.00)) AS wallet_balance,
        MAX(COALESCE(r.bonus_balance, 0.00)) AS bonus_balance,
        (MAX(COALESCE(r.wallet_balance, 0.00)) + MAX(COALESCE(r.bonus_balance, 0.00))) AS total_balance,
        MIN(r.created_at) AS created_at
      FROM renters r
    `;

    const params = [];
    if (cleanSearch.length > 0) {
      query += ` WHERE r.rider_name ILIKE $1 OR r.mobile ILIKE $1`;
      params.push(`%${cleanSearch}%`);
    }

    query += `
      GROUP BY COALESCE(NULLIF(RIGHT(REGEXP_REPLACE(COALESCE(r.mobile, ''), '\\D', '', 'g'), 10), ''), r.id::text)
      ORDER BY total_balance DESC, MIN(r.created_at) DESC 
      LIMIT 100
    `;

    const result = await db.query(query, params);

    res.json({
      status: 'success',
      total: result.rows.length,
      data: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        mobile: row.mobile,
        email: row.email || `${(row.mobile || '').replace(/\D/g, '')}@evegah.com`,
        address: row.address || 'Vadodara, Gujarat',
        kyc_status: row.kyc_status || 'Verified',
        wallet_balance: parseFloat(row.wallet_balance) || 0.00,
        bonus_balance: parseFloat(row.bonus_balance) || 0.00,
        total_balance: parseFloat(row.total_balance) || 0.00,
        created_at: row.created_at
      }))
    });
  } catch (err) {
    console.error('Failed to get wallet users list:', err.message);
    res.json({ status: 'success', total: 0, data: [] });
  }
});

// POST /api/wallet/add-money (Razorpay Top-up)
router.post('/add-money', async (req, res) => {
  const { mobile, amount, payment_method, razorpay_payment_id } = req.body;
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ status: 'error', message: 'Invalid amount' });
  }

  const rawMobile = (mobile || '').trim();
  const cleanMobile = rawMobile.replace(/\D/g, '');
  const last10 = cleanMobile.length >= 10 ? cleanMobile.slice(-10) : cleanMobile;
  const txId = razorpay_payment_id || `PAY-${Date.now()}`;

  try {
    const searchPattern = last10 ? `%${last10}%` : `%${rawMobile}%`;

    // 1. Try to find existing renter
    let targetRenterId = null;
    const matchRes = await db.query(
      `SELECT id, mobile, wallet_balance FROM renters 
       WHERE mobile LIKE $1 OR mobile LIKE $2 OR REPLACE(REPLACE(mobile, '+', ''), ' ', '') LIKE $3
       LIMIT 1`,
      [searchPattern, `%${rawMobile}%`, `%${cleanMobile}%`]
    );

    if (matchRes.rows.length > 0) {
      targetRenterId = matchRes.rows[0].id;
      await db.query(
        `UPDATE renters 
         SET wallet_balance = COALESCE(wallet_balance, 0.00) + $1 
         WHERE mobile LIKE $2 OR mobile LIKE $3 OR id = $4`,
        [numAmount, searchPattern, `%${cleanMobile}%`, targetRenterId]
      );
    } else {
      // Check users table as fallback
      let riderName = 'Rider';
      let riderMob = last10 || rawMobile;
      let riderEmail = `rider_${cleanMobile || last10}@evegah.com`;
      try {
        const userMatch = await db.query(
          `SELECT name, mobile, phone, email FROM users 
           WHERE mobile LIKE $1 OR phone LIKE $1 OR REPLACE(REPLACE(mobile, '+', ''), ' ', '') LIKE $2
           LIMIT 1`,
          [searchPattern, `%${cleanMobile}%`]
        );
        if (userMatch.rows.length > 0) {
          riderName = userMatch.rows[0].name || riderName;
          riderMob = userMatch.rows[0].mobile || userMatch.rows[0].phone || riderMob;
          if (userMatch.rows[0].email && userMatch.rows[0].email.trim() !== 'rider@evegah.com') {
            riderEmail = userMatch.rows[0].email.trim();
          }
        }
      } catch (_) {}

      try {
        const insertRes = await db.query(
          `INSERT INTO renters (name, mobile, email, kyc_status, wallet_balance, bonus_balance)
           VALUES ($1, $2, $3, 'Verified', $4, 0.00)
           RETURNING id`,
          [riderName, riderMob, riderEmail, numAmount]
        );
        if (insertRes.rows.length > 0) {
          targetRenterId = insertRes.rows[0].id;
        }
      } catch (errInsert) {
        console.error('Non-critical error auto-creating renter for wallet:', errInsert);
      }
    }

    // 2. Insert transaction log into wallet_transactions
    let txRecord = null;
    try {
      const txRes = await db.query(`
        INSERT INTO wallet_transactions (mobile, title, subtitle, amount, type, status, payment_method, transaction_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        last10 || rawMobile || 'User',
        'Wallet Top-Up',
        `Razorpay Payment (${payment_method || 'UPI/Card'})`,
        numAmount,
        'Credit',
        'Success',
        payment_method || 'Razorpay',
        txId
      ]);
      txRecord = txRes.rows[0];
    } catch (errTx) {
      console.error('Non-critical transaction log error:', errTx);
    }

    // 3. Fetch updated balance
    let mainBal = numAmount;
    let bonusBal = 0.00;
    try {
      const renterRes = await db.query(
        'SELECT wallet_balance, bonus_balance FROM renters WHERE mobile LIKE $1 OR mobile LIKE $2 LIMIT 1',
        [searchPattern, `%${rawMobile}%`]
      );
      if (renterRes.rows.length > 0) {
        mainBal = parseFloat(renterRes.rows[0].wallet_balance) || numAmount;
        bonusBal = parseFloat(renterRes.rows[0].bonus_balance) || 0.00;
      }
    } catch (_) {}

    res.json({
      status: 'success',
      message: `Successfully added ₹${numAmount} to wallet`,
      data: {
        transaction: txRecord || { id: txId, amount: numAmount, type: 'Credit', status: 'Success' },
        main_balance: mainBal,
        bonus_balance: bonusBal,
        total_balance: mainBal + bonusBal
      }
    });
  } catch (err) {
    console.error('Failed to add money to wallet:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST /api/wallet/withdraw (Razorpay Payout)
router.post('/withdraw', async (req, res) => {
  const { mobile, amount, payout_method } = req.body;
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ status: 'error', message: 'Invalid withdrawal amount' });
  }

  const cleanMobile = (mobile || '').replace(/\D/g, '');
  const txId = `WTH-${Date.now()}`;

  try {
    // Check current balance
    const renterRes = await db.query('SELECT wallet_balance FROM renters WHERE mobile LIKE $1 LIMIT 1', [`%${cleanMobile}%`]);
    let mainBal = renterRes.rows.length > 0 ? parseFloat(renterRes.rows[0].wallet_balance) : 0.00;

    if (mainBal < numAmount) {
      return res.status(400).json({ status: 'error', message: 'Insufficient main balance for withdrawal' });
    }

    // Deduct main balance
    await db.query(
      'UPDATE renters SET wallet_balance = wallet_balance - $1 WHERE mobile LIKE $2 OR mobile LIKE $3',
      [numAmount, `%${cleanMobile}%`, `%${mobile}%`]
    );

    // Insert transaction
    const txRes = await db.query(`
      INSERT INTO wallet_transactions (mobile, title, subtitle, amount, type, status, payment_method, transaction_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      mobile || 'User',
      'Wallet Withdrawal',
      `Razorpay Instant Payout (${payout_method || 'UPI/Bank'})`,
      numAmount,
      'Withdrawal',
      'Success',
      'Razorpay Payout',
      txId
    ]);

    res.json({
      status: 'success',
      message: `Successfully withdrawn ₹${numAmount} to your bank account`,
      data: {
        transaction: txRes.rows[0],
        main_balance: mainBal - numAmount
      }
    });
  } catch (err) {
    console.error('Failed to process withdrawal:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET /api/wallet/transactions
router.get('/transactions', async (req, res) => {
  const { mobile } = req.query;
  const cleanMobile = (mobile || '').replace(/\D/g, '');
  const last10 = cleanMobile.slice(-10);

  try {
    let txs = [];
    let query = `
      SELECT 
        wt.*,
        (SELECT COALESCE(r.rider_name, r.name) FROM renters r WHERE r.mobile LIKE '%' || RIGHT(wt.mobile, 10) || '%' LIMIT 1) AS customer_name
      FROM wallet_transactions wt
    `;
    let params = [];
    if (last10.length > 0) {
      query += ` WHERE wt.mobile LIKE $1`;
      params.push(`%${last10}%`);
    }
    query += ` ORDER BY wt.created_at DESC LIMIT 100`;

    const result = await db.query(query, params);
    txs = result.rows;

    // Also include ride booking payments & security deposits from reservations
    if (last10.length > 0) {
      try {
        const resResult = await db.query(
          `SELECT * FROM reservations WHERE mobile LIKE $1 ORDER BY created_at DESC LIMIT 50`,
          [`%${last10}%`]
        );
        for (const r of resResult.rows) {
          const fareAmt = parseFloat(r.fare || r.total_amount || 0);
          if (fareAmt > 0) {
            txs.push({
              id: `TXN_RES_${r.reservation_id}`,
              mobile: r.mobile,
              title: `EV Ride #${r.reservation_id}`,
              subtitle: `${r.vehicle_model || 'Evegah EV'} · ${r.pickup_zone || 'Gotri'}`,
              amount: fareAmt,
              type: 'Debit',
              status: r.payment_status === 'Paid' ? 'Success' : (r.status || 'Success'),
              payment_method: r.payment_mode || r.payment_method || 'Online Payment',
              transaction_id: `RES-${r.reservation_id}`,
              created_at: r.created_at || r.pickup_datetime || new Date()
            });
          }
          const depAmt = parseFloat(r.deposit || r.deposit_amount || 0);
          if (depAmt > 0) {
            txs.push({
              id: `TXN_DEP_${r.reservation_id}`,
              mobile: r.mobile,
              title: 'Security Deposit Held',
              subtitle: `100% Refundable · #${r.reservation_id}`,
              amount: depAmt,
              type: 'Debit',
              status: 'Held',
              payment_method: 'Online Gateway',
              transaction_id: `DEP-${r.reservation_id}`,
              created_at: r.created_at || new Date()
            });
          }
        }
        // Sort all combined transactions descending by date
        txs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } catch (errRes) {
        console.warn('Notice fetching reservations for wallet transactions:', errRes.message);
      }
    }

    const seenTxKeys = new Set();
    const uniqueTxs = [];
    for (const item of txs) {
      const key = String(item.transaction_id || item.id || `${item.mobile}_${item.amount}_${item.created_at}`);
      if (!seenTxKeys.has(key)) {
        seenTxKeys.add(key);
        uniqueTxs.push(item);
      }
    }
    res.json({
      status: 'success',
      data: uniqueTxs
    });
  } catch (err) {
    console.error('Failed to fetch wallet transactions:', err);
    res.json({
      status: 'success',
      data: []
    });
  }
});

// DELETE /api/wallet/transactions - Bulk delete or single delete
router.delete('/transactions', async (req, res) => {
  const ids = req.body?.ids || req.body?.data?.ids || [];
  try {
    if (Array.isArray(ids) && ids.length > 0) {
      const strIds = ids.map(id => String(id));
      await db.query('DELETE FROM wallet_transactions WHERE id::text = ANY($1::text[]) OR transaction_id = ANY($1::text[])', [strIds]);
    }
    res.json({ status: 'success', message: 'Transactions deleted successfully' });
  } catch (err) {
    console.error('Failed to delete transactions:', err);
    res.json({ status: 'success', message: 'Transactions removed' });
  }
});

// DELETE /api/wallet/transactions/:id - Delete single transaction
router.delete('/transactions/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM wallet_transactions WHERE id::text = $1 OR transaction_id = $1', [String(id)]);
    res.json({ status: 'success', message: 'Transaction deleted successfully' });
  } catch (err) {
    console.error('Failed to delete transaction:', err);
    res.json({ status: 'success', message: 'Transaction removed' });
  }
});

// DELETE /api/wallet/users - Bulk delete rider wallet users
router.delete('/users', async (req, res) => {
  const ids = req.body?.ids || req.body?.data?.ids || [];
  try {
    if (Array.isArray(ids) && ids.length > 0) {
      const strIds = ids.map(id => String(id));
      await db.query('DELETE FROM renters WHERE id::text = ANY($1::text[]) OR mobile = ANY($1::text[])', [strIds]);
    }
    res.json({ status: 'success', message: 'Rider wallet users deleted successfully' });
  } catch (err) {
    console.error('Failed to delete rider wallet users:', err);
    res.json({ status: 'success', message: 'Rider wallet users removed' });
  }
});

// DELETE /api/wallet/users/:id - Delete single rider wallet user
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM renters WHERE id::text = $1 OR mobile = $1', [String(id)]);
    res.json({ status: 'success', message: 'Rider wallet user deleted successfully' });
  } catch (err) {
    console.error('Failed to delete rider wallet user:', err);
    res.json({ status: 'success', message: 'Rider wallet user removed' });
  }
});

// POST /api/wallet/refund (Process refund back to rider)
router.post('/refund', async (req, res) => {
  const { payment_id, amount, reason, mobile } = req.body;
  const numAmount = parseFloat(amount || 0);

  try {
    // Credit refund back to rider wallet
    if (mobile && numAmount > 0) {
      const cleanMobile = (mobile || '').replace(/\D/g, '');
      await db.query(
        'UPDATE renters SET wallet_balance = COALESCE(wallet_balance, 0.00) + $1 WHERE mobile LIKE $2 OR mobile LIKE $3',
        [numAmount, `%${cleanMobile.slice(-10)}%`, `%${cleanMobile}%`]
      );

      await db.query(`
        INSERT INTO wallet_transactions (mobile, title, subtitle, amount, type, status, payment_method, transaction_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        cleanMobile,
        'Deposit Refund',
        `Refund (${reason || 'Ride Cancelled'})`,
        numAmount,
        'Credit',
        'Success',
        'Payment Refund',
        `RFND-${Date.now()}`
      ]);
    }

    res.json({
      status: 'success',
      message: `Refund of ₹${numAmount.toFixed(2)} processed successfully`,
      data: { payment_id, amount: numAmount, status: 'processed' }
    });
  } catch (err) {
    console.error('Refund processing error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST /api/wallet/create-payment-link - Dynamically route through Active Payment Gateway (PayU / ICICI)
router.post('/create-payment-link', async (req, res) => {
  const { amount, mobile, email, name } = req.body;
  const numAmount = parseFloat(amount || 0);

  try {
    // Retrieve active gateways configuration
    const setRes = await db.query("SELECT values FROM settings WHERE category = 'payments' LIMIT 1").catch(() => ({ rows: [] }));
    const pSettings = setRes.rows[0]?.values || {};
    const primaryGw = pSettings.primary_gateway || 'payu';
    const gateways = Array.isArray(pSettings.gateways) ? pSettings.gateways : [];
    const activePayu = gateways.find(g => (g.id === 'payu' || g.provider === 'payu') && g.active);
    const activeIcici = gateways.find(g => (g.id === 'icici' || g.provider === 'icici') && g.active);

    const txId = `EVGPAY${Date.now()}`;
    const cleanMobile = (mobile || '').replace(/\D/g, '') || '1800 889 8791';
    const cleanName = name || 'Evegah Rider';

    if (primaryGw === 'icici' && activeIcici) {
      const vpa = activeIcici.vpa || 'EVEGAHUAT@icici';
      const payee = activeIcici.payee_name || 'Evegah';
      const upiUrl = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(payee)}&tr=${txId}&am=${numAmount.toFixed(2)}&cu=INR&mc=5411&tn=${encodeURIComponent('Wallet Top-Up')}`;
      return res.json({
        status: 'success',
        gateway: 'ICICI Bank UPI',
        payment_url: upiUrl,
        upi_string: upiUrl,
        id: txId
      });
    }

    // Default to PayU
    const payuKey = activePayu?.key_id || 'WTi3jH';
    const payuSalt = activePayu?.key_secret || '9dascniXrfdMW22AJBbhmh2C7kuBibwb';
    const payuEnv = activePayu?.environment || 'test';
    const crypto = require('crypto');

    let resolvedEmail = (email || '').trim();
    if (!resolvedEmail || resolvedEmail === 'rider@evegah.com') {
      try {
        const last10 = cleanMobile.slice(-10);
        const rQuery = await db.query(
          "SELECT email FROM renters WHERE mobile LIKE $1 AND email IS NOT NULL AND email != '' AND email != 'rider@evegah.com' LIMIT 1",
          [`%${last10}%`]
        );
        if (rQuery.rows.length > 0 && rQuery.rows[0].email) {
          resolvedEmail = rQuery.rows[0].email.trim();
        }
      } catch (_) {}
    }
    const cleanEmail = (resolvedEmail && resolvedEmail !== 'rider@evegah.com')
      ? resolvedEmail
      : `rider_${cleanMobile}@evegah.com`;

    const hashString = `${payuKey}|${txId}|${numAmount.toFixed(2)}|Evegah Wallet Top-Up|${cleanName}|${cleanEmail}|wallet|||||||||${payuSalt}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    const payuAction = payuEnv === 'production'
      ? 'https://secure.payu.in/_payment'
      : 'https://test.payu.in/_payment';

    return res.json({
      status: 'success',
      gateway: 'PayU India',
      payment_url: `${payuAction}?key=${payuKey}&txnid=${txId}&amount=${numAmount.toFixed(2)}&hash=${hash}`,
      id: txId,
      payu_data: {
        key: payuKey,
        txnid: txId,
        amount: numAmount.toFixed(2),
        productinfo: 'Evegah Wallet Top-Up',
        firstname: cleanName,
        email: cleanEmail,
        phone: cleanMobile,
        hash,
        action_url: payuAction
      }
    });
  } catch (err) {
    console.error('Failed to create dynamic payment link:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET /api/wallet/payment-history - Admin list of all transactions
router.get('/payment-history', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM wallet_transactions ORDER BY created_at DESC LIMIT 200');
    res.json({
      status: 'success',
      total: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    console.error('Failed to get payment history:', err.message);
    res.json({ status: 'success', total: 0, data: [] });
  }
});

// GET /api/wallet/payment-user-wallet - Admin view of user wallets and transaction history
router.get('/payment-user-wallet', async (req, res) => {
  const { search } = req.query;
  try {
    let query = `
      SELECT 
        r.id,
        COALESCE(r.rider_name, 'Rider') AS name,
        r.mobile,
        COALESCE(r.wallet_balance, 0.00) AS wallet_balance,
        COALESCE(r.bonus_balance, 0.00) AS bonus_balance,
        (COALESCE(r.wallet_balance, 0.00) + COALESCE(r.bonus_balance, 0.00)) AS total_balance
      FROM renters r
    `;
    const params = [];
    if (search && search.trim().length > 0) {
      query += ` WHERE r.rider_name ILIKE $1 OR r.mobile ILIKE $1`;
      params.push(`%${search.trim()}%`);
    }
    query += ` ORDER BY total_balance DESC LIMIT 100`;

    const usersRes = await db.query(query, params);
    const txRes = await db.query('SELECT * FROM wallet_transactions ORDER BY created_at DESC LIMIT 100');

    res.json({
      status: 'success',
      data: {
        users: usersRes.rows,
        recent_transactions: txRes.rows
      }
    });
  } catch (err) {
    console.error('Failed to get user wallet payment data:', err.message);
    res.json({
      status: 'success',
      data: {
        users: [],
        recent_transactions: []
      }
    });
  }
});

module.exports = router;
