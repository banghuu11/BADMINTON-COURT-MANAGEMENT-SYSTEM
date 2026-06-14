const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "CourtSync_Secret_Key_2024";

const authenticateToken = (req, res, next) => {
  // Lấy token từ header Authorization (định dạng: Bearer <token>)
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Lấy token từ "Bearer <token>"

  if (!token) {
    return res
      .status(401)
      .json({ error: "Truy cập bị từ chối! Không tìm thấy token xác thực." });
  }

  try {
    // Xác minh token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Gán payload vào req để các API bên dưới sử dụng
    req.user = decoded;

    next();
  } catch (error) {
    return res
      .status(403)
      .json({ error: "Token không hợp lệ hoặc đã hết hạn!" });
  }
};

module.exports = {
  authenticateToken,
};
