const pool = require("../config/db");

// [POST] /api/invoices/booking/:bookingId/generate - Tính tiền & Tạo hóa đơn
const generateInvoice = async (req, res) => {
  const { bookingId } = req.params;
  const cashierId = req.user.userId; // Nhân viên đang thao tác

  try {
    // 1. Gọi function của Postgres để tính tổng tiền (Tiền sân + Tiền dịch vụ - Giảm giá)
    const calcResult = await pool.query(
      "SELECT * FROM fn_CalculateInvoice($1)",
      [bookingId],
    );

    if (calcResult.rows.length === 0) {
      return res
        .status(400)
        .json({ error: "Không thể tính toán hóa đơn cho Booking này!" });
    }

    const { courttotal, servicetotal, discount, totalamount } =
      calcResult.rows[0];

    // 2. Kiểm tra xem Booking này đã có hóa đơn chưa
    const checkInvoice = await pool.query(
      "SELECT * FROM Invoice WHERE BookingId = $1",
      [bookingId],
    );

    let invoice;
    if (checkInvoice.rows.length > 0) {
      // Đã có hóa đơn -> Cập nhật lại số tiền (phòng trường hợp khách mua thêm nước)
      const updateQuery = `
        UPDATE Invoice 
        SET CourtTotal = $1, ServiceTotal = $2, DiscountAmount = $3, TotalAmount = $4 
        WHERE BookingId = $5 RETURNING *
      `;
      const updated = await pool.query(updateQuery, [
        courttotal,
        servicetotal,
        discount,
        totalamount,
        bookingId,
      ]);
      invoice = updated.rows[0];
    } else {
      // Chưa có -> Tạo hóa đơn mới
      const invoiceCode =
        "HD" +
        Date.now().toString().slice(-6) +
        Math.floor(Math.random() * 100);
      const insertQuery = `
        INSERT INTO Invoice (BookingId, InvoiceCode, CashierId, CourtTotal, ServiceTotal, DiscountAmount, TotalAmount, PaymentStatus) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'Unpaid') RETURNING *
      `;
      const inserted = await pool.query(insertQuery, [
        bookingId,
        invoiceCode,
        cashierId,
        courttotal,
        servicetotal,
        discount,
        totalamount,
      ]);
      invoice = inserted.rows[0];
    }

    res.json({ message: "Tạo hóa đơn thành công!", invoice });
  } catch (error) {
    console.error("Lỗi generateInvoice:", error);
    res
      .status(500)
      .json({ error: "Lỗi server khi tạo hóa đơn.", details: error.message });
  }
};

// [POST] /api/invoices/:invoiceId/pay - Thanh toán hóa đơn
const payInvoice = async (req, res) => {
  const { invoiceId } = req.params;
  const { amount, paymentMethod, note } = req.body;
  const cashierId = req.user.userId;

  if (!amount || !paymentMethod) {
    return res
      .status(400)
      .json({ error: "Vui lòng nhập số tiền và phương thức thanh toán!" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Ghi nhận giao dịch thanh toán
    const insertPayment = `INSERT INTO PaymentTransaction (InvoiceId, CashierId, Amount, PaymentMethod, Note) VALUES ($1, $2, $3, $4, $5)`;
    await client.query(insertPayment, [
      invoiceId,
      cashierId,
      amount,
      paymentMethod,
      note || null,
    ]);

    // 2. Cập nhật số tiền đã trả vào Hóa đơn
    const updateInvoice = `
      UPDATE Invoice 
      SET PaidAmount = COALESCE(PaidAmount, 0) + $1, 
          PaymentStatus = CASE WHEN COALESCE(PaidAmount, 0) + $1 >= TotalAmount THEN 'Paid' ELSE 'Partial' END,
          PaymentDate = CURRENT_TIMESTAMP
      WHERE InvoiceId = $2 RETURNING *
    `;
    const result = await client.query(updateInvoice, [amount, invoiceId]);

    await client.query("COMMIT");
    res.json({ message: "Thanh toán thành công!", invoice: result.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Lỗi payInvoice:", error);
    res
      .status(500)
      .json({ error: "Lỗi server khi thanh toán.", details: error.message });
  } finally {
    client.release();
  }
};

module.exports = { generateInvoice, payInvoice };
