require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function fixBug() {
  try {
    await pool.query(`DROP INDEX IF EXISTS ux_nooverlap;`);
    console.log("Đã xoá index ux_nooverlap lỗi");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
fixBug();
