const express = require("express");
const {
  generateInvoice,
  payInvoice,
} = require("../controllers/invoiceController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const router = express.Router();

// Tạo & tính toán hóa đơn cho Booking
router.post("/booking/:bookingId/generate", authenticateToken, generateInvoice);

// Thanh toán hóa đơn
router.post("/:invoiceId/pay", authenticateToken, payInvoice);

module.exports = router;
