const express = require("express");
const {
  getServicesByVenue,
  createService,
  updateService,
  deleteService,
} = require("../controllers/serviceController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const router = express.Router();

// Lấy danh sách dịch vụ theo cơ sở
router.get("/venue/:venueId", authenticateToken, getServicesByVenue);

// Thêm sản phẩm/dịch vụ mới (Cần đăng nhập)
router.post("/", authenticateToken, createService);

// Cập nhật sản phẩm (Cần đăng nhập)
router.put("/:serviceId", authenticateToken, updateService);

// Xóa mềm sản phẩm (Cần đăng nhập)
router.delete("/:serviceId", authenticateToken, deleteService);

module.exports = router;
