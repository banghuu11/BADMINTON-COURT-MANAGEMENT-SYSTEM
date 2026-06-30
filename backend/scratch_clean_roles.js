require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function cleanRoles() {
  try {
    // Xoá Notifications của Lễ tân
    await pool.query("DELETE FROM Notification WHERE UserId IN (SELECT UserId FROM AppUser WHERE RoleId = 3)");
    
    // Xoá user là Lễ tân
    await pool.query("DELETE FROM AppUser WHERE RoleId = 3");
    
    // Xoá role Lễ tân
    await pool.query("DELETE FROM Role WHERE RoleId = 3");

    // Lấy danh sách roles còn lại (sẽ là Admin, Owner, Customer)
    const result = await pool.query("SELECT * FROM Role ORDER BY RoleId ASC");
    console.log("ROLES SAU KHI DỌN DẸP:");
    console.log(result.rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
cleanRoles();
