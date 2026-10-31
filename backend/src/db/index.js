require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  min: 5,
  max: 25,
  idleTimeoutMillis: 300000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client (Main DB)', err);
});

const bmsPool = new Pool({
  connectionString: process.env.BMS_DATABASE_URL || process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  min: 2,
  max: 20,
  idleTimeoutMillis: 300000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

bmsPool.on('error', (err) => {
  console.error('Unexpected error on idle client (BMS DB)', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  bmsQuery: (text, params) => bmsPool.query(text, params),
  getBmsClient: () => bmsPool.connect(),
};
