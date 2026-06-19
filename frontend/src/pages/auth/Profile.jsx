import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, Calendar, Clock, LogOut, Star } from "lucide-react";
import useAuthStore from "../../store/useAuthStore";
import { useProfile } from "../../hooks/useProfile";
import ReviewModal from "../../components/profile/ReviewModal";

const Profile = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const {
    bookings,
    isLoading,
    error,
    isReviewModalOpen,
    setIsReviewModalOpen,
    reviewForm,
    setReviewForm,
    submittingReview,
    handleCancelBooking,
    handleSubmitReview,
  } = useProfile();

  // Mở modal đánh giá
  const openReviewModal = (booking) => {
    const venueId = booking.slots?.[0]?.venueId;
    if (venueId)
      setReviewForm({
        venueId,
        bookingId: booking.bookingid,
        rating: 5,
        comment: "",
      });
    setIsReviewModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "Pending":
        return "text-amber-600 bg-amber-50 border-amber-200";
      case "Cancelled":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-slate-600 bg-slate-50 border-slate-200";
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

  // Kiểm tra xem đơn có thể đánh giá không (Đã hoàn thành hoặc có ca đã đánh xong)
  const canReview = (booking) => {
    return (
      booking.bookingstatus === "Completed" ||
      (booking.slots && booking.slots.some((s) => s.slotStatus === "Finished"))
    );
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-5 py-8 animate-fade-in">
      <h1 className="text-3xl font-extrabold text-white tracking-tight mb-8">
        Hồ sơ cá nhân
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cột thông tin cá nhân */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center">
            <div className="w-24 h-24 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-primary/30">
              <User className="w-12 h-12" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              {user.fullname}
            </h2>
            <p className="text-slate-500 text-sm mb-6">@{user.username}</p>

            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3 text-sm text-slate-600 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Phone className="w-4 h-4 text-slate-400" />
                <span className="font-medium">{user.phonenumber}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="font-medium">
                  {user.email || "Chưa cập nhật email"}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="w-full mt-6 py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-bold text-sm transition-colors border border-red-100 flex justify-center items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Đăng xuất
            </button>
          </div>
        </div>

        {/* Cột lịch sử đặt sân */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" /> Lịch sử đặt sân
          </h2>

          {isLoading ? (
            <div className="text-center py-10 text-slate-500 bg-white rounded-3xl border border-slate-200">
              Đang tải lịch sử...
            </div>
          ) : error ? (
            <div className="bg-red-500/20 text-red-300 p-4 rounded-xl text-sm font-medium border border-red-500/30">
              {error}
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center">
              <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8" />
              </div>
              <p className="text-slate-600 font-medium">
                Bạn chưa có lịch sử đặt sân nào.
              </p>
              <button
                onClick={() => navigate("/courts")}
                className="mt-4 text-primary font-bold hover:underline"
              >
                Tìm sân ngay
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {bookings.map((booking) => (
                <div
                  key={booking.bookingid}
                  className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-wrap gap-2 justify-between items-start mb-4 border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                        MÃ ĐƠN: {booking.bookingcode}
                      </span>
                      <p className="text-sm text-slate-500 mt-0.5">
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
                          className="text-yellow-600 hover:text-yellow-700 bg-yellow-50 hover:bg-yellow-100 px-3 py-1 rounded-lg text-xs font-bold border border-yellow-200 transition-colors flex items-center gap-1"
                        >
                          <Star className="w-3 h-3 fill-yellow-600" /> Đánh giá
                        </button>
                      )}
                      {(booking.bookingstatus === "Pending" ||
                        booking.bookingstatus === "Confirmed") && (
                        <button
                          onClick={() => handleCancelBooking(booking.bookingid)}
                          className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg text-xs font-bold border border-red-100 transition-colors"
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
                          className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center"
                        >
                          <div>
                            <p className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              {slot.venueName} - {slot.courtName}
                              <span className="text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-md ml-1">
                                {slot.positionIndex === 0 ||
                                slot.positionIndex == null
                                  ? "Bao nguyên sân"
                                  : `Vị trí: ${slot.positionIndex}`}
                              </span>
                              {slot.slotStatus === "Playing" && (
                                <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded uppercase">
                                  Đang chơi
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                              <Clock className="w-3.5 h-3.5" />{" "}
                              {slot.startTime && slot.startTime.slice(0, 5)} -{" "}
                              {slot.endTime && slot.endTime.slice(0, 5)} (
                              {new Date(slot.playDate).toLocaleDateString(
                                "vi-VN",
                              )}
                              )
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-extrabold text-slate-900">
                              {Number(slot.appliedPrice).toLocaleString()}đ
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-500">
                      Tổng tiền dự kiến
                    </span>
                    <span className="text-xl font-black text-primary">
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
