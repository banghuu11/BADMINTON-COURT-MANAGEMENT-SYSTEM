const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
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
const notificationRoutes = require("./src/routes/notification");
const paymentRoutes = require("./src/routes/payment");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Chỉnh sửa lại domain frontend nếu cần
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
  }
});

// Lưu `io` vào app để có thể sử dụng trong các Controller
app.set("io", io);

// Lắng nghe kết nối Socket
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Tham gia vào Room mang tên UserId
  socket.on("join-room", (userId) => {
    socket.join(userId.toString());
    console.log(`Socket ${socket.id} joined room: ${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

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
app.use("/api/notifications", notificationRoutes);
app.use("/api/payment", paymentRoutes);

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

// Khởi tạo Cron Jobs
const initCronJobs = require("./src/jobs/checkSubscriptions");
initCronJobs(app);

server.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
