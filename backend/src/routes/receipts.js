const express = require('express');
const router = express.Router();
const db = require('../db');

// Helper to fetch receipt data for any booking, transaction, or payment ID
async function findReceiptData(identifier) {
  if (!identifier) return null;
  const cleanId = String(identifier).trim();

  // 1. Try finding in reservations table
  try {
    const resResult = await db.query(
      `SELECT * FROM reservations 
       WHERE reservation_id = $1 
          OR id::text = $1 
          OR transaction_id = $1 
          OR cash_voucher_number = $1 
       LIMIT 1`,
      [cleanId]
    );
    if (resResult.rows.length > 0) {
      const r = resResult.rows[0];
      const fare = parseFloat(r.fare || r.total_amount || 0);
      const deposit = parseFloat(r.deposit || r.deposit_amount || 0);
      const total = parseFloat(r.total_payable || (fare + deposit) || 0);

      return {
        type: 'reservation',
        invoice_no: r.cash_voucher_number || r.transaction_id || r.reservation_id,
        booking_id: r.reservation_id,
        date: r.created_at || r.pickup_datetime || new Date(),
        customer_name: r.customer_name || 'Evegah Rider',
        mobile: r.mobile || '',
        email: r.email || '',
        vehicle_model: r.vehicle_model || 'Evegah Smart EV',
        vehicle_number: r.vehicle_number || 'EV-DEFAULT',
        plan: `${r.package_type || 'Daily'} Plan`,
        pickup_zone: r.pickup_zone || 'Gotri Zone',
        drop_zone: r.drop_zone || r.pickup_zone || 'Gotri Zone',
        pickup_time: r.pickup_datetime,
        drop_time: r.drop_datetime,
        fare,
        deposit,
        total,
        payment_mode: r.payment_mode || r.payment_method || 'PayU India',
        payment_status: r.payment_status || 'Paid',
        status: r.status || 'Confirmed'
      };
    }
  } catch (err) {
    console.warn('Receipt lookup reservations error:', err.message);
  }

  // 2. Try finding in payu_payments table
  try {
    const payuResult = await db.query(
      `SELECT * FROM payu_payments WHERE tx_id = $1 OR payu_id = $1 LIMIT 1`,
      [cleanId]
    );
    if (payuResult.rows.length > 0) {
      const p = payuResult.rows[0];
      const amount = parseFloat(p.amount || 0);
      let planTitle = 'Evegah Rental Top-Up';
      if (p.purpose === 'wallet' || p.purpose === 'wallet_topup') planTitle = 'Wallet Top-Up Credit';
      else if (p.purpose === 'extend_ride' || p.purpose === 'extend') planTitle = 'Ride Extension Top-Up';
      else if (p.purpose === 'ride') planTitle = 'EV Ride Booking Payment';

      return {
        type: 'payu',
        invoice_no: p.tx_id,
        booking_id: p.reservation_id || p.tx_id,
        date: p.created_at || new Date(),
        customer_name: p.rider_name || 'Evegah Rider',
        mobile: p.mobile || '',
        email: p.email || '',
        vehicle_model: 'Evegah Fleet Scooter',
        vehicle_number: 'N/A',
        plan: planTitle,
        pickup_zone: 'Vadodara Hub',
        drop_zone: 'Vadodara Hub',
        fare: amount,
        deposit: 0,
        total: amount,
        payment_mode: 'PayU India Secure Checkout',
        payment_status: p.status === 'Success' ? 'Paid' : p.status,
        status: p.status === 'Success' ? 'Completed' : p.status
      };
    }
  } catch (err) {
    console.warn('Receipt lookup payu error:', err.message);
  }

  // 3. Try finding in wallet_transactions table
  try {
    const wallResult = await db.query(
      `SELECT * FROM wallet_transactions WHERE transaction_id = $1 OR id::text = $1 LIMIT 1`,
      [cleanId]
    );
    if (wallResult.rows.length > 0) {
      const w = wallResult.rows[0];
      const amt = parseFloat(w.amount || 0);
      return {
        type: 'wallet',
        invoice_no: w.transaction_id || `TXN_${w.id}`,
        booking_id: w.transaction_id || `WTH_${w.id}`,
        date: w.created_at || new Date(),
        customer_name: 'Evegah Rider',
        mobile: w.mobile || '',
        email: '',
        vehicle_model: 'Evegah Wallet',
        vehicle_number: 'N/A',
        plan: w.title || 'Wallet Transaction',
        pickup_zone: 'Digital Wallet',
        drop_zone: 'Digital Wallet',
        fare: amt,
        deposit: 0,
        total: amt,
        payment_mode: w.payment_method || 'PayU India',
        payment_status: w.status === 'Success' ? 'Paid' : (w.status || 'Success'),
        status: 'Completed'
      };
    }
  } catch (err) {
    console.warn('Receipt lookup wallet error:', err.message);
  }

  return null;
}

// GET /api/receipts/:id (or /receipt/:id) - Returns HTML Tax Invoice or JSON
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const isJson = req.query.format === 'json' || req.headers.accept?.includes('application/json');

  const data = await findReceiptData(id);

  if (!data) {
    if (isJson) {
      return res.status(404).json({ status: 'error', message: 'Invoice or Receipt not found' });
    }
    return res.status(404).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Receipt Not Found - Evegah</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; background: #0F172A; color: #F8FAFC; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
          .card { background: #1E293B; max-width: 440px; width: 100%; border-radius: 20px; padding: 36px 30px; text-align: center; border: 1px solid rgba(255,255,255,0.08); }
          h2 { margin: 12px 0 8px; color: #F8FAFC; font-size: 20px; }
          p { color: #94A3B8; font-size: 14px; margin-bottom: 24px; }
          a { display: inline-block; background: #7C3AED; color: #fff; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div style="font-size: 42px;">🔍</div>
          <h2>Receipt Record Not Found</h2>
          <p>We could not find a confirmed payment record for Reference ID: <b>${id}</b>.</p>
          <a href="javascript:window.history.back()">Go Back</a>
        </div>
      </body>
      </html>
    `);
  }

  if (isJson) {
    return res.json({ status: 'success', data });
  }

  const d = new Date(data.date);
  const formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;

  // Render downloadable, printable, pixel-perfect official tax invoice HTML
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tax Invoice - ${data.invoice_no} | Evegah Mobility</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #F1F5F9;
      color: #0F172A;
      display: flex;
      justify-content: center;
      padding: 30px 16px;
      -webkit-font-smoothing: antialiased;
    }
    .invoice-container {
      background: #FFFFFF;
      max-width: 600px;
      width: 100%;
      border-radius: 20px;
      padding: 32px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.06);
      position: relative;
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px dashed #E2E8F0;
      padding-bottom: 22px;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 900;
      color: #4A168C;
      letter-spacing: -0.5px;
    }
    .brand-sub {
      font-size: 11px;
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-top: 3px;
    }
    .invoice-tag {
      background: #ECFDF5;
      color: #059669;
      font-size: 12px;
      font-weight: 800;
      padding: 6px 14px;
      border-radius: 999px;
      border: 1px solid #A7F3D0;
      display: inline-block;
    }
    .company-details {
      margin-top: 10px;
      font-size: 12px;
      color: #64748B;
      line-height: 1.5;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 22px;
      padding-bottom: 20px;
      border-bottom: 1px solid #F1F5F9;
    }
    .meta-box h4 {
      font-size: 11px;
      font-weight: 800;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .meta-box p {
      font-size: 13.5px;
      font-weight: 700;
      color: #0F172A;
      word-break: break-all;
    }
    .section-title {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      color: #7C3AED;
      letter-spacing: 0.6px;
      margin: 22px 0 12px;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .items-table th {
      text-align: left;
      font-size: 11px;
      font-weight: 800;
      color: #94A3B8;
      text-transform: uppercase;
      padding: 8px 0;
      border-bottom: 1px solid #E2E8F0;
    }
    .items-table td {
      padding: 12px 0;
      border-bottom: 1px solid #F8FAFC;
      color: #1E293B;
      font-weight: 600;
    }
    .items-table td.amount {
      text-align: right;
      font-weight: 800;
    }
    .items-table th.amount {
      text-align: right;
    }
    .total-box {
      margin-top: 16px;
      padding: 16px;
      background: #F8FAFC;
      border-radius: 14px;
      border: 1px solid #E2E8F0;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 13px;
      color: #64748B;
      font-weight: 600;
    }
    .total-row.grand {
      margin-bottom: 0;
      padding-top: 10px;
      border-top: 1px solid #E2E8F0;
      font-size: 17px;
      font-weight: 900;
      color: #4A168C;
    }
    .status-stamp {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #F0FDF4;
      color: #16A34A;
      font-weight: 800;
      font-size: 12px;
      padding: 4px 10px;
      border-radius: 6px;
    }
    .barcode-section {
      text-align: center;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px dashed #E2E8F0;
    }
    .barcode-sim {
      font-family: 'Courier New', Courier, monospace;
      font-weight: 900;
      font-size: 20px;
      letter-spacing: 5px;
      color: #1E293B;
      user-select: none;
    }
    .barcode-caption {
      font-size: 10px;
      color: #94A3B8;
      margin-top: 4px;
      text-transform: uppercase;
      font-weight: 700;
    }
    .actions-row {
      display: flex;
      gap: 12px;
      margin-top: 26px;
    }
    .btn {
      flex: 1;
      padding: 14px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 800;
      text-align: center;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      border: none;
    }
    .btn-primary {
      background: #4A168C;
      color: #FFFFFF;
    }
    .btn-secondary {
      background: #F1F5F9;
      color: #334155;
    }
    @media print {
      body { background: #FFFFFF; padding: 0; }
      .invoice-container { box-shadow: none; max-width: 100%; border-radius: 0; padding: 20px; }
      .actions-row { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="header-row">
      <div>
        <div class="brand-title">EVEGAH</div>
        <div class="brand-sub">Mobility Private Limited</div>
        <div class="company-details">
          Vadodara, Gujarat 390022<br />
          Toll-Free: 1800 889 8791 | GSTIN: 24AAACE1234F1Z5
        </div>
      </div>
      <div style="text-align: right;">
        <span class="invoice-tag">✓ TAX INVOICE PAID</span>
        <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: #64748B;">
          ORIGINAL FOR RECIPIENT
        </div>
      </div>
    </div>

    <div class="meta-grid">
      <div class="meta-box">
        <h4>Invoice Number</h4>
        <p>${data.invoice_no}</p>
      </div>
      <div class="meta-box">
        <h4>Date & Time</h4>
        <p>${formattedDate}</p>
      </div>
      <div class="meta-box">
        <h4>Billed To (Rider)</h4>
        <p>${data.customer_name}<br /><span style="color: #64748B; font-size: 12px;">+91 ${data.mobile || '—'}</span></p>
      </div>
      <div class="meta-box">
        <h4>Payment Method</h4>
        <p>${data.payment_mode}<br /><span class="status-stamp">✓ ${data.payment_status}</span></p>
      </div>
    </div>

    <div class="section-title">Rental Trip Particulars</div>
    <table class="items-table">
      <thead>
        <tr>
          <th>Description</th>
          <th>Location / Plan</th>
          <th class="amount">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <b>${data.vehicle_model}</b><br />
            <span style="font-size: 11px; color: #64748B;">Vehicle ID: ${data.vehicle_number}</span>
          </td>
          <td>
            ${data.plan}<br />
            <span style="font-size: 11px; color: #64748B;">Pickup: ${data.pickup_zone}</span>
          </td>
          <td class="amount">₹${data.fare.toFixed(2)}</td>
        </tr>
        ${data.deposit > 0 ? `
        <tr>
          <td>
            <b>Security Deposit</b><br />
            <span style="font-size: 11px; color: #059669;">100% Refundable Guarantee</span>
          </td>
          <td>At Trip Close</td>
          <td class="amount">₹${data.deposit.toFixed(2)}</td>
        </tr>
        ` : ''}
      </tbody>
    </table>

    <div class="total-box">
      <div class="total-row">
        <span>Subtotal (Rental Charges)</span>
        <span>₹${data.fare.toFixed(2)}</span>
      </div>
      ${data.deposit > 0 ? `
      <div class="total-row">
        <span>Refundable Security Deposit</span>
        <span>₹${data.deposit.toFixed(2)}</span>
      </div>
      ` : ''}
      <div class="total-row">
        <span>GST & Applicable Taxes</span>
        <span style="color: #059669; font-weight: 700;">Included (0%)</span>
      </div>
      <div class="total-row grand">
        <span>Total Amount Paid</span>
        <span>₹${data.total.toFixed(2)}</span>
      </div>
    </div>

    <div class="barcode-section">
      <div class="barcode-sim">||| | |||| | ||| || ||| | |||</div>
      <div class="barcode-caption">Authorized Digital Seal · Transaction #${data.invoice_no}</div>
    </div>

    <div class="actions-row">
      <button onclick="window.print()" class="btn btn-primary">
        <span>🖨️</span> Print / Save PDF Receipt
      </button>
      <button onclick="navigator.share ? navigator.share({title: 'Evegah Receipt', text: 'Invoice #${data.invoice_no}', url: window.location.href}) : alert('Receipt URL copied!')" class="btn btn-secondary">
        <span>🔗</span> Share Receipt
      </button>
    </div>
  </div>
</body>
</html>
  `);
});

module.exports = router;
