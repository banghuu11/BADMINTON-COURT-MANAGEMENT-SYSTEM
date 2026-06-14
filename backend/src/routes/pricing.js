const express = require("express");
const {
  createPricing,
  getPricingByCourt,
  deletePricing,
} = require("../controllers/pricingController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/", authenticateToken, createPricing);
router.get("/court/:courtId", getPricingByCourt); // Có thể public để khách hàng xem giá
router.delete("/:id", authenticateToken, deletePricing);

module.exports = router;
