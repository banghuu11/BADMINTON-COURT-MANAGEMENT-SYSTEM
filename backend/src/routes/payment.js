const express = require("express");
const { mockPayBooking } = require("../controllers/paymentController");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

// Mock Payment
router.post("/mock-pay", authenticateToken, mockPayBooking);

module.exports = router;
