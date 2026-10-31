require('dotenv').config();
const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect().then(() => {
  return client.query("SELECT category, values FROM settings");
}).then(res => {
  console.log(res.rows);
  client.end();
}).catch(err => {
  console.error(err);
  process.exit(1);
});
