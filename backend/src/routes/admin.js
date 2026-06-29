const express = require("express");
const {
  getPendingOwners,
  reviewOwnerProfile,
  getAllOwners,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllPlansAdmin,
  createPlan,
  updatePlan,
  deletePlan,
  getAllVenuesAdmin,
  createVenue,
  updateVenue,
  deleteVenue,
  getAllCourtsAdmin,
  createCourt,
  updateCourt,
  deleteCourt,
  getAllBookingsAdmin,
  deleteBookingAdmin,
  getAllInvoicesAdmin,
  deleteInvoiceAdmin,
  getAllPromotionsAdmin,
  deletePromotionAdmin,
  getAllServicesAdmin,
  deleteServiceAdmin,
  getAllReviewsAdmin,
  deleteReviewAdmin,
} = require("../controllers/adminController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/roleMiddleware");
const router = express.Router();

// Tất cả các route dưới đây yêu cầu quyền Admin (RoleId = 1)
router.use(authenticateToken, requireRole([1]));

// Duyệt hồ sơ & Danh sách chủ sân
router.get("/owners/pending", getPendingOwners);
router.post("/owners/review", reviewOwnerProfile);
router.get("/owners", getAllOwners);

// Quản lý người dùng
router.get("/users", getAllUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Quản lý gói dịch vụ SaaS
router.get("/plans", getAllPlansAdmin);
router.post("/plans", createPlan);
router.put("/plans/:id", updatePlan);
router.delete("/plans/:id", deletePlan);

// Quản lý cơ sở sân (Venues)
router.get("/venues", getAllVenuesAdmin);
router.post("/venues", createVenue);
router.put("/venues/:id", updateVenue);
router.delete("/venues/:id", deleteVenue);

// Quản lý sân (Courts)
router.get("/courts", getAllCourtsAdmin);
router.post("/courts", createCourt);
router.put("/courts/:id", updateCourt);
router.delete("/courts/:id", deleteCourt);

// Quản lý Đặt sân (Bookings)
router.get("/bookings", getAllBookingsAdmin);
router.delete("/bookings/:id", deleteBookingAdmin);

// Quản lý Hóa đơn (Invoices)
router.get("/invoices", getAllInvoicesAdmin);
router.delete("/invoices/:id", deleteInvoiceAdmin);

// Quản lý Khuyến mãi (Promotions)
router.get("/promotions", getAllPromotionsAdmin);
router.delete("/promotions/:id", deletePromotionAdmin);

// Quản lý Dịch vụ (Services)
router.get("/services", getAllServicesAdmin);
router.delete("/services/:id", deleteServiceAdmin);

// Quản lý Đánh giá (Reviews)
router.get("/reviews", getAllReviewsAdmin);
router.delete("/reviews/:id", deleteReviewAdmin);

module.exports = router;
