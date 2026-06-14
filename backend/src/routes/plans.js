const express = require("express");
const { getPlans } = require("../controllers/planController");
const router = express.Router();

// Lấy danh sách gói (Public API)
router.get("/", getPlans);

module.exports = router;
