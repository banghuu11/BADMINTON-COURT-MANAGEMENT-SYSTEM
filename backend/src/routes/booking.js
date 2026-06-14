const express = require("express");
const {
  checkAvailability,
  createBooking,
  getMyBookings,
  checkInSlot,
  checkOutSlot,
  cancelBooking,
  addServiceToBooking,
  getOpenMatches,
  getCourtSchedule,
  getVenueBookingsToday,
} = require("../controllers/bookingController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const router = express.Router();

// Kiểm tra sân trống (Public)
router.get("/available", checkAvailability);

// Lấy danh sách tìm bạn giao lưu (Public)
router.get("/matches", getOpenMatches);

// Lấy lịch đã đặt của sân (Public)
router.get("/court-schedule", getCourtSchedule);

// Lấy danh sách booking của cơ sở theo ngày (Cho Lễ tân/Chủ sân)
router.get("/venue/:venueId/today", authenticateToken, getVenueBookingsToday);

// Tạo đơn đặt sân mới (Cần đăng nhập)
router.post("/", authenticateToken, createBooking);

// Lấy lịch sử đặt sân của user (Cần đăng nhập)
router.get("/history", authenticateToken, getMyBookings);

// Lễ tân check-in nhận sân
router.patch("/slot/:slotId/check-in", authenticateToken, checkInSlot);

// Lễ tân trả sân (Check-out)
router.patch("/slot/:slotId/check-out", authenticateToken, checkOutSlot);

// Hủy đơn đặt sân
router.patch("/:bookingId/cancel", authenticateToken, cancelBooking);

// Thêm dịch vụ (nước, vợt) vào đơn đặt sân
router.post("/:bookingId/add-service", authenticateToken, addServiceToBooking);

module.exports = router;
