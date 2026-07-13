const pool = require("../config/db");
const bcrypt = require("bcrypt");

// ==========================================
// 1. DUYỆT HỒ SƠ CHỦ SÂN (Hiện tại)
// ==========================================

// [GET] /api/admin/owners/pending - Lấy danh sách hồ sơ chờ duyệt
const getPendingOwners = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT cop.*, u.Username, u.Email, u.FullName 
       FROM CourtOwnerProfile cop 
       JOIN AppUser u ON cop.UserId = u.UserId 
       WHERE cop.ProfileStatus = 'Submitted'`,
    );
    res.json({ message: "Lấy danh sách thành công!", owners: result.rows });
  } catch (error) {
    console.error("Lỗi getPendingOwners:", error);
    res
      .status(500)
      .json({ error: "Lỗi server khi lấy danh sách.", details: error.message });
  }
};

// [POST] /api/admin/owners/review - Duyệt/Từ chối hồ sơ
const reviewOwnerProfile = async (req, res) => {
  const adminId = req.user.userId;
  const { ownerId, decision, note } = req.body; // decision: 'Approve' | 'Reject' | 'Suspend'

  try {
    await pool.query("CALL sp_ReviewOwnerProfile($1, $2, $3, $4)", [
      ownerId,
      adminId,
      decision,
      note,
    ]);
    res.json({ message: `Hồ sơ đã được xử lý (${decision}) thành công!` });
  } catch (error) {
    console.error("Lỗi reviewOwnerProfile:", error);
    res
      .status(500)
      .json({ error: "Lỗi server khi duyệt hồ sơ.", details: error.message });
  }
};

// [GET] /api/admin/owners - Lấy danh sách tất cả chủ sân (để chọn khi gán Venue)
const getAllOwners = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT cop.OwnerId, cop.RepFullName, cop.BusinessName, u.Username 
       FROM CourtOwnerProfile cop
       JOIN AppUser u ON cop.UserId = u.UserId
       ORDER BY cop.RepFullName ASC`
    );
    res.json({ owners: result.rows });
  } catch (error) {
    console.error("Lỗi getAllOwners:", error);
    res.status(500).json({ error: "Lỗi lấy danh sách chủ sân." });
  }
};

// ==========================================
// 2. QUẢN LÝ NGƯỜI DÙNG (USERS CRUD)
// ==========================================

// [GET] /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.UserId, u.RoleId, u.Username, u.FullName, u.PhoneNumber, u.Email, u.IsActive, u.IsVerified, u.SkillLevel, u.CreatedAt, r.RoleName 
       FROM AppUser u 
       JOIN Role r ON u.RoleId = r.RoleId 
       ORDER BY u.UserId DESC`
    );
    res.json({ users: result.rows });
  } catch (error) {
    console.error("Lỗi getAllUsers:", error);
    res.status(500).json({ error: "Lỗi server khi lấy danh sách người dùng." });
  }
};

// [POST] /api/admin/users
const createUser = async (req, res) => {
  const { roleId, username, password, fullName, phoneNumber, email, isActive, isVerified, skillLevel } = req.body;

  if (!roleId || !username || !password || !fullName || !phoneNumber) {
    return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin bắt buộc." });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO AppUser (RoleId, Username, PasswordHash, FullName, PhoneNumber, Email, IsActive, IsVerified, SkillLevel)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING UserId, Username, FullName, Email`,
      [
        roleId,
        username,
        passwordHash,
        fullName,
        phoneNumber,
        email || null,
        isActive !== undefined ? isActive : true,
        isVerified !== undefined ? isVerified : false,
        skillLevel || "Trung bình"
      ]
    );

    res.status(201).json({ message: "Tạo người dùng thành công!", user: result.rows[0] });
  } catch (error) {
    console.error("Lỗi createUser:", error);
    if (error.code === "23505") { // Unique constraint violation
      return res.status(400).json({ error: "Username, Số điện thoại hoặc Email đã tồn tại." });
    }
    res.status(500).json({ error: "Lỗi server khi tạo người dùng." });
  }
};

// [PUT] /api/admin/users/:id
const updateUser = async (req, res) => {
  const userId = req.params.id;
  const { roleId, fullName, phoneNumber, email, isActive, isVerified, skillLevel, password } = req.body;

  try {
    let passwordHash = null;
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(password, salt);
    }

    let query;
    let params;

    if (passwordHash) {
      query = `
        UPDATE AppUser 
        SET RoleId = $1, FullName = $2, PhoneNumber = $3, Email = $4, IsActive = $5, IsVerified = $6, SkillLevel = $7, PasswordHash = $8, UpdatedAt = CURRENT_TIMESTAMP
        WHERE UserId = $9
        RETURNING UserId, Username, FullName, Email
      `;
      params = [roleId, fullName, phoneNumber, email || null, isActive, isVerified, skillLevel, passwordHash, userId];
    } else {
      query = `
        UPDATE AppUser 
        SET RoleId = $1, FullName = $2, PhoneNumber = $3, Email = $4, IsActive = $5, IsVerified = $6, SkillLevel = $7, UpdatedAt = CURRENT_TIMESTAMP
        WHERE UserId = $8
        RETURNING UserId, Username, FullName, Email
      `;
      params = [roleId, fullName, phoneNumber, email || null, isActive, isVerified, skillLevel, userId];
    }

    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Người dùng không tồn tại." });
    }

    res.json({ message: "Cập nhật người dùng thành công!", user: result.rows[0] });
  } catch (error) {
    console.error("Lỗi updateUser:", error);
    if (error.code === "23505") {
      return res.status(400).json({ error: "Số điện thoại hoặc Email đã tồn tại." });
    }
    res.status(500).json({ error: "Lỗi server khi cập nhật người dùng." });
  }
};

// [DELETE] /api/admin/users/:id
const deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const checkBooking = await pool.query("SELECT COUNT(*) FROM Booking WHERE CustomerId = $1", [userId]);
    if (parseInt(checkBooking.rows[0].count) > 0) {
      return res.status(400).json({ error: "Không thể xóa người dùng này vì họ đã có dữ liệu đặt sân trong hệ thống. Hãy vô hiệu hóa tài khoản của họ." });
    }

    const result = await pool.query("DELETE FROM AppUser WHERE UserId = $1 RETURNING *", [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Người dùng không tồn tại." });
    }

    res.json({ message: "Xóa người dùng thành công!" });
  } catch (error) {
    console.error("Lỗi deleteUser:", error);
    res.status(500).json({ error: "Lỗi server khi xóa người dùng (có ràng buộc khóa ngoại)." });
  }
};

// ==========================================
// 3. QUẢN LÝ GÓI DỊCH VỤ (PLANS CRUD)
// ==========================================

// [GET] /api/admin/plans
const getAllPlansAdmin = async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM SubscriptionPlan ORDER BY SortOrder ASC`);
    res.json({ plans: result.rows });
  } catch (error) {
    console.error("Lỗi getAllPlansAdmin:", error);
    res.status(500).json({ error: "Lỗi lấy danh sách gói dịch vụ." });
  }
};

// [POST] /api/admin/plans
const createPlan = async (req, res) => {
  const {
    planName, planCode, billingCycle, pricePerCycle, originalPrice,
    maxVenues, maxCourtsPerVenue, maxStaff, hasAdvancedReport,
    hasAPIAccess, hasPrioritySupport, hasCustomBranding, storageLimitGB,
    description, isActive, sortOrder
  } = req.body;

  if (!planName || !planCode || !billingCycle || pricePerCycle === undefined) {
    return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin gói dịch vụ." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO SubscriptionPlan (
        PlanName, PlanCode, BillingCycle, PricePerCycle, OriginalPrice,
        MaxVenues, MaxCourtsPerVenue, MaxStaff, HasAdvancedReport,
        HasAPIAccess, HasPrioritySupport, HasCustomBranding, StorageLimitGB,
        Description, IsActive, SortOrder
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
       RETURNING *`,
      [
        planName, planCode, billingCycle, pricePerCycle, originalPrice || null,
        maxVenues !== undefined ? maxVenues : 1,
        maxCourtsPerVenue !== undefined ? maxCourtsPerVenue : 4,
        maxStaff !== undefined ? maxStaff : 3,
        hasAdvancedReport || false,
        hasAPIAccess || false,
        hasPrioritySupport || false,
        hasCustomBranding || false,
        storageLimitGB || 2,
        description || "",
        isActive !== undefined ? isActive : true,
        sortOrder || 0
      ]
    );

    res.status(201).json({ message: "Tạo gói dịch vụ thành công!", plan: result.rows[0] });
  } catch (error) {
    console.error("Lỗi createPlan:", error);
    if (error.code === "23505") {
      return res.status(400).json({ error: "Mã gói dịch vụ (PlanCode) đã tồn tại." });
    }
    res.status(500).json({ error: "Lỗi server khi tạo gói dịch vụ." });
  }
};

// [PUT] /api/admin/plans/:id
const updatePlan = async (req, res) => {
  const planId = req.params.id;
  const {
    planName, planCode, billingCycle, pricePerCycle, originalPrice,
    maxVenues, maxCourtsPerVenue, maxStaff, hasAdvancedReport,
    hasAPIAccess, hasPrioritySupport, hasCustomBranding, storageLimitGB,
    description, isActive, sortOrder
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE SubscriptionPlan 
       SET PlanName = $1, PlanCode = $2, BillingCycle = $3, PricePerCycle = $4, OriginalPrice = $5,
           MaxVenues = $6, MaxCourtsPerVenue = $7, MaxStaff = $8, HasAdvancedReport = $9,
           HasAPIAccess = $10, HasPrioritySupport = $11, HasCustomBranding = $12, StorageLimitGB = $13,
           Description = $14, IsActive = $15, SortOrder = $16
       WHERE PlanId = $17
       RETURNING *`,
      [
        planName, planCode, billingCycle, pricePerCycle, originalPrice || null,
        maxVenues, maxCourtsPerVenue, maxStaff, hasAdvancedReport,
        hasAPIAccess, hasPrioritySupport, hasCustomBranding, storageLimitGB,
        description || "", isActive, sortOrder, planId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Gói dịch vụ không tồn tại." });
    }

    res.json({ message: "Cập nhật gói thành công!", plan: result.rows[0] });
  } catch (error) {
    console.error("Lỗi updatePlan:", error);
    if (error.code === "23505") {
      return res.status(400).json({ error: "Mã gói dịch vụ (PlanCode) đã tồn tại." });
    }
    res.status(500).json({ error: "Lỗi server khi cập nhật gói." });
  }
};

// [DELETE] /api/admin/plans/:id
const deletePlan = async (req, res) => {
  const planId = req.params.id;

  try {
    const result = await pool.query("DELETE FROM SubscriptionPlan WHERE PlanId = $1 RETURNING *", [planId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Gói dịch vụ không tồn tại." });
    }
    res.json({ message: "Xóa gói dịch vụ thành công!" });
  } catch (error) {
    console.error("Lỗi deletePlan:", error);
    res.status(500).json({ error: "Lỗi server khi xóa gói (gói này có thể đang được sử dụng bởi chủ sân)." });
  }
};

// ==========================================
// 4. QUẢN LÝ CƠ SỞ (VENUES CRUD)
// ==========================================

// [GET] /api/admin/venues
const getAllVenuesAdmin = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT v.*, cop.RepFullName, cop.BusinessName 
       FROM Venue v
       LEFT JOIN CourtOwnerProfile cop ON v.OwnerId = cop.OwnerId
       ORDER BY v.VenueId DESC`
    );
    res.json({ venues: result.rows });
  } catch (error) {
    console.error("Lỗi getAllVenuesAdmin:", error);
    res.status(500).json({ error: "Lỗi lấy danh sách cơ sở sân." });
  }
};

// [POST] /api/admin/venues
const createVenue = async (req, res) => {
  const { ownerId, venueName, address, city, district, description, status, openTime, closeTime, latitude, longitude } = req.body;

  if (!venueName || !address || !city || !district) {
    return res.status(400).json({ error: "Vui lòng điền tên cơ sở, địa chỉ, quận/huyện, tỉnh/thành phố." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO Venue (OwnerId, VenueName, Address, City, District, Description, Status, OpenTime, CloseTime, Latitude, Longitude)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        ownerId || null,
        venueName,
        address,
        city,
        district,
        description || "",
        status || "Active",
        openTime || "06:00:00",
        closeTime || "23:00:00",
        latitude || null,
        longitude || null
      ]
    );

    res.status(201).json({ message: "Tạo cơ sở thành công!", venue: result.rows[0] });
  } catch (error) {
    console.error("Lỗi createVenue:", error);
    res.status(500).json({ error: "Lỗi server khi tạo cơ sở sân." });
  }
};

// [PUT] /api/admin/venues/:id
const updateVenue = async (req, res) => {
  const venueId = req.params.id;
  const { ownerId, venueName, address, city, district, description, status, openTime, closeTime, latitude, longitude } = req.body;

  try {
    const result = await pool.query(
      `UPDATE Venue 
       SET OwnerId = $1, VenueName = $2, Address = $3, City = $4, District = $5, Description = $6, Status = $7, OpenTime = $8, CloseTime = $9, Latitude = $10, Longitude = $11, UpdatedAt = CURRENT_TIMESTAMP
       WHERE VenueId = $12
       RETURNING *`,
      [ownerId || null, venueName, address, city, district, description || "", status, openTime, closeTime, latitude || null, longitude || null, venueId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cơ sở không tồn tại." });
    }

    res.json({ message: "Cập nhật cơ sở thành công!", venue: result.rows[0] });
  } catch (error) {
    console.error("Lỗi updateVenue:", error);
    res.status(500).json({ error: "Lỗi server khi cập nhật cơ sở." });
  }
};

// [DELETE] /api/admin/venues/:id
const deleteVenue = async (req, res) => {
  const venueId = req.params.id;

  try {
    const result = await pool.query("DELETE FROM Venue WHERE VenueId = $1 RETURNING *", [venueId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Cơ sở không tồn tại." });
    }
    res.json({ message: "Xóa cơ sở thành công!" });
  } catch (error) {
    console.error("Lỗi deleteVenue:", error);
    res.status(500).json({ error: "Lỗi server khi xóa cơ sở (có dữ liệu sân hoặc lịch đặt liên quan)." });
  }
};

// ==========================================
// 5. QUẢN LÝ SÂN (COURTS CRUD)
// ==========================================

const createDefaultPricingForCourt = async (courtId) => {
  await pool.query(
    `INSERT INTO TimeSlotPricing (CourtId, SlotName, StartTime, EndTime, Price, DayType, IsActive)
     SELECT $1, slot_name, start_time::time, end_time::time, price, 'All', TRUE
     FROM (VALUES
       ('Giờ thấp điểm', '05:00:00', '17:00:00', 80000.00),
       ('Giờ cao điểm', '17:00:00', '22:00:00', 120000.00)
     ) AS defaults(slot_name, start_time, end_time, price)
     WHERE NOT EXISTS (
       SELECT 1 FROM TimeSlotPricing WHERE CourtId = $1
     )`,
    [courtId],
  );
};

// [GET] /api/admin/courts
const getAllCourtsAdmin = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, v.VenueName 
       FROM Court c
       JOIN Venue v ON c.VenueId = v.VenueId
       ORDER BY c.CourtId DESC`
    );
    res.json({ courts: result.rows });
  } catch (error) {
    console.error("Lỗi getAllCourtsAdmin:", error);
    res.status(500).json({ error: "Lỗi lấy danh sách sân." });
  }
};

// [POST] /api/admin/courts
const createCourt = async (req, res) => {
  const { venueId, courtName, surfaceType, status, notes } = req.body;

  if (!venueId || !courtName) {
    return res.status(400).json({ error: "Vui lòng chọn cơ sở và đặt tên sân." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO Court (VenueId, CourtName, SurfaceType, Status, Notes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [venueId, courtName, surfaceType || "PVC 4.5mm", status || "Available", notes || ""]
    );
    await createDefaultPricingForCourt(result.rows[0].courtid);

    res.status(201).json({ message: "Tạo sân thành công!", court: result.rows[0] });
  } catch (error) {
    console.error("Lỗi createCourt:", error);
    res.status(500).json({ error: "Lỗi server khi tạo sân." });
  }
};

// [PUT] /api/admin/courts/:id
const updateCourt = async (req, res) => {
  const courtId = req.params.id;
  const { venueId, courtName, surfaceType, status, notes } = req.body;

  try {
    const result = await pool.query(
      `UPDATE Court 
       SET VenueId = $1, CourtName = $2, SurfaceType = $3, Status = $4, Notes = $5
       WHERE CourtId = $6
       RETURNING *`,
      [venueId, courtName, surfaceType, status, notes || "", courtId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Sân không tồn tại." });
    }

    res.json({ message: "Cập nhật sân thành công!", court: result.rows[0] });
  } catch (error) {
    console.error("Lỗi updateCourt:", error);
    res.status(500).json({ error: "Lỗi server khi cập nhật sân." });
  }
};

// [DELETE] /api/admin/courts/:id
const deleteCourt = async (req, res) => {
  const courtId = req.params.id;

  try {
    const result = await pool.query("DELETE FROM Court WHERE CourtId = $1 RETURNING *", [courtId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Sân không tồn tại." });
    }
    res.json({ message: "Xóa sân thành công!" });
  } catch (error) {
    console.error("Lỗi deleteCourt:", error);
    res.status(500).json({ error: "Lỗi server khi xóa sân (sân này có thể đã được đặt trước)." });
  }
};

// [GET] /api/admin/bookings
const getAllBookingsAdmin = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, u.FullName as CustomerName 
       FROM Booking b 
       LEFT JOIN AppUser u ON b.CustomerId = u.UserId 
       ORDER BY b.CreatedAt DESC`
    );
    res.json({ bookings: result.rows });
  } catch (error) {
    console.error("Lỗi getAllBookingsAdmin:", error);
    res.status(500).json({ error: "Lỗi lấy danh sách đặt sân." });
  }
};

// [DELETE] /api/admin/bookings/:id
const deleteBookingAdmin = async (req, res) => {
  const bookingId = req.params.id;
  try {
    await pool.query("DELETE FROM BookingSlot WHERE BookingId = $1", [bookingId]);
    await pool.query("DELETE FROM DiscountCodeUsage WHERE BookingId = $1", [bookingId]);
    await pool.query("DELETE FROM BookingService WHERE BookingId = $1", [bookingId]);
    await pool.query("DELETE FROM Invoice WHERE BookingId = $1", [bookingId]);
    const result = await pool.query("DELETE FROM Booking WHERE BookingId = $1 RETURNING *", [bookingId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Đơn đặt sân không tồn tại." });
    }
    res.json({ message: "Xóa đơn đặt sân thành công!" });
  } catch (error) {
    console.error("Lỗi deleteBookingAdmin:", error);
    res.status(500).json({ error: "Lỗi server khi xóa đơn đặt sân." });
  }
};

// [GET] /api/admin/invoices
const getAllInvoicesAdmin = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, b.BookingCode, u.FullName as CustomerName 
       FROM Invoice i 
       JOIN Booking b ON i.BookingId = b.BookingId 
       LEFT JOIN AppUser u ON b.CustomerId = u.UserId 
       ORDER BY i.CreatedAt DESC`
    );
    res.json({ invoices: result.rows });
  } catch (error) {
    console.error("Lỗi getAllInvoicesAdmin:", error);
    res.status(500).json({ error: "Lỗi lấy danh sách hóa đơn." });
  }
};

// [DELETE] /api/admin/invoices/:id
const deleteInvoiceAdmin = async (req, res) => {
  const invoiceId = req.params.id;
  try {
    const result = await pool.query("DELETE FROM Invoice WHERE InvoiceId = $1 RETURNING *", [invoiceId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Hóa đơn không tồn tại." });
    }
    res.json({ message: "Xóa hóa đơn thành công!" });
  } catch (error) {
    console.error("Lỗi deleteInvoiceAdmin:", error);
    res.status(500).json({ error: "Lỗi server khi xóa hóa đơn." });
  }
};

// [GET] /api/admin/promotions
const getAllPromotionsAdmin = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, v.VenueName 
       FROM Promotion p 
       LEFT JOIN Venue v ON p.VenueId = v.VenueId 
       ORDER BY p.CreatedAt DESC`
    );
    res.json({ promotions: result.rows });
  } catch (error) {
    console.error("Lỗi getAllPromotionsAdmin:", error);
    res.status(500).json({ error: "Lỗi lấy danh sách khuyến mãi." });
  }
};

// [DELETE] /api/admin/promotions/:id
const deletePromotionAdmin = async (req, res) => {
  const promotionId = req.params.id;
  try {
    const codeCheck = await pool.query("SELECT CodeId FROM DiscountCode WHERE PromotionId = $1", [promotionId]);
    const codeIds = codeCheck.rows.map(r => r.codeid);
    if (codeIds.length > 0) {
      await pool.query("DELETE FROM DiscountCodeUsage WHERE CodeId = ANY($1)", [codeIds]);
      await pool.query("DELETE FROM DiscountCode WHERE PromotionId = $1", [promotionId]);
    }
    const result = await pool.query("DELETE FROM Promotion WHERE PromotionId = $1 RETURNING *", [promotionId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Khuyến mãi không tồn tại." });
    }
    res.json({ message: "Xóa khuyến mãi thành công!" });
  } catch (error) {
    console.error("Lỗi deletePromotionAdmin:", error);
    res.status(500).json({ error: "Lỗi server khi xóa khuyến mãi." });
  }
};

// [GET] /api/admin/services
const getAllServicesAdmin = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, v.VenueName, c.CategoryName 
       FROM ServiceItem s 
       LEFT JOIN Venue v ON s.VenueId = v.VenueId 
       LEFT JOIN ServiceCategory c ON s.CategoryId = c.CategoryId 
       ORDER BY s.ServiceName ASC`
    );
    res.json({ services: result.rows });
  } catch (error) {
    console.error("Lỗi getAllServicesAdmin:", error);
    res.status(500).json({ error: "Lỗi lấy danh sách dịch vụ." });
  }
};

// [DELETE] /api/admin/services/:id
const deleteServiceAdmin = async (req, res) => {
  const serviceId = req.params.id;
  try {
    await pool.query("DELETE FROM BookingService WHERE ServiceId = $1", [serviceId]);
    const result = await pool.query("DELETE FROM ServiceItem WHERE ServiceId = $1 RETURNING *", [serviceId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Dịch vụ không tồn tại." });
    }
    res.json({ message: "Xóa dịch vụ thành công!" });
  } catch (error) {
    console.error("Lỗi deleteServiceAdmin:", error);
    res.status(500).json({ error: "Lỗi server khi xóa dịch vụ." });
  }
};

// [GET] /api/admin/reviews
const getAllReviewsAdmin = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, u.FullName as CustomerName, v.VenueName 
       FROM Review r 
       LEFT JOIN AppUser u ON r.UserId = u.UserId 
       LEFT JOIN Venue v ON r.VenueId = v.VenueId 
       ORDER BY r.CreatedAt DESC`
    );
    res.json({ reviews: result.rows });
  } catch (error) {
    console.error("Lỗi getAllReviewsAdmin:", error);
    res.status(500).json({ error: "Lỗi lấy danh sách đánh giá." });
  }
};

// [DELETE] /api/admin/reviews/:id
const deleteReviewAdmin = async (req, res) => {
  const reviewId = req.params.id;
  try {
    await pool.query("DELETE FROM ReviewImage WHERE ReviewId = $1", [reviewId]);
    const result = await pool.query("DELETE FROM Review WHERE ReviewId = $1 RETURNING *", [reviewId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Đánh giá không tồn tại." });
    }
    res.json({ message: "Xóa đánh giá thành công!" });
  } catch (error) {
    console.error("Lỗi deleteReviewAdmin:", error);
    res.status(500).json({ error: "Lỗi server khi xóa đánh giá." });
  }
};

module.exports = {
  getPendingOwners,
  reviewOwnerProfile,
  getAllOwners,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllPlansAdmin,
  createPlan,
  updatePlan,
  deletePlan,
  getAllVenuesAdmin,
  createVenue,
  updateVenue,
  deleteVenue,
  getAllCourtsAdmin,
  createCourt,
  updateCourt,
  deleteCourt,
  getAllBookingsAdmin,
  deleteBookingAdmin,
  getAllInvoicesAdmin,
  deleteInvoiceAdmin,
  getAllPromotionsAdmin,
  deletePromotionAdmin,
  getAllServicesAdmin,
  deleteServiceAdmin,
  getAllReviewsAdmin,
  deleteReviewAdmin,
};
