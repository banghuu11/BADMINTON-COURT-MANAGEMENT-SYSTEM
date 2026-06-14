KẾ HOẠCH TRIỂN KHAI DỰ ÁN (ROADMAP PLAN)
Với một hệ thống lớn thế này, chúng ta không thể làm tất cả cùng lúc. Tôi đề xuất chia dự án thành các Giai đoạn (Phases) theo nguyên tắc: Cái gì là nền tảng thì làm trước, nghiệp vụ cốt lõi làm thứ hai, tính năng bổ trợ làm cuối cùng.

Giai đoạn 1: Nền tảng & Xác thực (Core & Auth) - NÊN LÀM ĐẦU TIÊN
Đây là móng nhà, không có nó thì không ai vào hệ thống được.

Đăng ký / Đăng nhập (Auth): API cho AppUser (Mã hóa mật khẩu, tạo JWT Token).
Phân quyền cơ bản (RBAC): Middleware kiểm tra Role (Admin, CourtOwner, Customer).
Quản lý Tài khoản: Xem/sửa thông tin cá nhân (Profile).
Giai đoạn 2: Quản lý Chủ sân (SaaS Onboarding)
Dành cho luồng Admin và Chủ sân (CourtOwner) để thiết lập cơ sở kinh doanh.

Gói dịch vụ (SubscriptionPlan): Lấy danh sách gói (cho chủ sân chọn).
Đăng ký Chủ sân: Flow điền hồ sơ CourtOwnerProfile -> Upload giấy tờ OwnerDocument.
Duyệt hồ sơ (Admin): Admin xem và đổi trạng thái duyệt sang Approved.
Cơ sở & Sân (Venue & Court): Chủ sân thêm Cơ sở mới (Venue) và khai báo số Sân (Court).
Giai đoạn 3: Nghiệp vụ cốt lõi (Core Business - Booking)
Giá trị lõi của ứng dụng nằm ở đây.

Cấu hình Bảng giá (TimeSlotPricing): Cài đặt giá theo giờ/ngày.
Tìm sân trống: Logic gọi Stored Procedure sp_CheckCourtAvailability để lọc sân.
Đặt sân (Booking): Khách hàng hoặc Lễ tân tạo Booking và BookingSlot.
Check-in / Nhận sân: Đổi trạng thái SlotStatus.
Giai đoạn 4: Bán hàng & Thanh toán (POS & Billing)
Dịch vụ & Kho (ServiceItem, StockTransaction): Mua nước, thuê vợt.
Tính tiền Hóa đơn: Áp dụng tính toán tiền sân + tiền nước (gọi SP sp_CalculateInvoice).
Thanh toán (Invoice, PaymentTransaction): Lưu lịch sử thanh toán (Tiền mặt / Chuyển khoản).
Giai đoạn 5: Tính năng nâng cao & Giữ chân khách hàng
Thống kê / Báo cáo (Dashboard): Tích hợp các View và SP Dashboard cho Chủ sân và Admin.
Khuyến mãi (Promotion, DiscountCode): Áp dụng mã giảm giá khi đặt sân.
Khách hàng thân thiết (CustomerMembership): Tích điểm sau khi thanh toán hóa đơn.
Đánh giá (Review): Khách hàng vote sao sau khi chơi xong.
Giai đoạn 6: Tính năng mở rộng
Bảo trì sân (MaintenanceRequest).
Sự kiện / Giải đấu (Event).
Thông báo (Email / InApp notification).
Xác nhận từ bạn: Bạn có đồng ý với lộ trình này không? Và quan trọng nhất lúc này: Bạn muốn tiếp tục dùng PostgreSQL (tôi sẽ giúp bạn chuyển đổi SQL) hay chuyển code Node.js sang dùng SQL Server (mssql) để chạy luôn đoạn script trên?
