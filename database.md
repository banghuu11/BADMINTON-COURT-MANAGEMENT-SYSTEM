-- =====================================================
-- HỆ THỐNG QUẢN LÝ SÂN CẦU LÔNG - POSTGRESQL FINAL V3.0
-- =====================================================

-- [CẢNH BÁO] Lệnh này sẽ xóa toàn bộ dữ liệu cũ trong schema public và tạo lại từ đầu.
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- =====================================================
-- MODULE 01: PHÂN QUYỀN & TÀI KHOẢN
-- =====================================================
CREATE TABLE Role (
RoleId SERIAL PRIMARY KEY,
RoleName VARCHAR(50) UNIQUE NOT NULL,
Description VARCHAR(200),
CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE AppUser (
UserId SERIAL PRIMARY KEY,
RoleId INT NOT NULL REFERENCES Role(RoleId),
Username VARCHAR(50) UNIQUE NOT NULL,
PasswordHash VARCHAR(255) NOT NULL,
FullName VARCHAR(100) NOT NULL,
PhoneNumber VARCHAR(20) UNIQUE NOT NULL,
Email VARCHAR(100) UNIQUE,
AvatarUrl VARCHAR(500),
DateOfBirth DATE,
Gender VARCHAR(10),
Address VARCHAR(255),
SkillLevel VARCHAR(50) DEFAULT 'Trung bình',
IsActive BOOLEAN DEFAULT TRUE,
IsVerified BOOLEAN DEFAULT FALSE,
LastLoginAt TIMESTAMP,
CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE UserToken (
TokenId SERIAL PRIMARY KEY,
UserId INT NOT NULL REFERENCES AppUser(UserId),
TokenType VARCHAR(30) NOT NULL,
TokenValue VARCHAR(255) NOT NULL,
ExpiresAt TIMESTAMP NOT NULL,
IsUsed BOOLEAN DEFAULT FALSE,
CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE LoginHistory (
HistoryId SERIAL PRIMARY KEY,
UserId INT NOT NULL REFERENCES AppUser(UserId),
LoginAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
IpAddress VARCHAR(45),
UserAgent VARCHAR(500),
IsSuccess BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- MODULE 02: GÓI DỊCH VỤ NỀN TẢNG (SaaS Plans)
-- =====================================================
CREATE TABLE SubscriptionPlan (
PlanId SERIAL PRIMARY KEY,
PlanName VARCHAR(100) NOT NULL,
PlanCode VARCHAR(30) UNIQUE NOT NULL,
BillingCycle VARCHAR(10) NOT NULL,
PricePerCycle DECIMAL(12,2) NOT NULL,
OriginalPrice DECIMAL(12,2),
MaxVenues INT DEFAULT 1,
MaxCourtsPerVenue INT DEFAULT 4,
MaxStaff INT DEFAULT 3,
HasAdvancedReport BOOLEAN DEFAULT FALSE,
HasAPIAccess BOOLEAN DEFAULT FALSE,
HasPrioritySupport BOOLEAN DEFAULT FALSE,
HasCustomBranding BOOLEAN DEFAULT FALSE,
StorageLimitGB INT DEFAULT 2,
Description VARCHAR(1000),
IsActive BOOLEAN DEFAULT TRUE,
SortOrder INT DEFAULT 0,
CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MODULE 03: CHỦ SÂN (CourtOwner)
-- =====================================================
CREATE TABLE CourtOwnerProfile (
OwnerId SERIAL PRIMARY KEY,
UserId INT NOT NULL UNIQUE REFERENCES AppUser(UserId),
BusinessType VARCHAR(20) NOT NULL DEFAULT 'Individual',
BusinessName VARCHAR(200),
TaxCode VARCHAR(30),
BusinessAddress VARCHAR(500),
RepFullName VARCHAR(100) NOT NULL,
RepPosition VARCHAR(100),
RepPhone VARCHAR(20) NOT NULL,
RepEmail VARCHAR(100) NOT NULL,
RepIdType VARCHAR(20) DEFAULT 'CCCD',
RepIdNumber VARCHAR(50) NOT NULL,
RepIdIssuedDate DATE,
RepIdIssuedPlace VARCHAR(200),
ProfileStatus VARCHAR(20) DEFAULT 'Draft',
SubmittedAt TIMESTAMP,
ReviewedAt TIMESTAMP,
ReviewedBy INT REFERENCES AppUser(UserId),
ReviewNote VARCHAR(1000),
CurrentPlanId INT REFERENCES SubscriptionPlan(PlanId),
PlanStartDate DATE,
PlanEndDate DATE,
SubscriptionStatus VARCHAR(20) DEFAULT 'Inactive',
BankName VARCHAR(100),
BankAccount VARCHAR(50),
BankOwner VARCHAR(100),
BankBranch VARCHAR(150),
HasAcceptedTerms BOOLEAN DEFAULT FALSE,
AcceptedTermsAt TIMESTAMP,
AcceptedTermsVersion VARCHAR(10),
AcceptedFromIp VARCHAR(45),
ReferralCode VARCHAR(30),
ReferredBy INT REFERENCES CourtOwnerProfile(OwnerId),
CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE OwnerDocument (
DocumentId SERIAL PRIMARY KEY,
OwnerId INT NOT NULL REFERENCES CourtOwnerProfile(OwnerId),
DocumentType VARCHAR(50) NOT NULL,
DocumentName VARCHAR(200) NOT NULL,
FileUrl VARCHAR(500) NOT NULL,
FileSizeKB INT,
MimeType VARCHAR(50),
IsRequired BOOLEAN DEFAULT TRUE,
VerifyStatus VARCHAR(20) DEFAULT 'Pending',
VerifiedBy INT REFERENCES AppUser(UserId),
VerifiedAt TIMESTAMP,
RejectReason VARCHAR(500),
ExpiryDate DATE,
Note VARCHAR(500),
UploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE TermsVersion (
VersionId SERIAL PRIMARY KEY,
VersionCode VARCHAR(10) UNIQUE NOT NULL,
Title VARCHAR(200) NOT NULL,
ContentUrl VARCHAR(500) NOT NULL,
EffectiveDate DATE NOT NULL,
IsCurrent BOOLEAN DEFAULT FALSE,
CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE TermsAcceptance (
AcceptanceId SERIAL PRIMARY KEY,
OwnerId INT NOT NULL REFERENCES CourtOwnerProfile(OwnerId),
VersionId INT NOT NULL REFERENCES TermsVersion(VersionId),
AcceptedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
AcceptedFromIp VARCHAR(45),
UserAgent VARCHAR(500),
IsForced BOOLEAN DEFAULT FALSE
);

CREATE TABLE OwnerSubscription (
SubscriptionId SERIAL PRIMARY KEY,
OwnerId INT NOT NULL REFERENCES CourtOwnerProfile(OwnerId),
PlanId INT NOT NULL REFERENCES SubscriptionPlan(PlanId),
BillingCycle VARCHAR(10) NOT NULL,
StartDate DATE NOT NULL,
EndDate DATE NOT NULL,
PriceCharged DECIMAL(12,2) NOT NULL,
DiscountAmount DECIMAL(12,2) DEFAULT 0,
FinalAmount DECIMAL(12,2) GENERATED ALWAYS AS (PriceCharged - DiscountAmount) STORED,
PromoCode VARCHAR(30),
Status VARCHAR(20) DEFAULT 'Active',
AutoRenew BOOLEAN DEFAULT TRUE,
CancelledAt TIMESTAMP,
CancelReason VARCHAR(500),
CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE PlatformInvoice (
PlatformInvoiceId SERIAL PRIMARY KEY,
OwnerId INT NOT NULL REFERENCES CourtOwnerProfile(OwnerId),
SubscriptionId INT NOT NULL REFERENCES OwnerSubscription(SubscriptionId),
InvoiceCode VARCHAR(30) UNIQUE NOT NULL,
PeriodFrom DATE NOT NULL,
PeriodTo DATE NOT NULL,
AmountBeforeVAT DECIMAL(12,2) NOT NULL,
VATRate DECIMAL(5,2) DEFAULT 10,
VATAmount DECIMAL(12,2) GENERATED ALWAYS AS (ROUND(AmountBeforeVAT _ VATRate / 100, 0)) STORED,
TotalAmount DECIMAL(12,2) GENERATED ALWAYS AS (AmountBeforeVAT + ROUND(AmountBeforeVAT _ VATRate / 100, 0)) STORED,
DueDate DATE NOT NULL,
PaymentStatus VARCHAR(20) DEFAULT 'Unpaid',
PaidAt TIMESTAMP,
PaymentMethod VARCHAR(30),
PaymentRef VARCHAR(100),
IsVATInvoiceIssued BOOLEAN DEFAULT FALSE,
VATInvoiceNumber VARCHAR(50),
VATInvoiceIssuedAt TIMESTAMP,
Note VARCHAR(500),
CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE RenewalReminder (
ReminderId SERIAL PRIMARY KEY,
OwnerId INT NOT NULL REFERENCES CourtOwnerProfile(OwnerId),
SubscriptionId INT NOT NULL REFERENCES OwnerSubscription(SubscriptionId),
ReminderType VARCHAR(20) NOT NULL,
Channel VARCHAR(20) NOT NULL,
SentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
IsActionTaken BOOLEAN DEFAULT FALSE
);

CREATE TABLE OwnerStatusHistory (
HistoryId SERIAL PRIMARY KEY,
OwnerId INT NOT NULL REFERENCES CourtOwnerProfile(OwnerId),
FromStatus VARCHAR(20),
ToStatus VARCHAR(20) NOT NULL,
ChangedBy INT NOT NULL REFERENCES AppUser(UserId),
Reason VARCHAR(500),
ChangedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MODULE 04: CƠ SỞ SÂN (Venue)
-- =====================================================
CREATE TABLE Venue (
VenueId SERIAL PRIMARY KEY,
OwnerId INT REFERENCES CourtOwnerProfile(OwnerId),
ManagerId INT REFERENCES AppUser(UserId),
VenueName VARCHAR(150) NOT NULL,
Slug VARCHAR(150) UNIQUE,
Address VARCHAR(255) NOT NULL,
Ward VARCHAR(100),
District VARCHAR(100),
City VARCHAR(100),
Latitude DECIMAL(10,7),
Longitude DECIMAL(10,7),
PhoneNumber VARCHAR(20),
Email VARCHAR(100),
Description VARCHAR(2000),
OpenTime TIME DEFAULT '06:00',
CloseTime TIME DEFAULT '23:00',
BankName VARCHAR(100),
BankAccount VARCHAR(50),
BankOwner VARCHAR(100),
QRCodeUrl VARCHAR(500),
Status VARCHAR(20) DEFAULT 'Active',
CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE VenueImage (
ImageId SERIAL PRIMARY KEY,
VenueId INT NOT NULL REFERENCES Venue(VenueId),
ImageUrl VARCHAR(500) NOT NULL,
Caption VARCHAR(200),
SortOrder INT DEFAULT 0,
IsMain BOOLEAN DEFAULT FALSE,
UploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE VenueAmenity (
AmenityId SERIAL PRIMARY KEY,
VenueId INT NOT NULL REFERENCES Venue(VenueId),
AmenityName VARCHAR(100) NOT NULL,
IconName VARCHAR(50),
IsAvailable BOOLEAN DEFAULT TRUE
);

CREATE TABLE VenueStaff (
StaffId SERIAL PRIMARY KEY,
VenueId INT NOT NULL REFERENCES Venue(VenueId),
UserId INT NOT NULL REFERENCES AppUser(UserId),
Position VARCHAR(100),
JoinDate DATE DEFAULT CURRENT_DATE,
LeaveDate DATE,
IsActive BOOLEAN DEFAULT TRUE,
UNIQUE (VenueId, UserId)
);

CREATE TABLE StaffShift (
ShiftId SERIAL PRIMARY KEY,
VenueStaffId INT NOT NULL REFERENCES VenueStaff(StaffId),
ShiftDate DATE NOT NULL,
StartTime TIME NOT NULL,
EndTime TIME NOT NULL,
Note VARCHAR(255),
CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MODULE 05: SÂN & BẢNG GIÁ
-- =====================================================
CREATE TABLE Court (
CourtId SERIAL PRIMARY KEY,
VenueId INT NOT NULL REFERENCES Venue(VenueId),
CourtName VARCHAR(100) NOT NULL,
CourtCode VARCHAR(20),
SurfaceType VARCHAR(50) DEFAULT 'PVC 4.5mm',
Length DECIMAL(6,2),
Width DECIMAL(6,2),
IsIndoor BOOLEAN DEFAULT TRUE,
HasAC BOOLEAN DEFAULT FALSE,
Status VARCHAR(20) DEFAULT 'Available',
Notes VARCHAR(500),
CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE CourtImage (
ImageId SERIAL PRIMARY KEY,
CourtId INT NOT NULL REFERENCES Court(CourtId),
ImageUrl VARCHAR(500) NOT NULL,
SortOrder INT DEFAULT 0
);

CREATE TABLE TimeSlotPricing (
PricingId SERIAL PRIMARY KEY,
CourtId INT NOT NULL REFERENCES Court(CourtId),
SlotName VARCHAR(100) NOT NULL,
DayType VARCHAR(20) DEFAULT 'Weekday',
StartTime TIME NOT NULL,
EndTime TIME NOT NULL,
Price DECIMAL(12,2) NOT NULL,
IsActive BOOLEAN DEFAULT TRUE,
EffectiveFrom DATE,
EffectiveTo DATE,
CONSTRAINT CK_Pricing_Time CHECK (EndTime > StartTime)
);

CREATE TABLE HolidayCalendar (
HolidayId SERIAL PRIMARY KEY,
HolidayDate DATE UNIQUE NOT NULL,
HolidayName VARCHAR(100) NOT NULL,
PriceMultiplier DECIMAL(5,2) DEFAULT 1.5,
IsActive BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- MODULE 06: DỊCH VỤ & KHO HÀNG
-- =====================================================
CREATE TABLE ServiceCategory (
CategoryId SERIAL PRIMARY KEY,
VenueId INT NOT NULL REFERENCES Venue(VenueId),
CategoryName VARCHAR(100) NOT NULL,
Description VARCHAR(255)
);

CREATE TABLE ServiceItem (
ServiceId SERIAL PRIMARY KEY,
VenueId INT NOT NULL REFERENCES Venue(VenueId),
CategoryId INT REFERENCES ServiceCategory(CategoryId),
ServiceName VARCHAR(150) NOT NULL,
SKU VARCHAR(50),
UnitPrice DECIMAL(12,2) NOT NULL,
CostPrice DECIMAL(12,2),
Unit VARCHAR(50),
StockQuantity INT DEFAULT 0,
MinStockAlert INT DEFAULT 5,
ImageUrl VARCHAR(500),
IsRentable BOOLEAN DEFAULT FALSE,
RentalPrice DECIMAL(12,2),
IsActive BOOLEAN DEFAULT TRUE,
CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE StockTransaction (
TransactionId SERIAL PRIMARY KEY,
ServiceId INT NOT NULL REFERENCES ServiceItem(ServiceId),
StaffId INT REFERENCES AppUser(UserId),
TransactionType VARCHAR(20) NOT NULL,
Quantity INT NOT NULL,
Note VARCHAR(255),
TransactionAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MODULE 07: KHÁCH HÀNG THÂN THIẾT (Loyalty)
-- =====================================================
CREATE TABLE MembershipTier (
TierId SERIAL PRIMARY KEY,
TierName VARCHAR(50) NOT NULL,
MinPoints INT NOT NULL,
DiscountPercent DECIMAL(5,2) DEFAULT 0,
BenefitDesc VARCHAR(500),
BadgeColor VARCHAR(20)
);

CREATE TABLE CustomerMembership (
MembershipId SERIAL PRIMARY KEY,
UserId INT NOT NULL UNIQUE REFERENCES AppUser(UserId),
TierId INT NOT NULL REFERENCES MembershipTier(TierId),
TotalPoints INT DEFAULT 0,
AvailablePoints INT DEFAULT 0,
JoinDate DATE DEFAULT CURRENT_DATE,
LastActivity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE PointTransaction (
PointTxId SERIAL PRIMARY KEY,
MembershipId INT NOT NULL REFERENCES CustomerMembership(MembershipId),
ReferenceId INT,
ReferenceType VARCHAR(30),
Points INT NOT NULL,
Description VARCHAR(255),
TransactionAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MODULE 08: KHUYẾN MÃI & MÃ GIẢM GIÁ
-- =====================================================
CREATE TABLE Promotion (
PromotionId SERIAL PRIMARY KEY,
VenueId INT REFERENCES Venue(VenueId),
PromotionName VARCHAR(200) NOT NULL,
Description VARCHAR(1000),
DiscountType VARCHAR(20) NOT NULL,
DiscountValue DECIMAL(12,2) NOT NULL,
MinOrderAmount DECIMAL(12,2) DEFAULT 0,
MaxDiscount DECIMAL(12,2),
StartDate TIMESTAMP NOT NULL,
EndDate TIMESTAMP NOT NULL,
UsageLimit INT,
UsageCount INT DEFAULT 0,
IsActive BOOLEAN DEFAULT TRUE,
CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE DiscountCode (
CodeId SERIAL PRIMARY KEY,
PromotionId INT NOT NULL REFERENCES Promotion(PromotionId),
Code VARCHAR(50) UNIQUE NOT NULL,
UsageLimitPerUser INT DEFAULT 1,
UsageCount INT DEFAULT 0,
IsActive BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- MODULE 09: ĐẶT SÂN (Booking)
-- =====================================================
CREATE TABLE Booking (
BookingId SERIAL PRIMARY KEY,
CustomerId INT REFERENCES AppUser(UserId),
GuestName VARCHAR(100),
GuestPhone VARCHAR(20),
BookingCode VARCHAR(20) UNIQUE,
BookingType VARCHAR(20) NOT NULL,
Source VARCHAR(30) DEFAULT 'Web',
StaffId INT REFERENCES AppUser(UserId),
PromotionId INT REFERENCES Promotion(PromotionId),
CodeId INT REFERENCES DiscountCode(CodeId),
Note VARCHAR(500),
DepositAmount DECIMAL(12,2) DEFAULT 0,
BookingStatus VARCHAR(20) DEFAULT 'Pending',
CancelledBy INT REFERENCES AppUser(UserId),
CancelReason VARCHAR(500),
CancelledAt TIMESTAMP,
CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo bảng DiscountCodeUsage sau khi có Booking để FK hợp lệ
CREATE TABLE DiscountCodeUsage (
UsageId SERIAL PRIMARY KEY,
CodeId INT NOT NULL REFERENCES DiscountCode(CodeId),
UserId INT NOT NULL REFERENCES AppUser(UserId),
BookingId INT REFERENCES Booking(BookingId),
UsedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE BookingSlot (
SlotId SERIAL PRIMARY KEY,
BookingId INT NOT NULL REFERENCES Booking(BookingId),
CourtId INT NOT NULL REFERENCES Court(CourtId),
PlayDate DATE NOT NULL,
PositionIndex INT DEFAULT 0, -- 0: Toàn sân, 1-4: Vị trí ghép kèo
StartTime TIME NOT NULL,
EndTime TIME NOT NULL,
DurationMinutes INT GENERATED ALWAYS AS (EXTRACT(EPOCH FROM (EndTime - StartTime))/60) STORED,
AppliedPrice DECIMAL(12,2) NOT NULL,
SlotStatus VARCHAR(20) DEFAULT 'NotStarted',
CheckInAt TIMESTAMP,
CheckOutAt TIMESTAMP,
Note VARCHAR(255),
CONSTRAINT CK_Slot_Time CHECK (EndTime > StartTime)
);

CREATE TABLE FixedBookingSchedule (
ScheduleId SERIAL PRIMARY KEY,
BookingId INT NOT NULL REFERENCES Booking(BookingId),
CourtId INT NOT NULL REFERENCES Court(CourtId),
DayOfWeek SMALLINT NOT NULL,
StartTime TIME NOT NULL,
EndTime TIME NOT NULL,
StartDate DATE NOT NULL,
EndDate DATE NOT NULL,
MonthlyPrice DECIMAL(12,2) NOT NULL,
IsActive BOOLEAN DEFAULT TRUE
);

CREATE TABLE BookingService (
BookingServiceId SERIAL PRIMARY KEY,
BookingId INT NOT NULL REFERENCES Booking(BookingId),
SlotId INT REFERENCES BookingSlot(SlotId),
ServiceId INT NOT NULL REFERENCES ServiceItem(ServiceId),
Quantity INT NOT NULL CHECK (Quantity > 0),
UnitPrice DECIMAL(12,2) NOT NULL,
TotalPrice DECIMAL(12,2) GENERATED ALWAYS AS (Quantity \* UnitPrice) STORED,
AddedBy INT REFERENCES AppUser(UserId),
AddedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE WaitingList (
WaitId SERIAL PRIMARY KEY,
CustomerId INT NOT NULL REFERENCES AppUser(UserId),
CourtId INT NOT NULL REFERENCES Court(CourtId),
PlayDate DATE NOT NULL,
StartTime TIME NOT NULL,
EndTime TIME NOT NULL,
RequestedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
NotifiedAt TIMESTAMP,
Status VARCHAR(20) DEFAULT 'Waiting'
);

-- =====================================================
-- MODULE 10: HÓA ĐƠN & THANH TOÁN
-- =====================================================
CREATE TABLE Invoice (
InvoiceId SERIAL PRIMARY KEY,
BookingId INT UNIQUE NOT NULL REFERENCES Booking(BookingId),
InvoiceCode VARCHAR(30) UNIQUE,
CashierId INT REFERENCES AppUser(UserId),
PaymentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
CourtTotal DECIMAL(12,2) DEFAULT 0,
ServiceTotal DECIMAL(12,2) DEFAULT 0,
SubTotal DECIMAL(12,2) GENERATED ALWAYS AS (CourtTotal + ServiceTotal) STORED,
DiscountAmount DECIMAL(12,2) DEFAULT 0,
TaxRate DECIMAL(5,2) DEFAULT 0,
TaxAmount DECIMAL(12,2) GENERATED ALWAYS AS (ROUND((CourtTotal + ServiceTotal - DiscountAmount) \* TaxRate / 100, 0)) STORED,
TotalAmount DECIMAL(12,2) DEFAULT 0,
PaidAmount DECIMAL(12,2) DEFAULT 0,
ChangeAmount DECIMAL(12,2) GENERATED ALWAYS AS (PaidAmount - TotalAmount) STORED,
PaymentStatus VARCHAR(20) DEFAULT 'Unpaid',
Note VARCHAR(500),
PrintedAt TIMESTAMP,
CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE PaymentTransaction (
PaymentId SERIAL PRIMARY KEY,
InvoiceId INT NOT NULL REFERENCES Invoice(InvoiceId),
CashierId INT REFERENCES AppUser(UserId),
Amount DECIMAL(12,2) NOT NULL,
PaymentMethod VARCHAR(30) NOT NULL,
TransactionRef VARCHAR(100),
BankCode VARCHAR(50),
Note VARCHAR(255),
PaidAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
IsRefund BOOLEAN DEFAULT FALSE
);

CREATE TABLE Refund (
RefundId SERIAL PRIMARY KEY,
InvoiceId INT NOT NULL REFERENCES Invoice(InvoiceId),
RequestedBy INT NOT NULL REFERENCES AppUser(UserId),
ApprovedBy INT REFERENCES AppUser(UserId),
RefundAmount DECIMAL(12,2) NOT NULL,
Reason VARCHAR(500),
RefundMethod VARCHAR(30),
Status VARCHAR(20) DEFAULT 'Pending',
RequestedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ProcessedAt TIMESTAMP
);

-- =====================================================
-- MODULE 11: ĐÁNH GIÁ & PHẢN HỒI
-- =====================================================
CREATE TABLE Review (
ReviewId SERIAL PRIMARY KEY,
VenueId INT NOT NULL REFERENCES Venue(VenueId),
UserId INT NOT NULL REFERENCES AppUser(UserId),
BookingId INT REFERENCES Booking(BookingId),
Rating SMALLINT NOT NULL CHECK (Rating BETWEEN 1 AND 5),
Title VARCHAR(200),
Comment VARCHAR(2000),
CourtRating SMALLINT CHECK (CourtRating BETWEEN 1 AND 5),
ServiceRating SMALLINT CHECK (ServiceRating BETWEEN 1 AND 5),
StaffRating SMALLINT CHECK (StaffRating BETWEEN 1 AND 5),
IsAnonymous BOOLEAN DEFAULT FALSE,
Status VARCHAR(20) DEFAULT 'Pending',
OwnerReply VARCHAR(1000),
OwnerRepliedAt TIMESTAMP,
CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ReviewImage (
ReviewImageId SERIAL PRIMARY KEY,
ReviewId INT NOT NULL REFERENCES Review(ReviewId),
ImageUrl VARCHAR(500) NOT NULL,
UploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MODULE 12: BẢO TRÌ SÂN
-- =====================================================
CREATE TABLE MaintenanceRequest (
MaintenanceId SERIAL PRIMARY KEY,
CourtId INT NOT NULL REFERENCES Court(CourtId),
ReportedBy INT NOT NULL REFERENCES AppUser(UserId),
AssignedTo INT REFERENCES AppUser(UserId),
Title VARCHAR(200) NOT NULL,
Description VARCHAR(2000),
Priority VARCHAR(20) DEFAULT 'Normal',
Status VARCHAR(20) DEFAULT 'Open',
EstimatedCost DECIMAL(12,2),
ActualCost DECIMAL(12,2),
StartDate DATE,
CompletedDate DATE,
Notes VARCHAR(1000),
CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE MaintenanceImage (
ImageId SERIAL PRIMARY KEY,
MaintenanceId INT NOT NULL REFERENCES MaintenanceRequest(MaintenanceId),
ImageUrl VARCHAR(500) NOT NULL,
Caption VARCHAR(200),
UploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE MaintenanceSchedule (
ScheduleId SERIAL PRIMARY KEY,
CourtId INT NOT NULL REFERENCES Court(CourtId),
Title VARCHAR(200) NOT NULL,
RecurrenceType VARCHAR(20) NOT NULL,
RecurrenceDay INT,
StartTime TIME,
EndTime TIME,
DurationHours INT DEFAULT 2,
IsActive BOOLEAN DEFAULT TRUE,
LastRun DATE,
NextRun DATE,
Description VARCHAR(500)
);

-- =====================================================
-- MODULE 13: SỰ KIỆN & GIẢI ĐẤU
-- =====================================================
CREATE TABLE Event (
EventId SERIAL PRIMARY KEY,
VenueId INT NOT NULL REFERENCES Venue(VenueId),
OrganizerId INT NOT NULL REFERENCES AppUser(UserId),
EventName VARCHAR(200) NOT NULL,
Description VARCHAR(4000),
EventType VARCHAR(30) DEFAULT 'Tournament',
BannerUrl VARCHAR(500),
StartDate TIMESTAMP NOT NULL,
EndDate TIMESTAMP NOT NULL,
RegisterDeadline TIMESTAMP,
MaxParticipants INT,
EntryFee DECIMAL(12,2) DEFAULT 0,
PrizeInfo VARCHAR(1000),
Status VARCHAR(20) DEFAULT 'Draft',
CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE EventRegistration (
RegId SERIAL PRIMARY KEY,
EventId INT NOT NULL REFERENCES Event(EventId),
UserId INT NOT NULL REFERENCES AppUser(UserId),
PartnerName VARCHAR(100),
TeamName VARCHAR(100),
Category VARCHAR(50),
PaymentStatus VARCHAR(20) DEFAULT 'Unpaid',
RegisteredAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
Status VARCHAR(20) DEFAULT 'Pending',
UNIQUE (EventId, UserId)
);

-- =====================================================
-- MODULE 14: THÔNG BÁO HỆ THỐNG
-- =====================================================
CREATE TABLE NotificationTemplate (
TemplateId SERIAL PRIMARY KEY,
TemplateName VARCHAR(100) UNIQUE NOT NULL,
Channel VARCHAR(20) NOT NULL,
Subject VARCHAR(200),
BodyTemplate VARCHAR(4000) NOT NULL,
IsActive BOOLEAN DEFAULT TRUE
);

CREATE TABLE Notification (
NotificationId SERIAL PRIMARY KEY,
UserId INT NOT NULL REFERENCES AppUser(UserId),
TemplateId INT REFERENCES NotificationTemplate(TemplateId),
Title VARCHAR(200) NOT NULL,
Body VARCHAR(2000) NOT NULL,
Channel VARCHAR(20) NOT NULL,
ReferenceType VARCHAR(30),
ReferenceId INT,
IsRead BOOLEAN DEFAULT FALSE,
ReadAt TIMESTAMP,
SentAt TIMESTAMP,
Status VARCHAR(20) DEFAULT 'Pending',
CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MODULE 15: CẤU HÌNH HỆ THỐNG
-- =====================================================
CREATE TABLE SystemConfig (
ConfigId SERIAL PRIMARY KEY,
ConfigKey VARCHAR(100) UNIQUE NOT NULL,
ConfigValue VARCHAR(1000),
DataType VARCHAR(20) DEFAULT 'String',
Description VARCHAR(500),
UpdatedBy INT REFERENCES AppUser(UserId),
UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MODULE 16: LOG & AUDIT
-- =====================================================
CREATE TABLE AuditLog (
LogId BIGSERIAL PRIMARY KEY,
UserId INT REFERENCES AppUser(UserId),
Action VARCHAR(50) NOT NULL,
TableName VARCHAR(50),
RecordId INT,
OldValue TEXT,
NewValue TEXT,
IpAddress VARCHAR(45),
UserAgent VARCHAR(500),
CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ErrorLog (
ErrorId BIGSERIAL PRIMARY KEY,
UserId INT REFERENCES AppUser(UserId),
ErrorCode VARCHAR(50),
ErrorMessage VARCHAR(1000),
StackTrace TEXT,
RequestUrl VARCHAR(500),
CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MODULE 17: INDEXES BỔ SUNG
-- =====================================================
CREATE UNIQUE INDEX UX_NoOverlap
ON BookingSlot (CourtId, PlayDate, StartTime, EndTime, PositionIndex)
WHERE SlotStatus NOT IN ('Cancelled', 'NoShow');

CREATE INDEX IDX_Slot_CourtDate ON BookingSlot (CourtId, PlayDate);

CREATE INDEX IDX_OwnerProfile_Status ON CourtOwnerProfile (ProfileStatus, SubscriptionStatus);

CREATE INDEX IDX_OwnerProfile_PlanEnd ON CourtOwnerProfile (PlanEndDate, SubscriptionStatus) INCLUDE (OwnerId, UserId);

CREATE INDEX IDX_PlatformInvoice_Owner ON PlatformInvoice (OwnerId, PaymentStatus, DueDate);

CREATE INDEX IDX_OwnerDoc_Status ON OwnerDocument (OwnerId, VerifyStatus);

-- =====================================================
-- MODULE 18: SEED DATA
-- =====================================================
INSERT INTO Role (RoleName, Description) VALUES
('Admin', 'Quản trị hệ thống toàn quyền'),
('CourtOwner', 'Chủ sân — trả phí SaaS, quản lý sân của mình'),
('VenueManager', 'Quản lý cơ sở (được CourtOwner bổ nhiệm)'),
('Staff', 'Nhân viên lễ tân / thu ngân'),
('Customer', 'Khách hàng đặt sân');

INSERT INTO SubscriptionPlan (PlanName, PlanCode, BillingCycle, PricePerCycle, OriginalPrice, MaxVenues, MaxCourtsPerVenue, MaxStaff, HasAdvancedReport, HasAPIAccess, HasPrioritySupport, HasCustomBranding, StorageLimitGB, Description, SortOrder) VALUES
('Cơ bản', 'BASIC_MONTHLY', 'Monthly', 299000, NULL, 1, 4, 2, FALSE, FALSE, FALSE, FALSE, 2, '1 cơ sở, 4 sân, 2 nhân viên, hỗ trợ email', 1),
('Chuyên nghiệp', 'PRO_MONTHLY', 'Monthly', 699000, NULL, 3, 10, 10, TRUE, FALSE, TRUE, FALSE, 10, '3 cơ sở, 10 sân, báo cáo nâng cao, hỗ trợ ưu tiên', 2),
('Doanh nghiệp', 'ENTERPRISE_MONTHLY', 'Monthly', 1499000, NULL, 99, 99, 99, TRUE, TRUE, TRUE, TRUE, 50, 'Không giới hạn, API riêng, branding, account manager', 3),
('Cơ bản (năm)', 'BASIC_YEARLY', 'Yearly', 2990000, 3588000, 1, 4, 2, FALSE, FALSE, FALSE, FALSE, 2, 'Tiết kiệm 17% so với trả tháng', 4),
('Chuyên nghiệp (năm)', 'PRO_YEARLY', 'Yearly', 6990000, 8388000, 3, 10, 10, TRUE, FALSE, TRUE, FALSE, 10, 'Tiết kiệm 17% so với trả tháng', 5),
('Doanh nghiệp (năm)', 'ENTERPRISE_YEARLY', 'Yearly', 14990000, 17988000, 99, 99, 99, TRUE, TRUE, TRUE, TRUE, 50, 'Tiết kiệm 17% so với trả tháng', 6);

INSERT INTO MembershipTier (TierName, MinPoints, DiscountPercent, BenefitDesc, BadgeColor) VALUES
('Đồng', 0, 0, 'Thành viên cơ bản', '#CD7F32'),
('Bạc', 500, 3, 'Giảm 3%, ưu tiên đặt sân 24h trước', '#C0C0C0'),
('Vàng', 2000, 5, 'Giảm 5%, 1 lần đặt sân miễn phí/tháng', '#FFD700'),
('Kim cương', 5000, 10, 'Giảm 10%, ưu tiên cao nhất, dịch vụ VIP', '#B9F2FF');

INSERT INTO SystemConfig (ConfigKey, ConfigValue, DataType, Description) VALUES
('APP_NAME', 'CourtSync', 'String', 'Tên ứng dụng'),
('CURRENCY', 'VND', 'String', 'Đơn vị tiền tệ'),
('TAX_RATE', '0', 'Number', 'Thuế VAT đặt sân (%)'),
('PLATFORM_VAT_RATE', '10', 'Number', 'Thuế VAT phí nền tảng (%)'),
('BOOKING_ADVANCE_DAYS', '30', 'Number', 'Số ngày tối đa đặt trước'),
('MIN_BOOKING_MINUTES', '60', 'Number', 'Thời gian đặt tối thiểu (phút)'),
('MAX_BOOKING_MINUTES', '240', 'Number', 'Thời gian đặt tối đa (phút)'),
('DEPOSIT_PERCENT', '30', 'Number', '% cọc khi đặt sân online'),
('CANCEL_FREE_HOURS', '2', 'Number', 'Số giờ trước giờ chơi được huỷ miễn phí'),
('POINTS_PER_10K', '1', 'Number', 'Điểm tích luỹ mỗi 10.000đ'),
('ALLOW_GUEST_BOOKING', 'true', 'Boolean', 'Cho phép đặt sân không cần đăng nhập'),
('OWNER_REVIEW_SLA_DAYS', '3', 'Number', 'SLA xét duyệt hồ sơ chủ sân (ngày làm việc)'),
('SUBSCRIPTION_GRACE_DAYS', '7', 'Number', 'Số ngày gia hạn ân hạn sau khi hết hạn gói'),
('PLATFORM_INVOICE_DUE', '3', 'Number', 'Số ngày thanh toán hóa đơn nền tảng');

INSERT INTO NotificationTemplate (TemplateName, Channel, Subject, BodyTemplate, IsActive) VALUES
('BOOKING_CONFIRMED', 'Email', 'Đặt sân thành công - {{booking_code}}', 'Xin chào {{customer_name}}, bạn đã đặt sân thành công. Mã: {{booking_code}}. Sân: {{court_name}}. Ngày: {{play_date}} | {{start_time}} - {{end_time}}.', TRUE),
('BOOKING_REMINDER', 'Push', 'Nhắc lịch chơi cầu lông', 'Bạn có lịch chơi lúc {{start_time}} hôm nay tại {{venue_name}}, sân {{court_name}}.', TRUE),
('PAYMENT_SUCCESS', 'Email', 'Thanh toán thành công - {{invoice_code}}', 'Hóa đơn {{invoice_code}} đã được thanh toán. Tổng tiền: {{total_amount}}. Cảm ơn bạn!', TRUE),
('BOOKING_CANCELLED', 'SMS', NULL, 'Dat san {{booking_code}} da bi huy. Ly do: {{cancel_reason}}. LH {{phone}}.', TRUE),
('COURT_AVAILABLE', 'Push', 'Sân bạn chờ đã trống!', 'Sân {{court_name}} ngày {{play_date}} lúc {{start_time}} đã có chỗ. Đặt ngay!', TRUE),
('STOCK_ALERT', 'InApp', 'Cảnh báo tồn kho thấp', 'Sản phẩm "{{product_name}}" còn {{quantity}} {{unit}}, dưới mức tối thiểu.', TRUE),
('OWNER_APPROVED', 'Email', 'Hồ sơ chủ sân đã được duyệt - CourtSync', 'Xin chào {{owner_name}}, hồ sơ của bạn đã được duyệt. Hãy chọn gói dịch vụ để bắt đầu quản lý sân.', TRUE),
('OWNER_REJECTED', 'Email', 'Hồ sơ chủ sân cần bổ sung - CourtSync', 'Xin chào {{owner_name}}, hồ sơ của bạn chưa đạt. Lý do: {{reject_reason}}. Vui lòng bổ sung và nộp lại.', TRUE),
('SUBSCRIPTION_RENEW_30', 'Email', 'Gói dịch vụ sắp hết hạn - còn 30 ngày', 'Gói {{plan_name}} của bạn sẽ hết hạn vào {{end_date}}. Gia hạn ngay để không gián đoạn dịch vụ.', TRUE),
('SUBSCRIPTION_EXPIRED', 'Email', 'Gói dịch vụ đã hết hạn - CourtSync', 'Gói {{plan_name}} đã hết hạn. Hệ thống sẽ tạm khoá sau {{grace_days}} ngày nếu chưa gia hạn.', TRUE),
('PLATFORM_INVOICE', 'Email', 'Hóa đơn phí nền tảng - {{invoice_code}}', 'Hóa đơn {{invoice_code}} kỳ {{period_from}} - {{period_to}}. Số tiền: {{total_amount}}. Hạn TT: {{due_date}}.', TRUE),
('OWNER_SUSPENDED', 'Email', 'Tài khoản chủ sân bị tạm khoá - CourtSync', 'Tài khoản của bạn đã bị tạm khoá. Lý do: {{reason}}. Liên hệ hỗ trợ để biết thêm chi tiết.', TRUE);

INSERT INTO TermsVersion (VersionCode, Title, ContentUrl, EffectiveDate, IsCurrent) VALUES
('v1.0', 'Điều khoản sử dụng nền tảng CourtSync v1.0', 'https://courtsync.vn/terms/v1.0.pdf', '2024-01-01', TRUE);

INSERT INTO AppUser (RoleId, Username, PasswordHash, FullName, PhoneNumber, Email, IsActive, IsVerified) VALUES (
(SELECT RoleId FROM Role WHERE RoleName = 'Admin'),
'admin',
'$2a$12$REPLACE_WITH_REAL_BCRYPT_HASH_HERE_XXXXXXXXX',
'Quản trị viên CourtSync',
'0900000001',
'admin@courtsync.vn',
TRUE, TRUE
);

-- =====================================================
-- MODULE 19: VIEWS
-- =====================================================
CREATE OR REPLACE VIEW vw_CourtSchedule AS
SELECT
bs.SlotId, v.VenueId, v.VenueName, c.CourtId, c.CourtName,
bs.PlayDate, bs.StartTime, bs.EndTime, bs.DurationMinutes,
bs.AppliedPrice, bs.SlotStatus,
b.BookingId, b.BookingCode, b.BookingType, b.Source,
COALESCE(u.FullName, b.GuestName) AS CustomerName,
COALESCE(u.PhoneNumber, b.GuestPhone) AS CustomerPhone,
b.BookingStatus
FROM BookingSlot bs
JOIN Booking b ON b.BookingId = bs.BookingId
JOIN Court c ON c.CourtId = bs.CourtId
JOIN Venue v ON v.VenueId = c.VenueId
LEFT JOIN AppUser u ON u.UserId = b.CustomerId;

CREATE OR REPLACE VIEW vw_RevenueReport AS
SELECT
v.VenueId, v.VenueName, cop.OwnerId,
i.PaymentDate::DATE AS RevenueDate,
EXTRACT(MONTH FROM i.PaymentDate) AS RevenueMonth,
EXTRACT(YEAR FROM i.PaymentDate) AS RevenueYear,
i.InvoiceId, i.InvoiceCode, i.CourtTotal, i.ServiceTotal,
i.DiscountAmount, i.TotalAmount, i.PaymentStatus, pt.PaymentMethod
FROM Invoice i
JOIN Booking b ON b.BookingId = i.BookingId
JOIN BookingSlot bs ON bs.BookingId = b.BookingId
JOIN Court c ON c.CourtId = bs.CourtId
JOIN Venue v ON v.VenueId = c.VenueId
LEFT JOIN CourtOwnerProfile cop ON cop.OwnerId = v.OwnerId
LEFT JOIN PaymentTransaction pt ON pt.InvoiceId = i.InvoiceId AND pt.IsRefund = FALSE;

CREATE OR REPLACE VIEW vw_StockStatus AS
SELECT
si.ServiceId, si.ServiceName, si.SKU, si.StockQuantity, si.MinStockAlert, si.UnitPrice,
v.VenueId, v.VenueName, sc.CategoryName,
CASE
WHEN si.StockQuantity = 0 THEN 'OutOfStock'
WHEN si.StockQuantity <= si.MinStockAlert THEN 'LowStock'
ELSE 'InStock'
END AS StockStatus
FROM ServiceItem si
JOIN Venue v ON v.VenueId = si.VenueId
LEFT JOIN ServiceCategory sc ON sc.CategoryId = si.CategoryId
WHERE si.IsActive = TRUE;

CREATE OR REPLACE VIEW vw_CustomerLoyalty AS
SELECT
u.UserId, u.FullName, u.PhoneNumber, u.Email,
cm.TotalPoints, cm.AvailablePoints, mt.TierName, mt.DiscountPercent,
cm.JoinDate, cm.LastActivity,
COUNT(DISTINCT b.BookingId) AS TotalBookings,
COALESCE(SUM(i.TotalAmount), 0) AS TotalSpent
FROM AppUser u
JOIN CustomerMembership cm ON cm.UserId = u.UserId
JOIN MembershipTier mt ON mt.TierId = cm.TierId
LEFT JOIN Booking b ON b.CustomerId = u.UserId AND b.BookingStatus = 'Completed'
LEFT JOIN Invoice i ON i.BookingId = b.BookingId AND i.PaymentStatus = 'Paid'
GROUP BY u.UserId, u.FullName, u.PhoneNumber, u.Email, cm.TotalPoints, cm.AvailablePoints, mt.TierName, mt.DiscountPercent, cm.JoinDate, cm.LastActivity;

CREATE OR REPLACE VIEW vw_OwnerEntitlement AS
SELECT
cop.OwnerId, cop.UserId, u.FullName, u.Email, u.PhoneNumber,
cop.BusinessName, cop.BusinessType, cop.ProfileStatus, cop.SubscriptionStatus,
sp.PlanName, sp.PlanCode, sp.BillingCycle,
cop.PlanStartDate, cop.PlanEndDate,
sp.MaxVenues, sp.MaxCourtsPerVenue, sp.MaxStaff,
sp.HasAdvancedReport, sp.HasAPIAccess, sp.HasPrioritySupport, sp.HasCustomBranding, sp.StorageLimitGB,
CASE
WHEN cop.ProfileStatus <> 'Approved' THEN 'NOT_APPROVED'
WHEN cop.SubscriptionStatus = 'Inactive' THEN 'NO_SUBSCRIPTION'
WHEN cop.SubscriptionStatus = 'Trial' THEN 'TRIAL'
WHEN cop.SubscriptionStatus = 'Active' AND cop.PlanEndDate >= CURRENT_DATE THEN 'ACTIVE'
WHEN cop.SubscriptionStatus IN ('Expired','Active') AND cop.PlanEndDate < CURRENT_DATE THEN 'EXPIRED'
WHEN cop.SubscriptionStatus = 'Suspended' THEN 'SUSPENDED'
WHEN cop.SubscriptionStatus = 'Cancelled' THEN 'CANCELLED'
ELSE 'UNKNOWN'
END AS AccessStatus,
(cop.PlanEndDate - CURRENT_DATE) AS DaysRemaining
FROM CourtOwnerProfile cop
JOIN AppUser u ON u.UserId = cop.UserId
LEFT JOIN SubscriptionPlan sp ON sp.PlanId = cop.CurrentPlanId;

CREATE OR REPLACE VIEW vw_PlatformRevenue AS
SELECT
EXTRACT(YEAR FROM pi.PaidAt) AS RevenueYear,
EXTRACT(MONTH FROM pi.PaidAt) AS RevenueMonth,
COUNT(\*) AS TotalInvoices,
COUNT(DISTINCT pi.OwnerId) AS ActiveOwners,
SUM(pi.AmountBeforeVAT) AS TotalBeforeVAT,
SUM(pi.VATAmount) AS TotalVAT,
SUM(pi.TotalAmount) AS TotalRevenue,
SUM(CASE WHEN sp.BillingCycle = 'Monthly' THEN pi.TotalAmount ELSE 0 END) AS MonthlyPlanRevenue,
SUM(CASE WHEN sp.BillingCycle = 'Yearly' THEN pi.TotalAmount ELSE 0 END) AS YearlyPlanRevenue
FROM PlatformInvoice pi
JOIN OwnerSubscription os ON os.SubscriptionId = pi.SubscriptionId
JOIN SubscriptionPlan sp ON sp.PlanId = os.PlanId
WHERE pi.PaymentStatus = 'Paid'
GROUP BY EXTRACT(YEAR FROM pi.PaidAt), EXTRACT(MONTH FROM pi.PaidAt);

-- =====================================================
-- MODULE 20: FUNCTIONS / PROCEDURES
-- =====================================================
CREATE OR REPLACE FUNCTION fn_CheckCourtAvailability(
p_CourtId INT, p_PlayDate DATE, p_StartTime TIME, p_EndTime TIME, p_ExcludeSlotId INT DEFAULT -1, p_PositionIndex INT DEFAULT 0
) RETURNS INT AS $$
DECLARE
v_ConflictCount INT;
BEGIN
SELECT COUNT(\*) INTO v_ConflictCount
FROM BookingSlot bs
WHERE bs.CourtId = p_CourtId AND bs.PlayDate = p_PlayDate
AND bs.SlotStatus NOT IN ('Cancelled', 'NoShow')
AND (bs.SlotId <> COALESCE(p_ExcludeSlotId, -1))
AND (
(p_StartTime >= bs.StartTime AND p_StartTime < bs.EndTime)
OR (p_EndTime > bs.StartTime AND p_EndTime <= bs.EndTime)
OR (p_StartTime <= bs.StartTime AND p_EndTime >= bs.EndTime)
) AND (
bs.PositionIndex = 0 OR p_PositionIndex = 0 OR bs.PositionIndex = p_PositionIndex
);
RETURN v_ConflictCount;
END;

$$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_CalculateInvoice(p_BookingId INT)
RETURNS TABLE (CourtTotal DECIMAL(12,2), ServiceTotal DECIMAL(12,2), Discount DECIMAL(12,2), TotalAmount DECIMAL(12,2)) AS
$$

DECLARE
v_CourtTotal DECIMAL(12,2) := 0;
v_ServiceTotal DECIMAL(12,2) := 0;
v_Discount DECIMAL(12,2) := 0;
v_MaxDiscount DECIMAL(12,2);
BEGIN
SELECT SUM(AppliedPrice \* (EXTRACT(EPOCH FROM (EndTime - StartTime))/3600.0))
INTO v_CourtTotal FROM BookingSlot WHERE BookingId = p_BookingId AND SlotStatus <> 'Cancelled';

    SELECT COALESCE(SUM(TotalPrice), 0) INTO v_ServiceTotal FROM BookingService WHERE BookingId = p_BookingId;

    SELECT
        CASE p.DiscountType
            WHEN 'Percent' THEN (COALESCE(v_CourtTotal,0) + v_ServiceTotal) * p.DiscountValue / 100.0
            WHEN 'FixedAmount' THEN p.DiscountValue
            ELSE 0
        END, p.MaxDiscount
    INTO v_Discount, v_MaxDiscount
    FROM Booking b JOIN Promotion p ON b.PromotionId = p.PromotionId WHERE b.BookingId = p_BookingId;

    IF v_MaxDiscount IS NOT NULL AND v_Discount > v_MaxDiscount THEN v_Discount := v_MaxDiscount; END IF;

    CourtTotal := COALESCE(v_CourtTotal, 0); ServiceTotal := COALESCE(v_ServiceTotal, 0);
    Discount := COALESCE(v_Discount, 0); TotalAmount := CourtTotal + ServiceTotal - Discount;
    RETURN NEXT;

END;

$$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_GetApplicablePrice(
    p_CourtId INT, p_PlayDate DATE, p_StartTime TIME
) RETURNS TABLE (PricingId INT, SlotName VARCHAR, Price DECIMAL, AppliedDayType VARCHAR, PriceMultiplier DECIMAL, FinalPrice DECIMAL) AS
$$

DECLARE
v_DayType VARCHAR(20);
v_DayOfWeek INT := EXTRACT(DOW FROM p_PlayDate);
BEGIN
IF EXISTS (SELECT 1 FROM HolidayCalendar WHERE HolidayDate = p_PlayDate AND IsActive = TRUE) THEN v_DayType := 'Holiday';
ELSIF v_DayOfWeek IN (0, 6) THEN v_DayType := 'Weekend';
ELSE v_DayType := 'Weekday';
END IF;

    RETURN QUERY
    SELECT tsp.PricingId, tsp.SlotName, tsp.Price, v_DayType, COALESCE(hc.PriceMultiplier, 1.0),
           ROUND(tsp.Price * COALESCE(hc.PriceMultiplier, 1.0), 0)
    FROM TimeSlotPricing tsp
    LEFT JOIN HolidayCalendar hc ON hc.HolidayDate = p_PlayDate AND hc.IsActive = TRUE
    WHERE tsp.CourtId = p_CourtId AND tsp.IsActive = TRUE AND (tsp.DayType = v_DayType OR tsp.DayType = 'All')
      AND p_StartTime >= tsp.StartTime AND p_StartTime < tsp.EndTime
      AND (tsp.EffectiveFrom IS NULL OR tsp.EffectiveFrom <= p_PlayDate)
      AND (tsp.EffectiveTo IS NULL OR tsp.EffectiveTo >= p_PlayDate)
    ORDER BY CASE tsp.DayType WHEN v_DayType THEN 0 ELSE 1 END LIMIT 1;

END;

$$
LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE sp_ReviewOwnerProfile(p_OwnerId INT, p_AdminId INT, p_Decision VARCHAR, p_Note VARCHAR DEFAULT NULL)
LANGUAGE plpgsql AS
$$

DECLARE
v_OldStatus VARCHAR(20); v_NewStatus VARCHAR(20);
BEGIN
SELECT ProfileStatus INTO v_OldStatus FROM CourtOwnerProfile WHERE OwnerId = p_OwnerId;
v_NewStatus := CASE p_Decision WHEN 'Approve' THEN 'Approved' WHEN 'Reject' THEN 'Rejected' WHEN 'Suspend' THEN 'Suspended' ELSE NULL END;
IF v_NewStatus IS NULL THEN RAISE EXCEPTION 'Decision phải là Approve, Reject hoặc Suspend.'; END IF;

    UPDATE CourtOwnerProfile SET ProfileStatus = v_NewStatus, ReviewedAt = CURRENT_TIMESTAMP, ReviewedBy = p_AdminId, ReviewNote = p_Note, UpdatedAt = CURRENT_TIMESTAMP WHERE OwnerId = p_OwnerId;
    INSERT INTO OwnerStatusHistory (OwnerId, FromStatus, ToStatus, ChangedBy, Reason) VALUES (p_OwnerId, v_OldStatus, v_NewStatus, p_AdminId, p_Note);
    IF p_Decision = 'Approve' THEN UPDATE AppUser SET IsActive = TRUE, RoleId = 2 WHERE UserId = (SELECT UserId FROM CourtOwnerProfile WHERE OwnerId = p_OwnerId); END IF;

END;

$$
;
$$
