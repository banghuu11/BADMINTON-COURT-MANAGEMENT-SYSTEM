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
  createMatch,
  joinMatch,
  getCourtSchedule,
  getVenueBookingsToday,
  validatePromotionEndpoint,
} = require("../controllers/bookingController");
const { authenticateToken, optionalAuthenticateToken } = require("../middlewares/authMiddleware");
const { requireRole, isStaffOrAbove, isOwnerOrAdmin } = require("../middlewares/roleMiddleware");
const router = express.Router();

router.get("/available", checkAvailability);
router.get("/matches", getOpenMatches);
router.get("/court-schedule", getCourtSchedule);

router.get("/venue/:venueId/today", authenticateToken, isStaffOrAbove, getVenueBookingsToday);

router.post("/", authenticateToken, createBooking);
router.post("/validate-promotion", optionalAuthenticateToken, validatePromotionEndpoint);
router.post("/matches", authenticateToken, createMatch);
router.post("/matches/:waitId/join", authenticateToken, joinMatch);


router.get("/history", authenticateToken, getMyBookings);


router.patch("/slot/:slotId/check-in", authenticateToken, isStaffOrAbove, checkInSlot);
router.patch("/slot/:slotId/check-out", authenticateToken, isStaffOrAbove, checkOutSlot);
router.patch("/:bookingId/cancel", authenticateToken, cancelBooking);
router.post("/:bookingId/add-service", authenticateToken, isStaffOrAbove, addServiceToBooking);

module.exports = router;
