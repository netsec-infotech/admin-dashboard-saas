const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate, requireRoles } = require('../middleware/auth');

// Ensure notifications table exists
(async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(100) PRIMARY KEY,
        mobile VARCHAR(50),
        rider_id VARCHAR(100),
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'system',
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await db.query(`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS mobile VARCHAR(50)`);
    await db.query(`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS rider_id VARCHAR(100)`);
  } catch (e) {
    console.warn('Notifications table init notice:', e.message);
  }
})();

// General system broadcast fallback announcements
const GENERAL_BROADCASTS = [
  {
    id: 'notif-offer-04',
    title: '🎁 Special Offer Alert: 25% OFF',
    message: 'Use code EVEGAH25 to get 25% off on your next weekly package booking!',
    type: 'promo',
    read: false,
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'notif-announce-05',
    title: '📢 System Announcement',
    message: 'EVegah 24x7 Stations are active across Gotri, Alkapuri & Subhanpura zones.',
    type: 'system',
    read: true,
    created_at: new Date(Date.now() - 172800000).toISOString()
  }
];

// GET /api/notifications — Rider-specific notifications
router.get('/', async (req, res) => {
  try {
    const rawMobile = req.query.mobile || req.headers['x-user-mobile'] || '';
    const cleanMobile = rawMobile.replace(/\D/g, '').slice(-10);

    const riderNotifications = [];
    let lastReadTimestamp = null;

    if (cleanMobile) {
      try {
        const userRes = await db.query(
          "SELECT notifications_read_at FROM users WHERE mobile LIKE $1 LIMIT 1",
          [`%${cleanMobile}%`]
        );
        if (userRes.rows.length > 0 && userRes.rows[0].notifications_read_at) {
          lastReadTimestamp = new Date(userRes.rows[0].notifications_read_at).getTime();
        }
      } catch (_) {}

      // 1. Fetch DB notifications specifically for this mobile or general broadcast
      try {
        const result = await db.query(`
          SELECT * FROM notifications 
          WHERE (mobile LIKE $1 OR mobile IS NULL OR mobile = '')
          ORDER BY created_at DESC 
          LIMIT 30
        `, [`%${cleanMobile}%`]);
        if (result.rows.length > 0) {
          riderNotifications.push(...result.rows);
        }
      } catch (dbErr) {
        console.warn('Error reading notifications table:', dbErr.message);
      }

      // 2. Synthesize real rider-specific notifications from recent wallet transactions
      try {
        const walletTx = await db.query(`
          SELECT transaction_id, title, subtitle, amount, type, created_at
          FROM wallet_transactions
          WHERE mobile LIKE $1
          ORDER BY created_at DESC
          LIMIT 5
        `, [`%${cleanMobile}%`]);

        walletTx.rows.forEach(w => {
          const isCredit = (w.type || '').toLowerCase() === 'credit';
          riderNotifications.push({
            id: `notif-wlt-${w.transaction_id}`,
            title: isCredit ? `💳 Wallet Credited (+₹${w.amount})` : `⚡ Wallet Debited (-₹${w.amount})`,
            message: `${w.title || 'Transaction'}: ${w.subtitle || `₹${w.amount} processed`}`,
            type: 'payment',
            read: false,
            created_at: w.created_at
          });
        });
      } catch (_) {}

      // 3. Synthesize real rider-specific notifications from recent ride reservations
      try {
        const resTx = await db.query(`
          SELECT reservation_id, package_type, pickup_zone, status, fare, created_at
          FROM reservations
          WHERE mobile LIKE $1
          ORDER BY created_at DESC
          LIMIT 5
        `, [`%${cleanMobile}%`]);

        resTx.rows.forEach(r => {
          riderNotifications.push({
            id: `notif-res-${r.reservation_id}`,
            title: `🛵 EV Ride ${r.status || 'Confirmed'} (${r.reservation_id})`,
            message: `Your ${r.package_type || 'EV'} booking in ${r.pickup_zone || 'station'} is ${r.status || 'Confirmed'}.`,
            type: 'booking',
            read: false,
            created_at: r.created_at
          });
        });
      } catch (_) {}

      // Add general broadcast offers
      riderNotifications.push(...GENERAL_BROADCASTS);
    } else {
      // Unauthenticated or general viewer: only show general broadcasts
      try {
        const result = await db.query(`
          SELECT * FROM notifications 
          WHERE (mobile IS NULL OR mobile = '')
          ORDER BY created_at DESC 
          LIMIT 10
        `);
        if (result.rows.length > 0) {
          riderNotifications.push(...result.rows);
        } else {
          riderNotifications.push(...GENERAL_BROADCASTS);
        }
      } catch (_) {
        riderNotifications.push(...GENERAL_BROADCASTS);
      }
    }

    // Sort by created_at DESC & deduplicate by ID
    const seen = new Set();
    const unique = [];
    riderNotifications
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .forEach(n => {
        if (!seen.has(n.id)) {
          seen.add(n.id);
          const itemTime = new Date(n.created_at).getTime();
          const isRead = Boolean(n.read) || (lastReadTimestamp !== null && itemTime <= lastReadTimestamp);
          unique.push({ ...n, read: isRead });
        }
      });

    const unreadCount = unique.filter(r => !r.read).length;
    res.json({ status: 'success', data: unique, unreadCount });
  } catch (err) {
    console.error('Failed to get notifications:', err);
    res.json({ status: 'success', data: GENERAL_BROADCASTS, unreadCount: 1 });
  }
});

// POST /api/notifications (Create notification)
const createNotification = async (title, message, type = 'booking', mobile = null) => {
  const notif = {
    id: `notif-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    mobile: mobile || null,
    title,
    message,
    type,
    read: false,
    created_at: new Date().toISOString()
  };
  try {
    await db.query(`
      INSERT INTO notifications (id, mobile, title, message, type, read, created_at)
      VALUES ($1, $2, $3, $4, $5, false, NOW())
    `, [notif.id, notif.mobile, notif.title, notif.message, notif.type]);
  } catch (_) {}
  return notif;
};

router.post('/', async (req, res) => {
  const { title, message, type, mobile } = req.body;
  const notif = await createNotification(title || 'System Notification', message || '', type, mobile);
  res.json({ status: 'success', data: notif });
});

// POST /api/notifications/mark-read
router.post('/mark-read', async (req, res) => {
  try {
    const rawMobile = req.body.mobile || req.query.mobile || req.headers['x-user-mobile'] || '';
    const cleanMobile = rawMobile.replace(/\D/g, '').slice(-10);

    if (cleanMobile) {
      await db.query(
        "UPDATE notifications SET read = true WHERE mobile LIKE $1 OR mobile IS NULL OR mobile = ''",
        [`%${cleanMobile}%`]
      );
      await db.query(
        "UPDATE users SET notifications_read_at = NOW() WHERE mobile LIKE $1",
        [`%${cleanMobile}%`]
      );
    } else {
      await db.query('UPDATE notifications SET read = true');
      await db.query('UPDATE users SET notifications_read_at = NOW()');
    }
  } catch (err) {
    console.warn('Mark read notice:', err.message);
  }
  res.json({ status: 'success', message: 'Notifications marked as read' });
});

// POST /api/notifications/register-token
router.post('/register-token', async (req, res) => {
  try {
    const { token, mobile, user_id, role, app_type, tenant_id, device_os } = req.body;
    if (!token) {
      return res.status(400).json({ status: 'error', message: 'Device token is required' });
    }

    const cleanMobile = mobile ? String(mobile).replace(/\D/g, '').slice(-10) : null;

    const query = `
      INSERT INTO device_tokens (
        token, user_id, mobile, role, app_type, tenant_id, device_os, is_active, last_active_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW())
      ON CONFLICT (token) DO UPDATE SET
        user_id = COALESCE(EXCLUDED.user_id, device_tokens.user_id),
        mobile = COALESCE(EXCLUDED.mobile, device_tokens.mobile),
        role = COALESCE(EXCLUDED.role, device_tokens.role),
        app_type = COALESCE(EXCLUDED.app_type, device_tokens.app_type),
        tenant_id = COALESCE(EXCLUDED.tenant_id, device_tokens.tenant_id),
        device_os = COALESCE(EXCLUDED.device_os, device_tokens.device_os),
        is_active = true,
        last_active_at = NOW()
      RETURNING *;
    `;

    const result = await db.query(query, [
      token,
      user_id || null,
      cleanMobile,
      role || 'rider',
      app_type || 'rider',
      tenant_id || null,
      device_os || 'android'
    ]);

    res.status(200).json({
      status: 'success',
      message: 'Device token registered successfully',
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Token registration error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST /api/notifications/unregister-token
router.post('/unregister-token', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ status: 'error', message: 'Device token is required' });
    }

    await db.query(
      'UPDATE device_tokens SET is_active = false, last_active_at = NOW() WHERE token = $1',
      [token]
    );

    res.json({ status: 'success', message: 'Device token deactivated' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET /api/notifications/tokens (List active device tokens for targeting inspection - Protected)
router.get('/tokens', authenticate, requireRoles('admin', 'superadmin', 'franchise', 'operator'), async (req, res) => {
  try {
    const { mobile, role, app_type } = req.query;
    let sql = 'SELECT id, token, user_id, mobile, role, app_type, device_os, is_active, last_active_at FROM device_tokens WHERE is_active = true';
    const params = [];
    if (mobile) {
      const cleanMob = String(mobile).replace(/\D/g, '').slice(-10);
      sql += ' AND mobile LIKE $' + (params.length + 1);
      params.push(`%${cleanMob}%`);
    }
    if (role) {
      sql += ' AND role = $' + (params.length + 1);
      params.push(role);
    }
    if (app_type) {
      sql += ' AND app_type = $' + (params.length + 1);
      params.push(app_type);
    }
    const result = await db.query(sql, params);
    res.json({ status: 'success', count: result.rows.length, data: result.rows });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Push Notification Dispatcher Engine
async function sendPushNotification({
  event_type = 'system',
  event_key = null,
  recipient_mobile = null,
  recipient_role = null,
  recipient_tenant = null,
  app_type = null,
  title,
  body,
  payload = {}
}) {
  const cleanMobile = recipient_mobile ? String(recipient_mobile).replace(/\D/g, '').slice(-10) : null;

  // 1. Duplicate event prevention (Idempotency)
  if (event_key) {
    const existingLog = await db.query(
      'SELECT id, status FROM push_notifications_log WHERE event_key = $1 LIMIT 1',
      [event_key]
    );
    if (existingLog.rows.length > 0) {
      return {
        status: 'ignored',
        reason: 'duplicate_suppressed',
        event_key,
        message: 'Notification event already dispatched previously'
      };
    }
  }

  // 2. Query target device tokens
  let tokenQuery = 'SELECT token, mobile, role, app_type, is_active FROM device_tokens WHERE is_active = true';
  const params = [];
  let paramIdx = 1;

  if (cleanMobile) {
    tokenQuery += ` AND mobile LIKE $${paramIdx++}`;
    params.push(`%${cleanMobile}%`);
  }
  if (recipient_role) {
    tokenQuery += ` AND role = $${paramIdx++}`;
    params.push(recipient_role);
  }
  if (app_type) {
    tokenQuery += ` AND app_type = $${paramIdx++}`;
    params.push(app_type);
  }
  if (recipient_tenant) {
    tokenQuery += ` AND tenant_id = $${paramIdx++}`;
    params.push(recipient_tenant);
  }

  const tokenRes = await db.query(tokenQuery, params);
  const targetTokens = tokenRes.rows;

  let successCount = 0;
  let failureCount = 0;
  const invalidTokens = [];

  // 3. Dispatch / mock push execution
  for (const t of targetTokens) {
    // If token is explicitly marked invalid or contains expired pattern, simulate FCM error
    if (t.token.startsWith('invalid_') || t.token.includes('expired')) {
      failureCount++;
      invalidTokens.push(t.token);
    } else {
      successCount++;
    }
  }

  // If invalid tokens were detected, prune/deactivate them
  if (invalidTokens.length > 0) {
    await db.query(
      'UPDATE device_tokens SET is_active = false, last_active_at = NOW() WHERE token = ANY($1)',
      [invalidTokens]
    );
  }

  // 4. Log event dispatch into push_notifications_log
  await db.query(`
    INSERT INTO push_notifications_log (
      event_type, event_key, recipient_mobile, recipient_role, title, body, payload, tokens_targeted, success_count, failure_count, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
  `, [
    event_type,
    event_key,
    cleanMobile,
    recipient_role,
    title,
    body,
    JSON.stringify(payload),
    targetTokens.length,
    successCount,
    failureCount,
    successCount > 0 || targetTokens.length === 0 ? 'dispatched' : 'failed'
  ]);

  // 5. Persist notification in in-app notification feed
  if (cleanMobile) {
    await createNotification(title, body, event_type, cleanMobile);
  }

  return {
    status: 'success',
    event_key,
    tokens_targeted: targetTokens.length,
    success_count: successCount,
    failure_count: failureCount,
    in_app_recorded: Boolean(cleanMobile)
  };
}

// POST /api/notifications/dispatch (Manual/System push trigger endpoint - Protected)
router.post('/dispatch', authenticate, requireRoles('admin', 'superadmin', 'franchise', 'operator'), async (req, res) => {
  try {
    const {
      event_type,
      event_key,
      recipient_mobile,
      recipient_role,
      recipient_tenant,
      app_type,
      title,
      body,
      payload
    } = req.body;

    if (!title || !body) {
      return res.status(400).json({ status: 'error', message: 'Title and body are required' });
    }

    const result = await sendPushNotification({
      event_type,
      event_key,
      recipient_mobile,
      recipient_role,
      recipient_tenant,
      app_type,
      title,
      body,
      payload
    });

    res.json(result);
  } catch (err) {
    console.error('Push dispatch error:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Helper: sendRentalExpiryNotification
async function sendRentalExpiryNotification({ mobile, riderName, daysRemaining, vehicleId, rentalId }) {
  const event_key = `EXP_${rentalId || vehicleId}_${new Date().toISOString().slice(0, 10)}`;
  const title = daysRemaining <= 1
    ? '⚠️ Rental Expiring Soon'
    : `📅 Rental Reminder: ${daysRemaining} Days Left`;
  const body = `Hello ${riderName || 'Rider'}, your rental for vehicle ${vehicleId || 'EV'} expires in ${daysRemaining} day(s). Renew now or return at an Evegah hub.`;

  return sendPushNotification({
    event_type: 'rental_expiry',
    event_key,
    recipient_mobile: mobile,
    app_type: 'rider',
    title,
    body,
    payload: { rentalId, vehicleId, daysRemaining, type: 'rental_expiry' }
  });
}

// Helper: sendBatterySwapNotification
async function sendBatterySwapNotification({ mobile, riderName, vehicleId, newBatteryId, oldBatterySoc, newBatterySoc, amount }) {
  const event_key = `SWAP_${newBatteryId}_${Date.now()}`;
  const title = '⚡ Battery Swap Completed';
  const body = `Hi ${riderName || 'Rider'}, battery swap for vehicle ${vehicleId || 'EV'} complete! Old: ${oldBatterySoc || 15}% SOC → New: ${newBatterySoc || 100}% SOC. Amount: ₹${parseFloat(amount || 0).toFixed(2)}.`;

  return sendPushNotification({
    event_type: 'battery_swap',
    event_key,
    recipient_mobile: mobile,
    app_type: 'rider',
    title,
    body,
    payload: { vehicleId, newBatteryId, amount, type: 'battery_swap' }
  });
}

module.exports = router;
module.exports.createNotification = createNotification;
module.exports.sendPushNotification = sendPushNotification;
module.exports.sendRentalExpiryNotification = sendRentalExpiryNotification;
module.exports.sendBatterySwapNotification = sendBatterySwapNotification;
