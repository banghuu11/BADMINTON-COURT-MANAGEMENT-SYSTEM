require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});
async function run() {
  const v = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'venue'");
  const c = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'court'");
  console.log("Venue:", v.rows);
  console.log("Court:", c.rows);
  pool.end();
}
run();
