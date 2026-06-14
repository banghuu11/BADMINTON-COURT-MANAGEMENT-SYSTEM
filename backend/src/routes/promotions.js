const express = require("express");
const {
  getPromotionsByVenue,
  createPromotion,
  updatePromotion,
  deletePromotion,
} = require("../controllers/promotionController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/venue/:venueId", getPromotionsByVenue);
router.post("/", authenticateToken, createPromotion);
router.put("/:id", authenticateToken, updatePromotion);
router.delete("/:id", authenticateToken, deletePromotion);

module.exports = router;
