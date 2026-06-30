require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function checkOverloads() {
  try {
    const result = await pool.query(`
      SELECT pg_get_functiondef(oid) AS def
      FROM pg_proc
      WHERE proname = 'fn_checkcourtavailability'
    `);
    console.log(result.rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
checkOverloads();
