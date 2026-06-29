const pool = require("../config/db");

// Lấy danh sách thông báo của User
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT * FROM Notification 
       WHERE UserId = $1 
       ORDER BY CreatedAt DESC`,
      [userId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Lỗi lấy thông báo:", error);
    res.status(500).json({ error: "Lỗi máy chủ", details: error.message });
  }
};

// Đánh dấu một thông báo là đã đọc
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.userId;

    const result = await pool.query(
      `UPDATE Notification 
       SET IsRead = TRUE, ReadAt = CURRENT_TIMESTAMP 
       WHERE NotificationId = $1 AND UserId = $2 
       RETURNING *`,
      [notificationId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy thông báo hoặc không có quyền." });
    }

    res.status(200).json({ message: "Đã đánh dấu đọc", notification: result.rows[0] });
  } catch (error) {
    console.error("Lỗi cập nhật thông báo:", error);
    res.status(500).json({ error: "Lỗi máy chủ", details: error.message });
  }
};

// Đánh dấu tất cả là đã đọc
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;

    await pool.query(
      `UPDATE Notification 
       SET IsRead = TRUE, ReadAt = CURRENT_TIMESTAMP 
       WHERE UserId = $1 AND IsRead = FALSE`,
      [userId]
    );

    res.status(200).json({ message: "Đã đánh dấu đọc tất cả." });
  } catch (error) {
    console.error("Lỗi cập nhật thông báo:", error);
    res.status(500).json({ error: "Lỗi máy chủ", details: error.message });
  }
};
