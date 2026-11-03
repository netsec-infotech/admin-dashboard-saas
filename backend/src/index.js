require('dotenv').config();
process.on('uncaughtException', (err) => console.error('Unhandled Exception:', err.message));
process.on('unhandledRejection', (reason) => console.error('Unhandled Rejection:', reason));
const { validateEnvironment } = require('./utils/envValidator');
validateEnvironment();

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-mobile', 'x-requested-with', 'Accept', 'x-api-key']
}));
app.options('*', cors());
app.use(express.json({ limit: '150mb' }));
app.use(express.urlencoded({ limit: '150mb', extended: true }));

app.use('/assets', express.static(path.join(__dirname, '../../frontend/public/assets')));
app.use('/assets', express.static(path.join(__dirname, '../../frontend/public')));
// Multi-path static uploads resolution (VPS, root, local dev)
const candidateUploadDirs = [
  path.join(__dirname, '../uploads'),
  path.join(__dirname, '../public/uploads'),
  path.join(process.cwd(), 'uploads'),
  path.join(process.cwd(), 'backend/uploads'),
  '/home/evegah/saas-full/backend/uploads',
  '/home/evegah/saas-full/backend/public/uploads',
];

candidateUploadDirs.forEach(dir => {
  try {
    if (fs.existsSync(dir)) {
      app.use('/uploads', express.static(dir));
      app.use('/api/uploads', express.static(dir));
    }
  } catch (_) {}
});

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Fast 404 handler for missing uploads so browser never hangs
app.use('/uploads', (req, res) => {
  res.status(404).send('Upload not found');
});
app.use('/api/uploads', (req, res) => {
  res.status(404).send('Upload not found');
});

// Direct filename resolver for media requested without /uploads/ prefix
app.get('/:filename([a-zA-Z0-9_.-]+\.(?:jpg|jpeg|png|webp|gif|pdf|svg))', (req, res, next) => {
  const filename = req.params.filename;
  for (const dir of candidateUploadDirs) {
    try {
      const filePath = path.join(dir, filename);
      if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
      }
    } catch (_) {}
  }
  next();
});

// Public mobile endpoint for dynamic app sliders
app.get('/api/app-sliders', async (req, res) => {
  try {
    const db = require('./db');
    const result = await db.query("SELECT values FROM settings WHERE category = 'app_slider' LIMIT 1");
    if (result.rows.length > 0 && result.rows[0].values) {
      let d = result.rows[0].values;
      if (d && d.value && typeof d.value === 'object') {
        d = { ...d, ...d.value };
      }
      const home_sliders = Array.isArray(d.home_sliders) ? d.home_sliders : [];
      const rent_sliders = Array.isArray(d.rent_sliders) ? d.rent_sliders : [];
      return res.json({
        status: 'success',
        data: {
          ...d,
          home_sliders,
          rent_sliders,
          value: { home_sliders, rent_sliders }
        }
      });
    }
    const defaultSliders = {
      home_sliders: [
        {
          id: 'home-1',
          screen: 'home',
          tag: 'SPECIAL OFFER',
          title: 'Ride More, Pay Less',
          lines: ['Hello,', 'Riders'],
          sub: 'Unlimited swaps and zero emissions',
          cta: 'Rent EVs',
          bg: '',
          front: '',
          active: true,
        },
        {
          id: 'home-2',
          screen: 'home',
          tag: 'BEST VALUE',
          title: 'Right Price EV Fleet',
          lines: ['Rent your EV', 'for the', 'Right price'],
          sub: 'Transparent rates starting at ₹149/day',
          cta: 'Rent EV',
          bg: '',
          front: '',
          active: true,
        },
        {
          id: 'home-3',
          screen: 'home',
          tag: 'SMART COMMUTE',
          title: 'Smart Way to Ride',
          lines: ['smart way', 'to ride'],
          sub: 'zero deposit plan options',
          cta: 'Go With EV',
          bg: '',
          front: '',
          active: true,
        },
      ],
      rent_sliders: [
        {
          id: 'rent-1',
          screen: 'rent',
          tag: 'DAILY COMMUTE',
          title: 'Smart Rides for Corporate Pros',
          lines: ['Smart Rides for', 'Corporate Pros'],
          sub: 'Zero petrol. 100% savings.',
          cta: 'Rent EV',
          bg: '',
          front: '',
          active: true,
        },
        {
          id: 'rent-2',
          screen: 'rent',
          tag: 'CAMPUS RIDES',
          title: 'College Travel, Made Effortless',
          lines: ['College Travel,', 'Made Effortless'],
          sub: 'Special student hourly rates.',
          cta: 'Book Now',
          bg: '',
          front: '',
          active: true,
        },
        {
          id: 'rent-3',
          screen: 'rent',
          tag: 'DELIVERY FLEET',
          title: 'Earn More With Evegah EV Fleet',
          lines: ['Earn More With', 'Evegah EV Fleet'],
          sub: 'High range & zero maintenance.',
          cta: 'Start Earning',
          bg: '',
          front: '',
          active: true,
        },
      ],
    };
    res.json({ status: 'success', data: defaultSliders });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Routes
app.use('/api/stats', require('./routes/stats'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/today-summary', require('./routes/todaySummary'));
app.use('/api/knowledge', require('./routes/knowledge'));
app.use('/api/batteries', require('./routes/batteries'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/renters', require('./routes/renters'));
app.use('/api/kyc', require('./routes/kyc'));
app.use('/api/zones', require('./routes/zones'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/users', require('./routes/users'));
app.use('/api/roles', require('./routes/roles'));
app.use('/api/vehicles', require('./routes/vehicleRemote'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/coupons', require('./routes/coupons'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/audit-logs', require('./routes/auditLogs'));
app.use('/api/maintenance', require('./routes/maintenance'));
app.use('/api/referral', require('./routes/referral'));
app.use('/api/wallet', require('./routes/wallet'));
app.use('/api/rides', require('./routes/rides'));
app.use('/api/retain-rider', require('./routes/rides'));
app.use('/api/payments/payu', require('./routes/payu'));
app.use('/api/payments/phonepe', require('./routes/phonepe'));
app.use('/api/phonepe', require('./routes/phonepe'));
app.use('/api/payments/icici', require('./routes/icici'));
app.use('/api/icici', require('./routes/icici'));
app.use('/api/payments/history', require('./routes/paymentHistory'));
app.use('/api/payments/cash-collection', (req, res, next) => {
  req.url = '/cash-collection';
  return require('./routes/paymentHistory')(req, res, next);
});
app.use('/api/receipts', require('./routes/receipts'));
app.use('/api/receipt', require('./routes/receipts'));
app.use('/receipt', require('./routes/receipts'));
app.use('/api/franchises', require('./routes/franchises'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/iot', require('./routes/iot'));
app.use('/api/payments/gateways', require('./routes/gateways'));
app.use('/api/payments/config', (req, res, next) => {
  req.url = '/config';
  return require('./routes/gateways')(req, res, next);
});

// Version 1.5 production feature routes
app.use('/api/reconciliation', require('./routes/reconciliation'));
app.use('/api/franchise-settlements', require('./routes/franchiseSettlements'));
app.use('/api/swap-stations', require('./routes/swapStations'));
app.use('/api/messaging', require('./routes/messaging'));
app.use('/api/backups', require('./routes/backups'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/sos', require('./routes/sos'));
app.use('/api/domains', require('./routes/domains'));
app.use('/api/fleet-documents', require('./routes/fleetDocuments'));



// Helper to identify maintenance service centers
const isServiceCenterZone = (z) => {
  const t = (z.type || '').toLowerCase();
  const n = (z.name || '').toLowerCase();
  return t.includes('service') || t.includes('maintenance') || n.includes('service center');
};

// API endpoints for the Rider App (Consumer Rental Zones only)
app.get('/api/v1/getzoneDetailWithBikeCountList', async (req, res) => {
  try {
    const [zonesRes, bikeCountsRes] = await Promise.all([
      require('./db').query('SELECT * FROM zones ORDER BY created_at DESC'),
      require('./db').query("SELECT zone, COUNT(*)::int as count FROM vehicles WHERE LOWER(vehicle_status) = 'available' GROUP BY zone").catch(() => ({ rows: [] }))
    ]);

    const bikeCountsMap = {};
    bikeCountsRes.rows.forEach(r => {
      if (r.zone) bikeCountsMap[r.zone.trim().toLowerCase()] = r.count;
    });

    // Exclude Service Zones and Maintenance Hubs from Rider Mobile App
    const consumerZones = zonesRes.rows.filter(z => !isServiceCenterZone(z));

    const formattedZones = consumerZones.map((z) => {
      let pts = [];
      try {
        pts = Array.isArray(z.points) ? z.points : JSON.parse(z.points || '[]');
      } catch(e) {}
      
      let center = { lat: 28.6315, lng: 77.2197 };
      if (pts.length > 0) {
        let sumLat = 0, sumLng = 0;
        pts.forEach(p => { sumLat += p.lat; sumLng += p.lng; });
        center = { lat: sumLat / pts.length, lng: sumLng / pts.length };
      }
      
      const zNameKey = (z.name || '').trim().toLowerCase();
      const bikeCount = bikeCountsMap[zNameKey] || 0;
      
      return {
        id: z.id,
        name: z.name,
        code: z.code,
        locality: z.locality,
        city: z.city,
        state: z.state,
        country: z.country,
        type: z.type,
        address: z.address || z.locality || `${z.name}, Vadodara, Gujarat`,
        image_url: z.image_url || '',
        phone: z.phone || z.contact_number || '+91 98765 43210',
        map_link: z.map_link || `https://maps.google.com/?q=${encodeURIComponent(z.name + ', Vadodara')}`,
        open_time: z.open_time || '06:00 AM',
        close_time: z.close_time || '11:00 PM',
        is_24_hours: z.is_24_hours ?? true,
        bike_count: bikeCount,
        available_vehicles: bikeCount,
        center: center,
        points: pts,
        pricing: z.pricing || {}
      };
    });
    res.json({
      status: 'success',
      data: formattedZones
    });
  } catch (err) {
    console.error('Failed to get live zones for Rider App:', err);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.post('/api/qrDecrypted', (req, res) => {
  const { qrString, lockNumber } = req.body;
  const resolvedLock = lockNumber || qrString || 'LCK-EVE-5678';
  res.json({
    status: 'success',
    data: [
      {
        lockNumber: resolvedLock,
        status: 'decrypted'
      }
    ]
  });
});

let globalBanners = [
  "assets/Rakshabandhan.png",
  "assets/Offer.png",
  "assets/Rent EV.png",
  "assets/Ride More.png"
];

app.get('/api/banners', (req, res) => {
  res.json({
    status: 'success',
    data: globalBanners
  });
});

app.post('/api/banners', (req, res) => {
  const { banners, banner_url, image_url, image } = req.body;
  if (Array.isArray(banners) && banners.length > 0) {
    globalBanners = banners;
  } else {
    const newImg = banner_url || image_url || image;
    if (newImg) {
      globalBanners.unshift(newImg);
    }
  }
  res.json({
    status: 'success',
    data: globalBanners
  });
});

// Health check & Configured Alerts endpoints
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));
app.get('/api/alerts/configured', (req, res) => {
  try {
    const { getConfiguredAlerts } = require('./cron/rideAlertCron');
    res.json({ status: 'success', data: getConfiguredAlerts() });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Evegah Backend running on http://localhost:${PORT}`);

  // Start WhatsApp Ride Alerts & Overdue Penalty Engine
  try {
    const { startRideAlertsEngine } = require('./cron/rideAlertCron');
    startRideAlertsEngine(60);
  } catch (err) {
    console.error('Could not start Ride Alerts Cron:', err.message);
  }
});
