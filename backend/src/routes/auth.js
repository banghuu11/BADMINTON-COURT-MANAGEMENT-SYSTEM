const express = require("express");
const {
  register,
  login,
  getProfile,
  refreshToken,
} = require("../controllers/authController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const router = express.Router();

// ==========================================
// 1. ĐĂNG KÝ TÀI KHOẢN (POST /api/auth/register)
// ==========================================
router.post("/register", register);

// ==========================================
// 2. ĐĂNG NHẬP (POST /api/auth/login)
// ==========================================
router.post("/login", login);

// ==========================================
// 3. LẤY THÔNG TIN CÁ NHÂN (GET /api/auth/profile)
// ==========================================
router.get("/profile", authenticateToken, getProfile);

// ==========================================
// 4. REFRESH TOKEN (POST /api/auth/refresh)
// ==========================================
router.post("/refresh", refreshToken);

module.exports = router;
