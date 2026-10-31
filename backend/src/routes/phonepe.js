const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../db');
const { sendWhatsAppReceipt } = require('../utils/whatsapp');

// PhonePe Sandbox Standard Test Credentials (Default fallback)
const DEFAULT_PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT';
const DEFAULT_PHONEPE_SALT_KEY = process.env.PHONEPE_SALT_KEY || '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
const DEFAULT_PHONEPE_KEY_INDEX = process.env.PHONEPE_KEY_INDEX || '1';
const DEFAULT_PHONEPE_ENV = process.env.PHONEPE_ENV || 'test'; // 'test' or 'production'

// Ensure phonepe_payments table exists in PostgreSQL
(async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS phonepe_payments (
        id SERIAL PRIMARY KEY,
        tx_id VARCHAR(100) UNIQUE NOT NULL,
        phonepe_tx_id VARCHAR(100),
        merchant_id VARCHAR(100),
        amount NUMERIC(10, 2) NOT NULL,
        rider_name VARCHAR(100),
        mobile VARCHAR(50),
        email VARCHAR(100),
        status VARCHAR(50) DEFAULT 'Pending',
        purpose VARCHAR(50) DEFAULT 'wallet',
        reservation_id VARCHAR(100),
        upi_ref_no VARCHAR(100),
        checkout_url TEXT,
        qr_string TEXT,
        error_message TEXT,
        raw_response JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await db.query(`ALTER TABLE phonepe_payments ADD COLUMN IF NOT EXISTS upi_ref_no VARCHAR(100)`);
    await db.query(`ALTER TABLE phonepe_payments ADD COLUMN IF NOT EXISTS checkout_url TEXT`);
    await db.query(`ALTER TABLE phonepe_payments ADD COLUMN IF NOT EXISTS qr_string TEXT`);
    await db.query(`ALTER TABLE phonepe_payments ADD COLUMN IF NOT EXISTS error_message TEXT`);
    await db.query(`ALTER TABLE phonepe_payments ADD COLUMN IF NOT EXISTS raw_response JSONB`);
    await db.query(`ALTER TABLE phonepe_payments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()`);
  } catch (e) {
    console.warn('PhonePe DB init warning:', e.message);
  }
})();

// Helper to fetch live PhonePe credentials dynamically from settings table or environment
async function getPhonePeCredentials() {
  try {
    const res = await db.query("SELECT values FROM settings WHERE category = 'payments' LIMIT 1");
    if (res.rows.length > 0 && res.rows[0].values) {
      const p = res.rows[0].values;
      if (Array.isArray(p.gateways)) {
        const phonepeGw = p.gateways.find(g => g.id === 'phonepe' || g.provider === 'phonepe');
        if (phonepeGw) {
          const env = (phonepeGw.environment || DEFAULT_PHONEPE_ENV).toLowerCase();
          return {
            merchantId: phonepeGw.key_id || DEFAULT_PHONEPE_MERCHANT_ID,
            saltKey: phonepeGw.key_secret || DEFAULT_PHONEPE_SALT_KEY,
            keyIndex: phonepeGw.key_index || DEFAULT_PHONEPE_KEY_INDEX,
            env,
            active: phonepeGw.active !== false,
            vpa: phonepeGw.vpa || 'evegah@ybl',
            payeeName: phonepeGw.payee_name || 'Evegah'
          };
        }
      }
      if (p.phonepe_merchant_id) {
        return {
          merchantId: p.phonepe_merchant_id || DEFAULT_PHONEPE_MERCHANT_ID,
          saltKey: p.phonepe_salt_key || DEFAULT_PHONEPE_SALT_KEY,
          keyIndex: p.phonepe_key_index || DEFAULT_PHONEPE_KEY_INDEX,
          env: (p.phonepe_env || DEFAULT_PHONEPE_ENV).toLowerCase(),
          active: p.phonepe_active !== false,
          vpa: p.phonepe_vpa || 'evegah@ybl',
          payeeName: p.phonepe_payee_name || 'Evegah'
        };
      }
    }
  } catch (err) {
    console.warn('Could not read PhonePe settings from DB, using defaults:', err.message);
  }

  return {
    merchantId: DEFAULT_PHONEPE_MERCHANT_ID,
    saltKey: DEFAULT_PHONEPE_SALT_KEY,
    keyIndex: DEFAULT_PHONEPE_KEY_INDEX,
    env: DEFAULT_PHONEPE_ENV.toLowerCase(),
    active: true,
    vpa: 'evegah@ybl',
    payeeName: 'Evegah'
  };
}

// PhonePe Base URL Helper
function getPhonePeBaseUrl(env) {
  return env === 'production'
    ? 'https://api.phonepe.com/apis/hermes'
    : 'https://api-preprod.phonepe.com/apis/pg-sandbox';
}

// Generate PhonePe X-VERIFY Checksum for /pg/v1/pay
function generatePhonePePayChecksum(base64Payload, saltKey, keyIndex) {
  const hash = crypto.createHash('sha256').update(base64Payload + '/pg/v1/pay' + saltKey).digest('hex');
  return `${hash}###${keyIndex}`;
}

// Generate PhonePe X-VERIFY Checksum for /pg/v1/status/{merchantId}/{txId}
function generatePhonePeStatusChecksum(merchantId, txId, saltKey, keyIndex) {
  const hash = crypto.createHash('sha256').update(`/pg/v1/status/${merchantId}/${txId}` + saltKey).digest('hex');
  return `${hash}###${keyIndex}`;
}

// Helper to credit wallet or update reservation upon successful payment
async function processSuccessfulPayment({ txId, amount, mobile, riderName, purpose, reservationId, phonepeTxId, utr, rawResponse }) {
  const numAmount = parseFloat(amount || 0);
  const cleanMobile = (mobile || '').replace(/\D/g, '');

  // 1. Update phonepe_payments table status to Success
  try {
    await db.query(`
      UPDATE phonepe_payments
      SET status = 'Success',
          phonepe_tx_id = COALESCE($1, phonepe_tx_id),
          upi_ref_no = COALESCE($2, upi_ref_no),
          raw_response = COALESCE($3, raw_response),
          updated_at = NOW()
      WHERE tx_id = $4
    `, [phonepeTxId || null, utr || null, rawResponse ? JSON.stringify(rawResponse) : null, txId]);
  } catch (err) {
    console.warn('Failed to update phonepe_payments status:', err.message);
  }

  // 2. Handle Wallet Top-Up
  if (purpose === 'wallet' && cleanMobile && numAmount > 0) {
    try {
      await db.query(
        'UPDATE renters SET wallet_balance = COALESCE(wallet_balance, 0.00) + $1 WHERE mobile LIKE $2 OR mobile LIKE $3',
        [numAmount, `%${cleanMobile.slice(-10)}%`, `%${cleanMobile}%`]
      );

      await db.query(`
        INSERT INTO wallet_transactions (mobile, title, subtitle, amount, type, status, payment_method, transaction_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        cleanMobile,
        'Wallet Top-Up (PhonePe)',
        `PhonePe Ref: ${phonepeTxId || txId}`,
        numAmount,
        'Credit',
        'Success',
        'PhonePe',
        txId
      ]);
    } catch (walletErr) {
      console.error('Failed to credit wallet on PhonePe success:', walletErr.message);
    }
  }

  // 3. Handle Ride / Registration / Reservation confirmation
  if (reservationId) {
    try {
      await db.query(
        `UPDATE reservations 
         SET payment_status = 'Paid', payment_mode = 'PhonePe', status = 'Confirmed', transaction_id = $1 
         WHERE id::text = $2 OR reservation_id = $2`,
        [txId, reservationId]
      );
    } catch (resErr) {
      console.warn('Failed to update reservation on PhonePe success:', resErr.message);
    }
  }

  // 4. Record in general payment transactions log if present
  try {
    await db.query(`
      INSERT INTO payment_transactions (
        transaction_id, reference_id, amount, payment_method, status, mobile, customer_name, purpose
      )
      VALUES ($1, $2, $3, 'PhonePe', 'SUCCESS', $4, $5, $6)
      ON CONFLICT (transaction_id) DO UPDATE SET status = 'SUCCESS', updated_at = NOW()
    `, [txId, phonepeTxId || txId, numAmount, cleanMobile, riderName || 'Rider', purpose || 'ride']);
  } catch (_) {}

  // 5. Send automated WhatsApp payment confirmation receipt
  try {
    if (cleanMobile && numAmount > 0) {
      await sendWhatsAppReceipt({
        mobile: cleanMobile,
        name: riderName || 'Valued Rider',
        invoice_no: `INV-${txId.slice(-8)}`,
        invoice_date: new Date().toLocaleDateString('en-IN'),
        plan: purpose === 'wallet' ? 'Wallet Recharge' : 'EV Scooter Rental',
        amount: String(numAmount)
      });
    }
  } catch (waErr) {
    console.warn('WhatsApp receipt send error (PhonePe):', waErr.message);
  }
}

// GET /api/payments/phonepe/config - Public Configuration
router.get('/config', async (req, res) => {
  try {
    const creds = await getPhonePeCredentials();
    res.json({
      status: 'success',
      data: {
        active: creds.active,
        merchant_id: creds.merchantId,
        environment: creds.env,
        vpa: creds.vpa,
        payee_name: creds.payeeName
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST /api/payments/phonepe/initiate - Standard PhonePe Hosted Checkout Initiation
router.post('/initiate', async (req, res) => {
  try {
    const { amount, rider_name, mobile, email, purpose = 'wallet', reservation_id, return_url } = req.body;
    const numAmount = parseFloat(amount || 0);

    if (numAmount <= 0) {
      return res.status(400).json({ status: 'error', message: 'Valid payment amount is required' });
    }

    const creds = await getPhonePeCredentials();
    if (!creds.active) {
      return res.status(403).json({ status: 'error', message: 'PhonePe Payment Gateway is currently disabled by Admin' });
    }

    const cleanMobile = (mobile || '').replace(/\D/g, '') || '1800 889 8791';
    const cleanName = (rider_name || 'Evegah Rider').trim();
    const cleanEmail = (email || `rider_${cleanMobile}@evegah.com`).trim();
    const txnid = `EVGPH${Date.now()}${Math.floor(100 + Math.random() * 900)}`;

    const host = req.get('host') || 'evegah.cloud';
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const backendBase = `${protocol}://${host}/api/payments/phonepe`;

    const redirectUrl = `${backendBase}/callback?client_redirect=${encodeURIComponent(return_url || '')}&txnid=${txnid}`;
    const callbackUrl = `${backendBase}/webhook`;

    // PhonePe payload (amount is in PAISA: ₹1 = 100 paise)
    const amountInPaise = Math.round(numAmount * 100);
    const merchantUserId = `MUID_${cleanMobile.slice(-10) || Date.now()}`;

    const normalPayload = {
      merchantId: creds.merchantId,
      merchantTransactionId: txnid,
      merchantUserId,
      amount: amountInPaise,
      redirectUrl,
      redirectMode: 'POST',
      callbackUrl,
      mobileNumber: cleanMobile.slice(-10),
      paymentInstrument: {
        type: 'PAY_PAGE'
      }
    };

    const base64Payload = Buffer.from(JSON.stringify(normalPayload)).toString('base64');
    const xVerifyHeader = generatePhonePePayChecksum(base64Payload, creds.saltKey, creds.keyIndex);
    const baseUrl = getPhonePeBaseUrl(creds.env);

    // Record initial transaction in phonepe_payments
    try {
      await db.query(`
        INSERT INTO phonepe_payments (tx_id, merchant_id, amount, rider_name, mobile, email, status, purpose, reservation_id)
        VALUES ($1, $2, $3, $4, $5, $6, 'Pending', $7, $8)
      `, [txnid, creds.merchantId, numAmount, cleanName, cleanMobile, cleanEmail, purpose, reservation_id || null]);
    } catch (dbErr) {
      console.warn('DB insert notice for phonepe_payments:', dbErr.message);
    }

    let checkoutUrl = `${backendBase}/checkout/${txnid}`;
    let upstreamData = null;

    try {
      const response = await fetch(`${baseUrl}/pg/v1/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-VERIFY': xVerifyHeader
        },
        body: JSON.stringify({ request: base64Payload })
      });

      const responseBody = await response.json();
      upstreamData = responseBody;

      if (responseBody?.success && responseBody?.data?.instrumentResponse?.redirectInfo?.url) {
        checkoutUrl = responseBody.data.instrumentResponse.redirectInfo.url;
      }
    } catch (apiErr) {
      console.warn('PhonePe upstream API call warning (using hosted checkout fallback):', apiErr.message);
    }

    // Save generated checkout_url & upstream response
    try {
      await db.query(`
        UPDATE phonepe_payments 
        SET checkout_url = $1, raw_response = $2, updated_at = NOW() 
        WHERE tx_id = $3
      `, [checkoutUrl, upstreamData ? JSON.stringify(upstreamData) : null, txnid]);
    } catch (_) {}

    res.json({
      status: 'success',
      data: {
        tx_id: txnid,
        amount: numAmount,
        checkout_url: checkoutUrl,
        environment: creds.env,
        upstream: upstreamData
      }
    });
  } catch (err) {
    console.error('PhonePe initiate error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET /api/payments/phonepe/checkout/:txnid - Hosted Auto-Redirect / Pay-Page fallback
router.get('/checkout/:txnid', async (req, res) => {
  try {
    const { txnid } = req.params;
    const result = await db.query('SELECT * FROM phonepe_payments WHERE tx_id = $1 LIMIT 1', [txnid]);
    if (result.rows.length === 0) {
      return res.status(404).send('PhonePe Transaction not found or expired');
    }

    const payment = result.rows[0];
    const creds = await getPhonePeCredentials();
    const formattedAmount = parseFloat(payment.amount).toFixed(2);
    const amountInPaise = Math.round(parseFloat(payment.amount) * 100);
    const cleanMobile = (payment.mobile || '').replace(/\D/g, '') || '1800 889 8791';
    const baseUrl = getPhonePeBaseUrl(creds.env);

    const host = req.get('host') || 'evegah.cloud';
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const backendBase = `${protocol}://${host}/api/payments/phonepe`;
    const redirectUrl = `${backendBase}/callback?txnid=${txnid}`;
    const callbackUrl = `${backendBase}/webhook`;

    const normalPayload = {
      merchantId: creds.merchantId,
      merchantTransactionId: txnid,
      merchantUserId: `MUID_${cleanMobile.slice(-10)}`,
      amount: amountInPaise,
      redirectUrl,
      redirectMode: 'POST',
      callbackUrl,
      mobileNumber: cleanMobile.slice(-10),
      paymentInstrument: {
        type: 'PAY_PAGE'
      }
    };

    const base64Payload = Buffer.from(JSON.stringify(normalPayload)).toString('base64');
    const xVerifyHeader = generatePhonePePayChecksum(base64Payload, creds.saltKey, creds.keyIndex);

    // Check if we already have direct redirectInfo URL
    if (payment.checkout_url && payment.checkout_url.startsWith('http') && !payment.checkout_url.includes('/checkout/')) {
      return res.redirect(payment.checkout_url);
    }

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Redirecting to PhonePe Secure Gateway...</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #FAF8FF; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .loader-box { text-align: center; background: #fff; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(95,37,159,0.08); border: 1px solid #EDE9FE; max-width: 380px; }
          .phonepe-logo { width: 56px; height: 56px; background: #5F259F; border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; color: #fff; font-size: 26px; font-weight: 800; margin-bottom: 16px; }
          .spinner { width: 40px; height: 40px; border: 4px solid #F3E8FF; border-top-color: #5F259F; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
          @keyframes spin { to { transform: rotate(360deg); } }
          h3 { margin: 0 0 6px; color: #1E1B4B; font-size: 19px; font-weight: 800; }
          p { margin: 0 0 20px; color: #6B7280; font-size: 13.5px; }
          .amount-tag { font-size: 22px; font-weight: 800; color: #5F259F; margin-bottom: 16px; }
          .pay-btn { background: #5F259F; color: #fff; border: none; padding: 12px 24px; border-radius: 10px; font-weight: 700; font-size: 14px; cursor: pointer; width: 100%; transition: background .15s; }
          .pay-btn:hover { background: #4C1D95; }
        </style>
      </head>
      <body>
        <div class="loader-box">
          <div class="phonepe-logo">पे</div>
          <div class="spinner"></div>
          <h3>PhonePe Secure Payment</h3>
          <div class="amount-tag">₹${formattedAmount}</div>
          <p>Connecting securely to PhonePe Payment Gateway...</p>
          <form id="phonepeForm" method="POST" action="${baseUrl}/pg/v1/pay">
            <input type="hidden" name="request" value="${base64Payload}" />
            <button type="submit" class="pay-btn">Proceed to PhonePe</button>
          </form>
        </div>
        <script>
          setTimeout(() => {
            document.getElementById("phonepeForm").submit();
          }, 600);
        </script>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send('Error loading PhonePe checkout: ' + err.message);
  }
});

// POST /api/payments/phonepe/qr - Generate Dynamic QR for Desk Registration & Riders
router.post('/qr', async (req, res) => {
  try {
    const { amount, rider_name, mobile, notes, purpose = 'ride', reservation_id } = req.body;
    const numAmount = parseFloat(amount || 0);

    if (numAmount <= 0) {
      return res.status(400).json({ status: 'error', message: 'Valid payment amount is required' });
    }

    const creds = await getPhonePeCredentials();
    const cleanMobile = (mobile || '').replace(/\D/g, '') || '1800 889 8791';
    const cleanName = (rider_name || 'Rider').trim();
    const txnid = `EVGPHQR${Date.now()}${Math.floor(100 + Math.random() * 900)}`;

    const vpa = (creds.vpa || 'evegah@ybl').trim();
    const payee = (creds.payeeName || 'Evegah').trim();
    const noteText = encodeURIComponent(notes || 'Evegah EV Rental');

    // Standard NPCI dynamic UPI string
    const dynamicUpiString = `upi://pay?pa=${vpa}&pn=${encodeURIComponent(payee)}&tr=${txnid}&am=${numAmount.toFixed(2)}&cu=INR&tn=${noteText}&mc=5411`;

    // Save pending QR transaction in DB
    try {
      await db.query(`
        INSERT INTO phonepe_payments (tx_id, merchant_id, amount, rider_name, mobile, status, purpose, reservation_id, qr_string)
        VALUES ($1, $2, $3, $4, $5, 'Pending', $6, $7, $8)
      `, [txnid, creds.merchantId, numAmount, cleanName, cleanMobile, purpose, reservation_id || null, dynamicUpiString]);
    } catch (e) {
      console.warn('PhonePe QR insert notice:', e.message);
    }

    res.json({
      status: 'success',
      data: {
        tx_id: txnid,
        merchantTranId: txnid,
        qrString: dynamicUpiString,
        upi_string: dynamicUpiString,
        amount: numAmount,
        vpa,
        payee_name: payee,
        status: 'Pending'
      }
    });
  } catch (err) {
    console.error('PhonePe QR error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET /api/payments/phonepe/status/:txId - Check Payment Status via PhonePe Hermes/Sandbox API
router.get('/status/:txId', async (req, res) => {
  try {
    const { txId } = req.params;
    if (!txId) {
      return res.status(400).json({ status: 'error', message: 'Transaction ID is required' });
    }

    // 1. Fetch transaction from database
    const pRes = await db.query('SELECT * FROM phonepe_payments WHERE tx_id = $1 LIMIT 1', [txId]);
    const payment = pRes.rows.length > 0 ? pRes.rows[0] : null;

    if (payment && payment.status === 'Success') {
      return res.json({
        status: 'success',
        data: {
          tx_id: txId,
          payment_status: 'SUCCESS',
          amount: parseFloat(payment.amount),
          status: 'SUCCESS',
          message: 'Payment verified and completed',
          upi_ref_no: payment.upi_ref_no || payment.phonepe_tx_id
        }
      });
    }

    const creds = await getPhonePeCredentials();
    const baseUrl = getPhonePeBaseUrl(creds.env);
    const xVerifyHeader = generatePhonePeStatusChecksum(creds.merchantId, txId, creds.saltKey, creds.keyIndex);

    let phonePeData = null;
    let isSuccess = false;
    let phonepeTxId = '';
    let utr = '';

    try {
      const response = await fetch(`${baseUrl}/pg/v1/status/${creds.merchantId}/${txId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-VERIFY': xVerifyHeader,
          'X-MERCHANT-ID': creds.merchantId
        }
      });

      phonePeData = await response.json();

      if (phonePeData?.success && (phonePeData?.code === 'PAYMENT_SUCCESS' || phonePeData?.data?.state === 'COMPLETED')) {
        isSuccess = true;
        phonepeTxId = phonePeData.data?.transactionId || '';
        utr = phonePeData.data?.paymentInstrument?.utr || phonePeData.data?.paymentInstrument?.bankTransactionId || '';
      }
    } catch (apiErr) {
      console.warn('PhonePe status check API warning:', apiErr.message);
    }

    if (isSuccess && payment) {
      await processSuccessfulPayment({
        txId,
        amount: payment.amount,
        mobile: payment.mobile,
        riderName: payment.rider_name,
        purpose: payment.purpose,
        reservationId: payment.reservation_id,
        phonepeTxId,
        utr,
        rawResponse: phonePeData
      });

      return res.json({
        status: 'success',
        data: {
          tx_id: txId,
          payment_status: 'SUCCESS',
          amount: parseFloat(payment.amount),
          status: 'SUCCESS',
          upi_ref_no: utr || phonepeTxId,
          upstream: phonePeData
        }
      });
    }

    res.json({
      status: 'success',
      data: {
        tx_id: txId,
        payment_status: payment?.status?.toUpperCase() || 'PENDING',
        status: payment?.status?.toUpperCase() || 'PENDING',
        amount: payment ? parseFloat(payment.amount) : 0,
        upstream: phonePeData
      }
    });
  } catch (err) {
    console.error('PhonePe status check error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST /api/payments/phonepe/callback - Customer Browser Redirect Handler
router.all('/callback', async (req, res) => {
  try {
    const rawPayload = req.body || req.query || {};
    const txnid = rawPayload.txnid || req.query.txnid || '';
    const clientRedirect = req.query.client_redirect || '';

    let decoded = null;
    if (rawPayload.response) {
      try {
        const decodedStr = Buffer.from(rawPayload.response, 'base64').toString('utf8');
        decoded = JSON.parse(decodedStr);
      } catch (_) {}
    }

    const txId = txnid || decoded?.data?.merchantTransactionId || '';
    const isSuccess = decoded?.success && (decoded?.code === 'PAYMENT_SUCCESS' || decoded?.data?.state === 'COMPLETED');

    if (txId && isSuccess) {
      const pRes = await db.query('SELECT * FROM phonepe_payments WHERE tx_id = $1 LIMIT 1', [txId]);
      if (pRes.rows.length > 0) {
        const payment = pRes.rows[0];
        await processSuccessfulPayment({
          txId,
          amount: payment.amount,
          mobile: payment.mobile,
          riderName: payment.rider_name,
          purpose: payment.purpose,
          reservationId: payment.reservation_id,
          phonepeTxId: decoded?.data?.transactionId || '',
          utr: decoded?.data?.paymentInstrument?.utr || '',
          rawResponse: decoded
        });
      }
    }

    if (clientRedirect) {
      const sep = clientRedirect.includes('?') ? '&' : '?';
      return res.redirect(`${clientRedirect}${sep}status=${isSuccess ? 'success' : 'failed'}&tx_id=${txId}`);
    }

    // Default friendly HTML receipt page
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Payment ${isSuccess ? 'Successful' : 'Status'} - Evegah</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #FAF8FF; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: #fff; padding: 36px 32px; border-radius: 20px; text-align: center; max-width: 400px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); }
          .icon { width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 32px; background: ${isSuccess ? '#DCFCE7' : '#FEE2E2'}; color: ${isSuccess ? '#16A34A' : '#DC2626'}; }
          h2 { margin: 0 0 8px; color: #111827; }
          p { color: #6B7280; font-size: 14px; margin: 0 0 24px; }
          .btn { display: inline-block; background: #5F259F; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 700; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="icon">${isSuccess ? '✓' : '✕'}</div>
          <h2>Payment ${isSuccess ? 'Successful!' : 'Pending or Cancelled'}</h2>
          <p>Transaction ID: ${txId || 'N/A'}</p>
          <a href="/new-rider/review" class="btn">Return to Evegah</a>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error('PhonePe callback error:', err);
    res.status(500).send('Callback processing error');
  }
});

// POST /api/payments/phonepe/webhook - Server-to-Server Webhook / IPN
router.post('/webhook', async (req, res) => {
  try {
    const rawResponse = req.body?.response;
    if (!rawResponse) {
      return res.status(400).json({ status: 'error', message: 'Invalid webhook payload' });
    }

    const decodedStr = Buffer.from(rawResponse, 'base64').toString('utf8');
    const decoded = JSON.parse(decodedStr);
    const txId = decoded?.data?.merchantTransactionId;

    if (!txId) {
      return res.status(400).json({ status: 'error', message: 'No merchantTransactionId in payload' });
    }

    const isSuccess = decoded?.success && (decoded?.code === 'PAYMENT_SUCCESS' || decoded?.data?.state === 'COMPLETED');

    if (isSuccess) {
      const pRes = await db.query('SELECT * FROM phonepe_payments WHERE tx_id = $1 LIMIT 1', [txId]);
      if (pRes.rows.length > 0) {
        const payment = pRes.rows[0];
        await processSuccessfulPayment({
          txId,
          amount: payment.amount,
          mobile: payment.mobile,
          riderName: payment.rider_name,
          purpose: payment.purpose,
          reservationId: payment.reservation_id,
          phonepeTxId: decoded?.data?.transactionId || '',
          utr: decoded?.data?.paymentInstrument?.utr || '',
          rawResponse: decoded
        });
      }
    }

    res.json({ success: true, message: 'Webhook processed' });
  } catch (err) {
    console.error('PhonePe webhook error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST /api/payments/phonepe/verify - Manual / Instant Operator Verification
router.post('/verify', async (req, res) => {
  try {
    const { tx_id, amount, mobile, rider_name, purpose = 'ride', status = 'SUCCESS' } = req.body;
    if (!tx_id) {
      return res.status(400).json({ status: 'error', message: 'Transaction ID is required' });
    }

    const pRes = await db.query('SELECT * FROM phonepe_payments WHERE tx_id = $1 LIMIT 1', [tx_id]);
    const payment = pRes.rows.length > 0 ? pRes.rows[0] : null;

    const numAmount = parseFloat(amount || payment?.amount || 0);
    const resolvedMobile = mobile || payment?.mobile || '';
    const resolvedName = rider_name || payment?.rider_name || 'Rider';

    await processSuccessfulPayment({
      txId: tx_id,
      amount: numAmount,
      mobile: resolvedMobile,
      riderName: resolvedName,
      purpose,
      reservationId: payment?.reservation_id || null,
      phonepeTxId: `PH_MANUAL_${Date.now()}`,
      utr: `UTR_${Date.now()}`,
      rawResponse: { manual: true, verifiedBy: 'operator' }
    });

    res.json({
      status: 'success',
      payment_status: 'SUCCESS',
      data: {
        tx_id,
        amount: numAmount,
        verified: true,
        message: 'PhonePe transaction confirmed successfully'
      }
    });
  } catch (err) {
    console.error('PhonePe verify error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
