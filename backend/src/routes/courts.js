const express = require("express");
const {
  createCourt,
  getCourtsByVenue,
  getCourtById,
  updateCourt,
  deleteCourt,
} = require("../controllers/courtController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/roleMiddleware");
const { isOwnerOfVenue } = require("../middlewares/venueOwnerMiddleware");
const router = express.Router();

router.post("/", authenticateToken, isOwnerOfVenue, requireRole([1, 2, 3]), createCourt);
router.get("/venue/:venueId", getCourtsByVenue);
router.get("/:id", getCourtById);
router.put("/:courtId", authenticateToken, requireRole([1, 2]), updateCourt);
router.delete("/:courtId", authenticateToken, requireRole([1, 2]), deleteCourt);

module.exports = router;

