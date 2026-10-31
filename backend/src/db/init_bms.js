require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.BMS_DATABASE_URL,
  ssl: (process.env.BMS_DATABASE_URL && (process.env.BMS_DATABASE_URL.includes('localhost') || process.env.BMS_DATABASE_URL.includes('127.0.0.1')))
    ? false
    : { rejectUnauthorized: false },
});

const initBMS = async () => {
  console.log('Initializing BMS database tables...');

  try {
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE IF NOT EXISTS batteries (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        battery_id VARCHAR(50) UNIQUE NOT NULL,
        status VARCHAR(30) DEFAULT 'idle',
        soc INT DEFAULT 100,
        voltage NUMERIC(5, 2),
        current NUMERIC(5, 2),
        temp NUMERIC(4, 1),
        cycles INT DEFAULT 0,
        health INT DEFAULT 100,
        lat NUMERIC(9, 6),
        lng NUMERIC(9, 6),
        serial_number VARCHAR(100),
        battery_type VARCHAR(50) DEFAULT 'Li-ion',
        capacity VARCHAR(30),
        make VARCHAR(100),
        model VARCHAR(100),
        location VARCHAR(150),
        zone VARCHAR(150),
        assigned_to VARCHAR(100),
        vehicle_number VARCHAR(50),
        rider_name VARCHAR(100),
        purchase_date DATE,
        warranty_valid_till DATE,
        supplier VARCHAR(150),
        cost NUMERIC(10, 2),
        invoice_number VARCHAR(100),
        notes TEXT,
        cells JSONB DEFAULT '[]'::jsonb,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS battery_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        battery_id VARCHAR(50) REFERENCES batteries(battery_id) ON DELETE CASCADE,
        soc INT,
        voltage NUMERIC(5, 2),
        current NUMERIC(5, 2),
        temp NUMERIC(4, 1),
        lat NUMERIC(9, 6),
        lng NUMERIC(9, 6),
        status VARCHAR(30),
        cells JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log('BMS schema created successfully!');
  } catch (err) {
    console.error('BMS schema initialization failed:', err);
  } finally {
    pool.end();
  }
};

initBMS();
