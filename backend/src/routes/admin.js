const express = require("express");
const {
  getPendingOwners,
  reviewOwnerProfile,
} = require("../controllers/adminController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { isAdmin } = require("../middlewares/roleMiddleware");
const router = express.Router();

router.get("/owners/pending", authenticateToken, isAdmin, getPendingOwners);

router.post("/owners/review", authenticateToken, isAdmin, reviewOwnerProfile);

module.exports = router;
