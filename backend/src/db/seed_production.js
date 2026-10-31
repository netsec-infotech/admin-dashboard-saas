const db = require('./index');
const { v4: uuidv4 } = require('uuid');

async function seedProductionData() {
  try {
    console.log('Seeding real production test data into PostgreSQL database...');

    // 0. Ensure schema compatibility
    await db.query('ALTER TABLE renters ADD COLUMN IF NOT EXISTS zone VARCHAR(100)');
    await db.query('ALTER TABLE renters ADD COLUMN IF NOT EXISTS kyc_status VARCHAR(50)');
    await db.query('ALTER TABLE reservations ADD COLUMN IF NOT EXISTS kyc_status VARCHAR(50)');
    try {
      await db.query('ALTER TABLE renters ALTER COLUMN vehicle_id DROP NOT NULL');
      await db.query('ALTER TABLE renters ALTER COLUMN battery_id DROP NOT NULL');
    } catch (ignore) {}

    // 1. Seed Real Renters (Rider App users)
    const riders = [
      // Manjalpur Zone riders
      { id: uuidv4(), name: 'Hardik Joshi', mobile: '+91 98251 23456', vehicle: 'EVM102501', pkg: 'Weekly Pro', rent: 1800, deposit: 2000, status: 'Active Ride', zone: 'Manjalpur Zone', kyc: 'Approved' },
      { id: uuidv4(), name: 'Kinjal Trivedi', mobile: '+91 97241 87654', vehicle: 'EVM102502', pkg: 'Monthly Pro', rent: 5500, deposit: 2500, status: 'Active Ride', zone: 'Manjalpur Zone', kyc: 'Approved' },
      { id: uuidv4(), name: 'Manish Parmar', mobile: '+91 98980 11223', vehicle: 'EVM102503', pkg: 'Daily Commuter', rent: 450, deposit: 1000, status: 'Confirmed', zone: 'Manjalpur Zone', kyc: 'Approved' },
      { id: uuidv4(), name: 'Rakesh Solanki', mobile: '+91 99042 33445', vehicle: 'EVM102504', pkg: 'Weekly Standard', rent: 1600, deposit: 2000, status: 'Payment Due', zone: 'Manjalpur Zone', kyc: 'Approved' },
      { id: uuidv4(), name: 'Jignesh Barot', mobile: '+91 98791 55667', vehicle: 'EVM102505', pkg: 'Monthly Saver', rent: 4800, deposit: 2000, status: 'Payment Due', zone: 'Manjalpur Zone', kyc: 'Approved' },
      { id: uuidv4(), name: 'Ankit Dave', mobile: '+91 99250 66778', vehicle: null, pkg: 'Weekly Pro', rent: 1800, deposit: 2000, status: 'Draft', zone: 'Manjalpur Zone', kyc: 'Pending Documents' },
      { id: uuidv4(), name: 'Bhavin Soni', mobile: '+91 98240 77889', vehicle: null, pkg: 'Monthly Standard', rent: 5000, deposit: 2000, status: 'Draft', zone: 'Manjalpur Zone', kyc: 'Under Review' },
      { id: uuidv4(), name: 'Dhaval Shah', mobile: '+91 98985 99001', vehicle: 'EVM102501', pkg: 'Daily Commuter', rent: 450, deposit: 1000, status: 'Completed', zone: 'Manjalpur Zone', kyc: 'Approved' },

      // Gotri Zone riders
      { id: uuidv4(), name: 'Himanshu Chavda', mobile: '+91 81282 51172', vehicle: 'EVM1024011', pkg: 'Weekly Pro', rent: 1800, deposit: 2000, status: 'Active Ride', zone: 'Gotri Zone', kyc: 'Approved' },
      { id: uuidv4(), name: 'Amit Kumar', mobile: '+91 98765 43210', vehicle: 'EVM1024012', pkg: 'Daily Package', rent: 450, deposit: 1000, status: 'Active Ride', zone: 'Gotri Zone', kyc: 'Approved' },
      { id: uuidv4(), name: 'Neha Gupta', mobile: '+91 91254 56789', vehicle: 'EVM1024015', pkg: 'Monthly Package', rent: 4500, deposit: 2000, status: 'Active Ride', zone: 'Gotri Zone', kyc: 'Approved' },
      { id: uuidv4(), name: 'Rohit Singh', mobile: '+91 99876 54321', vehicle: 'EVM1024023', pkg: 'Daily Package', rent: 450, deposit: 1000, status: 'Payment Due', zone: 'Gotri Zone', kyc: 'Approved' },
      { id: uuidv4(), name: 'Tanmay Bhatt', mobile: '+91 99770 12345', vehicle: null, pkg: 'Weekly Standard', rent: 1600, deposit: 2000, status: 'Draft', zone: 'Gotri Zone', kyc: 'Pending Documents' },

      // Aatapi Zone & KPGU Zone riders
      { id: uuidv4(), name: 'Priya Sharma', mobile: '+91 98123 45678', vehicle: 'EVM1024050', pkg: 'Weekly Package', rent: 1800, deposit: 2000, status: 'Confirmed', zone: 'Aatapi Zone', kyc: 'Approved' },
      { id: uuidv4(), name: 'Vikram Patel', mobile: '+91 78945 61230', vehicle: 'EVM1024051', pkg: 'Monthly Package', rent: 5000, deposit: 2000, status: 'Active Ride', zone: 'Aatapi Zone', kyc: 'Approved' },
      { id: uuidv4(), name: 'Devendra Rana', mobile: '+91 98255 44332', vehicle: 'EVM1024001', pkg: 'Daily Lite', rent: 400, deposit: 1000, status: 'Active Ride', zone: 'KPGU Zone', kyc: 'Approved' }
    ];

    for (const r of riders) {
      await db.query(`
        INSERT INTO renters (id, rider_name, mobile, vehicle_id, battery_id, package_name, rental_start_date, return_date, status, rent, deposit, total, zone, kyc_status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW() - INTERVAL '2 days', NOW() + INTERVAL '5 days', $7, $8, $9, $10, $11, $12, NOW() - INTERVAL '2 days')
        ON CONFLICT (id) DO NOTHING
      `, [r.id, r.name, r.mobile, r.vehicle, r.vehicle ? 'BAT-' + r.vehicle : null, r.pkg, r.status, r.rent, r.deposit, r.rent + r.deposit, r.zone, r.kyc]);
    }

    // 2. Seed Real Reservations
    const reservations = [
      // Manjalpur Zone reservations
      { res_id: 'RID-MNZ-202601', name: 'Hardik Joshi', mobile: '+91 98251 23456', vehicle: 'EVM102501', pkg: 'Weekly Pro', fare: 1800, deposit: 2000, p_mode: 'UPI', p_status: 'Paid', status: 'Active Ride', zone: 'Manjalpur Zone', kyc: 'Approved' },
      { res_id: 'RID-MNZ-202602', name: 'Kinjal Trivedi', mobile: '+91 97241 87654', vehicle: 'EVM102502', pkg: 'Monthly Pro', fare: 5500, deposit: 2500, p_mode: 'Razorpay', p_status: 'Paid', status: 'Active Ride', zone: 'Manjalpur Zone', kyc: 'Approved' },
      { res_id: 'RID-MNZ-202603', name: 'Manish Parmar', mobile: '+91 98980 11223', vehicle: 'EVM102503', pkg: 'Daily Commuter', fare: 450, deposit: 1000, p_mode: 'UPI', p_status: 'Paid', status: 'Confirmed', zone: 'Manjalpur Zone', kyc: 'Approved' },
      { res_id: 'RID-MNZ-202604', name: 'Rakesh Solanki', mobile: '+91 99042 33445', vehicle: 'EVM102504', pkg: 'Weekly Standard', fare: 1600, deposit: 2000, p_mode: 'Pending', p_status: 'Pending', status: 'Payment Due', zone: 'Manjalpur Zone', kyc: 'Approved' },
      { res_id: 'RID-MNZ-202605', name: 'Jignesh Barot', mobile: '+91 98791 55667', vehicle: 'EVM102505', pkg: 'Monthly Saver', fare: 4800, deposit: 2000, p_mode: 'Unpaid', p_status: 'Overdue', status: 'Payment Due', zone: 'Manjalpur Zone', kyc: 'Approved' },
      { res_id: 'RID-MNZ-202606', name: 'Ankit Dave', mobile: '+91 99250 66778', vehicle: 'EVM102501', pkg: 'Weekly Pro', fare: 1800, deposit: 2000, p_mode: 'Draft', p_status: 'Unpaid', status: 'Draft', zone: 'Manjalpur Zone', kyc: 'Pending Documents' },
      { res_id: 'RID-MNZ-202607', name: 'Bhavin Soni', mobile: '+91 98240 77889', vehicle: 'EVM102502', pkg: 'Monthly Standard', fare: 5000, deposit: 2000, p_mode: 'Draft', p_status: 'Unpaid', status: 'Draft', zone: 'Manjalpur Zone', kyc: 'Under Review' },
      { res_id: 'RID-MNZ-202608', name: 'Dhaval Shah', mobile: '+91 98985 99001', vehicle: 'EVM102501', pkg: 'Daily Commuter', fare: 450, deposit: 1000, p_mode: 'UPI', p_status: 'Paid', status: 'Completed', zone: 'Manjalpur Zone', kyc: 'Approved' },

      // Gotri Zone reservations
      { res_id: 'RID-GOT-202601', name: 'Himanshu Chavda', mobile: '+91 81282 51172', vehicle: 'EVM1024011', pkg: 'Weekly Pro', fare: 1800, deposit: 2000, p_mode: 'UPI', p_status: 'Paid', status: 'Active Ride', zone: 'Gotri Zone', kyc: 'Approved' },
      { res_id: 'RID-GOT-202602', name: 'Amit Kumar', mobile: '+91 98765 43210', vehicle: 'EVM1024012', pkg: 'Daily Package', fare: 450, deposit: 1000, p_mode: 'Razorpay', p_status: 'Paid', status: 'Active Ride', zone: 'Gotri Zone', kyc: 'Approved' },
      { res_id: 'RID-GOT-202603', name: 'Neha Gupta', mobile: '+91 91254 56789', vehicle: 'EVM1024015', pkg: 'Monthly Package', fare: 4500, deposit: 2000, p_mode: 'Razorpay', p_status: 'Paid', status: 'Active Ride', zone: 'Gotri Zone', kyc: 'Approved' },
      { res_id: 'RID-GOT-202604', name: 'Rohit Singh', mobile: '+91 99876 54321', vehicle: 'EVM1024023', pkg: 'Daily Package', fare: 450, deposit: 1000, p_mode: 'UPI', p_status: 'Pending', status: 'Payment Due', zone: 'Gotri Zone', kyc: 'Approved' },
      { res_id: 'RID-GOT-202605', name: 'Tanmay Bhatt', mobile: '+91 99770 12345', vehicle: null, pkg: 'Weekly Standard', fare: 1600, deposit: 2000, p_mode: 'Draft', p_status: 'Unpaid', status: 'Draft', zone: 'Gotri Zone', kyc: 'Pending Documents' },

      // Other zones
      { res_id: 'RID-AAT-202601', name: 'Priya Sharma', mobile: '+91 98123 45678', vehicle: 'EVM1024050', pkg: 'Weekly Package', fare: 1800, deposit: 2000, p_mode: 'Razorpay', p_status: 'Paid', status: 'Confirmed', zone: 'Aatapi Zone', kyc: 'Approved' },
      { res_id: 'RID-AAT-202602', name: 'Vikram Patel', mobile: '+91 78945 61230', vehicle: 'EVM1024051', pkg: 'Monthly Package', fare: 5000, deposit: 2000, p_mode: 'Card', p_status: 'Paid', status: 'Active Ride', zone: 'Aatapi Zone', kyc: 'Approved' },
      { res_id: 'RID-KPG-202601', name: 'Devendra Rana', mobile: '+91 98255 44332', vehicle: 'EVM1024001', pkg: 'Daily Lite', fare: 400, deposit: 1000, p_mode: 'UPI', p_status: 'Paid', status: 'Active Ride', zone: 'KPGU Zone', kyc: 'Approved' }
    ];

    for (const res of reservations) {
      await db.query(`
        INSERT INTO reservations (id, reservation_id, customer_name, mobile, gov_id, reservation_date, reservation_time, package_type, vehicle_category, vehicle_number, fare, deposit, payment_mode, payment_status, status, pickup_zone, drop_zone, kyc_status, created_at)
        VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, '10:00:00', $6, 'E-Scooter', $7, $8, $9, $10, $11, $12, $13, $13, $14, NOW() - INTERVAL '1 day')
        ON CONFLICT (reservation_id) DO UPDATE SET
          customer_name = EXCLUDED.customer_name,
          mobile = EXCLUDED.mobile,
          package_type = EXCLUDED.package_type,
          vehicle_number = EXCLUDED.vehicle_number,
          fare = EXCLUDED.fare,
          deposit = EXCLUDED.deposit,
          payment_mode = EXCLUDED.payment_mode,
          payment_status = EXCLUDED.payment_status,
          status = EXCLUDED.status,
          pickup_zone = EXCLUDED.pickup_zone,
          drop_zone = EXCLUDED.drop_zone,
          kyc_status = EXCLUDED.kyc_status
      `, [uuidv4(), res.res_id, res.name, res.mobile, 'AADHAAR-812825', res.pkg, res.vehicle, res.fare, res.deposit, res.p_mode, res.p_status, res.status, res.zone, res.kyc]);
    }

    // 3. Seed Real Batteries for Manjalpur Zone and Gotri Zone
    const batteries = [
      // Manjalpur Zone batteries
      { id: uuidv4(), battery_id: 'BAT-MNZ-001', status: 'In Use', soc: 82, zone: 'Manjalpur Zone', location: 'Manjalpur Hub', vehicle_number: 'EVM102501', rider_name: 'Hardik Joshi' },
      { id: uuidv4(), battery_id: 'BAT-MNZ-002', status: 'In Use', soc: 68, zone: 'Manjalpur Zone', location: 'Manjalpur Hub', vehicle_number: 'EVM102502', rider_name: 'Kinjal Trivedi' },
      { id: uuidv4(), battery_id: 'BAT-MNZ-003', status: 'Available', soc: 98, zone: 'Manjalpur Zone', location: 'Manjalpur Hub Station 1', vehicle_number: null, rider_name: null },
      { id: uuidv4(), battery_id: 'BAT-MNZ-004', status: 'Available', soc: 92, zone: 'Manjalpur Zone', location: 'Manjalpur Hub Station 1', vehicle_number: null, rider_name: null },
      { id: uuidv4(), battery_id: 'BAT-MNZ-005', status: 'Available', soc: 86, zone: 'Manjalpur Zone', location: 'Manjalpur Main Road Station', vehicle_number: null, rider_name: null },
      { id: uuidv4(), battery_id: 'BAT-MNZ-006', status: 'Charging', soc: 38, zone: 'Manjalpur Zone', location: 'Manjalpur Hub Station 1', vehicle_number: null, rider_name: null },
      { id: uuidv4(), battery_id: 'BAT-MNZ-007', status: 'Charging', soc: 24, zone: 'Manjalpur Zone', location: 'Manjalpur Main Road Station', vehicle_number: null, rider_name: null },
      { id: uuidv4(), battery_id: 'BAT-MNZ-008', status: 'Available', soc: 74, zone: 'Manjalpur Zone', location: 'Manjalpur Hub Station 1', vehicle_number: null, rider_name: null },

      // Gotri Zone batteries
      { id: uuidv4(), battery_id: 'BAT-GOT-001', status: 'In Use', soc: 85, zone: 'Gotri Zone', location: 'Gotri Hub', vehicle_number: 'EVM1024011', rider_name: 'Himanshu Chavda' },
      { id: uuidv4(), battery_id: 'BAT-GOT-002', status: 'In Use', soc: 72, zone: 'Gotri Zone', location: 'Gotri Hub', vehicle_number: 'EVM1024012', rider_name: 'Amit Kumar' },
      { id: uuidv4(), battery_id: 'BAT-GOT-003', status: 'Available', soc: 95, zone: 'Gotri Zone', location: 'Gotri Hub Station 1', vehicle_number: null, rider_name: null },
      { id: uuidv4(), battery_id: 'BAT-GOT-004', status: 'Available', soc: 90, zone: 'Gotri Zone', location: 'Gotri Hub Station 2', vehicle_number: null, rider_name: null },
      { id: uuidv4(), battery_id: 'BAT-GOT-005', status: 'Charging', soc: 30, zone: 'Gotri Zone', location: 'Gotri Hub Station 1', vehicle_number: null, rider_name: null }
    ];

    for (const b of batteries) {
      await db.query(`
        INSERT INTO batteries (id, battery_id, status, soc, zone, location, vehicle_number, rider_name, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        ON CONFLICT (battery_id) DO UPDATE SET
          status = EXCLUDED.status,
          soc = EXCLUDED.soc,
          zone = EXCLUDED.zone,
          location = EXCLUDED.location,
          vehicle_number = EXCLUDED.vehicle_number,
          rider_name = EXCLUDED.rider_name
      `, [b.id, b.battery_id, b.status, b.soc, b.zone, b.location, b.vehicle_number, b.rider_name]);
    }

    // 4. Update vehicle status and telemetry for Manjalpur Zone
    await db.query(`UPDATE vehicles SET vehicle_status = 'In Ride', status = 'Online', renter_name = 'Hardik Joshi', battery_pct = 82, current_km_reading = '145.2', total_km_covered = '620.0' WHERE code = 'EVM102501'`);
    await db.query(`UPDATE vehicles SET vehicle_status = 'In Ride', status = 'Online', renter_name = 'Kinjal Trivedi', battery_pct = 68, current_km_reading = '230.5', total_km_covered = '780.0' WHERE code = 'EVM102502'`);
    await db.query(`UPDATE vehicles SET vehicle_status = 'Available', status = 'Online', renter_name = 'None (Available)', battery_pct = 95, current_km_reading = '20.0', total_km_covered = '210.0' WHERE code = 'EVM102503'`);
    await db.query(`UPDATE vehicles SET vehicle_status = 'In Ride', status = 'Online', renter_name = 'Rakesh Solanki', battery_pct = 45, current_km_reading = '310.0', total_km_covered = '920.0' WHERE code = 'EVM102504'`);
    await db.query(`UPDATE vehicles SET vehicle_status = 'Available', status = 'Online', renter_name = 'None (Available)', battery_pct = 90, current_km_reading = '35.0', total_km_covered = '340.0' WHERE code = 'EVM102505'`);

    // 5. Update vehicle status for Gotri Zone
    await db.query(`UPDATE vehicles SET vehicle_status = 'In Ride', status = 'Online', renter_name = 'Himanshu Chavda', battery_pct = 85, current_km_reading = '120.5', total_km_covered = '450.0' WHERE code = 'EVM1024011'`);
    await db.query(`UPDATE vehicles SET vehicle_status = 'In Ride', status = 'Online', renter_name = 'Amit Kumar', battery_pct = 72, current_km_reading = '85.0', total_km_covered = '320.0' WHERE code = 'EVM1024012'`);
    await db.query(`UPDATE vehicles SET vehicle_status = 'In Ride', status = 'Online', renter_name = 'Neha Gupta', battery_pct = 90, current_km_reading = '210.0', total_km_covered = '680.0' WHERE code = 'EVM1024015'`);
    await db.query(`UPDATE vehicles SET vehicle_status = 'Available', status = 'Online', renter_name = 'None (Available)', battery_pct = 95, current_km_reading = '15.0', total_km_covered = '150.0' WHERE code = 'EVM1024023'`);

    console.log('Seeded production data successfully for all operational zones!');
    process.exit(0);
  } catch (e) {
    console.error('Seed error:', e);
    process.exit(1);
  }
}

seedProductionData();

