const pool = require("../config/db");
const { createNotification } = require("../utils/notificationHelper");
const { createVNPayPaymentUrl, verifyVNPayReturn } = require("../services/vnpayService");
const { createCheckout, verifyIpnSecret } = require("../services/sepayService");

const calculateBookingTotal = async (client, bookingId, customerId) => {
  const bookingResult = await client.query(
    `SELECT b.*, COALESCE(SUM(bs.AppliedPrice), 0) AS CourtTotal
     FROM Booking b
     LEFT JOIN BookingSlot bs ON b.BookingId = bs.BookingId
     WHERE b.BookingId = $1 AND ($2::int IS NULL OR b.CustomerId = $2)
     GROUP BY b.BookingId`,
    [bookingId, customerId]
  );
  if (bookingResult.rows.length === 0) throw new Error("Không tìm thấy đơn đặt sân.");

  const booking = bookingResult.rows[0];
  if (["Paid", "Completed"].includes(booking.bookingstatus)) {
    throw new Error("Đơn này đã được thanh toán hoặc hoàn thành.");
  }

  const calcResult = await client.query("SELECT * FROM fn_CalculateInvoice($1)", [bookingId]);
  const calculated = calcResult.rows[0] || {};
  return {
    booking,
    amount: Number(calculated.totalamount ?? booking.courttotal),
    discount: Number(calculated.discount ?? 0),
  };
};

// [POST] /api/payment/mock-pay
exports.mockPayBooking = async (req, res) => {
  const { bookingId, method } = req.body;
  const userId = req.user.userId;

  if (!bookingId || !method) {
    return res.status(400).json({ error: "Thiếu BookingId hoặc Phương thức thanh toán!" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Lấy thông tin booking để kiểm tra và lấy giá trị
    const bookingResult = await client.query(
      `SELECT b.*, COALESCE(SUM(bs.AppliedPrice), 0) as CourtTotal
       FROM Booking b
       LEFT JOIN BookingSlot bs ON b.BookingId = bs.BookingId
       WHERE b.BookingId = $1
       GROUP BY b.BookingId`,
      [bookingId]
    );

    if (bookingResult.rows.length === 0) {
      throw new Error("Không tìm thấy đơn đặt sân!");
    }

    const booking = bookingResult.rows[0];
    if (booking.bookingstatus === "Paid" || booking.bookingstatus === "Completed") {
      throw new Error("Đơn này đã được thanh toán hoặc hoàn thành!");
    }

    // 1. Cập nhật BookingStatus
    await client.query(
      "UPDATE Booking SET BookingStatus = 'Paid' WHERE BookingId = $1",
      [bookingId]
    );

    // 2. Tính số tiền thanh toán (Tạm tính theo giá sân, thực tế cần hàm fn_CalculateInvoice nếu có dịch vụ)
    const calcResult = await client.query("SELECT * FROM fn_CalculateInvoice($1)", [bookingId]);
    let finalAmount = booking.courttotal;
    let discount = 0;
    if (calcResult.rows.length > 0) {
        finalAmount = calcResult.rows[0].totalamount;
        discount = calcResult.rows[0].discount;
    }

    // 3. Tạo Invoice với trạng thái Paid
    const invoiceCode = "HD" + Date.now().toString().slice(-6) + Math.floor(Math.random() * 100);
    const insertInvoice = `
      INSERT INTO Invoice (BookingId, InvoiceCode, CashierId, CourtTotal, ServiceTotal, DiscountAmount, TotalAmount, PaidAmount, PaymentStatus, PaymentDate) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Paid', CURRENT_TIMESTAMP) RETURNING InvoiceId
    `;
    const invoiceResult = await client.query(insertInvoice, [
      bookingId,
      invoiceCode,
      null, // Tự thanh toán online không có thu ngân
      booking.courttotal,
      0, // Giả sử lúc đặt sân chưa mua dịch vụ
      discount,
      finalAmount,
      finalAmount
    ]);
    const invoiceId = invoiceResult.rows[0].invoiceid;

    // 4. Tạo Transaction
    const insertPayment = `INSERT INTO PaymentTransaction (InvoiceId, CashierId, Amount, PaymentMethod, Note) VALUES ($1, $2, $3, $4, $5)`;
    await client.query(insertPayment, [
      invoiceId,
      null,
      finalAmount,
      method,
      "Thanh toán online (Mock)"
    ]);

    await client.query("COMMIT");

    // 5. Bắn notification real-time qua Socket.IO
    await createNotification(
      req.app, 
      userId, 
      "Thanh toán thành công", 
      `Bạn đã thanh toán thành công ${Number(finalAmount).toLocaleString('vi-VN')}đ cho đơn đặt sân ${booking.bookingcode}.`, 
      "Payment", 
      bookingId
    );

    res.json({ message: "Thanh toán thành công!", bookingId });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Lỗi mockPayBooking:", error);
    res.status(500).json({ error: "Lỗi server khi thanh toán.", details: error.message });
  } finally {
    client.release();
  }
};

// [POST] /api/payment/vnpay/create-payment
exports.createVNPayBookingPayment = async (req, res) => {
  const { bookingId } = req.body;
  if (!bookingId) return res.status(400).json({ error: "Thiếu BookingId." });

  const { VNPAY_TMN_CODE, VNPAY_HASH_SECRET } = process.env;
  if (!VNPAY_TMN_CODE || !VNPAY_HASH_SECRET) {
    return res.status(501).json({ error: "Chưa cấu hình VNPAY_TMN_CODE và VNPAY_HASH_SECRET trong .env. Hệ thống sẽ tự chuyển sang thanh toán Mock để demo." });
  }

  const client = await pool.connect();
  try {
    const { amount } = await calculateBookingTotal(client, bookingId, req.user.userId);
    const transactionRef = `BK${bookingId}T${Date.now()}`;
    const ipAddress = (req.headers["x-forwarded-for"] || req.ip || "127.0.0.1")
      .toString()
      .split(",")[0]
      .trim();
    const paymentUrl = createVNPayPaymentUrl({ amount, transactionRef, ipAddress });
    res.json({ paymentUrl, transactionRef, amount });
  } catch (error) {
    res.status(500).json({ error: error.message || "Không thể tạo liên kết thanh toán VNPay." });
  } finally {
    client.release();
  }
};

// [POST] /api/payment/sepay/checkout
exports.createSePayBookingCheckout = async (req, res) => {
  const { bookingId } = req.body;
  if (!bookingId) return res.status(400).json({ error: "Thiếu BookingId." });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { booking, amount, discount } = await calculateBookingTotal(
      client,
      bookingId,
      req.user.userId,
    );
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("Số tiền thanh toán không hợp lệ.");

    await client.query(
      `UPDATE Invoice
       SET PaymentStatus = 'Cancelled', Note = 'Thay thế bởi giao dịch SePay mới'
       WHERE BookingId = $1 AND PaymentStatus = 'Unpaid'`,
      [bookingId],
    );

    const courtTotal = Number(booking.courttotal);
    const serviceTotal = Math.max(0, amount + discount - courtTotal);
    const invoiceCode = `BKSEP${bookingId}${Date.now()}`;
    const invoiceResult = await client.query(
      `INSERT INTO Invoice
       (BookingId, InvoiceCode, CashierId, PaymentDate, CourtTotal, ServiceTotal,
        DiscountAmount, TotalAmount, PaidAmount, PaymentStatus, Note)
       VALUES ($1, $2, NULL, NULL, $3, $4, $5, $6, 0, 'Unpaid', 'Chờ SePay xác nhận')
       RETURNING InvoiceId, InvoiceCode, TotalAmount`,
      [bookingId, invoiceCode, courtTotal, serviceTotal, discount, amount],
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const checkout = createCheckout({
      invoiceCode,
      amount: invoiceResult.rows[0].totalamount,
      description: `Thanh toan dat san ${booking.bookingcode}`,
      customerId: `CUSTOMER${req.user.userId}`,
      successUrl: `${frontendUrl}/payment/${bookingId}?status=success&gateway=sepay`,
      errorUrl: `${frontendUrl}/payment/${bookingId}?status=failure&gateway=sepay`,
      cancelUrl: `${frontendUrl}/payment/${bookingId}?status=cancel&gateway=sepay`,
    });

    await client.query("COMMIT");
    res.status(201).json({ ...checkout, invoiceCode, amount });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Lỗi tạo checkout SePay cho booking:", error);
    res.status(500).json({ error: error.message || "Không thể tạo checkout SePay." });
  } finally {
    client.release();
  }
};

// SePay IPN cho hóa đơn đặt sân. Route tổng sẽ phân biệt theo tiền tố BKSEP.
exports.handleSePayBookingIpn = async (req, res) => {
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
  let paidBooking = null;
  try {
    await client.query("BEGIN");
    const invoiceResult = await client.query(
      `SELECT i.*, b.CustomerId, b.BookingCode, b.BookingStatus
       FROM Invoice i
       JOIN Booking b ON b.BookingId = i.BookingId
       WHERE i.InvoiceCode = $1
       FOR UPDATE OF i, b`,
      [order.order_invoice_number],
    );
    if (invoiceResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, error: "Không tìm thấy hóa đơn đặt sân." });
    }

    const invoice = invoiceResult.rows[0];
    if (invoice.paymentstatus === "Paid") {
      await client.query("COMMIT");
      return res.json({ success: true, duplicate: true });
    }
    if (invoice.paymentstatus !== "Unpaid") throw new Error("Hóa đơn không còn chờ thanh toán.");

    const orderAmount = Number(order.order_amount);
    const transactionAmount = Number(transaction.transaction_amount);
    if (orderAmount !== Number(invoice.totalamount) || transactionAmount !== Number(invoice.totalamount)) {
      throw new Error("Số tiền SePay không khớp hóa đơn.");
    }

    const duplicateTransaction = await client.query(
      "SELECT 1 FROM PaymentTransaction WHERE TransactionRef = $1 LIMIT 1",
      [transaction.transaction_id],
    );
    if (duplicateTransaction.rows.length > 0) throw new Error("Mã giao dịch SePay đã được sử dụng.");

    await client.query(
      `UPDATE Invoice
       SET PaidAmount = TotalAmount, PaymentStatus = 'Paid', PaymentDate = CURRENT_TIMESTAMP,
           Note = 'SePay IPN xác nhận thành công'
       WHERE InvoiceId = $1`,
      [invoice.invoiceid],
    );
    await client.query("UPDATE Booking SET BookingStatus = 'Paid' WHERE BookingId = $1", [invoice.bookingid]);
    await client.query(
      `INSERT INTO PaymentTransaction
       (InvoiceId, CashierId, Amount, PaymentMethod, TransactionRef, Note)
       VALUES ($1, NULL, $2, 'SePay', $3, 'Thanh toán SePay Sandbox')`,
      [invoice.invoiceid, invoice.totalamount, transaction.transaction_id],
    );
    await client.query("COMMIT");
    paidBooking = invoice;
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Lỗi xử lý SePay IPN cho booking:", error);
    return res.status(400).json({ success: false, error: error.message });
  } finally {
    client.release();
  }

  try {
    await createNotification(
      req.app,
      paidBooking.customerid,
      "Thanh toán SePay thành công",
      `Đơn đặt sân ${paidBooking.bookingcode} đã được thanh toán.`,
      "Payment",
      paidBooking.bookingid,
    );
  } catch (error) {
    console.error("Không thể gửi thông báo thanh toán booking:", error);
  }
  return res.json({ success: true });
};

// URL này được VNPay chuyển hướng người dùng về sau khi thanh toán.
exports.handleVNPayReturn = async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  let verify;

  try {
    verify = verifyVNPayReturn(req.query);
  } catch (error) {
    console.error("Loi verify VNPay return:", error);
    return res.redirect(`${frontendUrl}/payment/?status=failure`);
  }

  if (!verify.isSuccess || String(req.query.vnp_TransactionStatus) !== "00") {
    return res.redirect(`${frontendUrl}/payment/?status=failure`);
  }

  const matched = /^BK(\d+)T\d+$/.exec(String(req.query.vnp_TxnRef || ""));
  if (!matched) {
    return res.redirect(`${frontendUrl}/payment/?status=failure`);
  }

  const bookingId = Number(matched[1]);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { booking, amount, discount } = await calculateBookingTotal(client, bookingId, null);
    const paidAmount = Number(req.query.vnp_Amount) / 100;
    if (paidAmount !== amount) throw new Error("Số tiền phản hồi từ VNPay không khớp hóa đơn.");

    await client.query("UPDATE Booking SET BookingStatus = 'Paid' WHERE BookingId = $1", [bookingId]);
    const invoiceCode = `HD${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 100)}`;
    const invoiceResult = await client.query(
      `INSERT INTO Invoice (BookingId, InvoiceCode, CourtTotal, ServiceTotal, DiscountAmount, TotalAmount, PaidAmount, PaymentStatus, PaymentDate)
       VALUES ($1, $2, $3, 0, $4, $5, $5, 'Paid', CURRENT_TIMESTAMP) RETURNING InvoiceId`,
      [bookingId, invoiceCode, booking.courttotal, discount, amount]
    );
    await client.query(
      `INSERT INTO PaymentTransaction (InvoiceId, Amount, PaymentMethod, TransactionRef, Note)
       VALUES ($1, $2, 'VNPay', $3, 'Thanh toán VNPay Sandbox')`,
      [invoiceResult.rows[0].invoiceid, amount, req.query.vnp_TransactionNo || req.query.vnp_TxnRef]
    );
    await client.query("COMMIT");

    if (booking.customerid) {
      await createNotification(req.app, booking.customerid, "Thanh toán VNPay thành công", `Đơn đặt sân ${booking.bookingcode} đã được thanh toán.`, "Payment", bookingId);
    }

    return res.redirect(`${frontendUrl}/payment/${bookingId}?status=success`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Loi xac nhan thanh toan VNPay:", error);
    return res.redirect(`${frontendUrl}/payment/${bookingId}?status=failure`);
  } finally {
    client.release();
  }
};

// [GET] /api/payment/status/:bookingId
exports.getPaymentStatus = async (req, res) => {
  const { bookingId } = req.params;
  const customerId = req.user ? req.user.userId : null;

  try {
    const result = await pool.query(
      `SELECT b.BookingId, b.BookingStatus, b.BookingCode,
              i.InvoiceId, i.TotalAmount, i.PaymentStatus, i.InvoiceCode
       FROM Booking b
       LEFT JOIN Invoice i ON b.BookingId = i.BookingId
       WHERE b.BookingId = $1 AND ($2::int IS NULL OR b.CustomerId = $2)`,
      [bookingId, customerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy đơn đặt sân." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Lỗi lấy trạng thái thanh toán.", details: error.message });
  }
};
