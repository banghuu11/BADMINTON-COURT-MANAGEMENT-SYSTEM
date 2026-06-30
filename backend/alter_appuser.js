const pool = require("./src/config/db");

async function alterTable() {
  try {
    await pool.query(`
      ALTER TABLE AppUser
      ADD COLUMN IF NOT EXISTS ResetToken VARCHAR(255),
      ADD COLUMN IF NOT EXISTS ResetTokenExpiry TIMESTAMP;
    `);
    console.log("Successfully added ResetToken and ResetTokenExpiry columns to AppUser table.");
  } catch (error) {
    console.error("Error altering table:", error);
  } finally {
    await pool.end();
  }
}

alterTable();
