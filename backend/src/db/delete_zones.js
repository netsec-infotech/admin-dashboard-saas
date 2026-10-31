require('dotenv').config();
const db = require('./index');

const clearZones = async () => {
  console.log('Clearing all zones from database...');
  try {
    const res = await db.query('DELETE FROM zones');
    console.log('Zones cleared successfully!', res.rowCount, 'rows deleted.');
  } catch (err) {
    console.error('Failed to clear zones:', err);
  }
  process.exit(0);
};

clearZones();
