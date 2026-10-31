require('dotenv').config();
const db = require('../src/db');
const { delByPattern } = require('../src/redis');

async function run() {
  const res = await db.query(`
    UPDATE vehicles 
    SET vehicle_status = 'Available', renter_name = 'None (Available)' 
    WHERE vehicle_status = 'In Ride' 
      AND code NOT IN (
        SELECT vehicle_id FROM renters WHERE status IN ('Active Ride', 'Ongoing', 'Retain Ride')
      )
  `);
  console.log('Cleaned up vehicles count:', res.rowCount);
  await delByPattern('vehicles:*');
  console.log('Cleared redis cache for vehicles:*');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
