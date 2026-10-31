const db = require('../db');

async function seedVehicles() {
  try {
    const existing = await db.query('SELECT COUNT(*) FROM vehicles');
    if (parseInt(existing.rows[0].count, 10) > 0) {
      console.log('Vehicles already exist in database:', existing.rows[0].count);
      return;
    }

    console.log('Seeding initial vehicle fleet...');
    const vehicles = [
      // Gotri Zone (Available EVs)
      {
        code: 'EVM1024011',
        evegah_model_name: 'Evegah City',
        vehicle_model: 'Evegah City 2.0',
        vehicle_category: 'E-Scooter',
        registration_number: 'GJ-06-EV-1011',
        chassis_number: 'CHS-GT-1011',
        motor_number: 'MOT-GT-1011',
        controller_number: 'CTL-GT-1011',
        color: 'Electric White',
        zone: 'Gotri Zone',
        vehicle_status: 'Available',
        status: 'Online',
        battery_pct: 95,
        current_km_reading: 20.0,
        total_km_covered: 210.0,
        renter_name: 'None (Available)',
        lat: 22.3168,
        lng: 73.1415
      },
      {
        code: 'EVM1024012',
        evegah_model_name: 'Evegah City',
        vehicle_model: 'Evegah City 2.0',
        vehicle_category: 'E-Scooter',
        registration_number: 'GJ-06-EV-1012',
        chassis_number: 'CHS-GT-1012',
        motor_number: 'MOT-GT-1012',
        controller_number: 'CTL-GT-1012',
        color: 'Ocean Blue',
        zone: 'Gotri Zone',
        vehicle_status: 'Available',
        status: 'Online',
        battery_pct: 90,
        current_km_reading: 35.0,
        total_km_covered: 340.0,
        renter_name: 'None (Available)',
        lat: 22.3175,
        lng: 73.1420
      },
      {
        code: 'EVM1024023',
        evegah_model_name: 'Evegah Mink',
        vehicle_model: 'Evegah Mink Cargo',
        vehicle_category: 'Cargo EV',
        registration_number: 'GJ-06-EV-1023',
        chassis_number: 'CHS-GT-1023',
        motor_number: 'MOT-GT-1023',
        controller_number: 'CTL-GT-1023',
        color: 'Matte Grey',
        zone: 'Gotri Zone',
        vehicle_status: 'Available',
        status: 'Online',
        battery_pct: 98,
        current_km_reading: 15.0,
        total_km_covered: 150.0,
        renter_name: 'None (Available)',
        lat: 22.3160,
        lng: 73.1410
      },

      // Manjalpur Zone (In Ride vehicles => 0 Available units)
      {
        code: 'EVM102501',
        evegah_model_name: 'Evegah City',
        vehicle_model: 'Evegah City 2.0',
        vehicle_category: 'E-Scooter',
        registration_number: 'GJ-06-EV-5001',
        chassis_number: 'CHS-MN-5001',
        motor_number: 'MOT-MN-5001',
        controller_number: 'CTL-MN-5001',
        color: 'Racing Red',
        zone: 'Manjalpur Zone',
        vehicle_status: 'In Ride',
        status: 'Online',
        battery_pct: 82,
        current_km_reading: 145.2,
        total_km_covered: 620.0,
        renter_name: 'Hardik Joshi',
        lat: 22.2684,
        lng: 73.1952
      },
      {
        code: 'EVM102502',
        evegah_model_name: 'Evegah City',
        vehicle_model: 'Evegah City 2.0',
        vehicle_category: 'E-Scooter',
        registration_number: 'GJ-06-EV-5002',
        chassis_number: 'CHS-MN-5002',
        motor_number: 'MOT-MN-5002',
        controller_number: 'CTL-MN-5002',
        color: 'Midnight Black',
        zone: 'Manjalpur Zone',
        vehicle_status: 'In Ride',
        status: 'Online',
        battery_pct: 68,
        current_km_reading: 230.5,
        total_km_covered: 780.0,
        renter_name: 'Kinjal Trivedi',
        lat: 22.2690,
        lng: 73.1960
      },
      {
        code: 'EVM102504',
        evegah_model_name: 'Evegah City',
        vehicle_model: 'Evegah City 2.0',
        vehicle_category: 'E-Scooter',
        registration_number: 'GJ-06-EV-5004',
        chassis_number: 'CHS-MN-5004',
        motor_number: 'MOT-MN-5004',
        controller_number: 'CTL-MN-5004',
        color: 'Electric White',
        zone: 'Manjalpur Zone',
        vehicle_status: 'In Ride',
        status: 'Online',
        battery_pct: 45,
        current_km_reading: 310.0,
        total_km_covered: 920.0,
        renter_name: 'Rakesh Solanki',
        lat: 22.2675,
        lng: 73.1945
      },

      // Aatapi Zone (Available EVs)
      {
        code: 'EVM1026001',
        evegah_model_name: 'Evegah City',
        vehicle_model: 'Evegah City 2.0',
        vehicle_category: 'E-Scooter',
        registration_number: 'GJ-06-EV-6001',
        chassis_number: 'CHS-AT-6001',
        motor_number: 'MOT-AT-6001',
        controller_number: 'CTL-AT-6001',
        color: 'Sunset Orange',
        zone: 'Aatapi Zone',
        vehicle_status: 'Available',
        status: 'Online',
        battery_pct: 92,
        current_km_reading: 50.0,
        total_km_covered: 450.0,
        renter_name: 'None (Available)',
        lat: 22.3615,
        lng: 73.3524
      },
      {
        code: 'EVM1026002',
        evegah_model_name: 'Evegah Mink',
        vehicle_model: 'Evegah Mink Cargo',
        vehicle_category: 'Cargo EV',
        registration_number: 'GJ-06-EV-6002',
        chassis_number: 'CHS-AT-6002',
        motor_number: 'MOT-AT-6002',
        controller_number: 'CTL-AT-6002',
        color: 'Electric White',
        zone: 'Aatapi Zone',
        vehicle_status: 'Available',
        status: 'Online',
        battery_pct: 88,
        current_km_reading: 75.0,
        total_km_covered: 520.0,
        renter_name: 'None (Available)',
        lat: 22.3620,
        lng: 73.3530
      },

      // Moti Daman Zone (Available EVs)
      {
        code: 'EVM1027001',
        evegah_model_name: 'Evegah City',
        vehicle_model: 'Evegah City 2.0',
        vehicle_category: 'E-Scooter',
        registration_number: 'DD-03-EV-7001',
        chassis_number: 'CHS-DM-7001',
        motor_number: 'MOT-DM-7001',
        controller_number: 'CTL-DM-7001',
        color: 'Coastal Blue',
        zone: 'Moti Daman Zone',
        vehicle_status: 'Available',
        status: 'Online',
        battery_pct: 96,
        current_km_reading: 10.0,
        total_km_covered: 120.0,
        renter_name: 'None (Available)',
        lat: 20.4075,
        lng: 72.8335
      }
    ];

    for (const v of vehicles) {
      await db.query(`
        INSERT INTO vehicles (
          code, evegah_model_name, vehicle_model, vehicle_category,
          registration_number, chassis_number, motor_number, controller_number,
          color, zone, vehicle_status, status, battery_pct,
          current_km_reading, total_km_covered, renter_name, lat, lng, created_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW()
        )
        ON CONFLICT (code) DO UPDATE SET
          zone = EXCLUDED.zone,
          vehicle_status = EXCLUDED.vehicle_status,
          status = EXCLUDED.status,
          battery_pct = EXCLUDED.battery_pct,
          renter_name = EXCLUDED.renter_name
      `, [
        v.code, v.evegah_model_name, v.vehicle_model, v.vehicle_category,
        v.registration_number, v.chassis_number, v.motor_number, v.controller_number,
        v.color, v.zone, v.vehicle_status, v.status, v.battery_pct,
        v.current_km_reading, v.total_km_covered, v.renter_name, v.lat, v.lng
      ]);
    }

    console.log('Successfully seeded vehicle fleet!');
  } catch (err) {
    console.error('Error seeding vehicles:', err);
  }
}

if (require.main === module) {
  seedVehicles().then(() => process.exit(0));
}

module.exports = seedVehicles;
