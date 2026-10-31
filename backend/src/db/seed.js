const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

const seed = async () => {
  console.log('Seeding database - Custom Run (Super Admin Only)...');
  try {
    const adminUserId = uuidv4();
    await db.query(`
      INSERT INTO users (id, name, email, role, mobile, zone, status, password) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (email) DO UPDATE SET
        role = EXCLUDED.role,
        name = EXCLUDED.name,
        password = EXCLUDED.password
    `, [
      adminUserId, 
      'Himanshu', 
      'himanshu@evegah.com', 
      'Super Admin', 
      '+91 99999 88888', 
      'Multiple Zones', 
      'Active', 
      'admin123'
    ]);
    
    console.log('Successfully seeded Super Admin user: himanshu@evegah.com / admin123');
  } catch (err) {
    console.error('Seed failed:', err);
  }
  process.exit(0);
};

seed();
