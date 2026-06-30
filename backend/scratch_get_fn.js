require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function getFnArgs() {
  try {
    const result = await pool.query(`SELECT pg_get_functiondef(oid) as def FROM pg_proc WHERE proname = 'fn_checkcourtavailability'`);
    console.log(result.rows[0].def);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
getFnArgs();
