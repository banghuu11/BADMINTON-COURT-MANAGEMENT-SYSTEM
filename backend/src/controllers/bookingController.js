const pool = require("../config/db");

// [GET] /api/booking/available - Kiểm tra sân trống và lấy giá áp dụng
const checkAvailability = async (req, res) => {
  // Dữ liệu truy vấn dạng query string: ?courtId=1&playDate=2024-10-15&startTime=18:00&endTime=19:00
  const { courtId, playDate, startTime, endTime } = req.query;

  if (!courtId || !playDate || !startTime || !endTime) {
    return res.status(400).json({
      error: "Thiếu thông tin tra cứu (courtId, playDate, startTime, endTime)!",
    });
  }

  try {
    // 1. Gọi Postgres Function kiểm tra xem có xung đột lịch nào không
    const availResult = await pool.query(
      `SELECT fn_CheckCourtAvailability($1, $2, $3, $4) AS conflict_count`,
      [courtId, playDate, startTime, endTime],
    );

    const conflictCount = availResult.rows[0].conflict_count;
    if (conflictCount > 0) {
      return res.json({
        isAvailable: false,
        message: "Sân đã có người đặt trong khung giờ này!",
      });
    }

    // 2. Nếu sân trống, gọi Postgres Function để lấy ra giá tiền áp dụng cho lúc đó
    const priceResult = await pool.query(
      `SELECT * FROM fn_GetApplicablePrice($1, $2, $3)`,
      [courtId, playDate, startTime],
    );

    res.json({
      isAvailable: true,
      message: "Sân đang trống!",
      pricingDetail: priceResult.rows[0] || null,
    });
  } catch (error) {
    console.error("Lỗi checkAvailability:", error);
    res.status(500).json({
      error: "Lỗi server khi kiểm tra sân trống.",
      details: error.message,
    });
  }
};

// [POST] /api/booking - Tạo đơn đặt sân mới
const createBooking = async (req, res) => {
  // Mặc định lấy userId từ token (nếu khách hàng đã đăng nhập)
  const customerId = req.user ? req.user.userId : null;
  const { guestName, guestPhone, bookingType, note, slots } = req.body;

  if (!slots || !Array.isArray(slots) || slots.length === 0) {
    return res
      .status(400)
      .json({ error: "Vui lòng chọn ít nhất 1 ca chơi (slot)!" });
  }

  const client = await pool.connect(); // Dùng client riêng để chạy Transaction
  try {
    await client.query("BEGIN");

    // 1. Tạo mã BookingCode ngẫu nhiên (Ví dụ: BK + timestamp 6 số cuối + random)
    const bookingCode =
      "BK" + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);

    // 2. Lưu thông tin chung vào bảng Booking
    const insertBookingQuery = `
      INSERT INTO Booking (CustomerId, GuestName, GuestPhone, BookingCode, BookingType, Source, Note, BookingStatus)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pending') RETURNING BookingId, BookingCode
    `;
    const bookingValues = [
      customerId,
      guestName || null,
      guestPhone || null,
      bookingCode,
      bookingType || "Online",
      "Web",
      note || null,
    ];
    const bookingResult = await client.query(insertBookingQuery, bookingValues);
    const newBooking = bookingResult.rows[0];

    // 3. Duyệt qua mảng slots để lưu vào bảng BookingSlot
    for (const slot of slots) {
      const {
        courtId,
        playDate,
        startTime,
        endTime,
        appliedPrice,
        positionIndex = 0,
      } = slot;

      // Kiểm tra đúp (Double-check): Tránh trường hợp 2 người cùng submit trùng 1 giây
      const checkConflict = await client.query(
        `SELECT fn_CheckCourtAvailability($1, $2, $3, $4, -1, $5) AS conflict_count`,
        [courtId, playDate, startTime, endTime, positionIndex],
      );
      if (checkConflict.rows[0].conflict_count > 0) {
        throw new Error(
          `Rất tiếc, sân (ID: ${courtId}) vào ngày ${playDate} lúc ${startTime}-${endTime} vừa bị người khác đặt!`,
        );
      }

      const insertSlotQuery = `
        INSERT INTO BookingSlot (BookingId, CourtId, PlayDate, StartTime, EndTime, AppliedPrice, SlotStatus, PositionIndex)
        VALUES ($1, $2, $3, $4, $5, $6, 'NotStarted', $7)
      `;
      await client.query(insertSlotQuery, [
        newBooking.bookingid,
        courtId,
        playDate,
        startTime,
        endTime,
        appliedPrice,
        positionIndex,
      ]);
    }

    await client.query("COMMIT"); // Lưu tất cả vào Database
    res
      .status(201)
      .json({ message: "Đặt sân thành công!", booking: newBooking });
  } catch (error) {
    await client.query("ROLLBACK"); // Nếu có lỗi (hoặc trùng lịch), hủy bỏ toàn bộ thay đổi
    console.error("Lỗi createBooking:", error);
    res.status(500).json({ error: "Lỗi khi đặt sân.", details: error.message });
  } finally {
    client.release(); // Trả client về lại cho pool
  }
};

// [GET] /api/booking/history - Lấy danh sách lịch sử đặt sân của user hiện tại
const getMyBookings = async (req, res) => {
  const customerId = req.user.userId;

  try {
    const query = `
      SELECT b.BookingId, b.BookingCode, b.BookingType, b.BookingStatus, b.DepositAmount, b.CreatedAt, b.Note,
             json_agg(
                 json_build_object(
                     'slotId', bs.SlotId,
                     'courtId', bs.CourtId,
                     'venueId', v.VenueId,
                     'courtName', c.CourtName,
                     'venueName', v.VenueName,
                     'playDate', bs.PlayDate,
                     'startTime', bs.StartTime,
                     'endTime', bs.EndTime,
                     'slotStatus', bs.SlotStatus,
                     'appliedPrice', bs.AppliedPrice
                 )
             ) as slots
      FROM Booking b
      LEFT JOIN BookingSlot bs ON b.BookingId = bs.BookingId
      LEFT JOIN Court c ON bs.CourtId = c.CourtId
      LEFT JOIN Venue v ON c.VenueId = v.VenueId
      WHERE b.CustomerId = $1
      GROUP BY b.BookingId
      ORDER BY b.CreatedAt DESC
    `;
    const result = await pool.query(query, [customerId]);
    res.json({
      message: "Lấy lịch sử đặt sân thành công!",
      bookings: result.rows,
    });
  } catch (error) {
    console.error("Lỗi getMyBookings:", error);
    res.status(500).json({
      error: "Lỗi server khi lấy lịch sử đặt sân.",
      details: error.message,
    });
  }
};

// [PATCH] /api/booking/slot/:slotId/check-in - Lễ tân check-in nhận sân
const checkInSlot = async (req, res) => {
  const { slotId } = req.params;

  try {
    // 1. Kiểm tra ca chơi có tồn tại không
    const checkSlot = await pool.query(
      "SELECT * FROM BookingSlot WHERE SlotId = $1",
      [slotId],
    );
    if (checkSlot.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy ca chơi (Slot) này!" });
    }

    const slot = checkSlot.rows[0];
    // 2. Chỉ cho phép check-in nếu trạng thái đang là NotStarted
    if (slot.slotstatus !== "NotStarted") {
      return res.status(400).json({
        error: `Không thể check-in. Trạng thái ca chơi hiện tại đang là: ${slot.slotstatus}`,
      });
    }

    // 3. Cập nhật trạng thái thành 'Playing' và lưu thời gian CheckInAt
    const updateQuery = `
      UPDATE BookingSlot
      SET SlotStatus = 'Playing', CheckInAt = CURRENT_TIMESTAMP
      WHERE SlotId = $1 RETURNING *
    `;
    const updatedSlot = await pool.query(updateQuery, [slotId]);

    res.json({
      message: "Check-in nhận sân thành công!",
      slot: updatedSlot.rows[0],
    });
  } catch (error) {
    console.error("Lỗi checkInSlot:", error);
    res.status(500).json({
      error: "Lỗi server khi check-in nhận sân.",
      details: error.message,
    });
  }
};

// [PATCH] /api/booking/slot/:slotId/check-out - Lễ tân trả sân (Check-out)
const checkOutSlot = async (req, res) => {
  const { slotId } = req.params;

  try {
    const checkSlot = await pool.query(
      "SELECT SlotStatus FROM BookingSlot WHERE SlotId = $1",
      [slotId],
    );
    if (checkSlot.rows.length === 0)
      return res.status(404).json({ error: "Không tìm thấy ca chơi!" });

    if (checkSlot.rows[0].slotstatus !== "Playing") {
      return res.status(400).json({
        error: "Chỉ có thể Check-out khi sân đang ở trạng thái 'Playing'.",
      });
    }

    const updateQuery = `
      UPDATE BookingSlot SET SlotStatus = 'Finished', CheckOutAt = CURRENT_TIMESTAMP WHERE SlotId = $1 RETURNING *
    `;
    const updatedSlot = await pool.query(updateQuery, [slotId]);
    res.json({
      message: "Check-out trả sân thành công!",
      slot: updatedSlot.rows[0],
    });
  } catch (error) {
    console.error("Lỗi checkOutSlot:", error);
    res
      .status(500)
      .json({ error: "Lỗi server khi check-out.", details: error.message });
  }
};

// [PATCH] /api/booking/:bookingId/cancel - Khách hàng hoặc Admin Hủy đặt sân
const cancelBooking = async (req, res) => {
  const { bookingId } = req.params;
  const { cancelReason } = req.body;
  const userId = req.user.userId;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Kiểm tra Booking có tồn tại và chưa bị hủy không
    const booking = await client.query(
      "SELECT BookingStatus FROM Booking WHERE BookingId = $1",
      [bookingId],
    );
    if (booking.rows.length === 0)
      throw new Error("Không tìm thấy đơn đặt sân!");
    if (
      booking.rows[0].bookingstatus === "Cancelled" ||
      booking.rows[0].bookingstatus === "Completed"
    ) {
      throw new Error(
        "Không thể hủy đơn đặt sân đã hoàn thành hoặc đã hủy trước đó!",
      );
    }

    // Cập nhật trạng thái Booking
    await client.query(
      `
      UPDATE Booking SET BookingStatus = 'Cancelled', CancelledBy = $1, CancelReason = $2, CancelledAt = CURRENT_TIMESTAMP WHERE BookingId = $3
    `,
      [userId, cancelReason || "Khách yêu cầu hủy", bookingId],
    );

    // Cập nhật toàn bộ các Slot chưa bắt đầu thành Cancelled để nhả sân cho người khác đặt
    await client.query(
      `UPDATE BookingSlot SET SlotStatus = 'Cancelled' WHERE BookingId = $1 AND SlotStatus = 'NotStarted'`,
      [bookingId],
    );

    await client.query("COMMIT");
    res.json({ message: "Hủy đặt sân thành công!" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Lỗi cancelBooking:", error);
    res
      .status(500)
      .json({ error: "Lỗi khi hủy đặt sân.", details: error.message });
  } finally {
    client.release();
  }
};

// [POST] /api/booking/:bookingId/add-service - Thêm dịch vụ vào đơn đặt sân (và tự động cập nhật hóa đơn nếu có)
const addServiceToBooking = async (req, res) => {
  const { bookingId } = req.params;
  const { serviceId, quantity, slotId } = req.body; // slotId là tùy chọn (nếu muốn biết mua ở ca nào)
  const addedBy = req.user.userId;

  if (!serviceId || !quantity || quantity <= 0) {
    return res.status(400).json({
      error: "Vui lòng cung cấp ServiceId và Số lượng (Quantity) hợp lệ!",
    });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Lấy đơn giá và kiểm tra tồn kho từ bảng ServiceItem
    const serviceResult = await client.query(
      "SELECT UnitPrice, StockQuantity, ServiceName FROM ServiceItem WHERE ServiceId = $1",
      [serviceId],
    );
    if (serviceResult.rows.length === 0) {
      throw new Error("Không tìm thấy dịch vụ/sản phẩm này trong kho!");
    }

    const { unitprice, stockquantity, servicename } = serviceResult.rows[0];

    if (stockquantity < quantity) {
      throw new Error(
        `Sản phẩm ${servicename} không đủ số lượng tồn kho (Chỉ còn ${stockquantity}).`,
      );
    }

    // 2. Thêm vào bảng BookingService
    const insertServiceQuery = `
      INSERT INTO BookingService (BookingId, SlotId, ServiceId, Quantity, UnitPrice, AddedBy)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
    `;
    const newService = await client.query(insertServiceQuery, [
      bookingId,
      slotId || null,
      serviceId,
      quantity,
      unitPrice,
      addedBy,
    ]);

    // 2.1 TRỪ TỒN KHO VÀ GHI LOG (BẢN VÁ LỖI)
    await client.query(
      "UPDATE ServiceItem SET StockQuantity = StockQuantity - $1 WHERE ServiceId = $2",
      [quantity, serviceId],
    );
    await client.query(
      "INSERT INTO StockTransaction (ServiceId, StaffId, TransactionType, Quantity, Note) VALUES ($1, $2, 'Export', $3, 'Bán kèm đơn đặt sân')",
      [serviceId, addedBy, quantity],
    );

    // 3. Nếu khách đã có Hóa đơn (Invoice), tự động cập nhật lại tổng tiền Hóa đơn
    const checkInvoice = await client.query(
      "SELECT InvoiceId FROM Invoice WHERE BookingId = $1",
      [bookingId],
    );
    if (checkInvoice.rows.length > 0) {
      const calcResult = await client.query(
        "SELECT * FROM fn_CalculateInvoice($1)",
        [bookingId],
      );
      if (calcResult.rows.length > 0) {
        const { courttotal, servicetotal, discount, totalamount } =
          calcResult.rows[0];
        const updateInvoiceQuery = `
          UPDATE Invoice 
          SET CourtTotal = $1, ServiceTotal = $2, DiscountAmount = $3, TotalAmount = $4 
          WHERE BookingId = $5
        `;
        await client.query(updateInvoiceQuery, [
          courttotal,
          servicetotal,
          discount,
          totalamount,
          bookingId,
        ]);
      }
    }

    await client.query("COMMIT");
    res.status(201).json({
      message: "Thêm dịch vụ thành công!",
      bookingService: newService.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Lỗi addServiceToBooking:", error);
    res
      .status(500)
      .json({ error: "Lỗi server khi thêm dịch vụ.", details: error.message });
  } finally {
    client.release();
  }
};

// [GET] /api/booking/matches - Lấy danh sách đang tìm người giao lưu
const getOpenMatches = async (req, res) => {
  try {
    const query = `
      SELECT w.WaitId, w.PlayDate, w.StartTime, w.EndTime, 
             u.FullName, u.AvatarUrl, c.CourtName, v.VenueName
      FROM WaitingList w
      JOIN AppUser u ON w.CustomerId = u.UserId
      JOIN Court c ON w.CourtId = c.CourtId
      JOIN Venue v ON c.VenueId = v.VenueId
      WHERE w.Status = 'Waiting' AND w.PlayDate >= CURRENT_DATE
      ORDER BY w.PlayDate ASC, w.StartTime ASC LIMIT 5
    `;
    const result = await pool.query(query);
    res.json({
      message: "Lấy danh sách giao lưu thành công",
      matches: result.rows,
    });
  } catch (error) {
    console.error("Lỗi getOpenMatches:", error);
    res.status(500).json({ error: "Lỗi server khi lấy danh sách giao lưu." });
  }
};

// [GET] /api/booking/court-schedule - Lấy lịch đã đặt của 1 sân trong 1 ngày
const getCourtSchedule = async (req, res) => {
  const { courtId, playDate } = req.query;
  if (!courtId || !playDate) {
    return res
      .status(400)
      .json({ error: "Thiếu thông tin courtId hoặc playDate" });
  }

  try {
    const result = await pool.query(
      `SELECT StartTime, EndTime, PositionIndex FROM BookingSlot 
       WHERE CourtId = $1 AND PlayDate = $2 AND SlotStatus NOT IN ('Cancelled', 'NoShow')
       ORDER BY StartTime ASC`,
      [courtId, playDate],
    );
    res.json({ message: "Lấy lịch sân thành công", bookedSlots: result.rows });
  } catch (error) {
    console.error("Lỗi getCourtSchedule:", error);
    res.status(500).json({ error: "Lỗi server khi lấy lịch sân." });
  }
};

// [GET] /api/booking/venue/:venueId/today - Lấy danh sách booking của cơ sở
const getVenueBookingsToday = async (req, res) => {
  const { venueId } = req.params;
  const playDate = req.query.date || new Date().toISOString().split("T")[0];

  try {
    const query = `
      SELECT bs.SlotId, bs.PlayDate, bs.StartTime, bs.EndTime, bs.SlotStatus, bs.AppliedPrice,
             b.BookingId, b.BookingCode, b.GuestName, b.GuestPhone, b.BookingStatus,
             c.CourtName, u.FullName as CustomerName, u.PhoneNumber as CustomerPhone
      FROM BookingSlot bs
      JOIN Booking b ON bs.BookingId = b.BookingId
      JOIN Court c ON bs.CourtId = c.CourtId
      LEFT JOIN AppUser u ON b.CustomerId = u.UserId
      WHERE c.VenueId = $1 AND bs.PlayDate = $2
      ORDER BY bs.StartTime ASC, c.CourtName ASC
    `;
    const result = await pool.query(query, [venueId, playDate]);
    res.json({
      message: "Lấy danh sách đặt sân thành công",
      bookings: result.rows,
    });
  } catch (error) {
    console.error("Lỗi getVenueBookingsToday:", error);
    res
      .status(500)
      .json({ error: "Lỗi server khi lấy danh sách.", details: error.message });
  }
};

module.exports = {
  checkAvailability,
  createBooking,
  getMyBookings,
  checkInSlot,
  checkOutSlot,
  cancelBooking,
  addServiceToBooking,
  getOpenMatches,
  getCourtSchedule,
  getVenueBookingsToday,
};
