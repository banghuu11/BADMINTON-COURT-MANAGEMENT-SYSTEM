const express = require("express");
const { getPlans } = require("../controllers/planController");
const {
  getMySubscription,
  getMyInvoices,
  subscribePlan,
  createMomoQr,
  createSePaySubscriptionCheckout,
  handleSePayIpn,
} = require("../controllers/subscriptionController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/roleMiddleware");

const router = express.Router();

// Lấy danh sách gói (Public API)
router.get("/", getPlans);

// Lấy thông tin gói dịch vụ hiện tại của Chủ sân
router.get("/my-subscription", authenticateToken, requireRole([2]), getMySubscription);

// Lấy lịch sử giao dịch gói (PlatformInvoice) của Chủ sân
router.get("/my-invoices", authenticateToken, requireRole([2]), getMyInvoices);

// Đăng ký mới hoặc Gia hạn gói dịch vụ (Tích hợp luồng Mock Payment)
router.post("/subscribe", authenticateToken, requireRole([2]), subscribePlan);

// Tạo mã QR thanh toán MoMo
router.post("/create-momo-qr", authenticateToken, requireRole([2]), createMomoQr);

router.post("/sepay/checkout", authenticateToken, requireRole([2]), createSePaySubscriptionCheckout);
router.post("/sepay/ipn", handleSePayIpn);

module.exports = router;
