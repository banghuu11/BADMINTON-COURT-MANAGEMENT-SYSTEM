const express = require("express");
const {
  createCourt,
  getCourtsByVenue,
  getCourtById,
} = require("../controllers/courtController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/roleMiddleware");
const { isOwnerOfVenue } = require("../middlewares/venueOwnerMiddleware");
const router = express.Router();

router.post("/", authenticateToken, isOwnerOfVenue, requireRole([1, 2, 3]), createCourt);
router.get("/venue/:venueId", getCourtsByVenue);
router.get("/:id", getCourtById);

module.exports = router;

