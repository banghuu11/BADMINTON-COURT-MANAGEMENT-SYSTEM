const express = require("express");
const {
  getPromotionsByVenue,
  createPromotion,
  updatePromotion,
  deletePromotion,
  getAllActivePromotions,
} = require("../controllers/promotionController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { isOwnerOrAdmin } = require("../middlewares/roleMiddleware");
const router = express.Router();

router.get("/", getAllActivePromotions);
router.get("/venue/:venueId", getPromotionsByVenue);
router.post("/", authenticateToken, isOwnerOrAdmin, createPromotion);
router.put("/:id", authenticateToken, isOwnerOrAdmin, updatePromotion);
router.delete("/:id", authenticateToken, isOwnerOrAdmin, deletePromotion);

module.exports = router;
