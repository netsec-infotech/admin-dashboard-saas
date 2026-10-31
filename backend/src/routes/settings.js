const express = require('express');
const router = express.Router();
const db = require('../db');

// Default initial settings for all system categories
const DEFAULT_SETTINGS = {
  general: {
    zone_name: 'Gotri Zone',
    time_zone: '(UTC +05:30) Asia/Kolkata',
    date_format: 'DD MMM YYYY (31 May 2024)',
    time_format: '12 Hours (AM/PM)',
    currency: 'INR (₹) - Indian Rupee',
    auto_approve_registrations: true,
    email_notifications: true,
    sms_notifications: true,
    maintenance_mode: false,
    allow_bulk_operations: true,
    items_per_page: 25,
    default_language: 'English',
    map_provider: 'Google Maps',
    session_timeout: '30 Minutes',
    min_rental_duration: 1,
    max_rental_duration: 30,
    late_return_grace_period: 15,
    security_deposit: 500.00
  },
  ride_rental: {
    allow_ride_booking: true,
    min_ride_distance: 1.0,
    max_ride_distance: 100,
    ride_cancellation_limit: '15 Minutes',
    auto_complete_ride: true,
    ride_grace_time: 10,
    allow_rentals: true,
    min_rental_duration_hours: 1,
    max_rental_duration_days: 30,
    security_deposit_refundable: 500.00,
    advance_payment: 'No Advance',
    auto_extend_rental: true,
    base_fare: 20.00,
    per_km_charge: 8.00,
    plan_rate_type: 'Per Day',
    late_return_fee: 50.00,
    tax_percentage: 18,
    renter_wallet_deduction: true,
    operating_hours_ride_from: '06:00 AM',
    operating_hours_ride_to: '11:00 PM',
    operating_hours_rental_from: '06:00 AM',
    operating_hours_rental_to: '10:00 PM',
    weekly_off: ['Sun'],
    pickup_outside_zone: false,
    drop_outside_zone: false,
    extended_coverage_fee: 30.00,
    allow_multiple_vehicles: true,
    enable_rating_reviews: true,
    cleaner_fee: 100.00,
    toll_charges: 'Reimburse',
    smoking_penalty: 200.00
  },
  payments: {
    gateways: [
      {
        id: 'payu',
        name: 'PayU India',
        provider: 'payu',
        active: true,
        key_id: 'WTi3jH',
        key_secret: '9dascniXrfdMW22AJBbhmh2C7kuBibwb',
        client_id: '8ecdb3a31264fb5b8c0ef026846a904d9aefcef39acdfb55d61225cdc06eb543',
        client_secret: 'd9c50d234985c580d2ac5ea6891cfb5d7f8f12dadb5b5afb6cc565b1b28ad7e4',
        environment: 'test',
        notes: 'PayU India Hosted Checkout, Cards, NetBanking, UPI'
      },
      {
        id: 'icici',
        name: 'ICICI Bank UPI',
        provider: 'icici',
        active: true,
        key_id: '613268',
        key_secret: 'wnHtmdq9q1Zibc05sNX1wzMW1W62K7Lp',
        vpa: 'EVEGAHUAT@icici',
        payee_name: 'Evegah',
        environment: 'production',
        notes: 'Direct Merchant UPI QR & Intent Launch'
      }
    ],
    primary_gateway: 'payu',
    default_payment_method: 'UPI',
    payment_capture: true,
    partial_payment: true,
    payment_retry: '3 Attempts',
    payment_timeout: '10 Minutes',
    auto_refund: true,
    refund_approval: true,
    refund_limit: 500.00,
    refund_processing_time: '3 - 5 Business Days',
    gst_applicable: true,
    gst_percentage: 18,
    service_fee: 10.00,
    convenience_fee: 5.00,
    methods_upi: true,
    methods_card: true,
    methods_netbanking: true,
    methods_wallets: true,
    methods_cash: false,
    payu_active: true,
    payu_key_id: 'WTi3jH',
    payu_key_secret: '9dascniXrfdMW22AJBbhmh2C7kuBibwb',
    payu_client_id: '8ecdb3a31264fb5b8c0ef026846a904d9aefcef39acdfb55d61225cdc06eb543',
    payu_client_secret: 'd9c50d234985c580d2ac5ea6891cfb5d7f8f12dadb5b5afb6cc565b1b28ad7e4',
    payu_env: 'test'
  },
  notifications: {
    channels_email: true,
    channels_sms: true,
    channels_inapp: true,
    quiet_hours_enabled: true,
    quiet_hours_from: '10:00 PM',
    quiet_hours_to: '07:00 AM',
    quiet_hours_timezone: '(UTC +05:30) Asia/Kolkata',
    prefs_ride_bookings: { email: true, sms: true, inapp: true },
    prefs_rental_bookings: { email: true, sms: true, inapp: true },
    prefs_payments: { email: true, sms: false, inapp: true },
    prefs_payouts: { email: true, sms: false, inapp: true },
    prefs_battery_alerts: { email: false, sms: true, inapp: true },
    prefs_vehicle_alerts: { email: true, sms: true, inapp: true },
    prefs_system_alerts: { email: true, sms: false, inapp: true },
    prefs_promotions: { email: false, sms: false, inapp: true }
  },
  battery_swapping: {
    soc_swap_threshold: 20,
    soc_alert_threshold: 15,
    max_cycles_limit: 500,
    temp_alert_threshold: 45,
    auto_station_allocation: true,
    require_swap_auth: true
  },
  documents: {
    require_aadhar: true,
    require_dl: true,
    require_pan: false,
    auto_verify_documents: true,
    max_file_size: 5,
    allowed_formats: 'PDF, PNG, JPG'
  },
  security: {
    two_factor_auth: false,
    strong_password_policy: true,
    max_login_attempts: 5,
    session_timeout_seconds: 1800,
    allow_concurrent_logins: false,
    refund_auth_mobile: '8128251172',
    refund_auth_password: 'Qatar@2022'
  },
  system: {
    system_time_zone: '(UTC +05:30) Asia/Kolkata',
    system_date_format: 'DD-MM-YYYY',
    system_time_format: '12 Hour (AM/PM)',
    system_language: 'English',
    system_automatic_updates: true,
    system_update_channel: 'Stable',
    system_last_checked: 'Today, 08:30 AM',
    system_version: 'v2.4.0',
    system_info: {
      server_name: 'evg-server-01',
      web_server: 'Nginx 1.24.0',
      environment: 'Production',
      php_version: '8.2.12',
      total_storage: 256,
      used_storage: 128,
      database_version: 'PostgreSQL 16.0',
      active_users: 24,
      active_sessions: 37,
      uptime: '15 Days, 6 Hours'
    },
    auto_backup: true,
    backup_frequency: 'Daily',
    last_backup: 'Today, 02:00 AM',
    last_backup_status: 'Success',
    backup_size: '2.4 GB'
  },
  app_slider: {
    home_sliders: [
      {
        id: 'home-1',
        screen: 'home',
        tag: 'Slider 1',
        title: 'Ride Smarter, Go Farther',
        lines: ['Ride Smarter,', 'Go Farther'],
        sub: 'High-performance electric vehicles designed for daily city commute.',
        cta: 'Rent EV Now',
        bg: '',
        front: '',
        active: true,
      },
      {
        id: 'home-2',
        screen: 'home',
        tag: 'Slider 2',
        title: 'Swap & Go in 60s',
        lines: ['Swap & Go', 'in 60s'],
        sub: 'Never wait for charging. Fast automated battery swapping stations.',
        cta: 'Find Station',
        bg: '',
        front: '',
        active: true,
      },
      {
        id: 'home-3',
        screen: 'home',
        tag: 'Slider 3',
        title: 'Zero Emission Mobility',
        lines: ['Zero Emission', 'Mobility'],
        sub: 'Reduce carbon footprint with certified green energy battery swaps.',
        cta: 'Explore Fleet',
        bg: '',
        front: '',
        active: true,
      },
    ],
    rent_sliders: [
      {
        id: 'rent-1',
        screen: 'rent',
        tag: 'Slider 1',
        title: 'Rent at L&T Knowledge City',
        lines: ['Rent at L&T', 'Knowledge City'],
        sub: 'Instant unlock at Main Gate hub. Smooth ride to office.',
        cta: 'Book This Zone',
        bg: '',
        front: '',
        active: true,
      },
      {
        id: 'rent-2',
        screen: 'rent',
        tag: 'Slider 2',
        title: 'Parul University Campus Fleet',
        lines: ['Parul University', 'Campus Fleet'],
        sub: 'Zero deposit student & staff plans. Swap batteries inside campus.',
        cta: 'Select Campus Zone',
        bg: '',
        front: '',
        active: true,
      },
      {
        id: 'rent-3',
        screen: 'rent',
        tag: 'Slider 3',
        title: 'Zepto Dark Store Hub',
        lines: ['Zepto Dark', 'Store Hub'],
        sub: 'High payload commercial EVs. Unlimited battery swaps.',
        cta: 'Start Earning',
        bg: '',
        front: '',
        active: true,
      },
    ],
  }
};

// Seed default settings on server startup if not already present
(async () => {
  try {
    for (const [category, values] of Object.entries(DEFAULT_SETTINGS)) {
      await db.query(`
        INSERT INTO settings (category, values)
        VALUES ($1, $2)
        ON CONFLICT (category) DO NOTHING
      `, [category, JSON.stringify(values)]);
    }
  } catch (err) {
    console.error('Settings DB initialization notice:', err.message);
  }
})();

// GET all settings
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT category, values FROM settings');
    const settingsObj = {};
    
    // Populate with defaults first
    Object.assign(settingsObj, DEFAULT_SETTINGS);

    // Group settings by category from database, merging with defaults
    result.rows.forEach(row => {
      settingsObj[row.category] = { ...(DEFAULT_SETTINGS[row.category] || {}), ...row.values };
    });

    res.json({ status: 'success', data: settingsObj });
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// In-memory refund OTP store with 5-minute TTL
const refundOtpStore = new Map(); // key: mobile -> { otp, expiresAt }

// POST /api/settings/refund-auth/send-otp - Dispatch OTP to configured mobile
router.post('/refund-auth/send-otp', async (req, res) => {
  try {
    const sRes = await db.query("SELECT values FROM settings WHERE category = 'security' LIMIT 1").catch(() => ({ rows: [] }));
    const sec = sRes.rows[0]?.values || DEFAULT_SETTINGS.security;
    const mobile = (sec.refund_auth_mobile || '8128251172').trim();

    // 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + 5 * 60 * 1000;
    refundOtpStore.set(mobile, { otp, expiresAt });

    // Send WhatsApp Direct Message
    const { sendWhatsAppDirectMessage } = require('../utils/whatsapp');
    const maskedMobile = mobile.length >= 10 ? mobile.slice(0, 2) + '******' + mobile.slice(-2) : mobile;
    
    await sendWhatsAppDirectMessage({
      mobile,
      message: `🔐 *Evegah Security Authorization*\n\nYour OTP for Security Deposit Refund approval is: *${otp}*.\n\nValid for 5 minutes. Do not share this OTP with anyone.`
    }).catch(err => console.warn('Could not dispatch WhatsApp OTP:', err.message));

    console.log(`[RefundAuth] OTP generated for ${mobile}: ${otp}`);

    res.json({
      status: 'success',
      message: `OTP sent successfully to authorized mobile (+91 ${maskedMobile})`,
      mobile: maskedMobile,
      debug_otp: otp
    });
  } catch (err) {
    console.error('Error sending refund OTP:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST /api/settings/refund-auth/verify - Verify OTP or Master Password
router.post('/refund-auth/verify', async (req, res) => {
  try {
    const { method, otp, password } = req.body;
    const sRes = await db.query("SELECT values FROM settings WHERE category = 'security' LIMIT 1").catch(() => ({ rows: [] }));
    const sec = sRes.rows[0]?.values || DEFAULT_SETTINGS.security;
    const configuredMobile = (sec.refund_auth_mobile || '8128251172').trim();
    const configuredPassword = (sec.refund_auth_password || 'Qatar@2022').trim();

    if (method === 'otp') {
      if (!otp) return res.status(400).json({ status: 'error', message: 'Please enter the 6-digit OTP.' });
      const record = refundOtpStore.get(configuredMobile);
      if (!record) {
        return res.status(400).json({ status: 'error', message: 'No OTP requested or OTP has expired. Please click Send OTP.' });
      }
      if (Date.now() > record.expiresAt) {
        refundOtpStore.delete(configuredMobile);
        return res.status(400).json({ status: 'error', message: 'OTP has expired. Please request a new one.' });
      }
      if (String(otp).trim() !== record.otp) {
        return res.status(400).json({ status: 'error', message: 'Invalid OTP. Please check and try again.' });
      }
      refundOtpStore.delete(configuredMobile);
      const token = `REF-AUTH-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      return res.json({ status: 'success', verified: true, token, message: 'OTP verified successfully!' });
    } else if (method === 'password') {
      if (!password) return res.status(400).json({ status: 'error', message: 'Please enter the refund master password.' });
      if (String(password).trim() !== configuredPassword) {
        return res.status(400).json({ status: 'error', message: 'Incorrect Master Password. Access denied.' });
      }
      const token = `REF-AUTH-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      return res.json({ status: 'success', verified: true, token, message: 'Master Password verified successfully!' });
    } else {
      return res.status(400).json({ status: 'error', message: 'Invalid verification method specified.' });
    }
  } catch (err) {
    console.error('Error verifying refund authorization:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST /api/settings/upload-asset - Upload image asset for sliders / branding
router.post('/upload-asset', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const data = req.body.data || req.body.dataUrl;
    const name = req.body.name || req.body.filename;
    if (!data) {
      return res.status(400).json({ status: 'error', message: 'Asset data (base64) is required' });
    }

    const matches = data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer;
    let ext = 'png';
    if (matches && matches.length === 3) {
      const mime = matches[1];
      if (mime.includes('jpeg') || mime.includes('jpg')) ext = 'jpg';
      else if (mime.includes('webp')) ext = 'webp';
      else if (mime.includes('svg')) ext = 'svg';
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(data, 'base64');
    }

    const parsedPath = path.parse(name || 'asset');
    const rawName = parsedPath.name || 'asset';
    const cleanBaseName = rawName
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40);
    const requestedFileName = req.body.exactFileName || req.body.fileName;
    const fileName = requestedFileName || `slider_${Date.now()}_${cleanBaseName}.${ext}`;
    const targetDir = path.join(__dirname, '../../public/uploads');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    const targetPath = path.join(targetDir, fileName);
    fs.writeFileSync(targetPath, buffer);

    // Also replicate to backend/uploads if folder exists for direct uploads route fallback
    try {
      const altTargetDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(altTargetDir)) {
        fs.mkdirSync(altTargetDir, { recursive: true });
      }
      fs.writeFileSync(path.join(altTargetDir, fileName), buffer);
    } catch (_) {}

    // Also replicate to production cloud server so physical mobile devices on 4G/remote can load it immediately
    try {
      fetch('https://evegah.cloud/api/settings/upload-asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data,
          name: cleanBaseName
        })
      }).catch(() => {});
    } catch (_) {}

    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const host = req.get('host') || 'localhost:5000';
    const fullUrl = `${protocol}://${host}/api/uploads/${fileName}`;

    res.json({
      status: 'success',
      success: true,
      fileName,
      url: `/api/uploads/${fileName}`,
      fullUrl,
    });
  } catch (err) {
    console.error('Error uploading asset:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ──────────────────────────────────────────────────────────────
// Dedicated App Slider Management API: GET & POST /app_slider
// Allows dynamic updates for HomeScreen & RentScreen sliders
// ──────────────────────────────────────────────────────────────
router.get('/app_slider', async (req, res) => {
  try {
    const result = await db.query('SELECT values FROM settings WHERE category = $1 LIMIT 1', ['app_slider']);
    let sliderData = result.rows.length > 0 && result.rows[0].values ? result.rows[0].values : DEFAULT_SETTINGS.app_slider;

    if (sliderData && sliderData.value && typeof sliderData.value === 'object') {
      sliderData = { ...sliderData, ...sliderData.value };
    }

    if (!sliderData || typeof sliderData !== 'object') {
      sliderData = DEFAULT_SETTINGS.app_slider;
    }

    const normalizeUrl = (url) => {
      if (!url || typeof url !== 'string') return url;
      let s = url.trim();
      if (s.startsWith('/uploads/')) return `/api${s}`;
      if (s.includes('evegah.cloud/uploads/')) return s.replace('evegah.cloud/uploads/', 'evegah.cloud/api/uploads/');
      return s;
    };

    const normalizeSlideUrls = (slides) => {
      if (!Array.isArray(slides)) return [];
      return slides.map((s) => ({
        ...s,
        bg: normalizeUrl(s.bg),
        front: normalizeUrl(s.front),
      }));
    };

    const home_sliders = normalizeSlideUrls(Array.isArray(sliderData.home_sliders) ? sliderData.home_sliders : (DEFAULT_SETTINGS.app_slider.home_sliders || []));
    const rent_sliders = normalizeSlideUrls(Array.isArray(sliderData.rent_sliders) ? sliderData.rent_sliders : (DEFAULT_SETTINGS.app_slider.rent_sliders || []));

    const responsePayload = {
      ...sliderData,
      home_sliders,
      rent_sliders,
      value: {
        home_sliders,
        rent_sliders
      }
    };

    res.json({
      status: 'success',
      data: responsePayload
    });
  } catch (err) {
    console.error('Error fetching app_slider settings:', err);
    res.json({
      status: 'success',
      data: DEFAULT_SETTINGS.app_slider
    });
  }
});

const handleSaveSliderSettings = async (req, res) => {
  try {
    const payload = req.body || {};
    const val = (payload.value && typeof payload.value === 'object') ? payload.value : payload;

    // Fetch current settings to merge
    const currentRes = await db.query('SELECT values FROM settings WHERE category = $1 LIMIT 1', ['app_slider']);
    let existing = currentRes.rows.length > 0 && currentRes.rows[0].values ? currentRes.rows[0].values : DEFAULT_SETTINGS.app_slider;
    if (existing && existing.value && typeof existing.value === 'object') {
      existing = { ...existing, ...existing.value };
    }

    const home_sliders = Array.isArray(val.home_sliders)
      ? val.home_sliders
      : (Array.isArray(payload.home_sliders) ? payload.home_sliders : (existing.home_sliders || []));
    const rent_sliders = Array.isArray(val.rent_sliders)
      ? val.rent_sliders
      : (Array.isArray(payload.rent_sliders) ? payload.rent_sliders : (existing.rent_sliders || []));

    const updated = {
      ...existing,
      ...payload,
      home_sliders,
      rent_sliders,
      value: {
        home_sliders,
        rent_sliders
      }
    };

    await db.query(`
      INSERT INTO settings (category, values)
      VALUES ($1, $2)
      ON CONFLICT (category) DO UPDATE SET values = EXCLUDED.values
    `, ['app_slider', JSON.stringify(updated)]);

    res.json({
      status: 'success',
      message: 'App sliders updated successfully for HomeScreen and RentScreen',
      data: updated
    });
  } catch (err) {
    console.error('Error updating app_slider settings:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
};

router.post('/app_slider', handleSaveSliderSettings);
router.put('/app_slider', handleSaveSliderSettings);

// GET settings for a specific category
router.get('/:category', async (req, res) => {
  const { category } = req.params;
  try {
    const result = await db.query('SELECT values FROM settings WHERE category = $1 LIMIT 1', [category]);
    if (result.rows.length > 0 && result.rows[0].values) {
      return res.json({ status: 'success', data: result.rows[0].values });
    }
    if (DEFAULT_SETTINGS[category]) {
      return res.json({ status: 'success', data: DEFAULT_SETTINGS[category] });
    }
    res.status(404).json({ status: 'error', message: `Settings category '${category}' not found` });
  } catch (err) {
    console.error(`Error fetching settings for ${category}:`, err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// PUT settings for a specific category
router.put('/:category', async (req, res) => {
  const { category } = req.params;
  let newValues = req.body;

  try {
    const validCategories = ['general', 'ride_rental', 'payments', 'notifications', 'system', 'battery_swapping', 'documents', 'security', 'mobile_app', 'app_slider', 'mobile_app_settings'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ status: 'error', message: `Invalid settings category: ${category}` });
    }

    if (category === 'app_slider') {
      const val = (newValues.value && typeof newValues.value === 'object') ? newValues.value : newValues;
      const home_sliders = Array.isArray(val.home_sliders) ? val.home_sliders : (Array.isArray(newValues.home_sliders) ? newValues.home_sliders : []);
      const rent_sliders = Array.isArray(val.rent_sliders) ? val.rent_sliders : (Array.isArray(newValues.rent_sliders) ? newValues.rent_sliders : []);
      newValues = {
        ...newValues,
        home_sliders,
        rent_sliders,
        value: {
          home_sliders,
          rent_sliders
        }
      };
    }

    // Insert or update settings in database
    await db.query(`
      INSERT INTO settings (category, values)
      VALUES ($1, $2)
      ON CONFLICT (category) DO UPDATE SET values = EXCLUDED.values
    `, [category, JSON.stringify(newValues)]);

    res.json({ status: 'success', message: `Settings updated for category: ${category}`, data: newValues });
  } catch (err) {
    console.error(`Error saving settings for ${category}:`, err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
