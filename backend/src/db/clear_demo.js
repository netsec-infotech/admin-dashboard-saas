require('dotenv').config();
const db = require('./index');

const clear = async () => {
  console.log('Clearing all demo content from database tables...');
  try {
    await db.query('DROP TABLE IF EXISTS battery_logs CASCADE');
    await db.query('DROP TABLE IF EXISTS batteries CASCADE');
    await db.query('DROP TABLE IF EXISTS renters CASCADE');
    console.log('Database tables cleared successfully!');
  } catch (err) {
    console.error('Failed to clear database tables:', err);
  }
  process.exit(0);
};

clear();
