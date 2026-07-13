const pool = require("../config/db");

const ensureSystemSettingTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS SystemSetting (
      SettingKey VARCHAR(100) PRIMARY KEY,
      SettingValue TEXT,
      UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

const getPublicSettings = async (req, res) => {
  try {
    await ensureSystemSettingTable();
    const result = await pool.query(
      `SELECT SettingKey, SettingValue FROM SystemSetting WHERE SettingKey IN ('home_banner_url')`,
    );

    const settings = result.rows.reduce((acc, row) => {
      acc[row.settingkey] = row.settingvalue;
      return acc;
    }, {});

    res.json({
      bannerUrl: settings.home_banner_url || null,
    });
  } catch (error) {
    console.error("Lỗi getPublicSettings:", error);
    res.status(500).json({ error: "Lỗi server khi lấy cấu hình hệ thống." });
  }
};

const updateHomeBanner = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Vui lòng chọn ảnh banner." });
  }

  const bannerUrl = `http://localhost:8080/uploads/${req.file.filename}`;

  try {
    await ensureSystemSettingTable();
    await pool.query(
      `INSERT INTO SystemSetting (SettingKey, SettingValue, UpdatedAt)
       VALUES ('home_banner_url', $1, CURRENT_TIMESTAMP)
       ON CONFLICT (SettingKey)
       DO UPDATE SET SettingValue = EXCLUDED.SettingValue, UpdatedAt = CURRENT_TIMESTAMP`,
      [bannerUrl],
    );

    res.json({
      message: "Cập nhật banner trang chủ thành công!",
      bannerUrl,
    });
  } catch (error) {
    console.error("Lỗi updateHomeBanner:", error);
    res.status(500).json({ error: "Lỗi server khi cập nhật banner." });
  }
};

const deleteHomeBanner = async (req, res) => {
  try {
    await ensureSystemSettingTable();
    await pool.query("DELETE FROM SystemSetting WHERE SettingKey = 'home_banner_url'");
    res.json({ message: "Đã xóa banner trang chủ." });
  } catch (error) {
    console.error("Lỗi deleteHomeBanner:", error);
    res.status(500).json({ error: "Lỗi server khi xóa banner." });
  }
};

module.exports = {
  getPublicSettings,
  updateHomeBanner,
  deleteHomeBanner,
};
