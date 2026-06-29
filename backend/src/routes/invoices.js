const express = require("express");
const { generateInvoice, payInvoice } = require("../controllers/invoiceController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { isStaffOrAbove } = require("../middlewares/roleMiddleware");
const router = express.Router();

router.post("/booking/:bookingId/generate", authenticateToken, isStaffOrAbove, generateInvoice);
router.post("/:invoiceId/pay", authenticateToken, isStaffOrAbove, payInvoice);
module.exports = router;
