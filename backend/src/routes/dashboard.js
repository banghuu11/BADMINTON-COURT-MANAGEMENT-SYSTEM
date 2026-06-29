const express = require("express");
const {
  getAdminDashboard,
  getOwnerDashboard,
  getPublicStats,
} = require("../controllers/dashboardController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/roleMiddleware");
const router = express.Router();

router.get("/public", getPublicStats);

router.get("/admin", authenticateToken, requireRole([1]), getAdminDashboard);

router.get("/owner", authenticateToken, requireRole([1, 2]), getOwnerDashboard);

module.exports = router;
