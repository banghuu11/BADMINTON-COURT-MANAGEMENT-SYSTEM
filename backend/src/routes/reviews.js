const express = require("express");
const {
  createReview,
  getVenueReviews,
  replyToReview,
} = require("../controllers/reviewController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { isOwnerOrAdmin } = require("../middlewares/roleMiddleware");
const router = express.Router();

router.post("/", authenticateToken, createReview);
router.get("/venue/:venueId", getVenueReviews);
router.patch("/:reviewId/reply", authenticateToken, isOwnerOrAdmin, replyToReview);

module.exports = router;
