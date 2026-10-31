const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const clean = (val) => (val !== undefined && val !== null ? String(val).trim() : '');

// Apply authentication to all attendance endpoints
router.use(authenticate);

// 1. GET /api/attendance/logs - Retrieve attendance history with filters
router.get('/logs', async (req, res) => {
  try {
    const { employee_name, user_id, zone, date, status } = req.query;
    let query = 'SELECT * FROM attendance_logs WHERE 1=1';
    const params = [];

    if (employee_name) {
      params.push(`%${employee_name}%`);
      query += ` AND employee_name ILIKE $${params.length}`;
    }

    if (user_id) {
      params.push(user_id);
      query += ` AND user_id::text = $${params.length}`;
    }

    if (zone && zone !== 'All Zones') {
      params.push(`%${zone}%`);
      query += ` AND zone ILIKE $${params.length}`;
    }

    if (status && status !== 'All') {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    if (date) {
      params.push(date);
      query += ` AND clock_in_time::date = $${params.length}::date`;
    }

    query += ' ORDER BY clock_in_time DESC';
    const result = await db.query(query, params);

    res.json({
      status: 'success',
      data: result.rows,
      count: result.rows.length,
    });
  } catch (err) {
    console.error('Fetch attendance error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to retrieve attendance logs: ' + err.message });
  }
});

// 2. GET /api/attendance/current - Get open clock-in session for employee
router.get('/current', async (req, res) => {
  try {
    const { employee_name, user_id } = req.query;
    if (!employee_name && !user_id) {
      return res.status(400).json({ status: 'error', message: 'employee_name or user_id required' });
    }

    let query = "SELECT * FROM attendance_logs WHERE status = 'clocked_in'";
    const params = [];

    if (user_id) {
      params.push(user_id);
      query += ` AND user_id::text = $${params.length}`;
    } else {
      params.push(employee_name);
      query += ` AND employee_name ILIKE $${params.length}`;
    }

    query += ' ORDER BY clock_in_time DESC LIMIT 1';
    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.json({ status: 'success', activeSession: null });
    }

    res.json({ status: 'success', activeSession: result.rows[0] });
  } catch (err) {
    console.error('Fetch current attendance session error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to check current attendance session' });
  }
});

// Known Zone Hub Coordinates in Vadodara
const ZONE_HUB_COORDINATES = {
  'gotri': { lat: 22.3168, lng: 73.1534, name: 'Gotri Zone Hub' },
  'alkapuri': { lat: 22.3106, lng: 73.1705, name: 'Alkapuri Zone Hub' },
  'manjalpur': { lat: 22.2612, lng: 73.1947, name: 'Manjalpur Zone Hub' },
  'waghodia': { lat: 22.2986, lng: 73.2389, name: 'Waghodia Zone Hub' },
  'kpgu': { lat: 22.3100, lng: 73.1800, name: 'KPGU Zone Hub' },
  'aatapi': { lat: 22.2800, lng: 73.2000, name: 'Aatapi Zone Hub' },
};

function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

function validateGeofence(userLat, userLng, zoneName) {
  if (userLat === null || userLat === undefined || userLng === null || userLng === undefined || isNaN(userLat) || isNaN(userLng)) {
    return {
      verified: false,
      distanceMeters: null,
      reason: 'GPS coordinates unavailable / location permission denied'
    };
  }

  const cleanZone = String(zoneName || '').toLowerCase();
  let hub = null;
  for (const [key, coord] of Object.entries(ZONE_HUB_COORDINATES)) {
    if (cleanZone.includes(key)) {
      hub = coord;
      break;
    }
  }

  if (!hub) hub = ZONE_HUB_COORDINATES.gotri;

  const dist = calculateDistanceMeters(userLat, userLng, hub.lat, hub.lng);
  const MAX_GEOFENCE_RADIUS_METERS = 1000; // 1 km radius for hub geofence

  const verified = dist <= MAX_GEOFENCE_RADIUS_METERS;
  return {
    verified,
    distanceMeters: dist,
    hubName: hub.name,
    reason: verified 
      ? `Verified within ${dist}m of ${hub.name}` 
      : `Geofence breach: ${dist}m away from ${hub.name} (exceeds ${MAX_GEOFENCE_RADIUS_METERS}m limit)`
  };
}

// 3. POST /api/attendance/clock-in - Idempotent Clock-In with Geofence & Identity Verification
async function handleClockIn(req, res) {
  try {
    const {
      user_id,
      employee_id,
      employee_name,
      employee_role,
      zone,
      shift,
      lat,
      lng,
      latitude,
      longitude,
      notes,
    } = req.body;

    const actualLat = lat !== undefined ? lat : latitude;
    const actualLng = lng !== undefined ? lng : longitude;
    const actualUserId = user_id || employee_id;

    if (!employee_name) {
      return res.status(400).json({ status: 'error', message: 'Employee name is required.' });
    }

    // Identity verification: Derived securely from authenticated JWT claims
    const authCallerId = req.userId;
    const authCallerRole = req.userRole;
    if (authCallerId && actualUserId && String(authCallerId) !== String(actualUserId)) {
      // Allow only Admins or Platform Admins to clock-in on behalf of another employee
      const isAdmin = String(authCallerRole).toLowerCase().includes('admin');
      if (!isAdmin) {
        return res.status(403).json({
          status: 'error',
          message: 'Forbidden: Employees cannot submit attendance on behalf of another employee.'
        });
      }
    }

    // Idempotency: Check if an open clock-in session already exists for this employee today
    const checkQuery = actualUserId
      ? "SELECT * FROM attendance_logs WHERE (user_id::text = $1 OR employee_id = $1) AND status = 'clocked_in' LIMIT 1"
      : "SELECT * FROM attendance_logs WHERE employee_name ILIKE $1 AND status = 'clocked_in' LIMIT 1";

    const existingOpen = await db.query(checkQuery, [actualUserId || employee_name]);
    if (existingOpen.rows.length > 0) {
      return res.json({
        status: 'success',
        message: 'Employee is already clocked in.',
        data: existingOpen.rows[0],
        log: {
          ...existingOpen.rows[0],
          validation_outcome: existingOpen.rows[0].notes || 'Existing verified session',
          distance_from_hub_m: 50,
        }
      });
    }

    // Geofence validation
    const parsedLat = actualLat !== null && actualLat !== undefined && actualLat !== '' ? parseFloat(actualLat) : null;
    const parsedLng = actualLng !== null && actualLng !== undefined && actualLng !== '' ? parseFloat(actualLng) : null;
    const geofenceResult = validateGeofence(parsedLat, parsedLng, zone || 'Gotri Zone Hub');

    const combinedNotes = [
      notes ? String(notes).trim() : null,
      geofenceResult.reason
    ].filter(Boolean).join(' | ');

    const isUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str || '');
    const validDbUserId = isUUID(actualUserId) ? actualUserId : null;

    const insertRes = await db.query(
      `INSERT INTO attendance_logs (
        user_id, employee_id, employee_name, employee_role, zone, shift,
        clock_in_time, status, geofence_verified, clock_in_lat, clock_in_lng, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), 'clocked_in', $7, $8, $9, $10)
      RETURNING *`,
      [
        validDbUserId,
        clean(employee_id || `EMP-${Date.now().toString().slice(-4)}`),
        clean(employee_name),
        clean(employee_role || 'Operations Staff'),
        clean(zone || 'Gotri Zone Hub'),
        clean(shift || 'Morning Shift (08:00 AM – 04:00 PM)'),
        geofenceResult.verified,
        parsedLat,
        parsedLng,
        combinedNotes,
      ]
    );

    res.status(200).json({
      status: 'success',
      message: 'Clock-in recorded successfully',
      geofence: geofenceResult,
      data: insertRes.rows[0],
      log: {
        ...insertRes.rows[0],
        validation_outcome: geofenceResult.reason,
        distance_from_hub_m: geofenceResult.distanceMeters,
      }
    });
  } catch (err) {
    console.error('Clock-in error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to record clock-in: ' + err.message });
  }
}

router.post('/clock-in', handleClockIn);
router.post('/check-in', handleClockIn);

// 4. POST /api/attendance/clock-out - Clock-Out & Compute Elapsed Shift
router.post('/clock-out', async (req, res) => {
  try {
    const { id, user_id, employee_name, lat, lng, notes } = req.body;

    let targetRecord = null;
    if (id) {
      const resById = await db.query('SELECT * FROM attendance_logs WHERE id::text = $1 LIMIT 1', [id]);
      targetRecord = resById.rows[0];
    } else {
      const checkQuery = user_id
        ? "SELECT * FROM attendance_logs WHERE user_id::text = $1 AND status = 'clocked_in' ORDER BY clock_in_time DESC LIMIT 1"
        : "SELECT * FROM attendance_logs WHERE employee_name ILIKE $1 AND status = 'clocked_in' ORDER BY clock_in_time DESC LIMIT 1";
      const resByEmp = await db.query(checkQuery, [user_id || employee_name]);
      targetRecord = resByEmp.rows[0];
    }

    if (!targetRecord) {
      return res.status(404).json({
        status: 'error',
        message: 'No active clock-in session found to clock out from.',
      });
    }

    // Identity verification on clock-out derived securely from authenticated JWT claims
    const authCallerId = req.userId;
    const authCallerRole = req.userRole;
    if (authCallerId && targetRecord.user_id && String(authCallerId) !== String(targetRecord.user_id)) {
      const isAdmin = String(authCallerRole).toLowerCase().includes('admin');
      if (!isAdmin) {
        return res.status(403).json({
          status: 'error',
          message: 'Forbidden: Employees cannot clock out on behalf of another employee.'
        });
      }
    }

    // Calculate elapsed minutes
    const now = new Date();
    const clockInDate = new Date(targetRecord.clock_in_time);
    const elapsedMinutes = Math.max(0, Math.round((now.getTime() - clockInDate.getTime()) / (1000 * 60)));

    const updateRes = await db.query(
      `UPDATE attendance_logs
       SET clock_out_time = NOW(),
           elapsed_minutes = $1,
           status = 'clocked_out',
           clock_out_lat = $2,
           clock_out_lng = $3,
           notes = CASE WHEN $4 != '' THEN $4 ELSE notes END
       WHERE id = $5
       RETURNING *`,
      [
        elapsedMinutes,
        lat ? parseFloat(lat) : null,
        lng ? parseFloat(lng) : null,
        clean(notes || ''),
        targetRecord.id,
      ]
    );

    res.json({
      status: 'success',
      message: 'Clock-out recorded successfully',
      data: updateRes.rows[0],
    });
  } catch (err) {
    console.error('Clock-out error:', err);
    res.status(500).json({ status: 'error', message: 'Failed to record clock-out: ' + err.message });
  }
});

// Alias for BMS mobile check-out
router.post('/check-out', (req, res, next) => {
  if (req.body.latitude !== undefined && req.body.lat === undefined) req.body.lat = req.body.latitude;
  if (req.body.longitude !== undefined && req.body.lng === undefined) req.body.lng = req.body.longitude;
  if (req.body.employee_id && !req.body.user_id) req.body.user_id = req.body.employee_id;
  req.url = '/clock-out';
  return router.handle(req, res, next);
});

module.exports = router;
