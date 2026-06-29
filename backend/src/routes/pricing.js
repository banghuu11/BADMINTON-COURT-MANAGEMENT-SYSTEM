const express = require("express");
const {
  createPricing,
  getPricingByCourt,
  deletePricing,
} = require("../controllers/pricingController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { isOwnerOrAdmin } = require("../middlewares/roleMiddleware");
const router = express.Router();

router.post("/", authenticateToken, isOwnerOrAdmin, createPricing);
router.get("/court/:courtId", getPricingByCourt);
router.delete("/:id", authenticateToken, isOwnerOrAdmin, deletePricing);

module.exports = router;
