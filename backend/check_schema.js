const pool = require('./src/config/db');

async function checkSchema() {
  const result = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'booking';
  `);
  console.log(result.rows);
  process.exit(0);
}

checkSchema();
