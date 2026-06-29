const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { authenticateToken } = require("../middlewares/authMiddleware");

// Require authentication for all notification routes
router.use(authenticateToken);

router.get("/", notificationController.getNotifications);
router.put("/:notificationId/read", notificationController.markAsRead);
router.put("/read-all", notificationController.markAllAsRead);

module.exports = router;
