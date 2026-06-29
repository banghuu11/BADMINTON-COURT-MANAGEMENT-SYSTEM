const express = require("express");
const { submitProfile, getProfile } = require("../controllers/ownerController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/roleMiddleware");
const router = express.Router();

router.get("/profile", authenticateToken, requireRole([1, 2]), getProfile);

router.post("/profile", authenticateToken, requireRole([1, 2]), submitProfile);

module.exports = router;
