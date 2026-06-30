const pool = require("../config/db");
const { createNotification } = require("../utils/notificationHelper");

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
