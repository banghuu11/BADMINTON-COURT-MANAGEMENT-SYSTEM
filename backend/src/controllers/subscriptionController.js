const pool = require("../config/db");
const { createNotification } = require("../utils/notificationHelper");
const { createMomoPaymentUrl } = require("../services/momoService");

// Lấy thông tin gói dịch vụ hiện tại của Chủ sân
const getMySubscription = async (req, res) => {
  const ownerId = req.user.userId;

  try {
    const query = `
      SELECT os.*, sp.PlanName, sp.MaxVenues, sp.MaxCourtsPerVenue, sp.MaxStaff, sp.HasAdvancedReport
      FROM OwnerSubscription os
      JOIN SubscriptionPlan sp ON os.PlanId = sp.PlanId
      WHERE os.OwnerId = $1
      ORDER BY os.EndDate DESC
      LIMIT 1
    `;
    const result = await pool.query(query, [ownerId]);

    if (result.rows.length === 0) {
      return res.json({ message: "Chưa đăng ký gói nào", subscription: null });
    }

    res.json({ subscription: result.rows[0] });
  } catch (error) {
    console.error("Lỗi getMySubscription:", error);
    res.status(500).json({ error: "Lỗi hệ thống khi lấy thông tin gói." });
  }
};

// Lấy lịch sử giao dịch gói (PlatformInvoice) của Chủ sân
const getMyInvoices = async (req, res) => {
  const ownerId = req.user.userId;

  try {
    const query = `
      SELECT pi.*, sp.PlanName, os.BillingCycle
      FROM PlatformInvoice pi
      JOIN OwnerSubscription os ON pi.SubscriptionId = os.SubscriptionId
      JOIN SubscriptionPlan sp ON os.PlanId = sp.PlanId
      WHERE pi.OwnerId = $1
      ORDER BY pi.CreatedAt DESC
    `;
    const result = await pool.query(query, [ownerId]);
    res.json({ invoices: result.rows });
  } catch (error) {
    console.error("Lỗi getMyInvoices:", error);
    res.status(500).json({ error: "Lỗi hệ thống khi lấy lịch sử giao dịch." });
  }
};

// Đăng ký mới hoặc Gia hạn gói dịch vụ (Tích hợp luồng Mock Payment)
const subscribePlan = async (req, res) => {
  const ownerId = req.user.userId;
  const { planId, billingCycle, autoRenew, paymentMethod } = req.body; // billingCycle có thể là 'Monthly' hoặc 'Yearly'

  if (!planId || !billingCycle || !paymentMethod) {
    return res.status(400).json({ error: "Vui lòng cung cấp đủ thông tin thanh toán gói." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Lấy giá của Gói dịch vụ
    const planResult = await client.query("SELECT * FROM SubscriptionPlan WHERE PlanId = $1", [planId]);
    if (planResult.rows.length === 0) {
      throw new Error("Gói dịch vụ không tồn tại!");
    }
    const plan = planResult.rows[0];

    // Tính toán số tiền (Mock)
    let finalAmount = Number(plan.pricepercycle);
    if (billingCycle === 'Yearly') {
      finalAmount = finalAmount * 12 * 0.9; // Giảm 10% nếu mua năm
    }

    // 2. Tính toán ngày bắt đầu và kết thúc
    let startDate = new Date();
    let endDate = new Date();
    let isUpgrade = false;
    
    // Kiểm tra xem đã có gói nào đang Active chưa
    const currentSubResult = await client.query(
      "SELECT PlanId, EndDate FROM OwnerSubscription WHERE OwnerId = $1 AND Status = 'Active' ORDER BY EndDate DESC LIMIT 1",
      [ownerId]
    );

    if (currentSubResult.rows.length > 0 && new Date(currentSubResult.rows[0].enddate) > new Date()) {
      const currentSub = currentSubResult.rows[0];
      // Nếu là gói MỚI (nâng cấp/đổi gói), không cộng dồn ngày, áp dụng ngay lập tức
      if (currentSub.planid !== planId) {
        isUpgrade = true;
        // Bắt đầu ngay hôm nay
        startDate = new Date();
        endDate = new Date();
      } else {
        // Nếu mua cùng loại gói (Gia hạn), StartDate sẽ là sau khi gói cũ hết hạn
        startDate = new Date(currentSub.enddate);
        endDate = new Date(currentSub.enddate);
      }
    }

    // Cộng thêm thời hạn
    if (billingCycle === 'Monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (billingCycle === 'Yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    // 3. Hủy kích hoạt gói cũ
    if (isUpgrade) {
      await client.query("UPDATE OwnerSubscription SET Status = 'Upgraded' WHERE OwnerId = $1 AND Status = 'Active'", [ownerId]);
    } else {
      await client.query("UPDATE OwnerSubscription SET Status = 'Replaced' WHERE OwnerId = $1 AND Status = 'Active'", [ownerId]);
    }

    // 4. Tạo Subscription mới
    const insertSub = `
      INSERT INTO OwnerSubscription (OwnerId, PlanId, FinalAmount, AutoRenew, StartDate, EndDate, PriceCharged, DiscountAmount, BillingCycle, Status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'Active') RETURNING *
    `;
    const subValues = [
      ownerId,
      planId,
      finalAmount,
      autoRenew || false,
      startDate,
      endDate,
      plan.pricepercycle,
      0, // discount
      billingCycle
    ];
    const newSubResult = await client.query(insertSub, subValues);

    // 5. Tạo PlatformInvoice (Hóa đơn phí nền tảng cho Chủ sân)
    const invoiceCode = "PLAT-" + Date.now().toString().slice(-6);
    const insertInvoice = `
      INSERT INTO PlatformInvoice (OwnerId, SubscriptionId, InvoiceCode, Amount, Status, PaidAt, PaymentMethod)
      VALUES ($1, $2, $3, $4, 'Paid', CURRENT_TIMESTAMP, $5)
    `;
    await client.query(insertInvoice, [
      ownerId,
      newSubResult.rows[0].subscriptionid,
      invoiceCode,
      finalAmount,
      paymentMethod
    ]);

    await client.query("COMMIT");

    // Gửi thông báo
    await createNotification(
      req.app, 
      ownerId, 
      "Thanh toán Gói Dịch Vụ", 
      `Gói dịch vụ ${plan.planname} của bạn đã được kích hoạt thành công. Hạn dùng tới ${endDate.toLocaleDateString('vi-VN')}`, 
      "System"
    );

    res.json({ message: "Đăng ký gói dịch vụ thành công!", subscription: newSubResult.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Lỗi subscribePlan:", error);
    res.status(500).json({ error: "Lỗi thanh toán gói dịch vụ.", details: error.message });
  } finally {
    client.release();
  }
};

// Tạo mã QR thanh toán MoMo
const createMomoQr = async (req, res) => {
  const ownerId = req.user.userId;
  const { planId, billingCycle } = req.body;

  if (!planId || !billingCycle) {
    return res.status(400).json({ error: "Thiếu thông tin tạo mã QR." });
  }

  try {
    const planResult = await pool.query("SELECT * FROM SubscriptionPlan WHERE PlanId = $1", [planId]);
    if (planResult.rows.length === 0) {
      return res.status(404).json({ error: "Gói không tồn tại." });
    }
    const plan = planResult.rows[0];

    // Tính tiền
    let finalAmount = Number(plan.pricepercycle);
    if (billingCycle === 'Yearly') {
      finalAmount = finalAmount * 12 * 0.9;
    }

    const orderId = "SUB_" + Date.now();
    const orderInfo = `Thanh toan goi ${plan.planname}`;
    
    // Gọi MoMo
    const payUrl = await createMomoPaymentUrl(orderId, finalAmount, orderInfo);
    
    res.json({ payUrl });
  } catch (error) {
    console.error("Lỗi tạo QR MoMo:", error);
    res.status(500).json({ error: "Lỗi tạo thanh toán MoMo." });
  }
};

module.exports = {
  getMySubscription,
  getMyInvoices,
  subscribePlan,
  createMomoQr
};
