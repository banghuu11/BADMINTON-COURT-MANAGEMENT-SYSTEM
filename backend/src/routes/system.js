const express = require("express");
const {
  getPublicSettings,
  updateHomeBanner,
  deleteHomeBanner,
} = require("../controllers/systemController");
const upload = require("../middlewares/uploadMiddleware");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/roleMiddleware");

const router = express.Router();

router.get("/public-settings", getPublicSettings);
router.post(
  "/home-banner",
  authenticateToken,
  requireRole([1]),
  upload.single("banner"),
  updateHomeBanner,
);
router.delete(
  "/home-banner",
  authenticateToken,
  requireRole([1]),
  deleteHomeBanner,
);

module.exports = router;
