const pool = require("../config/db");

const fetchInvoiceDetails = async (invoiceId) => {
  const invoiceQuery = `
    SELECT 
      i.*,
      b.GuestName, b.GuestPhone, b.BookingCode,
      v.VenueName, v.Address AS VenueAddress, v.PhoneNumber AS VenuePhone, 
      v.BankName, v.BankAccount, v.BankOwner, v.QRCodeUrl,
      u.FullName AS CustomerName, u.PhoneNumber AS CustomerPhone
    FROM Invoice i
    JOIN Booking b ON i.BookingId = b.BookingId
    LEFT JOIN AppUser u ON b.CustomerId = u.UserId
    LEFT JOIN BookingSlot bs ON b.BookingId = bs.BookingId
    LEFT JOIN Court c ON bs.CourtId = c.CourtId
    LEFT JOIN Venue v ON c.VenueId = v.VenueId
    WHERE i.InvoiceId = $1
    LIMIT 1
  `;
  const invRes = await pool.query(invoiceQuery, [invoiceId]);
  if (invRes.rows.length === 0) return null;
  
  const invoice = invRes.rows[0];

  const slotsQuery = `
    SELECT bs.PlayDate, bs.StartTime, bs.EndTime, c.CourtName, bs.AppliedPrice, bs.DurationMinutes
    FROM BookingSlot bs
    JOIN Court c ON bs.CourtId = c.CourtId
    WHERE bs.BookingId = $1
    ORDER BY bs.PlayDate, bs.StartTime
  `;
  const slots = await pool.query(slotsQuery, [invoice.bookingid]);

  const servicesQuery = `
    SELECT si.ServiceName, bsv.Quantity, bsv.UnitPrice, bsv.TotalPrice
    FROM BookingService bsv
    JOIN ServiceItem si ON bsv.ServiceId = si.ServiceId
    WHERE bsv.BookingId = $1
  `;
  const services = await pool.query(servicesQuery, [invoice.bookingid]);

  return { invoice, slots: slots.rows, services: services.rows };
};

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

    const details = await fetchInvoiceDetails(invoice.invoiceid);
    res.json({ message: "Tạo hóa đơn thành công!", invoice: invoice, details: details });
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
// [GET] /api/invoices/:invoiceId/details - Lấy chi tiết hóa đơn (in bill)
const getInvoiceDetails = async (req, res) => {
  const { invoiceId } = req.params;
  try {
    const details = await fetchInvoiceDetails(invoiceId);
    if (!details) {
      return res.status(404).json({ error: "Không tìm thấy hóa đơn" });
    }
    res.json(details);
  } catch (error) {
    console.error("Lỗi getInvoiceDetails:", error);
    res.status(500).json({ error: "Lỗi server khi lấy chi tiết hóa đơn.", details: error.message });
  }
};

module.exports = { generateInvoice, payInvoice, getInvoiceDetails };
