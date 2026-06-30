require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function fixRoles() {
  try {
    // 1. Xóa users thuộc role 3 (Staff)
    await pool.query("DELETE FROM AppUser WHERE RoleId = 3");
    
    // 2. Thêm cột tạm thời để né constraint hoặc disable trigger
    await pool.query("ALTER TABLE AppUser DISABLE TRIGGER ALL");
    await pool.query("ALTER TABLE Role DISABLE TRIGGER ALL");
    
    // Cập nhật AppUser từ 4 -> 3
    await pool.query("UPDATE AppUser SET RoleId = 3 WHERE RoleId = 4");
    
    // Xóa role 3 cũ, đổi role 4 -> 3
    await pool.query("DELETE FROM Role WHERE RoleId = 3");
    await pool.query("UPDATE Role SET RoleId = 3 WHERE RoleId = 4");

    await pool.query("ALTER TABLE AppUser ENABLE TRIGGER ALL");
    await pool.query("ALTER TABLE Role ENABLE TRIGGER ALL");

    const result = await pool.query("SELECT * FROM Role ORDER BY RoleId ASC");
    console.log("ROLES HIỆN TẠI:");
    console.log(result.rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
fixRoles();
