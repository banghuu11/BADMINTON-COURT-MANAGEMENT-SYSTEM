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
const { requireRole } = require("../middlewares/roleMiddleware");
const { isOwnerOfVenue } = require("../middlewares/venueOwnerMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const router = express.Router();

// Lấy danh sách toàn bộ cơ sở (Public API)
router.get("/all", getAllVenues);

// Lấy chi tiết cơ sở (Public API)
router.get("/:venueId", getVenueById);

router.post("/", authenticateToken, requireRole([1, 2]), createVenue);
router.get("/", authenticateToken, requireRole([1, 2, 3, 4]), getMyVenues);

router.get("/:venueId/images", getVenueImages);
router.post(
  "/:venueId/images",
  authenticateToken,
  isOwnerOfVenue,
  upload.single("image"),
  uploadVenueImage,
);
router.delete("/images/:imageId", authenticateToken, isOwnerOfVenue, deleteVenueImage);

module.exports = router;
