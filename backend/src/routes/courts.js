const express = require("express");
const {
  createCourt,
  getCourtsByVenue,
  getCourtSuggestions,
  getCourtById,
  updateCourt,
  deleteCourt,
} = require("../controllers/courtController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/roleMiddleware");
const { isOwnerOfVenue } = require("../middlewares/venueOwnerMiddleware");
const { enforceCourtLimit } = require("../middlewares/subscriptionLimitMiddleware");
const router = express.Router();

router.post("/", authenticateToken, requireRole([1, 2, 3]), isOwnerOfVenue, enforceCourtLimit, createCourt);
router.get("/suggestions", getCourtSuggestions);
router.get("/venue/:venueId", getCourtsByVenue);
router.get("/:id", getCourtById);
router.put("/:courtId", authenticateToken, requireRole([1, 2]), updateCourt);
router.delete("/:courtId", authenticateToken, requireRole([1, 2]), deleteCourt);

module.exports = router;
