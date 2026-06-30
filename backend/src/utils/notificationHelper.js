const pool = require("../config/db");

/**
 * Tạo thông báo mới và gửi realtime qua Socket.IO
 * @param {Object} app - Express app instance (để lấy io)
 * @param {Number} userId - Người nhận thông báo
 * @param {String} title - Tiêu đề
 * @param {String} message - Nội dung
 * @param {String} type - Loại (Booking, System, Auth, Promotion)
 * @param {String} relatedId - ID tham chiếu (BookingId, v.v...)
 */
const createNotification = async (app, userId, title, message, type = "System", relatedId = null) => {
  try {
    // 1. Lưu vào Database
    const insertQuery = `
      INSERT INTO Notification (UserId, Title, Message, NotificationType, RelatedId)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `;
    const result = await pool.query(insertQuery, [userId, title, message, type, relatedId]);
    const newNotification = result.rows[0];

    // 2. Gửi qua Socket.IO nếu server đã khởi tạo io
    if (app) {
      const io = app.get("io");
      if (io) {
        io.to(userId.toString()).emit("new_notification", newNotification);
      }
    }

    return newNotification;
  } catch (error) {
    console.error("Lỗi khi tạo notification:", error);
    return null;
  }
};

module.exports = { createNotification };
