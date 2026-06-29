require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "courtsync",
  password: process.env.DB_PASSWORD || "password",
  port: process.env.DB_PORT || 5432,
});

const createNotificationTables = async () => {
  try {
    console.log("Tạo bảng NotificationTemplate và Notification...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS NotificationTemplate (
        TemplateId SERIAL PRIMARY KEY,
        TemplateName VARCHAR(100) UNIQUE NOT NULL,
        Channel VARCHAR(20) NOT NULL,
        Subject VARCHAR(200),
        BodyTemplate VARCHAR(4000) NOT NULL,
        IsActive BOOLEAN DEFAULT TRUE
      );

      CREATE TABLE IF NOT EXISTS Notification (
        NotificationId SERIAL PRIMARY KEY,
        UserId INT NOT NULL REFERENCES AppUser(UserId),
        TemplateId INT REFERENCES NotificationTemplate(TemplateId),
        Title VARCHAR(200) NOT NULL,
        Body VARCHAR(2000) NOT NULL,
        Channel VARCHAR(20) NOT NULL,
        ReferenceType VARCHAR(30),
        ReferenceId INT,
        IsRead BOOLEAN DEFAULT FALSE,
        ReadAt TIMESTAMP,
        SentAt TIMESTAMP,
        Status VARCHAR(20) DEFAULT 'Pending',
        CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed some fake notifications
    await pool.query(`
      INSERT INTO Notification (UserId, Title, Body, Channel, IsRead)
      SELECT UserId, 'Chào mừng bạn', 'Cảm ơn bạn đã sử dụng hệ thống', 'System', FALSE
      FROM AppUser LIMIT 5;
    `);

    console.log("Thành công!");
  } catch (error) {
    console.error("Lỗi:", error);
  } finally {
    pool.end();
  }
};

createNotificationTables();
