import { useEffect, useState } from "react";
import {
  BarChart3,
  Users,
  DollarSign,
  CheckCircle,
  XCircle,
  FileText,
  Plus,
  Edit2,
  Trash2,
  Building2,
  LayoutGrid,
  Percent,
  TrendingUp,
  Sliders,
  Check,
  Shield,
  Activity,
  Calendar,
  Star,
  Package,
  Printer,
  Crown,
  Settings,
  Image as ImageIcon,
  Upload,
  RefreshCcw
} from "lucide-react";
import { useAdminDashboard } from "../hooks/useAdminDashboard";
import { useAdminManagement } from "../hooks/useAdminManagement";
import { apiFetch } from "../services/api";
import defaultHeroImage from "../assets/hero.png";

const AdminDashboard = () => {
  const {
    dashboardData,
    pendingOwners,
    isLoading: loadingSummary,
    error: errorSummary,
    handleReview,
  } = useAdminDashboard();

  const {
    users,
    plans,
    venues,
    courts,
    owners,
    bookings,
    invoices,
    promotions,
    services,
    reviews,
    isLoading: loadingCRUD,
    error: errorCRUD,
    createUser,
    updateUser,
    deleteUser,
    createPlan,
    updatePlan,
    deletePlan,
    createVenue,
    updateVenue,
    deleteVenue,
    createCourt,
    updateCourt,
    deleteCourt,
    deleteBooking,
    deleteInvoice,
    deletePromotion,
    deleteService,
    deleteReview,
  } = useAdminManagement();

  // State quản lý Tab hiện tại: 'overview' | 'users' | 'plans' | 'venues' | 'courts'
  const [activeTab, setActiveTab] = useState("overview");

  // State quản lý Modal
  const [modalType, setModalType] = useState(null); // 'user' | 'plan' | 'venue' | 'court'
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [systemSettings, setSystemSettings] = useState({ bannerUrl: null });
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [systemLoading, setSystemLoading] = useState(false);
  const [systemMessage, setSystemMessage] = useState("");
  const [systemError, setSystemError] = useState("");

  const displayBannerUrl = bannerPreview || systemSettings.bannerUrl || defaultHeroImage;

  const fetchSystemSettings = async () => {
    try {
      const data = await apiFetch("/system/public-settings");
      setSystemSettings({ bannerUrl: data.bannerUrl || null });
    } catch (err) {
      setSystemError(err.message || "Không thể tải cấu hình hệ thống.");
    }
  };

  useEffect(() => {
    fetchSystemSettings();
  }, []);

  useEffect(() => {
    return () => {
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    };
  }, [bannerPreview]);

  const handleBannerFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    setBannerFile(file);
    setBannerPreview(file ? URL.createObjectURL(file) : "");
    setSystemMessage("");
    setSystemError("");
  };

  const handleUploadBanner = async (e) => {
    e.preventDefault();
    if (!bannerFile) {
      setSystemError("Vui lòng chọn ảnh banner trước khi cập nhật.");
      return;
    }

    const form = new FormData();
    form.append("banner", bannerFile);
    setSystemLoading(true);
    setSystemMessage("");
    setSystemError("");

    try {
      const data = await apiFetch("/system/home-banner", {
        method: "POST",
        body: form,
      });
      setSystemSettings({ bannerUrl: data.bannerUrl || null });
      setBannerFile(null);
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
      setBannerPreview("");
      setSystemMessage("Đã cập nhật banner trang chủ.");
    } catch (err) {
      setSystemError(err.message || "Không thể cập nhật banner.");
    } finally {
      setSystemLoading(false);
    }
  };

  const handleDeleteBanner = async () => {
    if (!window.confirm("Xóa banner trang chủ hiện tại? Trang chủ sẽ dùng banner mặc định.")) return;

    setSystemLoading(true);
    setSystemMessage("");
    setSystemError("");

    try {
      await apiFetch("/system/home-banner", { method: "DELETE" });
      setSystemSettings({ bannerUrl: null });
      setBannerFile(null);
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
      setBannerPreview("");
      setSystemMessage("Đã xóa banner riêng, hệ thống đang dùng banner mặc định.");
    } catch (err) {
      setSystemError(err.message || "Không thể xóa banner.");
    } finally {
      setSystemLoading(false);
    }
  };

  const openCreateModal = (type) => {
    setModalType(type);
    setModalMode("create");
    setEditItem(null);
    setSubmitError("");

    if (type === "user") {
      setFormData({
        roleId: 5, // Mặc định là Customer
        username: "",
        password: "",
        fullName: "",
        phoneNumber: "",
        email: "",
        isActive: true,
        isVerified: false,
        skillLevel: "Trung bình"
      });
    } else if (type === "plan") {
      setFormData({
        planName: "",
        planCode: "",
        billingCycle: "Monthly",
        pricePerCycle: 0,
        originalPrice: 0,
        maxVenues: 1,
        maxCourtsPerVenue: 4,
        maxStaff: 3,
        hasAdvancedReport: false,
        hasAPIAccess: false,
        hasPrioritySupport: false,
        hasCustomBranding: false,
        storageLimitGB: 2,
        description: "",
        isActive: true,
        sortOrder: 0
      });
    } else if (type === "venue") {
      setFormData({
        ownerId: owners[0]?.ownerid || "",
        venueName: "",
        address: "",
        city: "Hồ Chí Minh",
        district: "",
        latitude: "",
        longitude: "",
        description: "",
        status: "Active",
        openTime: "06:00:00",
        closeTime: "23:00:00"
      });
    } else if (type === "court") {
      setFormData({
        venueId: venues[0]?.venueid || "",
        courtName: "",
        surfaceType: "PVC 4.5mm",
        status: "Available",
        notes: ""
      });
    }
  };

  const openEditModal = (type, item) => {
    setModalType(type);
    setModalMode("edit");
    setEditItem(item);
    setSubmitError("");

    if (type === "user") {
      setFormData({
        id: item.userid,
        roleId: item.roleid,
        username: item.username,
        fullName: item.fullname,
        phoneNumber: item.phonenumber,
        email: item.email || "",
        isActive: item.isactive,
        isVerified: item.isverified,
        skillLevel: item.skilllevel || "Trung bình",
        password: "" // Không hiển thị mật khẩu cũ vì lý do bảo mật
      });
    } else if (type === "plan") {
      setFormData({
        id: item.planid,
        planName: item.planname,
        planCode: item.plancode,
        billingCycle: item.billingcycle,
        pricePerCycle: Number(item.pricepercycle),
        originalPrice: item.originalprice ? Number(item.originalprice) : 0,
        maxVenues: item.maxvenues,
        maxCourtsPerVenue: item.maxcourtspervenue,
        maxStaff: item.maxstaff,
        hasAdvancedReport: item.hasadvancedreport,
        hasAPIAccess: item.hasapiaccess,
        hasPrioritySupport: item.hasprioritysupport,
        hasCustomBranding: item.hascustombranding,
        storageLimitGB: item.storagelimitgb,
        description: item.description || "",
        isActive: item.isactive,
        sortOrder: item.sortorder
      });
    } else if (type === "venue") {
      setFormData({
        id: item.venueid,
        ownerId: item.ownerid || "",
        venueName: item.venuename,
        address: item.address,
        city: item.city || "Hồ Chí Minh",
        district: item.district || "",
        latitude: item.latitude || "",
        longitude: item.longitude || "",
        description: item.description || "",
        status: item.status || "Active",
        openTime: item.opentime || "06:00:00",
        closeTime: item.closetime || "23:00:00"
      });
    } else if (type === "court") {
      setFormData({
        id: item.courtid,
        venueId: item.venueid,
        courtName: item.courtname,
        surfaceType: item.surfacetype || "PVC 4.5mm",
        status: item.status || "Available",
        notes: item.notes || ""
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    try {
      if (modalType === "user") {
        if (modalMode === "create") {
          await createUser(formData);
        } else {
          await updateUser(formData);
        }
      } else if (modalType === "plan") {
        if (modalMode === "create") {
          await createPlan(formData);
        } else {
          await updatePlan(formData);
        }
      } else if (modalType === "venue") {
        if (modalMode === "create") {
          await createVenue(formData);
        } else {
          await updateVenue(formData);
        }
      } else if (modalType === "court") {
        if (modalMode === "create") {
          await createCourt(formData);
        } else {
          await updateCourt(formData);
        }
      }
      setModalType(null);
    } catch (err) {
      setSubmitError(err.message || "Đã xảy ra lỗi khi lưu thông tin.");
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa mục này? Hành động này không thể hoàn tác.")) return;

    try {
      if (type === "user") await deleteUser(id);
      else if (type === "plan") await deletePlan(id);
      else if (type === "venue") await deleteVenue(id);
      else if (type === "court") await deleteCourt(id);
      else if (type === "booking") await deleteBooking(id);
      else if (type === "invoice") await deleteInvoice(id);
      else if (type === "promotion") await deletePromotion(id);
      else if (type === "service") await deleteService(id);
      else if (type === "review") await deleteReview(id);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loadingSummary || loadingCRUD)
    return (
      <div className="min-h-screen bg-[#00272c] flex flex-col items-center justify-center gap-3 text-slate-400">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="font-semibold text-sm">Đang tải bảng điều khiển quản trị...</p>
      </div>
    );

  if (errorSummary || errorCRUD)
    return (
      <div className="min-h-screen bg-[#00272c] flex items-center justify-center text-red-400 font-bold p-6">
        Lỗi: {errorSummary || errorCRUD}
      </div>
    );

  const totalRevenue =
    dashboardData?.platformRevenue?.reduce(
      (sum, item) => sum + Number(item.totalrevenue),
      0,
    ) || 0;

  return (
    <div className="max-w-7xl mx-auto px-5 py-8 animate-fade-in text-white">
      {/* Grid Template Layout: Left Sidebar + Right Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
        
        {/* Left Sidebar Menu */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl h-fit lg:sticky lg:top-8 flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-6 h-6 text-primary" />
              <span className="font-extrabold text-sm uppercase tracking-wider text-slate-200">CourtSync Admin</span>
            </div>
            <p className="text-[10px] text-slate-400">Hệ thống quản lý nền tảng</p>
          </div>
          
          <nav className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 ${
                activeTab === "overview"
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <LayoutGrid className="w-4.5 h-4.5" /> Tổng quan & Duyệt
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 ${
                activeTab === "users"
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Users className="w-4.5 h-4.5" /> Người dùng
            </button>
            <button
              onClick={() => setActiveTab("plans")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 ${
                activeTab === "plans"
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Percent className="w-4.5 h-4.5" /> Gói dịch vụ
            </button>
            <button
              onClick={() => setActiveTab("venues")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 ${
                activeTab === "venues"
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Building2 className="w-4.5 h-4.5" /> Cơ sở sân
            </button>
            <button
              onClick={() => setActiveTab("courts")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 ${
                activeTab === "courts"
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Activity className="w-4.5 h-4.5" /> Sân thi đấu
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 ${
                activeTab === "bookings"
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Calendar className="w-4.5 h-4.5" /> Đơn đặt sân
            </button>
            <button
              onClick={() => setActiveTab("invoices")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 ${
                activeTab === "invoices"
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <FileText className="w-4.5 h-4.5" /> Hóa đơn
            </button>
            <button
              onClick={() => setActiveTab("promotions")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 ${
                activeTab === "promotions"
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Sliders className="w-4.5 h-4.5" /> Khuyến mãi
            </button>
            <button
              onClick={() => setActiveTab("services")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 ${
                activeTab === "services"
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Package className="w-4.5 h-4.5" /> Dịch vụ
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 ${
                activeTab === "reviews"
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Star className="w-4.5 h-4.5" /> Đánh giá
            </button>
            <button
              onClick={() => setActiveTab("subscriptions")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 ${
                activeTab === "subscriptions"
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Crown className="w-4.5 h-4.5" /> Giao dịch SaaS
            </button>
            <button
              onClick={() => setActiveTab("system")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 ${
                activeTab === "system"
                  ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Settings className="w-4.5 h-4.5" /> Cấu hình
            </button>
          </nav>
        </div>

        {/* Right Main Workspace */}
        <div className="space-y-8">
          
          {/* Header Title Section */}
          <div className="border-b border-white/5 pb-4">
            <h1 className="text-2xl font-black text-white capitalize">
              {activeTab === "overview" && "Tổng quan & Duyệt đối tác"}
              {activeTab === "users" && `Quản lý Người dùng (${users.length})`}
              {activeTab === "plans" && `Quản lý Gói dịch vụ (${plans.length})`}
              {activeTab === "venues" && `Quản lý Cơ sở sân (${venues.length})`}
              {activeTab === "courts" && `Quản lý Sân thi đấu (${courts.length})`}
              {activeTab === "bookings" && `Quản lý Đơn đặt sân (${bookings?.length || 0})`}
              {activeTab === "invoices" && `Quản lý Hóa đơn (${invoices?.length || 0})`}
              {activeTab === "promotions" && `Quản lý Khuyến mãi (${promotions?.length || 0})`}
              {activeTab === "services" && `Quản lý Dịch vụ (${services?.length || 0})`}
              {activeTab === "reviews" && `Quản lý Đánh giá (${reviews?.length || 0})`}
              {activeTab === "subscriptions" && `Giao dịch gói SaaS (${dashboardData?.subscriptions?.length || 0})`}
              {activeTab === "system" && "Cấu hình hệ thống"}
            </h1>
            <p className="text-slate-400 mt-2 text-sm max-w-2xl">
              {activeTab === "overview" && "Thống kê tình hình hoạt động nền tảng và duyệt chủ sân mới."}
              {activeTab === "users" && "Quản lý tài khoản, thêm mới người dùng và phân quyền hệ thống."}
              {activeTab === "plans" && "Quản lý các gói sản phẩm SaaS, chu kỳ thanh toán và đơn giá."}
              {activeTab === "venues" && "Quản lý cơ sở sân cầu lông, địa chỉ vùng miền và gán chủ sở hữu."}
              {activeTab === "courts" && "Quản lý chi tiết từng sân thi đấu, chất liệu mặt thảm và trạng thái."}
              {activeTab === "bookings" && "Giám sát toàn bộ các giao dịch đặt lịch sân, hình thức đặt và trạng thái ca chơi."}
              {activeTab === "invoices" && "Theo dõi danh sách và trạng thái hóa đơn thanh toán tiền sân đấu & dịch vụ đi kèm."}
              {activeTab === "promotions" && "Quản lý và cập nhật danh sách các chương trình khuyến mãi, sự kiện giảm giá."}
              {activeTab === "services" && "Giám sát tất cả hàng hóa, dịch vụ và vật tư bán lẻ/cho thuê tại các cơ sở."}
              {activeTab === "reviews" && "Xem xét và quản lý các lượt nhận xét, chấm điểm của khách hàng dành cho các cơ sở sân."}
              {activeTab === "subscriptions" && "Thống kê danh sách Chủ sân đã mua các gói dịch vụ (SaaS) và tình trạng gói."}
              {activeTab === "system" && "Quản lý banner trang chủ và các thiết lập hiển thị chung cho người dùng."}
            </p>
          </div>

          {/* ==========================================
              TAB 1: TỔNG QUAN & DUYỆT HỒ SƠ
              ========================================== */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-fade-in">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <DollarSign className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Doanh thu nền tảng</p>
                    <p className="text-xl font-black text-white mt-1">
                      {totalRevenue.toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <FileText className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hồ sơ chờ duyệt</p>
                    <p className="text-xl font-black text-white mt-1">
                      {pendingOwners.length}
                    </p>
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <Users className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tài khoản hệ thống</p>
                    <p className="text-xl font-black text-white mt-1">
                      {users.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Monthly Revenue */}
                <div className="lg:col-span-1 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl h-fit">
                  <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
                    <TrendingUp className="w-4.5 h-4.5 text-primary" /> Doanh thu theo tháng
                  </h2>
                  {dashboardData?.platformRevenue?.length > 0 ? (
                    <div className="space-y-3">
                      {dashboardData.platformRevenue.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3.5 bg-white/5 rounded-2xl border border-white/5"
                        >
                          <span className="font-bold text-xs text-slate-300">
                            Tháng {item.revenuemonth}/{item.revenueyear}
                          </span>
                          <span className="font-extrabold text-sm text-primary">
                            {Number(item.totalrevenue).toLocaleString("vi-VN")}đ
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-6 bg-white/5 rounded-2xl border border-white/5">
                      Chưa có dữ liệu doanh thu.
                    </p>
                  )}
                </div>

                {/* Pending Approvals */}
                <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl">
                  <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
                    <Users className="w-4.5 h-4.5 text-primary" /> Yêu cầu Duyệt Đối tác mới
                  </h2>
                  {pendingOwners.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 text-[10px] text-slate-400 font-bold uppercase">
                            <th className="pb-3">Người đại diện</th>
                            <th className="pb-3">Thông tin Doanh nghiệp</th>
                            <th className="pb-3 text-right">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingOwners.map((owner) => (
                            <tr
                              key={owner.ownerid}
                              className="border-b border-white/5 hover:bg-white/5 transition-colors"
                            >
                              <td className="py-4 pr-4">
                                <p className="font-bold text-xs text-white">{owner.repfullname}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{owner.repphone}</p>
                                <p className="text-[10px] text-slate-400">{owner.repemail}</p>
                              </td>
                              <td className="py-4 pr-4">
                                <p className="font-bold text-xs text-white">{owner.businessname}</p>
                                <p className="text-[10px] text-slate-400 max-w-xs truncate mt-0.5">
                                  {owner.businessaddress}
                                </p>
                                <span className="inline-block mt-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded text-[8px] font-bold uppercase">
                                  Chờ duyệt
                                </span>
                              </td>
                              <td className="py-4 text-right space-x-2 whitespace-nowrap">
                                <button
                                  onClick={() => handleReview(owner.ownerid, "Approve")}
                                  className="px-2.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-xl transition-all duration-300 text-[10px] font-bold inline-flex items-center gap-1"
                                >
                                  <Check className="w-3 h-3" /> Duyệt
                                </button>
                                <button
                                  onClick={() => handleReview(owner.ownerid, "Reject")}
                                  className="px-2.5 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all duration-300 text-[10px] font-bold inline-flex items-center gap-1"
                                >
                                  <XCircle className="w-3 h-3" /> Từ chối
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/5">
                      <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                      <p className="text-slate-200 font-bold text-sm">
                        Đã duyệt tất cả hồ sơ!
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Không có đối tác nào đang chờ xét duyệt.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 2: QUẢN LÝ NGƯỜI DÙNG
              ========================================== */}
          {activeTab === "users" && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4.5 h-4.5 text-primary" /> Danh sách tài khoản
                </h2>
                <button
                  onClick={() => openCreateModal("user")}
                  className="px-3.5 py-2 bg-primary text-on-primary hover:bg-primary-hover rounded-xl text-xs font-black flex items-center gap-1 shadow-lg shadow-primary/10 transition-all"
                >
                  <Plus className="w-4 h-4" /> Thêm Người Dùng
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] text-slate-400 font-bold uppercase">
                      <th className="pb-3">Tài khoản</th>
                      <th className="pb-3">Họ và tên</th>
                      <th className="pb-3">SĐT / Email</th>
                      <th className="pb-3">Vai trò</th>
                      <th className="pb-3">Trạng thái</th>
                      <th className="pb-3 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.userid}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 pr-4 font-mono text-xs text-slate-200">
                          {user.username}
                        </td>
                        <td className="py-4 pr-4 font-bold text-xs text-white">
                          {user.fullname}
                        </td>
                        <td className="py-4 pr-4">
                          <p className="text-xs text-slate-200">{user.phonenumber}</p>
                          <p className="text-[10px] text-slate-400">{user.email || "N/A"}</p>
                        </td>
                        <td className="py-4 pr-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
                            user.roleid === 1 ? "bg-red-500/10 border-red-500/20 text-red-400" :
                            user.roleid === 2 ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                            user.roleid === 3 ? "bg-blue-500/10 border-blue-500/20 text-blue-400" :
                            user.roleid === 4 ? "bg-purple-500/10 border-purple-500/20 text-purple-400" :
                            "bg-slate-500/10 border-slate-500/20 text-slate-300"
                          }`}>
                            {user.rolename}
                          </span>
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex flex-col gap-1">
                            <span className={`w-fit inline-block px-1.5 py-0.2 rounded text-[8px] font-bold ${
                              user.isactive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                            }`}>
                              {user.isactive ? "Hoạt động" : "Khóa"}
                            </span>
                            <span className={`w-fit inline-block px-1.5 py-0.2 rounded text-[8px] font-bold ${
                              user.isverified ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-500/10 text-slate-400"
                            }`}>
                              {user.isverified ? "Đã xác minh" : "Chưa xác minh"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => openEditModal("user", user)}
                            className="p-1.5 bg-white/5 text-slate-300 hover:text-white rounded-lg border border-white/10"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDelete("user", user.userid)}
                            className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg border border-red-500/20"
                            title="Xóa"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 3: QUẢN LÝ GÓI DỊCH VỤ
              ========================================== */}
          {activeTab === "plans" && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Percent className="w-4.5 h-4.5 text-primary" /> Danh sách gói dịch vụ SaaS
                </h2>
                <button
                  onClick={() => openCreateModal("plan")}
                  className="px-3.5 py-2 bg-primary text-on-primary hover:bg-primary-hover rounded-xl text-xs font-black flex items-center gap-1 shadow-lg shadow-primary/10 transition-all"
                >
                  <Plus className="w-4 h-4" /> Thêm Gói Mới
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] text-slate-400 font-bold uppercase">
                      <th className="pb-3">Tên gói</th>
                      <th className="pb-3">Mã gói</th>
                      <th className="pb-3">Đơn giá / Chu kỳ</th>
                      <th className="pb-3">Giới hạn hệ thống</th>
                      <th className="pb-3">Trạng thái</th>
                      <th className="pb-3 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.map((plan) => (
                      <tr
                        key={plan.planid}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 pr-4 font-bold text-xs text-white">
                          {plan.planname}
                        </td>
                        <td className="py-4 pr-4 font-mono text-xs text-slate-200">
                          {plan.plancode}
                        </td>
                        <td className="py-4 pr-4">
                          <p className="font-extrabold text-xs text-primary">
                            {Number(plan.pricepercycle).toLocaleString("vi-VN")}đ
                          </p>
                          <p className="text-[10px] text-slate-400">{plan.billingcycle}</p>
                        </td>
                        <td className="py-4 pr-4 text-[11px] text-slate-200">
                          {plan.maxvenues} Cơ sở / {plan.maxcourtspervenue} Sân / {plan.maxstaff} NV
                        </td>
                        <td className="py-4 pr-4">
                          <span className={`inline-block px-1.5 py-0.2 rounded text-[8px] font-bold ${
                            plan.isactive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                          }`}>
                            {plan.isactive ? "Kích hoạt" : "Ẩn"}
                          </span>
                        </td>
                        <td className="py-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => openEditModal("plan", plan)}
                            className="p-1.5 bg-white/5 text-slate-300 hover:text-white rounded-lg border border-white/10"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDelete("plan", plan.planid)}
                            className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg border border-red-500/20"
                            title="Xóa"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 4: QUẢN LÝ CƠ SỞ (VENUES)
              ========================================== */}
          {activeTab === "venues" && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4.5 h-4.5 text-primary" /> Danh sách cơ sở sân
                </h2>
                <button
                  onClick={() => openCreateModal("venue")}
                  className="px-3.5 py-2 bg-primary text-on-primary hover:bg-primary-hover rounded-xl text-xs font-black flex items-center gap-1 shadow-lg shadow-primary/10 transition-all"
                >
                  <Plus className="w-4 h-4" /> Thêm Cơ Sở
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] text-slate-400 font-bold uppercase">
                      <th className="pb-3">Tên cơ sở</th>
                      <th className="pb-3">Địa chỉ / Khu vực</th>
                      <th className="pb-3">Chủ sở hữu</th>
                      <th className="pb-3">Khung giờ mở</th>
                      <th className="pb-3">Trạng thái</th>
                      <th className="pb-3 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {venues.map((venue) => (
                      <tr
                        key={venue.venueid}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 pr-4 font-bold text-xs text-white">
                          {venue.venuename}
                        </td>
                        <td className="py-4 pr-4 text-xs text-slate-200">
                          <p>{venue.address}</p>
                          <p className="text-[10px] text-slate-400">{venue.district}, {venue.city}</p>
                        </td>
                        <td className="py-4 pr-4">
                          {venue.repfullname ? (
                            <div>
                              <p className="font-bold text-[11px] text-slate-200">{venue.repfullname}</p>
                              <p className="text-[9px] text-slate-400">{venue.businessname}</p>
                            </div>
                          ) : (
                            <span className="text-[10px] text-red-400 italic">Chưa gán chủ</span>
                          )}
                        </td>
                        <td className="py-4 pr-4 text-xs text-slate-300">
                          {venue.opentime} - {venue.closetime}
                        </td>
                        <td className="py-4 pr-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-bold ${
                            venue.status === "Active" ? "bg-emerald-500/10 text-emerald-400" :
                            venue.status === "Maintenance" ? "bg-amber-500/10 text-amber-400" :
                            "bg-red-500/10 text-red-400"
                          }`}>
                            {venue.status === "Active" ? "Đang chạy" :
                             venue.status === "Maintenance" ? "Bảo trì" : "Đóng cửa"}
                          </span>
                        </td>
                        <td className="py-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => openEditModal("venue", venue)}
                            className="p-1.5 bg-white/5 text-slate-300 hover:text-white rounded-lg border border-white/10"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDelete("venue", venue.venueid)}
                            className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg border border-red-500/20"
                            title="Xóa"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 5: QUẢN LÝ SÂN ĐẤU (COURTS)
              ========================================== */}
          {activeTab === "courts" && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4.5 h-4.5 text-primary" /> Danh sách chi tiết sân
                </h2>
                <button
                  onClick={() => openCreateModal("court")}
                  className="px-3.5 py-2 bg-primary text-on-primary hover:bg-primary-hover rounded-xl text-xs font-black flex items-center gap-1 shadow-lg shadow-primary/10 transition-all"
                >
                  <Plus className="w-4 h-4" /> Thêm Sân Mới
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] text-slate-400 font-bold uppercase">
                      <th className="pb-3">Tên sân</th>
                      <th className="pb-3">Thuộc Cơ sở</th>
                      <th className="pb-3">Loại mặt thảm</th>
                      <th className="pb-3">Trạng thái sân</th>
                      <th className="pb-3">Ghi chú</th>
                      <th className="pb-3 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courts.map((court) => (
                      <tr
                        key={court.courtid}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 pr-4 font-bold text-xs text-white">
                          {court.courtname}
                        </td>
                        <td className="py-4 pr-4 text-xs text-slate-200">
                          {court.venuename}
                        </td>
                        <td className="py-4 pr-4 text-xs text-slate-300">
                          {court.surfacetype || "PVC 4.5mm"}
                        </td>
                        <td className="py-4 pr-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-bold ${
                            court.status === "Available" ? "bg-emerald-500/10 text-emerald-400" :
                            court.status === "Maintenance" ? "bg-amber-500/10 text-amber-400" :
                            "bg-red-500/10 text-red-400"
                          }`}>
                            {court.status === "Available" ? "Sẵn sàng" :
                             court.status === "Maintenance" ? "Bảo trì" : "Đã đặt / Đóng"}
                          </span>
                        </td>
                        <td className="py-4 pr-4 text-[11px] text-slate-400 max-w-xs truncate">
                          {court.notes || "Không có"}
                        </td>
                        <td className="py-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => openEditModal("court", court)}
                            className="p-1.5 bg-white/5 text-slate-300 hover:text-white rounded-lg border border-white/10"
                            title="Chỉnh sửa"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDelete("court", court.courtid)}
                            className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg border border-red-500/20"
                            title="Xóa"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 6: ĐƠN ĐẶT SÂN (Bookings)
              ========================================== */}
          {activeTab === "bookings" && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6 animate-fade-in">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 font-bold">
                      <th className="pb-3">Mã đơn</th>
                      <th className="pb-3">Khách hàng</th>
                      <th className="pb-3">SĐT khách</th>
                      <th className="pb-3">Hình thức</th>
                      <th className="pb-3">Trạng thái</th>
                      <th className="pb-3">Ngày tạo</th>
                      <th className="pb-3 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr
                        key={booking.bookingid}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 pr-4 font-bold text-white uppercase">
                          {booking.bookingcode}
                        </td>
                        <td className="py-4 pr-4 text-slate-200">
                          {booking.customername || booking.guestname || "Vãng lai"}
                        </td>
                        <td className="py-4 pr-4 text-slate-300">
                          {booking.guestphone || "Không có"}
                        </td>
                        <td className="py-4 pr-4 text-slate-300">
                          {booking.bookingtype === "fixed" ? "Cố định" : "Lẻ"}
                        </td>
                        <td className="py-4 pr-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-bold ${
                            booking.bookingstatus === "Completed" ? "bg-emerald-500/10 text-emerald-400" :
                            booking.bookingstatus === "Pending" ? "bg-amber-500/10 text-amber-400" :
                            booking.bookingstatus === "Confirmed" ? "bg-blue-500/10 text-blue-400" :
                            "bg-red-500/10 text-red-400"
                          }`}>
                            {booking.bookingstatus === "Completed" ? "Đã xong" :
                             booking.bookingstatus === "Pending" ? "Chờ duyệt" :
                             booking.bookingstatus === "Confirmed" ? "Đã nhận" : "Đã hủy"}
                          </span>
                        </td>
                        <td className="py-4 pr-4 text-slate-400">
                          {new Date(booking.createdat).toLocaleString("vi-VN")}
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleDelete("booking", booking.bookingid)}
                            className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg border border-red-500/20"
                            title="Xóa đơn"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center py-8 text-slate-400">
                          Không có đơn đặt sân nào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 7: HÓA ĐƠN (Invoices)
              ========================================== */}
          {activeTab === "invoices" && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6 animate-fade-in">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 font-bold">
                      <th className="pb-3">Mã HĐ</th>
                      <th className="pb-3">Mã Đơn</th>
                      <th className="pb-3">Khách hàng</th>
                      <th className="pb-3">Tiền sân</th>
                      <th className="pb-3">Tiền dịch vụ</th>
                      <th className="pb-3 font-extrabold text-white">Tổng cộng</th>
                      <th className="pb-3">Trạng thái</th>
                      <th className="pb-3">Ngày xuất</th>
                      <th className="pb-3 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr
                        key={invoice.invoiceid}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 pr-4 font-bold text-white uppercase">
                          {invoice.invoicecode || `INV-${invoice.invoiceid}`}
                        </td>
                        <td className="py-4 pr-4 text-slate-300 uppercase">
                          {invoice.bookingcode}
                        </td>
                        <td className="py-4 pr-4 text-slate-200">
                          {invoice.customername || "Khách vãng lai"}
                        </td>
                        <td className="py-4 pr-4 text-slate-300">
                          {Number(invoice.courttotal).toLocaleString()}đ
                        </td>
                        <td className="py-4 pr-4 text-slate-300">
                          {Number(invoice.servicetotal).toLocaleString()}đ
                        </td>
                        <td className="py-4 pr-4 font-bold text-primary">
                          {Number(invoice.totalamount).toLocaleString()}đ
                        </td>
                        <td className="py-4 pr-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-bold ${
                            invoice.paymentstatus === "Paid" ? "bg-emerald-500/10 text-emerald-400" :
                            "bg-amber-500/10 text-amber-400"
                          }`}>
                            {invoice.paymentstatus === "Paid" ? "Đã trả" : "Chưa trả"}
                          </span>
                        </td>
                        <td className="py-4 pr-4 text-slate-400">
                          {new Date(invoice.createdat).toLocaleString("vi-VN")}
                        </td>
                        <td className="py-4 text-right flex items-center justify-end gap-2">
                          <button
                            onClick={() => window.open(`/print/invoice/${invoice.invoiceid}`, "_blank")}
                            className="p-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg border border-blue-500/20"
                            title="In Hóa Đơn"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete("invoice", invoice.invoiceid)}
                            className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg border border-red-500/20"
                            title="Xóa HĐ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {invoices.length === 0 && (
                      <tr>
                        <td colSpan="9" className="text-center py-8 text-slate-400">
                          Không có hóa đơn nào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 8: KHUYẾN MÃI (Promotions)
              ========================================== */}
          {activeTab === "promotions" && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6 animate-fade-in">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 font-bold">
                      <th className="pb-3">Tên CTKM</th>
                      <th className="pb-3">Cơ sở áp dụng</th>
                      <th className="pb-3">Loại giảm</th>
                      <th className="pb-3">Giá trị</th>
                      <th className="pb-3">Đơn tối thiểu</th>
                      <th className="pb-3">Lượt dùng</th>
                      <th className="pb-3">Hạn dùng</th>
                      <th className="pb-3">Trạng thái</th>
                      <th className="pb-3 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promotions.map((promo) => (
                      <tr
                        key={promo.promotionid}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 pr-4 font-bold text-white">
                          {promo.promotionname}
                        </td>
                        <td className="py-4 pr-4 text-slate-200">
                          {promo.venuename || "Toàn hệ thống"}
                        </td>
                        <td className="py-4 pr-4 text-slate-300">
                          {promo.discounttype === "Percentage" ? "Theo %" : "Tiền mặt"}
                        </td>
                        <td className="py-4 pr-4 text-slate-300 font-bold">
                          {promo.discounttype === "Percentage" ? `${promo.discountvalue}%` : `${Number(promo.discountvalue).toLocaleString()}đ`}
                        </td>
                        <td className="py-4 pr-4 text-slate-300">
                          {Number(promo.minorderamount).toLocaleString()}đ
                        </td>
                        <td className="py-4 pr-4 text-slate-300">
                          {promo.usagecount} / {promo.usagelimit || "∞"}
                        </td>
                        <td className="py-4 pr-4 text-slate-400">
                          {new Date(promo.startdate).toLocaleDateString("vi-VN")} - {new Date(promo.enddate).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="py-4 pr-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-bold ${
                            promo.isactive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                          }`}>
                            {promo.isactive ? "Kích hoạt" : "Ngừng dùng"}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleDelete("promotion", promo.promotionid)}
                            className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg border border-red-500/20"
                            title="Xóa KM"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {promotions.length === 0 && (
                      <tr>
                        <td colSpan="9" className="text-center py-8 text-slate-400">
                          Không có chương trình khuyến mãi nào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 9: DỊCH VỤ (Services)
              ========================================== */}
          {activeTab === "services" && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6 animate-fade-in">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 font-bold">
                      <th className="pb-3">Tên dịch vụ</th>
                      <th className="pb-3">Cơ sở</th>
                      <th className="pb-3">Danh mục</th>
                      <th className="pb-3">SKU</th>
                      <th className="pb-3">Đơn giá</th>
                      <th className="pb-3">Tồn kho</th>
                      <th className="pb-3">Trạng thái</th>
                      <th className="pb-3 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((service) => (
                      <tr
                        key={service.serviceid}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 pr-4 font-bold text-white">
                          {service.servicename}
                        </td>
                        <td className="py-4 pr-4 text-slate-200">
                          {service.venuename}
                        </td>
                        <td className="py-4 pr-4 text-slate-300">
                          {service.categoryname || "Khác"}
                        </td>
                        <td className="py-4 pr-4 text-slate-300 font-mono">
                          {service.sku || "N/A"}
                        </td>
                        <td className="py-4 pr-4 text-slate-300 font-bold">
                          {Number(service.unitprice).toLocaleString()}đ
                        </td>
                        <td className="py-4 pr-4 text-slate-300">
                          {service.stockquantity} {service.unit || "Cái"}
                        </td>
                        <td className="py-4 pr-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-bold ${
                            service.isactive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                          }`}>
                            {service.isactive ? "Kích hoạt" : "Ngừng dùng"}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleDelete("service", service.serviceid)}
                            className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg border border-red-500/20"
                            title="Xóa dịch vụ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {services.length === 0 && (
                      <tr>
                        <td colSpan="8" className="text-center py-8 text-slate-400">
                          Không có dịch vụ/sản phẩm nào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 10: ĐÁNH GIÁ (Reviews)
              ========================================== */}
          {activeTab === "reviews" && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6 animate-fade-in">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 font-bold">
                      <th className="pb-3">Cơ sở</th>
                      <th className="pb-3">Khách hàng</th>
                      <th className="pb-3 text-center">Đánh giá</th>
                      <th className="pb-3">Nội dung</th>
                      <th className="pb-3">Ngày</th>
                      <th className="pb-3 text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews?.map((review) => (
                      <tr
                        key={review.reviewid}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 pr-4 font-bold text-white uppercase">
                          {review.venuename || "Không xác định"}
                        </td>
                        <td className="py-4 pr-4 text-slate-300 uppercase">
                          {review.customername || "Ẩn danh"}
                        </td>
                        <td className="py-4 pr-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400">
                            {review.rating} <Star className="w-3 h-3 fill-current" />
                          </span>
                        </td>
                        <td className="py-4 pr-4 text-slate-300 max-w-xs truncate" title={review.comment}>
                          {review.comment || "Không có nội dung"}
                        </td>
                        <td className="py-4 pr-4 text-slate-400">
                          {new Date(review.createdat).toLocaleString("vi-VN")}
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={() => handleDelete("review", review.reviewid)}
                            className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg border border-red-500/20"
                            title="Xóa đánh giá"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {reviews.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center py-8 text-slate-400">
                          Không có đánh giá nào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 11: CẤU HÌNH HỆ THỐNG
              ========================================== */}
          {activeTab === "system" && (
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 animate-fade-in">
              <form
                onSubmit={handleUploadBanner}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-white">
                        Banner trang chủ người dùng
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Nếu chưa upload ảnh riêng, hệ thống sẽ dùng banner mặc định.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={fetchSystemSettings}
                    className="w-fit px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/10 inline-flex items-center gap-2 transition-colors"
                  >
                    <RefreshCcw className="w-3.5 h-3.5" />
                    Tải lại
                  </button>
                </div>

                <div className="aspect-[16/6] min-h-[220px] rounded-3xl overflow-hidden border border-white/10 bg-[#001f23] relative">
                  <img
                    src={displayBannerUrl}
                    alt="Preview banner trang chủ"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent"></div>
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/75">
                      {systemSettings.bannerUrl ? "Banner đang dùng" : "Banner mặc định"}
                    </p>
                    <p className="text-sm font-black text-white mt-1">
                      Tìm sân nhanh. Chơi cực chất.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-end">
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Chọn ảnh banner
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerFileChange}
                      className="mt-2 block w-full text-xs text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2.5 file:text-xs file:font-black file:text-on-primary hover:file:bg-primary-hover"
                    />
                  </label>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      disabled={systemLoading}
                      className="px-4 py-3 rounded-xl bg-primary text-on-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-xs font-black inline-flex items-center gap-2 shadow-lg shadow-primary/10 transition-all"
                    >
                      <Upload className="w-4 h-4" />
                      {systemLoading ? "Đang lưu..." : "Cập nhật"}
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteBanner}
                      disabled={systemLoading || !systemSettings.bannerUrl}
                      className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed text-xs font-black inline-flex items-center gap-2 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa ảnh riêng
                    </button>
                  </div>
                </div>

                {systemMessage && (
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold">
                    {systemMessage}
                  </div>
                )}
                {systemError && (
                  <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-bold">
                    {systemError}
                  </div>
                )}
              </form>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 h-fit space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Text hiển thị khi chưa có dữ liệu</h3>
                    <p className="text-xs text-slate-400 mt-1">Không để giao diện bị trống.</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-300">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <p className="font-bold text-white">Banner</p>
                    <p className="text-slate-400 mt-1">Chưa có ảnh riêng, hệ thống sẽ dùng banner mặc định.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <p className="font-bold text-white">Thông báo</p>
                    <p className="text-slate-400 mt-1">Khi chưa có thông báo, popup sẽ hiển thị dòng hướng dẫn thay vì chỉ báo rỗng.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ==========================================
          MODALS: FORM THÊM / SỬA (Giữ nguyên)
          ========================================== */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-[#00272c] border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-scale-in">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white">
                {modalMode === "create" ? "Thêm mới" : "Chỉnh sửa"}{" "}
                {modalType === "user" ? "Người dùng" :
                 modalType === "plan" ? "Gói dịch vụ" :
                 modalType === "venue" ? "Cơ sở" : "Sân đấu"}
              </h3>
              <button
                onClick={() => setModalType(null)}
                className="text-slate-400 hover:text-white font-bold text-xl"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleFormSubmit} className="p-6 max-h-[70vh] overflow-y-auto space-y-4 no-scrollbar">
              {submitError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-xs font-bold">
                  {submitError}
                </div>
              )}

              {/* USER FORM */}
              {modalType === "user" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tài khoản (Username) *</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      disabled={modalMode === "edit"}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                      {modalMode === "create" ? "Mật khẩu *" : "Mật khẩu mới (Để trống nếu giữ nguyên)"}
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={modalMode === "create"}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Họ và tên *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Số điện thoại *</label>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Trình độ</label>
                    <select
                      name="skillLevel"
                      value={formData.skillLevel}
                      onChange={handleInputChange}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    >
                      <option value="Yếu">Yếu</option>
                      <option value="Trung bình">Trung bình</option>
                      <option value="Trung bình khá">Trung bình khá</option>
                      <option value="Khá">Khá</option>
                      <option value="Xuất sắc">Xuất sắc</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Vai trò *</label>
                    <select
                      name="roleId"
                      value={formData.roleId}
                      onChange={handleInputChange}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    >
                      <option value={1}>Admin</option>
                      <option value={2}>CourtOwner</option>
                      <option value={3}>VenueManager</option>
                      <option value={4}>Staff</option>
                      <option value={5}>Customer</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-6 mt-6">
                    <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="rounded border-white/10 text-primary focus:ring-primary bg-black/40 w-4 h-4"
                      />
                      Hoạt động
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isVerified"
                        checked={formData.isVerified}
                        onChange={handleInputChange}
                        className="rounded border-white/10 text-primary focus:ring-primary bg-black/40 w-4 h-4"
                      />
                      Xác minh
                    </label>
                  </div>
                </div>
              )}

              {/* PLAN FORM */}
              {modalType === "plan" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tên gói *</label>
                    <input
                      type="text"
                      name="planName"
                      value={formData.planName}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Mã gói (PlanCode) *</label>
                    <input
                      type="text"
                      name="planCode"
                      value={formData.planCode}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Chu kỳ *</label>
                    <select
                      name="billingCycle"
                      value={formData.billingCycle}
                      onChange={handleInputChange}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    >
                      <option value="Monthly">Monthly</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Đơn giá *</label>
                    <input
                      type="number"
                      name="pricePerCycle"
                      value={formData.pricePerCycle}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Giá gốc</label>
                    <input
                      type="number"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Thứ tự hiển thị</label>
                    <input
                      type="number"
                      name="sortOrder"
                      value={formData.sortOrder}
                      onChange={handleInputChange}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Max Cơ sở</label>
                    <input
                      type="number"
                      name="maxVenues"
                      value={formData.maxVenues}
                      onChange={handleInputChange}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Max Sân / Cơ sở</label>
                    <input
                      type="number"
                      name="maxCourtsPerVenue"
                      value={formData.maxCourtsPerVenue}
                      onChange={handleInputChange}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Max Nhân viên</label>
                    <input
                      type="number"
                      name="maxStaff"
                      value={formData.maxStaff}
                      onChange={handleInputChange}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Dung lượng tối đa (GB)</label>
                    <input
                      type="number"
                      name="storageLimitGB"
                      value={formData.storageLimitGB}
                      onChange={handleInputChange}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Mô tả gói</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    ></textarea>
                  </div>
                  <div className="flex items-center gap-6 mt-4">
                    <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="rounded border-white/10 text-primary focus:ring-primary bg-black/40 w-4 h-4"
                      />
                      Kích hoạt hiển thị
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        name="hasAdvancedReport"
                        checked={formData.hasAdvancedReport}
                        onChange={handleInputChange}
                        className="rounded border-white/10 text-primary focus:ring-primary bg-black/40 w-4 h-4"
                      />
                      Báo cáo nâng cao
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        name="hasAPIAccess"
                        checked={formData.hasAPIAccess}
                        onChange={handleInputChange}
                        className="rounded border-white/10 text-primary focus:ring-primary bg-black/40 w-4 h-4"
                      />
                      Truy cập API
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        name="hasPrioritySupport"
                        checked={formData.hasPrioritySupport}
                        onChange={handleInputChange}
                        className="rounded border-white/10 text-primary focus:ring-primary bg-black/40 w-4 h-4"
                      />
                      Hỗ trợ ưu tiên
                    </label>
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        name="hasCustomBranding"
                        checked={formData.hasCustomBranding}
                        onChange={handleInputChange}
                        className="rounded border-white/10 text-primary focus:ring-primary bg-black/40 w-4 h-4"
                      />
                      Thương hiệu riêng
                    </label>
                  </div>
                </div>
              )}

              {/* VENUE FORM */}
              {modalType === "venue" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tên cơ sở *</label>
                    <input
                      type="text"
                      name="venueName"
                      value={formData.venueName}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Địa chỉ chi tiết *</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Quận/Huyện *</label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tỉnh/Thành phố *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Giờ mở cửa</label>
                    <input
                      type="text"
                      name="openTime"
                      placeholder="06:00:00"
                      value={formData.openTime}
                      onChange={handleInputChange}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Giờ đóng cửa</label>
                    <input
                      type="text"
                      name="closeTime"
                      placeholder="23:00:00"
                      value={formData.closeTime}
                      onChange={handleInputChange}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Vĩ độ</label>
                    <input
                      type="number"
                      step="any"
                      name="latitude"
                      placeholder="10.7761"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Kinh độ</label>
                    <input
                      type="number"
                      step="any"
                      name="longitude"
                      placeholder="106.6713"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Chủ sân sở hữu *</label>
                    <select
                      name="ownerId"
                      value={formData.ownerId}
                      onChange={handleInputChange}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    >
                      <option value="">-- Không có --</option>
                      {owners.map((owner) => (
                        <option key={owner.ownerid} value={owner.ownerid}>
                          {owner.repfullname} ({owner.businessname || "Cá nhân"})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Trạng thái *</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    >
                      <option value="Active">Active</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Giới thiệu / Mô tả cơ sở</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* COURT FORM */}
              {modalType === "court" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tên sân *</label>
                    <input
                      type="text"
                      name="courtName"
                      value={formData.courtName}
                      onChange={handleInputChange}
                      required
                      placeholder="Ví dụ: Sân số 1"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Thuộc cơ sở *</label>
                    <select
                      name="venueId"
                      value={formData.venueId}
                      onChange={handleInputChange}
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    >
                      {venues.map((venue) => (
                        <option key={venue.venueid} value={venue.venueid}>
                          {venue.venuename}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Chất liệu thảm</label>
                    <select
                      name="surfaceType"
                      value={formData.surfaceType}
                      onChange={handleInputChange}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    >
                      <option value="PVC 4.5mm">PVC 4.5mm</option>
                      <option value="Yonex Premium">Yonex Premium</option>
                      <option value="Enlio Premium">Enlio Premium</option>
                      <option value="Standard Green">Standard Green</option>
                      <option value="Standard Wood">Standard Wood</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Trạng thái sân *</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    >
                      <option value="Available">Available</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Booked">Booked</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Ghi chú sân</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    ></textarea>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-6 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-5 py-2.5 bg-white/5 text-white hover:bg-white/10 rounded-2xl text-xs font-bold border border-white/10 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary text-on-primary hover:bg-primary-hover rounded-2xl text-xs font-black shadow-lg shadow-primary/10 transition"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
