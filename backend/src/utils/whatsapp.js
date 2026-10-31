// WhatsApp Cloud API Utility for Sending Payment Receipts

const getEnv = (key, fallback = '') => process.env[key] || fallback;

// In-memory cache to prevent sending duplicate receipts within 30 minutes
const RECENT_RECEIPTS = new Map();

function isDuplicateReceipt(cleanMobile, invoiceNo) {
  if (!invoiceNo) return false;
  const key = `${cleanMobile}:${invoiceNo}`;
  const now = Date.now();

  // Cleanup old keys older than 30 mins
  for (const [k, timestamp] of RECENT_RECEIPTS.entries()) {
    if (now - timestamp > 30 * 60 * 1000) {
      RECENT_RECEIPTS.delete(k);
    }
  }

  if (RECENT_RECEIPTS.has(key)) {
    return true;
  }
  RECENT_RECEIPTS.set(key, now);
  return false;
}

/**
 * Send WhatsApp payment receipt to rider
 * Supports both signatures:
 *   sendWhatsAppReceipt({ mobile, name, invoice_no, invoice_date, plan, amount, receipt_url })
 *   sendWhatsAppReceipt(mobile, { name, invoice_no, invoice_date, plan, amount, receipt_url })
 */
async function sendWhatsAppReceipt(firstArg, secondArg = {}) {
  let opts = {};
  if (typeof firstArg === 'string') {
    opts = { mobile: firstArg, ...secondArg };
  } else if (firstArg && typeof firstArg === 'object') {
    opts = { ...firstArg, ...secondArg };
  }

  const {
    mobile,
    name = 'Rider',
    invoice_no,
    invoice_date,
    plan = 'EV Rental Plan',
    amount = '0',
    receipt_url
  } = opts;

  if (!mobile) {
    console.warn('[WhatsApp] Skipped receipt: No mobile number provided');
    return { status: 'skipped', message: 'No mobile number provided' };
  }

  const phoneId = getEnv('WHATSAPP_PHONE_NUMBER_ID', '919221374614519');
  const token = getEnv('WHATSAPP_CLOUD_ACCESS_TOKEN');
  const version = getEnv('WHATSAPP_GRAPH_VERSION', 'v21.0').replace(/^v?/, 'v');
  const templateName = getEnv('WHATSAPP_TEMPLATE_NAME', 'rider_payment_receipt');
  const lang = getEnv('WHATSAPP_TEMPLATE_LANGUAGE', 'en');
  const dateFormat = getEnv('WHATSAPP_TEMPLATE_INVOICE_DATE_FORMAT', 'DD/MM/YYYY');

  if (!token) {
    console.warn('[WhatsApp] WHATSAPP_CLOUD_ACCESS_TOKEN not set, skipping API call');
    return { status: 'skipped', message: 'Access token not configured' };
  }

  // Format mobile to international format without plus (e.g. 911800 889 8791)
  let cleanMobile = String(mobile).replace(/\D/g, '');
  if (cleanMobile.length === 10) {
    cleanMobile = '91' + cleanMobile;
  }

  // Deduplication check: Suppress duplicate WhatsApp message if already dispatched recently
  if (invoice_no && isDuplicateReceipt(cleanMobile, invoice_no)) {
    console.warn(`[WhatsApp] Suppressed duplicate receipt for invoice: ${invoice_no} to ${cleanMobile}`);
    return { status: 'skipped', message: 'Duplicate receipt suppressed' };
  }

  // Format date
  let formattedDate = invoice_date;
  if (!formattedDate) {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    formattedDate = dateFormat === 'DD/MM/YYYY' ? `${dd}/${mm}/${yyyy}` : `${yyyy}-${mm}-${dd}`;
  }

  // Clean amount
  const cleanAmount = typeof amount === 'number' ? amount.toFixed(2) : String(amount).replace(/[^0-9.]/g, '');
  const displayAmount = `₹${cleanAmount || '0.00'}`;
  const displayInvNo = invoice_no || `EVG-${Date.now().toString().slice(-6)}`;

  const bodyComponents = [
    {
      type: 'body',
      parameters: [
        { type: 'text', text: String(name || 'Rider') },
        { type: 'text', text: String(displayInvNo) },
        { type: 'text', text: String(formattedDate) },
        { type: 'text', text: String(plan || 'EV Rental Plan') },
        { type: 'text', text: String(displayAmount) }
      ]
    }
  ];

  // If template has dynamic URL button configured
  const buttonIndex = getEnv('WHATSAPP_TEMPLATE_URL_BUTTON_INDEX', '0');
  if (buttonIndex !== '') {
    let buttonParam = '';
    if (receipt_url) {
      try {
        const u = new URL(String(receipt_url));
        buttonParam = `${u.pathname || ''}${u.search || ''}`.replace(/^\/+/, '');
      } catch {
        buttonParam = String(receipt_url).replace(/^\/+/, '');
      }
    }
    if (!buttonParam) {
      // Dynamic URL buttons in WhatsApp template require a parameter.
      // Fallback to invoice / receipt id so Meta API accepts the request.
      buttonParam = String(displayInvNo || 'receipt').replace(/^\/+/, '');
    }

    bodyComponents.push({
      type: 'button',
      sub_type: 'url',
      index: String(buttonIndex),
      parameters: [
        { type: 'text', text: buttonParam }
      ]
    });
  }

  const url = `https://graph.facebook.com/${version}/${phoneId}/messages`;
  const payload = {
    messaging_product: 'whatsapp',
    to: cleanMobile,
    type: 'template',
    template: {
      name: templateName,
      language: { code: lang },
      components: bodyComponents
    }
  };

  try {
    console.log(`[WhatsApp] Sending payment receipt to ${cleanMobile} via template "${templateName}"...`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok) {
      console.error('[WhatsApp] Meta API error:', result);
      return { status: 'error', error: result };
    }
    console.log('[WhatsApp] Receipt sent successfully! Meta Message ID:', result?.messages?.[0]?.id);
    return { status: 'success', data: result };
  } catch (err) {
    console.error('[WhatsApp] Send error:', err.message);
    return { status: 'error', message: err.message };
  }
}

/**
 * Send Direct Text Message via WhatsApp Cloud API
 */
async function sendWhatsAppDirectMessage(firstArg, secondArg) {
  let targetMobile = typeof firstArg === 'object' && firstArg !== null ? (firstArg.mobile || firstArg.to || firstArg.phone) : firstArg;
  let targetText = typeof firstArg === 'object' && firstArg !== null ? (firstArg.message || firstArg.text || firstArg.textBody || firstArg.body) : secondArg;

  if (!targetMobile) return { status: 'skipped', message: 'No mobile provided' };
  const token = getEnv('WHATSAPP_CLOUD_ACCESS_TOKEN');
  const phoneId = getEnv('WHATSAPP_PHONE_NUMBER_ID', '919221374614519');
  const version = getEnv('WHATSAPP_GRAPH_VERSION', 'v21.0').replace(/^v?/, 'v');

  let cleanMobile = String(targetMobile).replace(/\D/g, '');
  if (cleanMobile.length === 10) cleanMobile = '91' + cleanMobile;

  if (!token) {
    console.log(`[WhatsApp Mock] To: ${cleanMobile} | Message: ${targetText}`);
    return { status: 'mock_sent', message: 'Mock WhatsApp message logged (Token not set)' };
  }

  const url = `https://graph.facebook.com/${version}/${phoneId}/messages`;
  const payload = {
    messaging_product: 'whatsapp',
    to: cleanMobile,
    type: 'text',
    text: { preview_url: false, body: String(targetText || '') }
  };

  try {
    console.log(`[WhatsApp] Sending alert to ${cleanMobile}...`);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok) {
      console.warn('[WhatsApp] Text send warning:', result);
      return { status: 'error', error: result };
    }
    return { status: 'success', data: result };
  } catch (err) {
    console.error('[WhatsApp] Alert send error:', err.message);
    return { status: 'error', message: err.message };
  }
}

/**
 * Alert 1: Ride End Reminders (1 Hour before, 15 Minutes before, or at Ride End)
 */
async function sendRideReminderAlert({ mobile, name, vehicleNumber, timeRemaining, endTime, hubName = 'Evegah Gotri Hub' }) {
  let text = '';
  if (timeRemaining === '1hr') {
    text = `⚠️ *Evegah Ride Alert (1 Hour Left)*\n\nHi ${name || 'Rider'},\nYour EV ride for *${vehicleNumber || 'your vehicle'}* will end in *1 Hour* (at ${endTime || 'scheduled time'}).\n\n📍 Return Hub: ${hubName}\n\nPlease plan your return or extend your ride in the Evegah app to avoid late return charges.`;
  } else if (timeRemaining === '15min') {
    text = `⏰ *Evegah Ride Alert (15 Minutes Left)*\n\nHi ${name || 'Rider'},\nOnly *15 Minutes* remaining on your ride for *${vehicleNumber || 'your vehicle'}*.\n\n📍 Return Hub: ${hubName}\n\nPlease reach the hub promptly to complete vehicle check-in.`;
  } else {
    text = `🛑 *Evegah Scheduled Ride Ended*\n\nHi ${name || 'Rider'},\nYour scheduled booking period for *${vehicleNumber || 'your vehicle'}* has concluded.\n\nPlease drop off the vehicle at *${hubName}* now to avoid penalty deductions.`;
  }

  return sendWhatsAppDirectMessage(mobile, text);
}

/**
 * Alert 2: Grace Period Alert (Notice that grace period is active before penalty charges start)
 */
async function sendGracePeriodAlert({ mobile, name, vehicleNumber, graceMinutes = 15, penaltyRate = 50, hubName = 'Evegah Hub' }) {
  const text = `⏳ *Grace Period Notification*\n\nHi ${name || 'Rider'},\nYou have entered the *${graceMinutes}-Minute Grace Period* for returning vehicle *${vehicleNumber || 'EV'}*.\n\n⚠️ *Important*: Return the vehicle to *${hubName}* before this grace period expires.\nAfter the grace period, an overdue penalty of *₹${penaltyRate}/hr* will be charged automatically.\n\nFor assistance, contact Evegah Support: +91 93285 85954.`;
  return sendWhatsAppDirectMessage(mobile, text);
}

/**
 * Alert 3: Overdue Penalty Alert with Secure Verification OTP
 */
async function sendOverduePenaltyAlert({ mobile, name, vehicleNumber, overdueMinutes, penaltyAmount, otp, hubName = 'Evegah Hub' }) {
  const text = `🚨 *OVERDUE RIDE PENALTY NOTICE*\n\nHi ${name || 'Rider'},\nYour ride for vehicle *${vehicleNumber || 'EV'}* is currently *OVERDUE by ${overdueMinutes} minutes*.\n\n💰 *Penalty Incurred*: ₹${penaltyAmount}\n🔑 *Penalty Authorization OTP*: *${otp}*\n\nPlease present this OTP at *${hubName}* during vehicle return. Drop the vehicle immediately to prevent additional hourly penalty accruals.\n\nEmergency Helpline: +91 93285 85954.`;
  return sendWhatsAppDirectMessage(mobile, text);
}

module.exports = {
  sendWhatsAppReceipt,
  sendWhatsAppDirectMessage,
  sendRideReminderAlert,
  sendGracePeriodAlert,
  sendOverduePenaltyAlert
};

