import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Calendar, Clock, LogOut, Star, MapPin, Award } from "lucide-react";
import { apiFetch } from "../services/api";
import useAuthStore from "../store/useAuthStore";
import ReviewModal from "../components/profile/ReviewModal.jsx";

const Profile = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State cho Modal Đánh giá
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    venueId: "",
    bookingId: "",
    rating: 5,
    comment: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Redirect nếu chưa đăng nhập
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await apiFetch("/booking/history");
        setBookings(data.bookings || []);
      } catch (err) {
        setError(err.message || "Không thể tải lịch sử đặt sân.");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) fetchBookings();
  }, [isAuthenticated]);

  // Hàm xử lý hủy đặt sân
  const handleCancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm(
      "Bạn có chắc chắn muốn hủy đơn đặt sân này không?",
    );
    if (!confirmCancel) return;

    const reason = window.prompt("Vui lòng nhập lý do hủy (không bắt buộc):");

    try {
      await apiFetch(`/booking/${bookingId}/cancel`, {
        method: "PATCH",
        body: JSON.stringify({ cancelReason: reason || "Khách yêu cầu hủy" }),
      });
      alert("Hủy đặt sân thành công!");
      // Cập nhật lại danh sách lịch sử sau khi hủy
      const data = await apiFetch("/booking/history");
      setBookings(data.bookings || []);
    } catch (err) {
      alert(err.message || "Có lỗi xảy ra khi hủy đặt sân.");
    }
  };

  // Mở modal đánh giá
  const openReviewModal = (booking) => {
    const venueId = booking.slots?.[0]?.venueId;
    if (!venueId) {
      alert("Không tìm thấy thông tin cơ sở để đánh giá!");
      return;
    }
    setReviewForm({
      venueId,
      bookingId: booking.bookingid,
      rating: 5,
      comment: "",
    });
    setIsReviewModalOpen(true);
  };

  // Gửi đánh giá
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await apiFetch("/reviews", {
        method: "POST",
        body: JSON.stringify(reviewForm),
      });
      alert("Cảm ơn bạn đã đánh giá!");
      setIsReviewModalOpen(false);
    } catch (err) {
      alert(err.message || "Lỗi khi gửi đánh giá.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "Pending":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "Cancelled":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      default:
        return "text-slate-300 bg-white/5 border-white/10";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "Completed":
        return "Đã hoàn tất";
      case "Pending":
        return "Chờ xử lý";
      case "Cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const canReview = (booking) => {
    return (
      booking.bookingstatus === "Completed" ||
      (booking.slots && booking.slots.some((s) => s.slotStatus === "Finished"))
    );
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-5 py-8 animate-fade-in pb-24 text-white">
      <h1 className="text-3xl font-extrabold text-white tracking-tight mb-8">
        Hồ sơ cá nhân
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Cột thông tin cá nhân (Glassmorphic) */}
        <div className="space-y-6">
          <div className="bg-background/40 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl text-center">
            <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-primary/20 shadow-[0_0_15px_rgba(225,255,81,0.15)] overflow-hidden">
              {user.avatarurl ? (
                <img src={user.avatarurl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12" />
              )}
            </div>
            <h2 className="text-xl font-bold text-white">
              {user.fullname}
            </h2>
            <p className="text-slate-400 text-sm mb-6">@{user.username}</p>

            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3 text-sm text-slate-300 p-3 bg-white/5 rounded-xl border border-white/5">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <span className="font-semibold">{user.phonenumber}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300 p-3 bg-white/5 rounded-xl border border-white/5">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <span className="font-semibold truncate">
                  {user.email || "Chưa cập nhật email"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300 p-3 bg-white/5 rounded-xl border border-white/5">
                <User className="w-4 h-4 text-primary shrink-0" />
                <span className="font-semibold">
                  Giới tính: {user.gender || "Chưa cập nhật"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300 p-3 bg-white/5 rounded-xl border border-white/5">
                <Calendar className="w-4 h-4 text-primary shrink-0" />
                <span className="font-semibold">
                  Ngày sinh: {user.dateofbirth ? new Date(user.dateofbirth).toLocaleDateString("vi-VN") : "Chưa cập nhật"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300 p-3 bg-white/5 rounded-xl border border-white/5">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span className="font-semibold truncate" title={user.address || "Chưa cập nhật địa chỉ"}>
                  {user.address || "Chưa cập nhật địa chỉ"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300 p-3 bg-white/5 rounded-xl border border-white/5">
                <Award className="w-4 h-4 text-primary shrink-0" />
                <span className="font-semibold">
                  Trình độ: {user.skilllevel || "Mới chơi"}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate("/edit-profile")}
              className="w-full mt-6 py-3 text-[#00272C] bg-primary hover:bg-[#C6D632] rounded-xl font-bold text-sm transition-colors border border-primary/20 flex justify-center items-center gap-2 shadow-lg shadow-primary/10"
            >
              Chỉnh sửa hồ sơ
            </button>

            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="w-full mt-3 py-3 text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl font-bold text-sm transition-colors border border-red-500/20 flex justify-center items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Đăng xuất
            </button>
          </div>
        </div>

        {/* Cột lịch sử đặt sân (Glassmorphic list) */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" /> Lịch sử đặt sân
          </h2>

          {loading ? (
            <div className="text-center py-12 text-slate-400 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="font-semibold text-sm">Đang tải lịch sử đặt sân...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-sm font-semibold border border-red-500/20">
              {error}
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center backdrop-blur-xl">
              <div className="w-16 h-16 bg-white/5 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                <Calendar className="w-8 h-8" />
              </div>
              <p className="text-slate-300 font-bold mb-4">
                Bạn chưa có lịch sử đặt sân nào.
              </p>
              <button
                onClick={() => navigate("/courts")}
                className="bg-primary text-[#00272C] font-bold px-6 py-2.5 rounded-xl hover:bg-[#C6D632] transition-colors shadow-lg shadow-primary/10"
              >
                Tìm sân đặt ngay
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {bookings.map((booking) => (
                <div
                  key={booking.bookingid}
                  className="bg-[#00272c]/40 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shadow-xl hover:border-primary/20 transition-all duration-300"
                >
                  <div className="flex flex-wrap gap-2 justify-between items-start mb-4 border-b border-white/5 pb-4">
                    <div>
                      <span className="text-[10px] font-bold text-primary tracking-wider">
                        MÃ ĐƠN: {booking.bookingcode}
                      </span>
                      <p className="text-xs text-slate-400 mt-1">
                        Đặt lúc:{" "}
                        {new Date(booking.createdat).toLocaleString("vi-VN")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-lg border ${getStatusColor(booking.bookingstatus)}`}
                      >
                        {getStatusText(booking.bookingstatus)}
                      </span>
                      {canReview(booking) && (
                        <button
                          onClick={() => openReviewModal(booking)}
                          className="text-yellow-400 hover:text-yellow-300 bg-yellow-500/10 hover:bg-yellow-500/20 px-3 py-1.5 rounded-xl text-xs font-bold border border-yellow-500/20 transition-colors flex items-center gap-1"
                        >
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" /> Đánh giá
                        </button>
                      )}
                      {(booking.bookingstatus === "Pending" ||
                        booking.bookingstatus === "Confirmed") && (
                        <button
                          onClick={() => handleCancelBooking(booking.bookingid)}
                          className="text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-xl text-xs font-bold border border-red-500/20 transition-colors"
                        >
                          Hủy đơn
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {booking.slots &&
                      booking.slots.map((slot, index) => (
                        <div
                          key={index}
                          className="bg-white/5 p-4 rounded-2xl border border-white/5 flex justify-between items-center"
                        >
                          <div>
                            <p className="font-bold text-white text-sm flex items-center gap-2 flex-wrap">
                              <span>{slot.venueName} - {slot.courtName}</span>
                              {slot.slotStatus === "Playing" && (
                                <span className="text-[9px] bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
                                  Đang chơi
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1.5">
                              <Clock className="w-3.5 h-3.5 text-primary/70" />{" "}
                              {slot.startTime && slot.startTime.slice(0, 5)} -{" "}
                              {slot.endTime && slot.endTime.slice(0, 5)} (
                              {new Date(slot.playDate).toLocaleDateString(
                                "vi-VN",
                              )}
                              )
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-extrabold text-white">
                              {Number(slot.appliedPrice).toLocaleString()}đ
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400">
                      Tổng tiền dự kiến
                    </span>
                    <span className="text-lg font-black text-primary [text-shadow:0_0_10px_rgba(225,255,81,0.25)]">
                      {booking.slots
                        ? booking.slots
                            .reduce(
                              (total, slot) =>
                                total + Number(slot.appliedPrice),
                              0,
                            )
                            .toLocaleString()
                        : 0}
                      đ
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Đánh giá */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        reviewForm={reviewForm}
        setReviewForm={setReviewForm}
        onSubmit={handleSubmitReview}
        submittingReview={submittingReview}
      />
    </div>
  );
};

export default Profile;
