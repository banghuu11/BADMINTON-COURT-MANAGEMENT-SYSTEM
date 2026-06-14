const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.on("connect", () => {
  console.log("Kết nối thành công đến cơ sở dữ liệu PostgreSQL!");
});

pool.on("error", (err) => {
  console.error("Lỗi kết nối cơ sở dữ liệu:", err);
});

module.exports = pool;
