const express = require("express");
const {
  getAdminDashboard,
  getOwnerDashboard,
  getPublicStats,
} = require("../controllers/dashboardController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { isAdmin } = require("../middlewares/roleMiddleware");
const router = express.Router();

// Thống kê Public cho trang chủ (Ai cũng xem được)
router.get("/public", getPublicStats);

// Dashboard Admin (Chỉ Admin xem được)
router.get("/admin", authenticateToken, isAdmin, getAdminDashboard);

// Dashboard Chủ sân (CourtOwner xem được)
router.get("/owner", authenticateToken, getOwnerDashboard);

module.exports = router;
