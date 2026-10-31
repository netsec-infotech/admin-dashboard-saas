const db = require('./index');

const run = async () => {
  try {
    console.log('Querying existing tables...');
    const tablesRes = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Tables:', tablesRes.rows.map(r => r.table_name));

    for (const row of tablesRes.rows) {
      const columnsRes = await db.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1
      `, [row.table_name]);
      console.log(`Table: ${row.table_name}`);
      console.log(columnsRes.rows.map(c => `  - ${c.column_name} (${c.data_type})`).join('\n'));
    }
  } catch (err) {
    console.error('Error querying schema:', err);
  }
  process.exit(0);
};

run();
