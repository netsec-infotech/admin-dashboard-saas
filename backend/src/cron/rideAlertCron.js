const db = require('../db');
const {
  sendRideReminderAlert,
  sendGracePeriodAlert,
  sendOverduePenaltyAlert,
  sendWhatsAppDirectMessage
} = require('../utils/whatsapp');

// In-memory set to deduplicate alerts during server uptime (resets safely or backed by reservation.alerts_sent)
const sentAlertsTracker = new Set();

// Helper to sanitize clean key
const alertKey = (resId, alertType) => `${resId}:${alertType}`;

/**
 * Resolve Grace Period (in minutes) and Late Fee for a given zone or settings fallback
 */
async function resolveZoneGracePeriod(zoneName) {
  let graceMinutes = 15;
  let penaltyRate = 50;

  try {
    // 1. Try Zone specific pricing
    if (zoneName) {
      const zRes = await db.query('SELECT pricing FROM zones WHERE LOWER(name) = LOWER($1) LIMIT 1', [zoneName.trim()]);
      if (zRes.rows.length > 0 && zRes.rows[0].pricing) {
        const p = zRes.rows[0].pricing;
        if (p.hourlyPricing && Array.isArray(p.hourlyPricing) && p.hourlyPricing.length > 0) {
          const hp = p.hourlyPricing[0];
          if (hp.gracePeriod && !isNaN(parseInt(hp.gracePeriod))) {
            graceMinutes = parseInt(hp.gracePeriod);
          }
          if (hp.extraPrice && !isNaN(parseFloat(hp.extraPrice))) {
            penaltyRate = parseFloat(hp.extraPrice);
          }
        }
      }
    }

    // 2. Try settings table
    const sRes = await db.query("SELECT values FROM settings WHERE category IN ('general', 'ride_rental')");
    sRes.rows.forEach(r => {
      if (r.values?.late_return_grace_period) graceMinutes = parseInt(r.values.late_return_grace_period);
      else if (r.values?.ride_grace_time) graceMinutes = parseInt(r.values.ride_grace_time);
      if (r.values?.late_return_fee) penaltyRate = parseFloat(r.values.late_return_fee);
    });
  } catch (e) {
    console.warn('[RideAlerts] Config lookup error:', e.message);
  }

  return { graceMinutes: Math.max(graceMinutes, 5), penaltyRate: Math.max(penaltyRate, 20) };
}

/**
 * Compute scheduled end timestamp for an active reservation
 */
function getScheduledEndTime(resv) {
  if (resv.drop_datetime) {
    const d = new Date(resv.drop_datetime);
    if (!isNaN(d.getTime())) return d;
  }

  let start = null;
  if (resv.pickup_datetime) start = new Date(resv.pickup_datetime);
  else if (resv.created_at) start = new Date(resv.created_at);

  if (!start || isNaN(start.getTime())) start = new Date();

  // Package duration addition
  const pkg = (resv.package_type || 'Day').toLowerCase();
  const end = new Date(start.getTime());

  if (pkg.includes('hour')) {
    const hrs = parseInt(pkg.replace(/\D/g, '')) || 2;
    end.setHours(end.getHours() + hrs);
  } else if (pkg.includes('week')) {
    end.setDate(end.getDate() + 7);
  } else if (pkg.includes('month')) {
    end.setDate(end.getDate() + 30);
  } else {
    // Daily / 1 Day default
    end.setDate(end.getDate() + 1);
  }

  return end;
}

/**
 * Main Check Loop
 */
async function checkActiveRidesAndSendAlerts() {
  try {
    // Ensure tracking columns exist in reservations table
    await db.query(`
      ALTER TABLE reservations 
      ADD COLUMN IF NOT EXISTS penalty_amount NUMERIC(10,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS penalty_otp VARCHAR(20),
      ADD COLUMN IF NOT EXISTS is_overdue BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS alerts_sent TEXT
    `).catch(() => {});

    // Query all active / ongoing rides
    const activeRidesRes = await db.query(`
      SELECT * FROM reservations 
      WHERE status IN ('Active', 'Ongoing', 'Picked Up', 'Active Ride')
      ORDER BY created_at DESC
    `);

    if (activeRidesRes.rows.length === 0) return;

    const now = new Date();

    // 0. Alert: 30 Mins Before Reserved Ride Starts
    const reservedRides = await db.query(`
      SELECT * FROM reservations
      WHERE status IN ('Upcoming', 'Confirmed', 'Reserved')
      ORDER BY created_at DESC
    `).catch(() => ({ rows: [] }));

    for (const resv of reservedRides.rows) {
      const resId = resv.reservation_id || String(resv.id);
      const riderName = resv.customer_name || 'Rider';
      const mobile = resv.mobile;
      const vehicleNum = resv.vehicle_number || resv.vehicle_model || 'Evegah EV';
      const hubName = resv.pickup_zone || 'Gotri Hub';

      if (!mobile) continue;

      const scheduledStart = resv.pickup_datetime ? new Date(resv.pickup_datetime) : (resv.reservation_date ? new Date(resv.reservation_date) : null);
      if (!scheduledStart || isNaN(scheduledStart.getTime())) continue;

      const diffMs = scheduledStart.getTime() - now.getTime();
      const diffMin = Math.round(diffMs / 60000);

      if (diffMin <= 30 && diffMin >= 5 && !sentAlertsTracker.has(alertKey(resId, '30min_start'))) {
        sentAlertsTracker.add(alertKey(resId, '30min_start'));
        const text = `🔔 *Evegah Ride Starting Soon (in 30 Mins)*\n\nHi ${riderName},\nYour scheduled EV ride for *${vehicleNum}* will begin at *${hubName}* in 30 minutes.\n\nPlease arrive on time to complete your quick vehicle checkout. Safe travels!`;
        await sendWhatsAppDirectMessage(mobile, text);
      }
    }

    // 1. Process Active / Ongoing Rides
    for (const resv of activeRidesRes.rows) {
      const resId = resv.reservation_id || String(resv.id);
      const riderName = resv.customer_name || 'Rider';
      const mobile = resv.mobile;
      const vehicleNum = resv.vehicle_number || resv.vehicle_model || 'Evegah City';
      const hubName = resv.drop_zone || resv.pickup_zone || 'Gotri Hub';

      if (!mobile) continue;

      // Ride Started Confirmation Alert
      if (!sentAlertsTracker.has(alertKey(resId, 'ride_started'))) {
        sentAlertsTracker.add(alertKey(resId, 'ride_started'));
        const text = `🛵 *Evegah Ride Started Successfully!*\n\nHi ${riderName},\nYour ride for vehicle *${vehicleNum}* (Battery: ${resv.battery_id || 'Active'}) has officially started.\n\n📍 Return Hub: ${hubName}\n\nPlease wear your safety helmet and ride responsibly!`;
        await sendWhatsAppDirectMessage(mobile, text);
      }

      const scheduledEnd = getScheduledEndTime(resv);
      const diffMs = scheduledEnd.getTime() - now.getTime();
      const diffMin = Math.round(diffMs / 60000); // positive = remaining, negative = elapsed

      const { graceMinutes, penaltyRate } = await resolveZoneGracePeriod(hubName);

      const endTimeFormatted = scheduledEnd.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', hour12: true
      });

      // Alert: 1 Hour Before End
      if (diffMin <= 60 && diffMin >= 45 && !sentAlertsTracker.has(alertKey(resId, '1hr'))) {
        sentAlertsTracker.add(alertKey(resId, '1hr'));
        await sendRideReminderAlert({
          mobile,
          name: riderName,
          vehicleNumber: vehicleNum,
          timeRemaining: '1hr',
          endTime: endTimeFormatted,
          hubName
        });
      }

      // Alert: 15 Minutes Before End (with prompt to extend)
      if (diffMin <= 15 && diffMin >= 3 && !sentAlertsTracker.has(alertKey(resId, '15min'))) {
        sentAlertsTracker.add(alertKey(resId, '15min'));
        await sendRideReminderAlert({
          mobile,
          name: riderName,
          vehicleNumber: vehicleNum,
          timeRemaining: '15min',
          endTime: endTimeFormatted,
          hubName
        });
      }

      // Alert: Scheduled End Time
      if (diffMin <= 0 && diffMin >= -3 && !sentAlertsTracker.has(alertKey(resId, 'end_time'))) {
        sentAlertsTracker.add(alertKey(resId, 'end_time'));
        await sendRideReminderAlert({
          mobile,
          name: riderName,
          vehicleNumber: vehicleNum,
          timeRemaining: 'end',
          endTime: endTimeFormatted,
          hubName
        });
      }

      // Alert: Grace Period Notification
      if (diffMin < 0 && diffMin >= -graceMinutes && !sentAlertsTracker.has(alertKey(resId, 'grace_period'))) {
        sentAlertsTracker.add(alertKey(resId, 'grace_period'));
        const graceRemaining = graceMinutes + diffMin;
        await sendGracePeriodAlert({
          mobile,
          name: riderName,
          vehicleNumber: vehicleNum,
          graceMinutes: Math.max(graceRemaining, 1),
          penaltyRate,
          hubName
        });
      }

      // Alert: Overdue Past Grace Period -> Calculate 1/10th fare or zone rate
      if (diffMin < -graceMinutes && !sentAlertsTracker.has(alertKey(resId, 'overdue_penalty'))) {
        sentAlertsTracker.add(alertKey(resId, 'overdue_penalty'));

        const overdueMinutes = Math.abs(diffMin) - graceMinutes;
        const overdueHours = Math.ceil(overdueMinutes / 60);

        // 1/10 of fare amount per hour or zone pricing penalty rate
        const farePer10 = (parseFloat(resv.fare) || 0) / 10;
        const hourlyPenaltyRate = Math.max(farePer10 > 0 ? farePer10 : 50, penaltyRate);
        const penaltyAmount = overdueHours * hourlyPenaltyRate;

        // Generate 4-digit secure authorization OTP
        const otp = String(Math.floor(1000 + Math.random() * 9000));

        // Save penalty & OTP in database
        await db.query(`
          UPDATE reservations
          SET is_overdue = TRUE,
              penalty_amount = $1,
              penalty_otp = $2
          WHERE id::text = $3 OR reservation_id = $3
        `, [penaltyAmount, otp, resId]).catch(() => {});

        // Send Overdue WhatsApp Alert with Penalty Amount and OTP
        await sendOverduePenaltyAlert({
          mobile,
          name: riderName,
          vehicleNumber: vehicleNum,
          overdueMinutes,
          penaltyAmount,
          otp,
          hubName
        });
      }
    }

    // 2. Alert: Vehicle Battery Low (< 20%)
    const lowBatVehicles = await db.query(`
      SELECT v.code, v.battery_pct, v.zone, r.mobile, r.customer_name
      FROM vehicles v
      LEFT JOIN reservations r ON (r.vehicle_number = v.code AND r.status IN ('Active', 'Ongoing', 'Picked Up'))
      WHERE v.battery_pct <= 20 AND r.mobile IS NOT NULL
    `).catch(() => ({ rows: [] }));

    for (const v of lowBatVehicles.rows) {
      const vKey = alertKey(v.code, 'low_battery');
      if (!sentAlertsTracker.has(vKey)) {
        sentAlertsTracker.add(vKey);
        const text = `⚡ *Low Battery Alert (${v.battery_pct}%)*\n\nHi ${v.customer_name || 'Rider'},\nYour vehicle *${v.code}* battery is below 20% (${v.battery_pct}% remaining).\n\n📍 Nearest Swap Station: *${v.zone || 'Gotri'} Swap Dock*\nPlease swap your battery at the nearest station to prevent ride interruption.`;
        await sendWhatsAppDirectMessage(v.mobile, text);
      }
    }
  } catch (err) {
    console.error('[RideAlerts] Error in alert cron cycle:', err.message);
  }
}

/**
 * Start Cron Engine (runs every 60 seconds)
 */
function startRideAlertsEngine(intervalSeconds = 60) {
  console.log(`🚀 [RideAlerts] Engine initialized. Checking active rides every ${intervalSeconds}s for WhatsApp reminders and overdue penalties...`);
  // Run once immediately
  checkActiveRidesAndSendAlerts().catch(() => {});
  // Schedule recurring interval
  return setInterval(() => {
    checkActiveRidesAndSendAlerts().catch(() => {});
  }, intervalSeconds * 1000);
}

function getConfiguredAlerts() {
  return [
    { id: 'start_30min', name: 'Reserved Ride 30-Min Reminder', trigger: '30 mins before scheduled start', channel: 'WhatsApp', status: 'Active' },
    { id: 'ride_started', name: 'Ride Started Confirmation', trigger: 'Immediately when ride begins', channel: 'WhatsApp', status: 'Active' },
    { id: 'end_1hr', name: 'Ride Ending Reminder (1 Hour)', trigger: '60 mins before scheduled end', channel: 'WhatsApp', status: 'Active' },
    { id: 'end_15min', name: 'Ride Ending Reminder (15 Mins)', trigger: '15 mins before end with extension options', channel: 'WhatsApp', status: 'Active' },
    { id: 'grace_period', name: 'Grace Period Window Alert', trigger: 'At scheduled end during grace window', channel: 'WhatsApp', status: 'Active' },
    { id: 'delay_penalty', name: 'Overdue Penalty Notice with OTP', trigger: 'Past grace period (1/10th of fare or zone rate/hr)', channel: 'WhatsApp', status: 'Active' },
    { id: 'battery_low', name: 'Vehicle Battery Low Warning', trigger: 'When vehicle battery falls below 20%', channel: 'WhatsApp', status: 'Active' }
  ];
}

module.exports = {
  startRideAlertsEngine,
  checkActiveRidesAndSendAlerts,
  resolveZoneGracePeriod,
  getConfiguredAlerts
};
