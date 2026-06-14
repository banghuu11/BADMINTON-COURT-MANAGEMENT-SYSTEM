const express = require("express");
const {
  createVenue,
  getMyVenues,
  getAllVenues,
  getVenueById,
  uploadVenueImage,
  getVenueImages,
  deleteVenueImage,
} = require("../controllers/venueController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const router = express.Router();

// Lấy danh sách toàn bộ cơ sở (Public API)
router.get("/all", getAllVenues);

// Lấy chi tiết cơ sở (Public API)
router.get("/:venueId", getVenueById);

router.post("/", authenticateToken, createVenue);
router.get("/", authenticateToken, getMyVenues);

// Quản lý Hình ảnh Cơ sở
router.get("/:venueId/images", getVenueImages);
router.post(
  "/:venueId/images",
  authenticateToken,
  upload.single("image"),
  uploadVenueImage,
);
router.delete("/images/:imageId", authenticateToken, deleteVenueImage);

module.exports = router;
