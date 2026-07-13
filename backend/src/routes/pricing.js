const express = require("express");
const {
  createPricing,
  getPricingByCourt,
  deletePricing,
  updatePricing,
} = require("../controllers/pricingController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { isOwnerOrAdmin } = require("../middlewares/roleMiddleware");
const router = express.Router();

router.post("/", authenticateToken, isOwnerOrAdmin, createPricing);
router.get("/court/:courtId", getPricingByCourt);
router.put("/:pricingId", authenticateToken, isOwnerOrAdmin, updatePricing);
router.delete("/:id", authenticateToken, isOwnerOrAdmin, deletePricing);

module.exports = router;
