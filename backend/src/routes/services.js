const express = require("express");
const {
  getServicesByVenue,
  createService,
  updateService,
  deleteService,
} = require("../controllers/serviceController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { requireRole, isOwnerOrAdmin } = require("../middlewares/roleMiddleware");
const { isOwnerOfVenue } = require("../middlewares/venueOwnerMiddleware");
const router = express.Router();

router.get("/venue/:venueId", getServicesByVenue);
router.post("/", authenticateToken, isOwnerOrAdmin, createService);
router.put("/:serviceId", authenticateToken, isOwnerOrAdmin, updateService);
router.delete("/:serviceId", authenticateToken, isOwnerOrAdmin, deleteService);
module.exports = router;
