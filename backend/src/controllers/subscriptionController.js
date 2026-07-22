const pool = require("../config/db");
const { createNotification } = require("../utils/notificationHelper");
const { createMomoPaymentUrl } = require("../services/momoService");
const { createCheckout, verifyIpnSecret } = require("../services/sepayService");

const getOwnerProfileId = async (db, userId) => {
  const result = await db.query(
    "SELECT OwnerId FROM CourtOwnerProfile WHERE UserId = $1",
    [userId],
  );
  if (result.rows.length === 0) throw new Error("Không tìm thấy hồ sơ chủ sân.");
  return result.rows[0].ownerid;
};

// Lấy thông tin gói dịch vụ hiện tại của Chủ sân
const getMySubscription = async (req, res) => {
  try {
    const query = `
      SELECT os.*, sp.PlanName, sp.MaxVenues, sp.MaxCourtsPerVenue, sp.MaxStaff, sp.HasAdvancedReport
      FROM OwnerSubscription os
      JOIN SubscriptionPlan sp ON os.PlanId = sp.PlanId
      JOIN CourtOwnerProfile cop ON os.OwnerId = cop.OwnerId
      WHERE cop.UserId = $1
      ORDER BY
        CASE WHEN os.Status = 'Active' THEN 0 ELSE 1 END,
        os.CreatedAt DESC,
        os.SubscriptionId DESC
      LIMIT 1
    `;
    const result = await pool.query(query, [req.user.userId]);

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
  try {
    const query = `
      SELECT pi.*, pi.TotalAmount AS Amount, sp.PlanName, os.BillingCycle
      FROM PlatformInvoice pi
      JOIN OwnerSubscription os ON pi.SubscriptionId = os.SubscriptionId
      JOIN SubscriptionPlan sp ON os.PlanId = sp.PlanId
      JOIN CourtOwnerProfile cop ON pi.OwnerId = cop.OwnerId
      WHERE cop.UserId = $1
      ORDER BY pi.CreatedAt DESC
    `;
    const result = await pool.query(query, [req.user.userId]);
    res.json({ invoices: result.rows });
  } catch (error) {
    console.error("Lỗi getMyInvoices:", error);
    res.status(500).json({ error: "Lỗi hệ thống khi lấy lịch sử giao dịch." });
  }
};

// Đăng ký mới hoặc Gia hạn gói dịch vụ (Tích hợp luồng Mock Payment)
const subscribePlan = async (req, res) => {
  if (process.env.PAYMENT_MOCK_ENABLED !== "true") {
    return res.status(410).json({
      error: "Thanh toán mô phỏng đã tắt. Vui lòng sử dụng cổng SePay.",
    });
  }
  const userId = req.user.userId;
  const { planId, billingCycle, autoRenew, paymentMethod } = req.body; // billingCycle có thể là 'Monthly' hoặc 'Yearly'

  if (!planId || !billingCycle || !paymentMethod) {
    return res.status(400).json({ error: "Vui lòng cung cấp đủ thông tin thanh toán gói." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const ownerId = await getOwnerProfileId(client, userId);

    // 1. Lấy giá của Gói dịch vụ
    const planResult = await client.query("SELECT * FROM SubscriptionPlan WHERE PlanId = $1 AND IsActive = TRUE", [planId]);
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
      INSERT INTO OwnerSubscription (OwnerId, PlanId, AutoRenew, StartDate, EndDate, PriceCharged, DiscountAmount, BillingCycle, Status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Active') RETURNING *
    `;
    const subValues = [
      ownerId,
      planId,
      autoRenew || false,
      startDate,
      endDate,
      plan.pricepercycle,
      0, // discount
      billingCycle
    ];
    const newSubResult = await client.query(insertSub, subValues);

    // 5. Tạo PlatformInvoice (Hóa đơn phí nền tảng cho Chủ sân)
    const invoiceCode = "PLAT-" + Date.now().toString().slice(-10);
    const insertInvoice = `
      INSERT INTO PlatformInvoice (
        OwnerId, SubscriptionId, InvoiceCode, PeriodFrom, PeriodTo, AmountBeforeVAT,
        DueDate, PaymentStatus, PaidAt, PaymentMethod, Note
      ) VALUES ($1, $2, $3, $4, $5, $6, $4, 'Paid', CURRENT_TIMESTAMP, $7, $8)
    `;
    await client.query(insertInvoice, [
      ownerId,
      newSubResult.rows[0].subscriptionid,
      invoiceCode,
      startDate,
      endDate,
      finalAmount,
      paymentMethod,
      "Thanh toán mô phỏng khi đăng ký gói",
    ]);

    await client.query("COMMIT");

    // Gửi thông báo
    await createNotification(
      req.app, 
      userId,
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

// [POST] /api/plans/sepay/checkout
const createSePaySubscriptionCheckout = async (req, res) => {
  const { planId, billingCycle, autoRenew = false } = req.body;
  if (!planId || !["Monthly", "Yearly"].includes(billingCycle)) {
    return res.status(400).json({ error: "Thông tin gói hoặc chu kỳ không hợp lệ." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const ownerId = await getOwnerProfileId(client, req.user.userId);
    const planResult = await client.query(
      "SELECT * FROM SubscriptionPlan WHERE PlanId = $1 AND IsActive = TRUE",
      [planId],
    );
    if (planResult.rows.length === 0) throw new Error("Gói dịch vụ không tồn tại.");
    const plan = planResult.rows[0];

    let amount = Number(plan.pricepercycle);
    if (billingCycle === "Yearly") amount = amount * 12 * 0.9;

    let startDate = new Date();
    let endDate = new Date();
    const currentResult = await client.query(
      `SELECT PlanId, EndDate FROM OwnerSubscription
       WHERE OwnerId = $1 AND Status = 'Active' AND EndDate >= CURRENT_DATE
       ORDER BY CreatedAt DESC, SubscriptionId DESC LIMIT 1`,
      [ownerId],
    );
    if (
      currentResult.rows.length > 0 &&
      Number(currentResult.rows[0].planid) === Number(planId)
    ) {
      startDate = new Date(currentResult.rows[0].enddate);
      endDate = new Date(currentResult.rows[0].enddate);
    }
    if (billingCycle === "Monthly") endDate.setMonth(endDate.getMonth() + 1);
    else endDate.setFullYear(endDate.getFullYear() + 1);

    const subscriptionResult = await client.query(
      `INSERT INTO OwnerSubscription
       (OwnerId, PlanId, BillingCycle, StartDate, EndDate, PriceCharged, DiscountAmount, Status, AutoRenew)
       VALUES ($1, $2, $3, $4, $5, $6, 0, 'PendingPayment', $7)
       RETURNING *`,
      [ownerId, planId, billingCycle, startDate, endDate, amount, Boolean(autoRenew)],
    );
    const subscription = subscriptionResult.rows[0];
    const invoiceCode = `SEP${ownerId}${Date.now()}`;
    const invoiceResult = await client.query(
      `INSERT INTO PlatformInvoice
       (OwnerId, SubscriptionId, InvoiceCode, PeriodFrom, PeriodTo, AmountBeforeVAT,
        VATRate, DueDate, PaymentStatus, PaymentMethod, Note)
       VALUES ($1, $2, $3, $4, $5, $6, 0, CURRENT_DATE, 'Unpaid', 'SePay', $7)
       RETURNING TotalAmount`,
      [
        ownerId,
        subscription.subscriptionid,
        invoiceCode,
        startDate,
        endDate,
        amount,
        "Chờ xác nhận thanh toán từ SePay",
      ],
    );
    const checkout = createCheckout({
      invoiceCode,
      amount: invoiceResult.rows[0].totalamount,
      description: `Thanh toan goi ${plan.planname}`,
      customerId: `OWNER${ownerId}`,
    });
    await client.query("COMMIT");
    res.status(201).json({ ...checkout, invoiceCode });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Lỗi tạo checkout SePay:", error);
    res.status(500).json({ error: error.message || "Không thể tạo checkout SePay." });
  } finally {
    client.release();
  }
};

// [POST] /api/plans/sepay/ipn - SePay gọi endpoint public này sau thanh toán.
const handleSePayIpn = async (req, res) => {
  try {
    if (!verifyIpnSecret(req.get("X-Secret-Key"))) {
      return res.status(401).json({ success: false, error: "IPN không hợp lệ." });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  const { notification_type: notificationType, order, transaction } = req.body || {};
  if (notificationType !== "ORDER_PAID") return res.json({ success: true });
  if (
    order?.order_status !== "CAPTURED" ||
    transaction?.transaction_status !== "APPROVED" ||
    order?.order_currency !== "VND"
  ) {
    return res.status(400).json({ success: false, error: "Trạng thái giao dịch không hợp lệ." });
  }

  const client = await pool.connect();
  let notificationData = null;
  try {
    await client.query("BEGIN");
    const invoiceResult = await client.query(
      `SELECT pi.*, os.PlanId, os.Status AS SubscriptionStatus, os.EndDate,
              sp.PlanName, cop.UserId
       FROM PlatformInvoice pi
       JOIN OwnerSubscription os ON os.SubscriptionId = pi.SubscriptionId
       JOIN SubscriptionPlan sp ON sp.PlanId = os.PlanId
       JOIN CourtOwnerProfile cop ON cop.OwnerId = pi.OwnerId
       WHERE pi.InvoiceCode = $1
       FOR UPDATE OF pi, os`,
      [order.order_invoice_number],
    );
    if (invoiceResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, error: "Không tìm thấy hóa đơn." });
    }
    const invoice = invoiceResult.rows[0];
    if (invoice.paymentstatus === "Paid") {
      await client.query("COMMIT");
      return res.json({ success: true, duplicate: true });
    }

    const paidAmount = Number(order.order_amount);
    const transactionAmount = Number(transaction.transaction_amount);
    if (
      paidAmount !== Number(invoice.totalamount) ||
      transactionAmount !== Number(invoice.totalamount)
    ) {
      throw new Error("Số tiền SePay không khớp hóa đơn.");
    }
    const duplicateTransaction = await client.query(
      `SELECT 1 FROM PlatformInvoice
       WHERE PaymentRef = $1 AND PlatformInvoiceId <> $2 LIMIT 1`,
      [transaction.transaction_id, invoice.platforminvoiceid],
    );
    if (duplicateTransaction.rows.length > 0) throw new Error("Mã giao dịch SePay đã được sử dụng.");
    if (invoice.subscriptionstatus !== "PendingPayment") {
      throw new Error("Gói chờ thanh toán không còn hợp lệ.");
    }

    await client.query(
      `UPDATE OwnerSubscription
       SET Status = CASE WHEN PlanId = $2 THEN 'Replaced' ELSE 'Upgraded' END
       WHERE OwnerId = $1 AND Status = 'Active'`,
      [invoice.ownerid, invoice.planid],
    );
    await client.query(
      "UPDATE OwnerSubscription SET Status = 'Active' WHERE SubscriptionId = $1",
      [invoice.subscriptionid],
    );
    await client.query(
      `UPDATE PlatformInvoice
       SET PaymentStatus = 'Paid', PaidAt = CURRENT_TIMESTAMP,
           PaymentMethod = 'SePay', PaymentRef = $2, Note = 'SePay IPN xác nhận thành công'
       WHERE PlatformInvoiceId = $1`,
      [invoice.platforminvoiceid, transaction.transaction_id],
    );
    await client.query("COMMIT");
    notificationData = invoice;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Lỗi xử lý SePay IPN:", error);
    return res.status(400).json({ success: false, error: error.message });
  } finally {
    client.release();
  }

  try {
    await createNotification(
      req.app,
      notificationData.userid,
      "Thanh toán SePay thành công",
      `Gói ${notificationData.planname} đã được kích hoạt đến ${new Date(notificationData.enddate).toLocaleDateString("vi-VN")}.`,
      "System",
    );
  } catch (error) {
    console.error("Không thể gửi thông báo sau SePay IPN:", error);
  }
  res.json({ success: true });
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
  createMomoQr,
  createSePaySubscriptionCheckout,
  handleSePayIpn,
};
