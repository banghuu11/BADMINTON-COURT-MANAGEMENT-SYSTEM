const express = require("express");
const {
  mockPayBooking,
  createVNPayBookingPayment,
  handleVNPayReturn,
  getPaymentStatus,
  createSePayBookingCheckout,
  handleSePayBookingIpn,
} = require("../controllers/paymentController");
const { handleSePayIpn: handleSePaySubscriptionIpn } = require("../controllers/subscriptionController");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

// Mock Payment
router.post("/mock-pay", authenticateToken, mockPayBooking);
router.post("/vnpay/create-payment", authenticateToken, createVNPayBookingPayment);
router.get("/vnpay-return", handleVNPayReturn);
router.post("/sepay/checkout", authenticateToken, createSePayBookingCheckout);
router.post("/sepay/ipn", (req, res) => {
  const invoiceCode = String(req.body?.order?.order_invoice_number || "");
  if (invoiceCode.startsWith("BKSEP")) return handleSePayBookingIpn(req, res);
  return handleSePaySubscriptionIpn(req, res);
});
router.get("/status/:bookingId", authenticateToken, getPaymentStatus);

module.exports = router;
