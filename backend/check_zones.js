const db = require('./src/db');
(async () => {
  try {
    const z = await db.query('SELECT COUNT(*) FROM zones');
    const r = await db.query('SELECT COUNT(*) FROM roles');
    const u = await db.query('SELECT COUNT(*) FROM users');
    const rn = await db.query('SELECT COUNT(*) FROM renters');
    const rs = await db.query('SELECT COUNT(*) FROM reservations');
    console.log('Zones count:', z.rows[0].count);
    console.log('Roles count:', r.rows[0].count);
    console.log('Users count:', u.rows[0].count);
    console.log('Renters count:', rn.rows[0].count);
    console.log('Reservations count:', rs.rows[0].count);
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
})();
