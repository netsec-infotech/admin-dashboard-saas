// backend/scripts/test_batch4.js
// Automated Acceptance Test Suite for Batch 4: Scope Completion & Hardening
// Tests A-H: CO2 Calculations, Rider Insights, Attendance Geofencing, Security, IoT Device Lifecycle

const http = require('http');
const { signToken } = require('../src/middleware/auth');

const BASE_URL = 'http://localhost:5000';

// Pre-signed tokens for authorized and operator roles
const adminToken = signToken({ id: 1, email: 'himanshu@evegah.com', role: 'Super Admin', evegahRole: 'super_admin' });
const operator1Token = signToken({ id: 'EMP-B4-01', email: 'emp1@evegah.com', role: 'Operations Staff', evegahRole: 'employee' });
const operator2Token = signToken({ id: 'EMP-B4-02', email: 'emp2@evegah.com', role: 'Operations Staff', evegahRole: 'employee' });
const attackerToken = signToken({ id: 'EMP-ATTACKER-01', email: 'attacker@evegah.com', role: 'Operations Staff', evegahRole: 'employee' });

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };
    const req = http.request(
      url,
      {
        method,
        headers: reqHeaders,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, headers: res.headers, data: data ? JSON.parse(data) : {} });
          } catch (e) {
            resolve({ status: res.statusCode, headers: res.headers, raw: data });
          }
        });
      }
    );
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

const results = [];
function record(name, passed, detail) {
  results.push({ name, passed, detail });
  console.log(`${passed ? '✅ PASS' : '❌ FAIL'}: ${name}${detail ? ` (${detail})` : ''}`);
}

async function runTests() {
  console.log('====================================================');
  console.log('  STARTING BATCH 4 INTEGRATION ACCEPTANCE SUITE    ');
  console.log('====================================================\n');

  try {
    // ----------------------------------------------------
    // TEST 1: Environmental & CO2 Savings Aggregation
    // ----------------------------------------------------
    const co2Res = await request('GET', '/api/stats/co2');
    if (co2Res.status === 200 && co2Res.data.co2_saved_kg !== undefined) {
      const { co2_saved_kg, total_km, trees_equivalent, fuel_saved_litres, methodology } = co2Res.data;
      const expectedCo2 = parseFloat((total_km * 0.095).toFixed(2));
      const match = Math.abs(co2_saved_kg - expectedCo2) < 0.1;
      record(
        '1. CO2 Savings Aggregation & ARAI/BEE Standard Methodology',
        match && methodology?.factor_ice_co2_kg_per_km === 0.095,
        `Total KM: ${total_km}, CO2: ${co2_saved_kg} kg, Trees: ${trees_equivalent}, Litres: ${fuel_saved_litres}`
      );
    } else {
      record('1. CO2 Savings Aggregation', false, `Status: ${co2Res.status}`);
    }

    // ----------------------------------------------------
    // TEST 2: Rider Insights Calculation
    // ----------------------------------------------------
    const riderRes = await request('GET', '/api/renters/stats');
    if (riderRes.status === 200 && riderRes.data.co2Savings !== undefined) {
      record(
        '2. Live Rider Insights Metrics',
        true,
        `Rider CO2: ${riderRes.data.co2Savings} kg, Active Renters: ${riderRes.data.activeRenters}`
      );
    } else {
      record('2. Live Rider Insights Metrics', false, `Status: ${riderRes.status}`);
    }

    // ----------------------------------------------------
    // TEST 3: Attendance Check-in with Valid Geofence Coordinates
    // ----------------------------------------------------
    const validCheckInRes = await request(
      'POST',
      '/api/attendance/check-in',
      {
        employee_id: 'EMP-B4-01',
        employee_name: 'Vikram Joshi',
        hub_id: 'HUB-GOTRI',
        latitude: 22.3160, // Gotri Hub coordinates
        longitude: 73.1510,
        battery_level: 88
      },
      { Authorization: `Bearer ${operator1Token}` }
    );
    const validGeofence = validCheckInRes.status === 200 && validCheckInRes.data.log?.geofence_verified === true;
    record(
      '3. Attendance Check-in with Valid Hub Geofence',
      validGeofence,
      `Outcome: ${validCheckInRes.data?.log?.validation_outcome || 'none'}, Distance: ${validCheckInRes.data?.log?.distance_from_hub_m}m`
    );

    // ----------------------------------------------------
    // TEST 4: Attendance Geofence Breach (Out of Radius)
    // ----------------------------------------------------
    const breachCheckInRes = await request(
      'POST',
      '/api/attendance/check-in',
      {
        employee_id: 'EMP-B4-02',
        employee_name: 'Suresh Patel',
        hub_id: 'HUB-GOTRI',
        latitude: 23.0225, // Ahmedabad coordinates (~100km away)
        longitude: 72.5714,
        battery_level: 70
      },
      { Authorization: `Bearer ${operator2Token}` }
    );
    const breachHandled = breachCheckInRes.status === 200 && breachCheckInRes.data.log?.geofence_verified === false;
    record(
      '4. Attendance Geofence Breach Detection',
      breachHandled,
      `Outcome: ${breachCheckInRes.data?.log?.validation_outcome}, Distance: ${breachCheckInRes.data?.log?.distance_from_hub_m}m`
    );

    // ----------------------------------------------------
    // TEST 5: Attendance Cross-Employee Identity Spoofing Protection
    // ----------------------------------------------------
    const spoofRes = await request(
      'POST',
      '/api/attendance/check-in',
      {
        employee_id: 'EMP-VICTIM-99',
        employee_name: 'Victim User',
        hub_id: 'HUB-GOTRI',
        latitude: 22.3160,
        longitude: 73.1510
      },
      { Authorization: `Bearer ${attackerToken}` }
    );
    const spoofForbidden = spoofRes.status === 403;
    record(
      '5. Attendance Identity Protection Against Unauthorized Check-in',
      spoofForbidden,
      `HTTP Status: ${spoofRes.status}`
    );

    // ----------------------------------------------------
    // TEST 6: IoT Inward Batch Creation and Device Serialization
    // ----------------------------------------------------
    const testSerial = `IOT-TEST-${Date.now()}`;
    const inwardRes = await request(
      'POST',
      '/api/iot/inward',
      {
        supplier: 'GlideX IoT Pvt. Ltd.',
        invoice_no: `INV-B4-${Date.now()}`,
        invoice_date: '2026-10-10',
        po_no: 'PO-B4-9988',
        device_type: 'GPS Tracker',
        device_model: 'GLX-GT06',
        quantity: 1,
        status: 'Completed',
        qc_status: 'Accepted',
        devices: [
          {
            serial_number: testSerial,
            device_type: 'GPS Tracker',
            device_model: 'GLX-GT06',
            firmware_version: 'v2.4.1',
            supplier: 'GlideX IoT Pvt. Ltd.'
          }
        ]
      },
      { Authorization: `Bearer ${adminToken}` }
    );
    const inwardSuccess = inwardRes.status === 201 && inwardRes.data.registeredCount === 1;
    record(
      '6. IoT Inward Batch Logging & Serialized Device Inward',
      inwardSuccess,
      `Batch: ${inwardRes.data?.batch?.inward_no}, Serial: ${testSerial}`
    );

    // ----------------------------------------------------
    // TEST 7: IoT Device Assignment to Vehicle
    // ----------------------------------------------------
    const assignRes = await request(
      'POST',
      '/api/iot/devices/assign',
      {
        serial_number: testSerial,
        vehicle_code: 'EV-M1-2026',
        performed_by: 'QA Architect'
      },
      { Authorization: `Bearer ${adminToken}` }
    );
    const assignSuccess = assignRes.status === 200 && assignRes.data.device?.assigned_vehicle_code === 'EV-M1-2026';
    record(
      '7. IoT Device Vehicle Assignment & Status Transition',
      assignSuccess,
      `Status: ${assignRes.data?.device?.status}, Assigned to: ${assignRes.data?.device?.assigned_vehicle_code}`
    );

    // ----------------------------------------------------
    // TEST 8: IoT Device Heartbeat Tracking
    // ----------------------------------------------------
    const heartbeatRes = await request(
      'POST',
      '/api/iot/devices/heartbeat',
      {
        serial_number: testSerial,
        latitude: 22.3162,
        longitude: 73.1514,
        battery_soc: 94.5,
        signal_csq: 28,
        is_simulated: false
      }
    );
    const hbSuccess = heartbeatRes.status === 200 && heartbeatRes.data.data?.is_simulated === false;
    record(
      '8. IoT Live Heartbeat & Telemetry Tracking',
      hbSuccess,
      `Last heartbeat: ${heartbeatRes.data?.data?.last_heartbeat}, Battery: 94.5%`
    );

    // ----------------------------------------------------
    // TEST 9: Notification Dispatch Security Authorization
    // ----------------------------------------------------
    const riderToken = signToken({ id: 5555, role: 'Rider', evegahRole: 'rider' });
    const unauthDispatchRes = await request(
      'POST',
      '/api/notifications/dispatch',
      {
        title: 'Unauthorized Notification',
        body: 'Should be rejected'
      },
      { Authorization: `Bearer ${riderToken}` } // unauthorized caller
    );
    const authDispatchRes = await request(
      'POST',
      '/api/notifications/dispatch',
      {
        event_type: 'rental_expiry',
        event_key: `KEY_SEC_${Date.now()}`,
        recipient_mobile: '9104441309',
        title: 'Batch 4 Secured Notice',
        body: 'Approved admin push notice'
      },
      { Authorization: `Bearer ${adminToken}` } // authorized caller
    );
    const securityEnforced = unauthDispatchRes.status === 403 && authDispatchRes.status === 200;
    record(
      '9. Push Dispatch Server-Side RBAC & Endpoint Hardening',
      securityEnforced,
      `Unauth: ${unauthDispatchRes.status} (403 expected), Auth: ${authDispatchRes.status} (200 expected)`
    );

    // ----------------------------------------------------
    // TEST 10: IoT Inventory KPI Aggregations
    // ----------------------------------------------------
    const devicesKpiRes = await request('GET', '/api/iot/devices');
    const kpiValid = devicesKpiRes.status === 200 && devicesKpiRes.data.kpis?.totalInstalled > 0;
    record(
      '10. IoT Device Fleet KPI Metrics & Real Inventory Counts',
      kpiValid,
      `Total: ${devicesKpiRes.data?.kpis?.totalInstalled}, Active: ${devicesKpiRes.data?.kpis?.activeSignals}, In Stock: ${devicesKpiRes.data?.kpis?.inStock}`
    );

  } catch (err) {
    console.error('Test execution error:', err);
  }

  console.log('\n====================================================');
  const allPassed = results.every((r) => r.passed);
  const passCount = results.filter((r) => r.passed).length;
  console.log(`  RESULTS: ${passCount}/${results.length} PASSED`);
  console.log('====================================================');

  process.exit(allPassed ? 0 : 1);
}

runTests();
