const pool = require('./src/config/db');

async function checkRoles() {
  const roles = await pool.query("SELECT * FROM Role");
  console.log(roles.rows);
  process.exit(0);
}
checkRoles();
