const express = require("express");
const {
  createVenue,
  getMyVenues,
  getAllVenues,
  getVenueById,
  uploadVenueImage,
  getVenueImages,
  deleteVenueImage,
  updateVenue,
  deleteVenue,
} = require("../controllers/venueController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/roleMiddleware");
const { isOwnerOfVenue } = require("../middlewares/venueOwnerMiddleware");
const { enforceVenueLimit } = require("../middlewares/subscriptionLimitMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const router = express.Router();

// Lấy danh sách toàn bộ cơ sở (Public API)
router.get("/all", getAllVenues);

// Lấy chi tiết cơ sở (Public API)
router.get("/:venueId", getVenueById);

router.post("/", authenticateToken, requireRole([1, 2]), enforceVenueLimit, createVenue);
router.get("/", authenticateToken, requireRole([1, 2, 3, 4]), getMyVenues);
router.put("/:venueId", authenticateToken, requireRole([1, 2]), updateVenue);
router.delete("/:venueId", authenticateToken, requireRole([1, 2]), deleteVenue);

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
