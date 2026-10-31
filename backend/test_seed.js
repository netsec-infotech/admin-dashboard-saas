const db = require('./src/db');

const testSeed = async () => {
  console.log('Clearing zones...');
  await db.query('DELETE FROM zones');
  
  const z = {
    name: 'Gotri Zone',
    code: 'ZONE-GT-001',
    country: 'India',
    state: 'Gujarat',
    city: 'Vadodara',
    locality: 'Gotri',
    type: 'Operational Zone',
    priority: 'High',
    status: 'active',
    timezone: '(GMT+05:30) Asia/Kolkata',
    description: 'Gotri operational zone',
    start_date: '2024-05-15',
    end_date: null,
    max_vehicles: 250,
    notes: '',
    map_link: '',
    points: [
      { lat: 22.3072, lng: 73.1812 },
      { lat: 22.3100, lng: 73.1900 },
      { lat: 22.3000, lng: 73.1950 },
      { lat: 22.2950, lng: 73.1850 }
    ],
    pricing: {
      pricingModel: 'Package Based',
      packages: [
        { id: 1, name: '3 Days Package', duration: 3, price: 899 },
        { id: 2, name: '5 Days Package', duration: 5, price: 1299 },
        { id: 3, name: '7 Days Package', duration: 7, price: 1699 }
      ]
    }
  };

  const z2 = {
    name: 'Aatapi Zone',
    code: 'ZONE-AT-002',
    country: 'India',
    state: 'Gujarat',
    city: 'Vadodara',
    locality: 'Aatapi',
    type: 'Operational Zone',
    priority: 'Medium',
    status: 'active',
    timezone: '(GMT+05:30) Asia/Kolkata',
    description: 'Aatapi tourist operational zone with hourly pricing',
    start_date: '2024-05-15',
    end_date: null,
    max_vehicles: 100,
    notes: '',
    map_link: '',
    points: [
      { lat: 22.3200, lng: 73.2000 },
      { lat: 22.3300, lng: 73.2100 },
      { lat: 22.3100, lng: 73.2200 }
    ],
    pricing: {
      pricingModel: 'Hourly Based',
      hourlyPricing: [
        { id: 1, model: 'Evegah City', basePrice: 80, extraPrice: 10 }
      ]
    }
  };

  try {
    const res1 = await db.query(`
      INSERT INTO zones (name, code, country, state, city, locality, type, priority, status, timezone, description, start_date, end_date, max_vehicles, notes, map_link, points, pricing)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING id, name
    `, [z.name, z.code, z.country, z.state, z.city, z.locality, z.type, z.priority, z.status, z.timezone, z.description, z.start_date, z.end_date, z.max_vehicles, z.notes, z.map_link, JSON.stringify(z.points), JSON.stringify(z.pricing)]);
    console.log('Inserted Gotri Zone:', res1.rows[0]);

    const res2 = await db.query(`
      INSERT INTO zones (name, code, country, state, city, locality, type, priority, status, timezone, description, start_date, end_date, max_vehicles, notes, map_link, points, pricing)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING id, name
    `, [z2.name, z2.code, z2.country, z2.state, z2.city, z2.locality, z2.type, z2.priority, z2.status, z2.timezone, z2.description, z2.start_date, z2.end_date, z2.max_vehicles, z2.notes, z2.map_link, JSON.stringify(z2.points), JSON.stringify(z2.pricing)]);
    console.log('Inserted Aatapi Zone:', res2.rows[0]);

    // Also insert a test vehicle assigned to Gotri Zone
    await db.query('DELETE FROM vehicles WHERE code = $1', ['EVM1024023']);
    const vehRes = await db.query(`
      INSERT INTO vehicles (code, vehicle_image, vehicle_category, vehicle_type, evegah_model_name, vehicle_status, status, battery_pct, speed, renter_name, zone)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, code, zone
    `, ['EVM1024023', '/City-1.png', 'E-Scooter', 'Rental', 'Evegah City', 'Available', 'Online', 95, 45, 'None (Available)', 'Gotri Zone']);
    console.log('Inserted/Updated Test Vehicle:', vehRes.rows[0]);

  } catch(e) {
    console.error('Insert failed:', e);
  }
  process.exit(0);
};

testSeed();
