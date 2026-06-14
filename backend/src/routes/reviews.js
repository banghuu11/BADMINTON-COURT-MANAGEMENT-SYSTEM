const express = require("express");
const {
  createReview,
  getVenueReviews,
  replyToReview,
} = require("../controllers/reviewController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const router = express.Router();

// Đăng đánh giá mới (Cần đăng nhập)
router.post("/", authenticateToken, createReview);

// Lấy danh sách đánh giá của một cơ sở (Public API - Ai cũng xem được)
router.get("/venue/:venueId", getVenueReviews);

// Chủ sân trả lời đánh giá
router.patch("/:reviewId/reply", authenticateToken, replyToReview);

module.exports = router;
