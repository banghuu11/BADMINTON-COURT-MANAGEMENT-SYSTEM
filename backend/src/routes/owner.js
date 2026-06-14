const express = require("express");
const { submitProfile, getProfile } = require("../controllers/ownerController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const router = express.Router();

// Lấy thông tin hồ sơ của Chủ sân (Cần token)
router.get("/profile", authenticateToken, getProfile);

// Gửi hoặc Cập nhật hồ sơ (Cần token)
router.post("/profile", authenticateToken, submitProfile);

module.exports = router;
