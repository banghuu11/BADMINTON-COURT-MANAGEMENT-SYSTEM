const express = require("express");
const cors = require("cors");
const path = require("path");
const pool = require("./src/config/db");
const authRoutes = require("./src/routes/auth");
const planRoutes = require("./src/routes/plans");
const ownerRoutes = require("./src/routes/owner");
const adminRoutes = require("./src/routes/admin");
const venueRoutes = require("./src/routes/venues");
const courtRoutes = require("./src/routes/courts");
const pricingRoutes = require("./src/routes/pricing");
const bookingRoutes = require("./src/routes/booking");
const invoiceRoutes = require("./src/routes/invoices");
const serviceRoutes = require("./src/routes/services");
const dashboardRoutes = require("./src/routes/dashboard");
const reviewRoutes = require("./src/routes/reviews");
const promotionRoutes = require("./src/routes/promotions");

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors()); // Cho phép gọi API từ Frontend
app.use(express.json()); // Phân tích body dưới dạng JSON

// Cấu hình Express phục vụ file tĩnh trong thư mục uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api/courts", courtRoutes);
app.use("/api/pricing", pricingRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/promotions", promotionRoutes);

// Route mặc định
app.get("/", (req, res) => {
  res.send("Server Quản Lý Sân Cầu Lông đang chạy thành công!");
});

// Route test kết nối Database
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()"); // Truy vấn lấy thời gian hiện tại từ DB
    res.json({
      message: "Kết nối Database thành công!",
      databaseTime: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: "Lỗi kết nối DB", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
