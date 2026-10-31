// backend/scripts/verify_rental_lifecycle.js
const http = require('http');
const db = require('../src/db');

function post(path, body) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body);
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'x-api-key': 'evegah-internal-key'
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
        catch (e) { resolve({ status: res.statusCode, raw: d }); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function get(path) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path,
      method: 'GET',
      headers: { 'x-api-key': 'evegah-internal-key' }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
        catch (e) { resolve({ status: res.statusCode, raw: d }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function verifyLifecycle() {
  console.log('=== STARTING END-TO-END RENTAL LIFECYCLE VERIFICATION ===\n');

  const testMobile = '987' + Math.floor(1000000 + Math.random() * 9000000);
  const testVehicleCode = 'EVM1024012';
  const testBatteryCode = 'EVB2560';

  // Step 1: Rider Onboarding & Vehicle Allocation
  console.log(`[Step 1] Creating New Ride: Rider Mobile: ${testMobile}, Vehicle: ${testVehicleCode}, Battery: ${testBatteryCode}`);
  const regRes = await post('/api/rides/new', {
    rider_name: 'Lifecycle Verification Rider',
    mobile: testMobile,
    vehicle_id: testVehicleCode,
    battery_id: testBatteryCode,
    package_name: 'Weekly Standard',
    rent: 1200,
    deposit: 1000
  });

  console.log('  -> Ride Creation HTTP Status:', regRes.status);
  const vehicleDuringRide = await db.query('SELECT code, vehicle_status, renter_name FROM vehicles WHERE code = $1', [testVehicleCode]);
  console.log('  -> Vehicle Status During Ride:', vehicleDuringRide.rows[0]);

  // Step 2: Active Rides Query
  console.log('\n[Step 2] Querying Active Rides:');
  const activeRes = await get('/api/rides/active');
  const foundActive = (activeRes.data?.data || []).some(r => r.mobile && r.mobile.includes(testMobile));
  console.log('  -> Ride actively listed in active registry:', foundActive);

  // Step 3: Rental Extension / Retain
  console.log('\n[Step 3] Retaining / Extending Ride Duration:');
  const retainRes = await post('/api/rides/retain', {
    mobile: testMobile,
    rider_name: 'Lifecycle Verification Rider',
    vehicle_id: testVehicleCode,
    battery_id: testBatteryCode,
    package_name: 'Weekly Renewal',
    rent: 1200,
    deposit: 0,
    payment_method: 'UPI'
  });
  console.log('  -> Retain API HTTP Status:', retainRes.status, 'Message:', retainRes.data?.message);

  // Step 4: Ride Return & Deposit Refund Routing
  console.log('\n[Step 4] Returning Vehicle and Releasing Inventory:');
  const returnRes = await post('/api/rides/return', {
    rider_name: 'Lifecycle Verification Rider',
    mobile: testMobile,
    vehicle_id: testVehicleCode,
    return_condition: 'Clean / Good',
    refund_deposit: 1000,
    damage_detected: false
  });
  console.log('  -> Return API HTTP Status:', returnRes.status, 'Status:', returnRes.data?.data?.vehicle_status, 'Deposit:', returnRes.data?.data?.deposit_status);

  // Step 5: Post-Return Database Verification
  console.log('\n[Step 5] Post-Return Inventory Status Check:');
  const vehiclePostReturn = await db.query('SELECT code, vehicle_status, renter_name FROM vehicles WHERE code = $1', [testVehicleCode]);
  console.log('  -> Vehicle Status Post-Return:', vehiclePostReturn.rows[0]);

  const batteryPostReturn = await db.query('SELECT battery_id, status FROM batteries WHERE battery_id = $1', [testBatteryCode]);
  console.log('  -> Battery Status Post-Return:', batteryPostReturn.rows[0]);

  const reservationPostReturn = await db.query('SELECT reservation_id, status, deposit_status, refund_amount FROM reservations WHERE mobile LIKE $1 ORDER BY id DESC LIMIT 1', [`%${testMobile}%`]);
  console.log('  -> Reservation Refund Status Post-Return:', reservationPostReturn.rows[0]);

  const isSuccess =
    regRes.status === 201 &&
    retainRes.status === 200 &&
    returnRes.status === 200 &&
    vehiclePostReturn.rows[0]?.vehicle_status === 'Available' &&
    batteryPostReturn.rows[0]?.status === 'available' &&
    reservationPostReturn.rows[0]?.deposit_status === 'Pending_Refund';

  console.log('\n=== LIFECYCLE VERIFICATION RESULT:', isSuccess ? 'PASSED ✅' : 'FAILED ❌');
  process.exit(isSuccess ? 0 : 1);
}

verifyLifecycle().catch(err => {
  console.error('Fatal lifecycle verification error:', err);
  process.exit(1);
});
