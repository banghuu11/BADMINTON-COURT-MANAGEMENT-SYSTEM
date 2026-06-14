const express = require("express");
const {
  createCourt,
  getCourtsByVenue,
} = require("../controllers/courtController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", authenticateToken, createCourt);
router.get("/venue/:venueId", getCourtsByVenue); // Có thể gọi không cần token

module.exports = router;
