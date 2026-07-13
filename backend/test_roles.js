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
  const res = await pool.query("SELECT * FROM Role");
  console.log(res.rows);
  pool.end();
}
run();
