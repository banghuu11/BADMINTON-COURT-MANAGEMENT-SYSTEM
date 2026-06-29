const pool = require("./config/db");
const bcrypt = require("bcrypt");

const seedAllTestData = async () => {
  try {
    console.log("=== BẮT ĐẦU SEED DỮ LIỆU TEST TOÀN DIỆN ===");

    // Tạo mật khẩu mã hóa mặc định: '123456'
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("123456", salt);

    console.log("1. Dọn dẹp dữ liệu cũ (Sử dụng TRUNCATE CASCADE)...");
    
    // Bắt đầu giao dịch để đảm bảo tính nhất quán
    await pool.query("BEGIN");

    await pool.query(`
      TRUNCATE TABLE 
        paymenttransaction, 
        invoice, 
        waitinglist, 
        bookingslot, 
        booking, 
        timeslotpricing, 
        court, 
        promotion, 
        serviceitem, 
        venue, 
        ownerstatushistory, 
        courtownerprofile, 
        appuser 
        CASCADE
    `);
    
    console.log("2. Chèn người dùng mẫu...");
    
    // Chèn Admin (mật khẩu 123456)
    const adminUser = await pool.query(
      `INSERT INTO AppUser (RoleId, Username, PasswordHash, FullName, PhoneNumber, Email, IsActive, IsVerified)
       VALUES ((SELECT RoleId FROM Role WHERE RoleName = 'Admin'), 'admin', $1, 'Quản trị viên CourtSync', '0900000001', 'admin@courtsync.vn', TRUE, TRUE)
       RETURNING UserId`,
      [passwordHash]
    );
    const adminId = adminUser.rows[0].userid;

    // Chèn Owner1 (Chủ sân Kỳ Hòa)
    const ownerUser1 = await pool.query(
      `INSERT INTO AppUser (RoleId, Username, PasswordHash, FullName, PhoneNumber, Email, IsActive, IsVerified)
       VALUES ((SELECT RoleId FROM Role WHERE RoleName = 'CourtOwner'), 'owner1', $1, 'Nguyễn Văn Chủ', '0900000002', 'owner1@courtsync.vn', TRUE, TRUE)
       RETURNING UserId`,
      [passwordHash]
    );
    const ownerUserId1 = ownerUser1.rows[0].userid;

    // Chèn Owner2 (Chủ sân Phú Thọ)
    const ownerUser2 = await pool.query(
      `INSERT INTO AppUser (RoleId, Username, PasswordHash, FullName, PhoneNumber, Email, IsActive, IsVerified)
       VALUES ((SELECT RoleId FROM Role WHERE RoleName = 'CourtOwner'), 'owner2', $1, 'Trần Thế Thao', '0900000022', 'owner2@courtsync.vn', TRUE, TRUE)
       RETURNING UserId`,
      [passwordHash]
    );
    const ownerUserId2 = ownerUser2.rows[0].userid;

    // Chèn Staff1 (Nhân viên lễ tân Kỳ Hòa)
    const staffUser1 = await pool.query(
      `INSERT INTO AppUser (RoleId, Username, PasswordHash, FullName, PhoneNumber, Email, IsActive, IsVerified)
       VALUES ((SELECT RoleId FROM Role WHERE RoleName = 'Staff'), 'staff1', $1, 'Trần Lễ Tân', '0900000003', 'staff1@courtsync.vn', TRUE, TRUE)
       RETURNING UserId`,
      [passwordHash]
    );

    // Chèn Staff2 (Nhân viên lễ tân Phú Thọ)
    const staffUser2 = await pool.query(
      `INSERT INTO AppUser (RoleId, Username, PasswordHash, FullName, PhoneNumber, Email, IsActive, IsVerified)
       VALUES ((SELECT RoleId FROM Role WHERE RoleName = 'Staff'), 'staff2', $1, 'Lê Tiếp Tân', '0900000023', 'staff2@courtsync.vn', TRUE, TRUE)
       RETURNING UserId`,
      [passwordHash]
    );

    // Chèn Customer1
    const customerUser1 = await pool.query(
      `INSERT INTO AppUser (RoleId, Username, PasswordHash, FullName, PhoneNumber, Email, IsActive, IsVerified)
       VALUES ((SELECT RoleId FROM Role WHERE RoleName = 'Customer'), 'customer1', $1, 'Lê Khách Hàng', '0900000004', 'customer1@courtsync.vn', TRUE, TRUE)
       RETURNING UserId`,
      [passwordHash]
    );
    const customerId1 = customerUser1.rows[0].userid;

    // Chèn Customer2
    const customerUser2 = await pool.query(
      `INSERT INTO AppUser (RoleId, Username, PasswordHash, FullName, PhoneNumber, Email, IsActive, IsVerified)
       VALUES ((SELECT RoleId FROM Role WHERE RoleName = 'Customer'), 'customer2', $1, 'Phạm Giao Lưu', '0900000005', 'customer2@courtsync.vn', TRUE, TRUE)
       RETURNING UserId`,
      [passwordHash]
    );
    const customerId2 = customerUser2.rows[0].userid;

    // Chèn Customer3
    const customerUser3 = await pool.query(
      `INSERT INTO AppUser (RoleId, Username, PasswordHash, FullName, PhoneNumber, Email, IsActive, IsVerified)
       VALUES ((SELECT RoleId FROM Role WHERE RoleName = 'Customer'), 'customer3', $1, 'Đỗ Đam Mê', '0900000006', 'customer3@courtsync.vn', TRUE, TRUE)
       RETURNING UserId`,
      [passwordHash]
    );
    const customerId3 = customerUser3.rows[0].userid;

    console.log("3. Tạo hồ sơ Chủ sân mẫu...");
    
    // Hồ sơ Owner 1
    const ownerProfile1 = await pool.query(
      `INSERT INTO CourtOwnerProfile (UserId, BusinessType, BusinessName, TaxCode, BusinessAddress, RepFullName, RepPosition, RepPhone, RepEmail, RepIdNumber, ProfileStatus, ReviewedBy)
       VALUES ($1, 'Company', 'Công Ty Sân Cầu Lông Kỳ Hòa', '0315264789', '238 Đường 3/2, Quận 10, TP. HCM', 'Nguyễn Văn Chủ', 'Director', '0900000002', 'owner1@courtsync.vn', '079090000001', 'Approved', $2)
       RETURNING OwnerId`,
      [ownerUserId1, adminId]
    );
    const ownerId1 = ownerProfile1.rows[0].ownerid;

    // Hồ sơ Owner 2
    const ownerProfile2 = await pool.query(
      `INSERT INTO CourtOwnerProfile (UserId, BusinessType, BusinessName, TaxCode, BusinessAddress, RepFullName, RepPosition, RepPhone, RepEmail, RepIdNumber, ProfileStatus, ReviewedBy)
       VALUES ($1, 'Company', 'Công Ty Thể Thao Phú Thọ', '0315264888', '219 Lý Thường Kiệt, Quận 11, TP. HCM', 'Trần Thế Thao', 'Director', '0900000022', 'owner2@courtsync.vn', '079090000022', 'Approved', $2)
       RETURNING OwnerId`,
      [ownerUserId2, adminId]
    );
    const ownerId2 = ownerProfile2.rows[0].ownerid;

    console.log("4. Tạo cơ sở (Venues) và sân (Courts)...");
    
    // Venue 1 - Kỳ Hòa
    const venue1 = await pool.query(
      `INSERT INTO Venue (OwnerId, VenueName, Description, Address, City, District, Latitude, Longitude, Status)
       VALUES ($1, 'Sân Cầu Lông Kỳ Hòa Quận 10', 'Hệ thống sân cầu lông thảm chuẩn quốc tế Yonex, bãi đậu xe rộng rãi.', '238 Đường 3/2, Quận 10, TP. HCM', 'Hồ Chí Minh', 'Quận 10', 10.7761, 106.6713, 'Active')
       RETURNING VenueId`,
      [ownerId1]
    );
    const venueId1 = venue1.rows[0].venueid;

    // Sân của Venue 1
    const court1_1 = await pool.query(`INSERT INTO Court (VenueId, CourtName, SurfaceType, Status) VALUES ($1, 'Sân Kỳ Hòa 1', 'Yonex Premium', 'Available') RETURNING CourtId`, [venueId1]);
    const courtId1_1 = court1_1.rows[0].courtid;
    const court1_2 = await pool.query(`INSERT INTO Court (VenueId, CourtName, SurfaceType, Status) VALUES ($1, 'Sân Kỳ Hòa 2', 'Yonex Premium', 'Available') RETURNING CourtId`, [venueId1]);
    const courtId1_2 = court1_2.rows[0].courtid;
    const court1_3 = await pool.query(`INSERT INTO Court (VenueId, CourtName, SurfaceType, Status) VALUES ($1, 'Sân Kỳ Hòa 3', 'Standard Wood', 'Available') RETURNING CourtId`, [venueId1]);
    const courtId1_3 = court1_3.rows[0].courtid;

    // Venue 2 - Phú Thọ
    const venue2 = await pool.query(
      `INSERT INTO Venue (OwnerId, VenueName, Description, Address, City, District, Latitude, Longitude, Status)
       VALUES ($1, 'Sân Cầu Lông Phú Thọ Quận 11', 'Sân chơi thoáng đãng, trần cao, trang thiết bị thi đấu chuyên nghiệp.', '219 Lý Thường Kiệt, Quận 11, TP. HCM', 'Hồ Chí Minh', 'Quận 11', 10.7681, 106.6575, 'Active')
       RETURNING VenueId`,
      [ownerId2]
    );
    const venueId2 = venue2.rows[0].venueid;

    // Sân của Venue 2
    const court2_1 = await pool.query(`INSERT INTO Court (VenueId, CourtName, SurfaceType, Status) VALUES ($1, 'Sân Phú Thọ 1', 'Enlio Premium', 'Available') RETURNING CourtId`, [venueId2]);
    const courtId2_1 = court2_1.rows[0].courtid;
    const court2_2 = await pool.query(`INSERT INTO Court (VenueId, CourtName, SurfaceType, Status) VALUES ($1, 'Sân Phú Thọ 2', 'Standard Green', 'Available') RETURNING CourtId`, [venueId2]);
    const courtId2_2 = court2_2.rows[0].courtid;

    console.log("5. Tạo bảng giá (TimeSlotPricing) cho từng sân...");
    const courtsToPrice = [courtId1_1, courtId1_2, courtId1_3, courtId2_1, courtId2_2];
    for (const cId of courtsToPrice) {
      // Giá giờ thấp điểm (05:00 - 17:00)
      await pool.query(
        `INSERT INTO TimeSlotPricing (CourtId, SlotName, StartTime, EndTime, Price, DayType, IsActive)
         VALUES ($1, 'Giờ thấp điểm', '05:00:00', '17:00:00', 80000.00, 'All', TRUE)`,
        [cId]
      );
      // Giá giờ cao điểm (17:00 - 22:00)
      await pool.query(
        `INSERT INTO TimeSlotPricing (CourtId, SlotName, StartTime, EndTime, Price, DayType, IsActive)
         VALUES ($1, 'Giờ cao điểm', '17:00:00', '22:00:00', 120000.00, 'All', TRUE)`,
        [cId]
      );
    }

    console.log("6. Tạo kho hàng & Dịch vụ (ServiceItem)...");
    
    // Nước và dịch vụ cho Kỳ Hòa
    await pool.query(`INSERT INTO ServiceItem (VenueId, ServiceName, SKU, Unit, UnitPrice, StockQuantity, IsActive) VALUES ($1, 'Nước suối Aquafina', 'AQF_500ML', 'Chai', 15000.00, 85, TRUE)`, [venueId1]);
    await pool.query(`INSERT INTO ServiceItem (VenueId, ServiceName, SKU, Unit, UnitPrice, StockQuantity, IsActive) VALUES ($1, 'Nước tăng lực Redbull', 'RDB_250ML', 'Lon', 25000.00, 42, TRUE)`, [venueId1]);
    await pool.query(`INSERT INTO ServiceItem (VenueId, ServiceName, SKU, Unit, UnitPrice, StockQuantity, IsActive, IsRentable, RentalPrice) VALUES ($1, 'Thuê vợt Yonex Astrox', 'VOT_ASTROX', 'Cái/Lượt', 50000.00, 8, TRUE, TRUE, 50000.00)`, [venueId1]);
    
    // Nước và dịch vụ cho Phú Thọ
    await pool.query(`INSERT INTO ServiceItem (VenueId, ServiceName, SKU, Unit, UnitPrice, StockQuantity, IsActive) VALUES ($1, 'Nước suối Aquafina', 'AQF_500ML', 'Chai', 15000.00, 90, TRUE)`, [venueId2]);
    await pool.query(`INSERT INTO ServiceItem (VenueId, ServiceName, SKU, Unit, UnitPrice, StockQuantity, IsActive, IsRentable, RentalPrice) VALUES ($1, 'Thuê giày cầu lông', 'GIAY_CL', 'Đôi/Lượt', 30000.00, 4, TRUE, TRUE, 30000.00)`, [venueId2]);

    console.log("7. Tạo mã khuyến mãi (Promotions)...");
    await pool.query(
      `INSERT INTO Promotion (VenueId, PromotionName, Description, DiscountType, DiscountValue, MinOrderAmount, MaxDiscount, StartDate, EndDate, UsageLimit, IsActive)
       VALUES ($1, 'Chào Hè Rực Rỡ', 'Giảm ngay 20% tổng hóa đơn nhân dịp hè 2026', 'Percent', 20.00, 100000.00, 50000.00, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '30 days', 500, TRUE)`,
      [venueId1]
    );
    await pool.query(
      `INSERT INTO Promotion (VenueId, PromotionName, Description, DiscountType, DiscountValue, MinOrderAmount, MaxDiscount, StartDate, EndDate, UsageLimit, IsActive)
       VALUES ($1, 'Khai Trương Sân Mới', 'Giảm trực tiếp 30.000đ khi đặt sân tại Phú Thọ', 'FixedAmount', 30000.00, 150000.00, 30000.00, CURRENT_DATE - INTERVAL '1 days', CURRENT_DATE + INTERVAL '15 days', 200, TRUE)`,
      [venueId2]
    );

    console.log("8. Tạo tin ghép kèo (WaitingList)...");
    await pool.query(
      `INSERT INTO WaitingList (CustomerId, CourtId, PlayDate, StartTime, EndTime, Status)
       VALUES ($1, $2, CURRENT_DATE, '18:00:00', '20:00:00', 'Waiting')`,
      [customerId2, courtId1_1]
    );
    await pool.query(
      `INSERT INTO WaitingList (CustomerId, CourtId, PlayDate, StartTime, EndTime, Status)
       VALUES ($1, $2, CURRENT_DATE + INTERVAL '1 day', '08:00:00', '10:00:00', 'Waiting')`,
      [customerId1, courtId2_1]
    );

    console.log("9. Tạo một số Đơn đặt sân mẫu (Đặt trước và Lịch sử hoàn thành để lấy số liệu)...");
    
    // Đơn đặt sân 1: Kỳ Hòa (Đã hoàn thành và thanh toán, 2 ngày trước)
    const booking1 = await pool.query(
      `INSERT INTO Booking (CustomerId, BookingCode, BookingType, GuestName, GuestPhone, DepositAmount, BookingStatus, Source)
       VALUES ($1, 'BK_KH_001', 'Onetime', NULL, NULL, 0.00, 'Completed', 'App')
       RETURNING BookingId`,
      [customerId1]
    );
    const bookingId1 = booking1.rows[0].bookingid;

    // Chi tiết slot 1
    await pool.query(
      `INSERT INTO BookingSlot (BookingId, CourtId, PlayDate, StartTime, EndTime, AppliedPrice, SlotStatus)
       VALUES ($1, $2, CURRENT_DATE - INTERVAL '2 days', '18:00:00', '20:00:00', 120000.00, 'CheckedIn')`,
      [bookingId1, courtId1_1]
    );

    // Hóa đơn 1
    const invoice1 = await pool.query(
      `INSERT INTO Invoice (BookingId, InvoiceCode, CourtTotal, ServiceTotal, DiscountAmount, TotalAmount, PaidAmount, PaymentStatus, PaymentDate)
       VALUES ($1, 'INV_001', 240000.00, 0.00, 0.00, 240000.00, 240000.00, 'Paid', CURRENT_TIMESTAMP - INTERVAL '2 days')
       RETURNING InvoiceId`,
      [bookingId1]
    );
    const invoiceId1 = invoice1.rows[0].invoiceid;

    // Giao dịch thanh toán 1
    await pool.query(
      `INSERT INTO PaymentTransaction (InvoiceId, Amount, PaymentMethod, TransactionRef, Note, PaidAt, IsRefund)
       VALUES ($1, 240000.00, 'Cash', 'TX_001', 'Thanh toán trực tiếp bằng tiền mặt', CURRENT_TIMESTAMP - INTERVAL '2 days', FALSE)`,
      [invoiceId1]
    );

    // Đơn đặt sân 2: Phú Thọ (Đang đặt trước trong hôm nay, chưa thanh toán)
    const booking2 = await pool.query(
      `INSERT INTO Booking (CustomerId, BookingCode, BookingType, GuestName, GuestPhone, DepositAmount, BookingStatus, Source)
       VALUES ($1, 'BK_PT_002', 'Onetime', NULL, NULL, 50000.00, 'Confirmed', 'Web')
       RETURNING BookingId`,
      [customerId2]
    );
    const bookingId2 = booking2.rows[0].bookingid;

    // Chi tiết slot 2
    await pool.query(
      `INSERT INTO BookingSlot (BookingId, CourtId, PlayDate, StartTime, EndTime, AppliedPrice, SlotStatus)
       VALUES ($1, $2, CURRENT_DATE, '15:00:00', '17:00:00', 80000.00, 'Reserved')`,
      [bookingId2, courtId2_1]
    );

    // Hóa đơn 2
    await pool.query(
      `INSERT INTO Invoice (BookingId, InvoiceCode, CourtTotal, ServiceTotal, DiscountAmount, TotalAmount, PaidAmount, PaymentStatus, PaymentDate)
       VALUES ($1, 'INV_002', 160000.00, 0.00, 0.00, 160000.00, 0.00, 'Unpaid', CURRENT_TIMESTAMP)`,
      [bookingId2]
    );

    // Đơn đặt sân 3: Kỳ Hòa (Hoàn thành 5 ngày trước)
    const booking3 = await pool.query(
      `INSERT INTO Booking (CustomerId, BookingCode, BookingType, GuestName, GuestPhone, DepositAmount, BookingStatus, Source)
       VALUES ($1, 'BK_KH_003', 'Onetime', NULL, NULL, 0.00, 'Completed', 'Web')
       RETURNING BookingId`,
      [customerId3]
    );
    const bookingId3 = booking3.rows[0].bookingid;

    await pool.query(
      `INSERT INTO BookingSlot (BookingId, CourtId, PlayDate, StartTime, EndTime, AppliedPrice, SlotStatus)
       VALUES ($1, $2, CURRENT_DATE - INTERVAL '5 days', '17:00:00', '19:00:00', 120000.00, 'CheckedIn')`,
      [bookingId3, courtId1_2]
    );

    const invoice3 = await pool.query(
      `INSERT INTO Invoice (BookingId, InvoiceCode, CourtTotal, ServiceTotal, DiscountAmount, TotalAmount, PaidAmount, PaymentStatus, PaymentDate)
       VALUES ($1, 'INV_003', 240000.00, 0.00, 0.00, 240000.00, 240000.00, 'Paid', CURRENT_TIMESTAMP - INTERVAL '5 days')
       RETURNING InvoiceId`,
      [bookingId3]
    );

    await pool.query(
      `INSERT INTO PaymentTransaction (InvoiceId, Amount, PaymentMethod, TransactionRef, Note, PaidAt, IsRefund)
       VALUES ($1, 240000.00, 'VNPAY', 'TX_003', 'Thanh toán trực tuyến VNPAY', CURRENT_TIMESTAMP - INTERVAL '5 days', FALSE)`,
      [invoice3.rows[0].invoiceid]
    );

    // Đơn đặt sân 4: Phú Thọ (Hoàn thành 3 ngày trước)
    const booking4 = await pool.query(
      `INSERT INTO Booking (CustomerId, BookingCode, BookingType, GuestName, GuestPhone, DepositAmount, BookingStatus, Source)
       VALUES ($1, 'BK_PT_004', 'Onetime', NULL, NULL, 0.00, 'Completed', 'Web')
       RETURNING BookingId`,
      [customerId1]
    );
    const bookingId4 = booking4.rows[0].bookingid;

    await pool.query(
      `INSERT INTO BookingSlot (BookingId, CourtId, PlayDate, StartTime, EndTime, AppliedPrice, SlotStatus)
       VALUES ($1, $2, CURRENT_DATE - INTERVAL '3 days', '08:00:00', '10:00:00', 80000.00, 'CheckedIn')`,
      [bookingId4, courtId2_2]
    );

    const invoice4 = await pool.query(
      `INSERT INTO Invoice (BookingId, InvoiceCode, CourtTotal, ServiceTotal, DiscountAmount, TotalAmount, PaidAmount, PaymentStatus, PaymentDate)
       VALUES ($1, 'INV_004', 160000.00, 0.00, 30000.00, 130000.00, 130000.00, 'Paid', CURRENT_TIMESTAMP - INTERVAL '3 days')
       RETURNING InvoiceId`,
      [bookingId4]
    );

    await pool.query(
      `INSERT INTO PaymentTransaction (InvoiceId, Amount, PaymentMethod, TransactionRef, Note, PaidAt, IsRefund)
       VALUES ($1, 130000.00, 'MOMO', 'TX_004', 'Thanh toán trực tuyến MOMO', CURRENT_TIMESTAMP - INTERVAL '3 days', FALSE)`,
      [invoice4.rows[0].invoiceid]
    );

    // Đơn đặt sân 5: Kỳ Hòa (Hoàn thành 1 ngày trước)
    const booking5 = await pool.query(
      `INSERT INTO Booking (CustomerId, BookingCode, BookingType, GuestName, GuestPhone, DepositAmount, BookingStatus, Source)
       VALUES ($1, 'BK_KH_005', 'Onetime', NULL, NULL, 0.00, 'Completed', 'App')
       RETURNING BookingId`,
      [customerId2]
    );
    const bookingId5 = booking5.rows[0].bookingid;

    await pool.query(
      `INSERT INTO BookingSlot (BookingId, CourtId, PlayDate, StartTime, EndTime, AppliedPrice, SlotStatus)
       VALUES ($1, $2, CURRENT_DATE - INTERVAL '1 day', '19:00:00', '21:00:00', 120000.00, 'CheckedIn')`,
      [bookingId5, courtId1_3]
    );

    const invoice5 = await pool.query(
      `INSERT INTO Invoice (BookingId, InvoiceCode, CourtTotal, ServiceTotal, DiscountAmount, TotalAmount, PaidAmount, PaymentStatus, PaymentDate)
       VALUES ($1, 'INV_005', 240000.00, 0.00, 0.00, 240000.00, 240000.00, 'Paid', CURRENT_TIMESTAMP - INTERVAL '1 day')
       RETURNING InvoiceId`,
      [bookingId5]
    );

    await pool.query(
      `INSERT INTO PaymentTransaction (InvoiceId, Amount, PaymentMethod, TransactionRef, Note, PaidAt, IsRefund)
       VALUES ($1, 240000.00, 'Cash', 'TX_005', 'Thanh toán trực tiếp bằng tiền mặt', CURRENT_TIMESTAMP - INTERVAL '1 day', FALSE)`,
      [invoice5.rows[0].invoiceid]
    );

    console.log("10. Thêm dữ liệu dịch vụ đã sử dụng (BookingService)...");
    
    // Đặt dịch vụ nước cho Booking 1
    await pool.query(
      `INSERT INTO BookingService (BookingId, ServiceId, Quantity, UnitPrice)
       VALUES ($1, (SELECT ServiceId FROM ServiceItem WHERE SKU = 'AQF_500ML' AND VenueId = $2 LIMIT 1), 3, 15000.00)`,
      [bookingId1, venueId1]
    );
    
    // Đặt dịch vụ vợt cho Booking 1
    await pool.query(
      `INSERT INTO BookingService (BookingId, ServiceId, Quantity, UnitPrice)
       VALUES ($1, (SELECT ServiceId FROM ServiceItem WHERE SKU = 'VOT_ASTROX' AND VenueId = $2 LIMIT 1), 2, 50000.00)`,
      [bookingId1, venueId1]
    );

    // Cập nhật ServiceTotal và TotalAmount của Invoice 1 để khớp với dịch vụ mới thêm
    await pool.query(
      `UPDATE Invoice 
       SET ServiceTotal = 145000.00, TotalAmount = CourtTotal + 145000.00, PaidAmount = CourtTotal + 145000.00
       WHERE InvoiceId = $1`,
      [invoiceId1]
    );
    await pool.query(
      `UPDATE PaymentTransaction 
       SET Amount = 385000.00
       WHERE InvoiceId = $1`,
      [invoiceId1]
    );

    await pool.query("COMMIT");
    console.log("=== SEED DỮ LIỆU TEST TOÀN DIỆN THÀNH CÔNG ===");
    process.exit(0);
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Lỗi khi seed dữ liệu test:", error);
    process.exit(1);
  }
};

seedAllTestData();
