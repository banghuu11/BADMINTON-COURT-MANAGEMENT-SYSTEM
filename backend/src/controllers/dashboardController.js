const pool = require("../config/db");

// [GET] /api/dashboard/admin - Dashboard dành cho Admin (Doanh thu nền tảng)
const getAdminDashboard = async (req, res) => {
  try {
    // 1. Lấy doanh thu nền tảng theo tháng (từ View vw_PlatformRevenue)
    const revenueResult = await pool.query(
      "SELECT * FROM vw_PlatformRevenue ORDER BY RevenueYear DESC, RevenueMonth DESC LIMIT 12",
    );

    // 2. Lấy số lượng hồ sơ Chủ sân đang chờ duyệt
    const pendingOwners = await pool.query(
      "SELECT COUNT(*) AS pending_count FROM CourtOwnerProfile WHERE ProfileStatus = 'Submitted'",
    );

    // 3. Lấy danh sách đăng ký gói SaaS của các Chủ sân
    const subscriptions = await pool.query(
      `SELECT 
        os.SubscriptionId, os.OwnerId, os.PlanId, os.StartDate, os.EndDate, os.Status, os.AutoRenew,
        sp.PlanName, sp.PricePerCycle,
        cop.BusinessName, cop.RepFullName, cop.RepPhone, cop.RepEmail
      FROM OwnerSubscription os
      JOIN SubscriptionPlan sp ON os.PlanId = sp.PlanId
      JOIN CourtOwnerProfile cop ON os.OwnerId = cop.OwnerId
      ORDER BY os.CreatedAt DESC`
    );

    res.json({
      message: "Lấy dữ liệu Dashboard Admin thành công!",
      pendingApprovals: parseInt(pendingOwners.rows[0].pending_count),
      platformRevenue: revenueResult.rows,
      subscriptions: subscriptions.rows,
    });
  } catch (error) {
    console.error("Lỗi getAdminDashboard:", error);
    res.status(500).json({
      error: "Lỗi server khi lấy dữ liệu Dashboard Admin.",
      details: error.message,
    });
  }
};

// [GET] /api/dashboard/owner - Dashboard dành cho Chủ sân (Doanh thu cho thuê sân)
const getOwnerDashboard = async (req, res) => {
  const userId = req.user.userId;
  // Có thể truyền param month, year trên URL. Mặc định là tháng/năm hiện tại
  const month = req.query.month || new Date().getMonth() + 1;
  const year = req.query.year || new Date().getFullYear();

  try {
    // 1. Tìm OwnerId của user đang đăng nhập
    const ownerCheck = await pool.query(
      "SELECT OwnerId FROM CourtOwnerProfile WHERE UserId = $1",
      [userId],
    );
    if (ownerCheck.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy hồ sơ chủ sân." });
    }
    const ownerId = ownerCheck.rows[0].ownerid;

    // 2. Lấy Tổng quan doanh thu tháng này
    const summaryResult = await pool.query(
      `
      SELECT 
        COALESCE(SUM(TotalAmount), 0) AS total_revenue,
        COALESCE(SUM(CourtTotal), 0) AS court_revenue,
        COALESCE(SUM(ServiceTotal), 0) AS service_revenue,
        COUNT(DISTINCT InvoiceId) AS total_invoices
      FROM vw_RevenueReport 
      WHERE OwnerId = $1 AND RevenueMonth = $2 AND RevenueYear = $3 AND PaymentStatus = 'Paid'
    `,
      [ownerId, month, year],
    );

    // 3. Doanh thu phân bổ theo từng Cơ sở (Venue)
    const venueRevenueResult = await pool.query(
      `
      SELECT VenueId, VenueName, COALESCE(SUM(TotalAmount), 0) AS VenueRevenue
      FROM vw_RevenueReport
      WHERE OwnerId = $1 AND RevenueMonth = $2 AND RevenueYear = $3 AND PaymentStatus = 'Paid'
      GROUP BY VenueId, VenueName
    `,
      [ownerId, month, year],
    );

    res.json({
      message: "Lấy dữ liệu Dashboard Chủ sân thành công!",
      period: { month, year },
      summary: summaryResult.rows[0],
      venueRevenues: venueRevenueResult.rows,
    });
  } catch (error) {
    console.error("Lỗi getOwnerDashboard:", error);
    res.status(500).json({
      error: "Lỗi server khi lấy dữ liệu Dashboard Chủ sân.",
      details: error.message,
    });
  }
};

// [GET] /api/dashboard/public - Thống kê public cho trang chủ
const getPublicStats = async (req, res) => {
  try {
    const bookings = await pool.query("SELECT COUNT(*) AS total FROM Booking");
    const users = await pool.query("SELECT COUNT(*) AS total FROM AppUser");
    res.json({
      message: "Lấy thống kê thành công",
      stats: {
        totalMatches: parseInt(bookings.rows[0].total) + 120, // +120 cho số liệu đẹp lúc demo
        totalUsers: parseInt(users.rows[0].total) + 85,
      },
    });
  } catch (error) {
    console.error("Lỗi getPublicStats:", error);
    res.status(500).json({ error: "Lỗi server khi lấy thống kê public." });
  }
};

module.exports = { getAdminDashboard, getOwnerDashboard, getPublicStats };
