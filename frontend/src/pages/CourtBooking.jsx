import { useParams, useNavigate } from "react-router-dom";
import {
  Users,
  User,
  Info,
  Check,
  ArrowLeft,
  Loader2,
  Maximize,
} from "lucide-react";
import { useCourtBooking } from "../hooks/useCourtBooking";
import TimeSlotSelector from "../components/booking/TimeSlotSelector.jsx";
import Court3D from "../components/booking/Court3D.jsx";
import useAuthStore from "../store/useAuthStore";

const CourtBooking = () => {
  const { courtId } = useParams();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const {
    playDate,
    pricingSlots,
    selectedTimeSlot,
    matchType,
    selectedPositions,
    slots3D,
    occupiedSlots,
    isFullCourt,
    canBook,
    showMatchPopup,
    isLoading,
    error,
    setPlayDate,
    setSelectedTimeSlot,
    setMatchType,
    handleTogglePosition,
    isSlotBooked,
    handleBookCourt,
    handleCreateMatch,
    setShowMatchPopup,
  } = useCourtBooking(courtId);

  const onConfirmBooking = async () => {
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để đặt sân!");
      navigate("/login");
      return;
    }
    try {
      await handleBookCourt();
    } catch (err) {
      alert(err.message || "Có lỗi xảy ra khi đặt sân.");
    }
  };

  const onConfirmMatch = async () => {
    try {
      await handleCreateMatch();
      alert("Đã đăng tin tìm bạn giao lưu thành công!");
      setShowMatchPopup(false);
      navigate("/");
    } catch (err) {
      alert(err.message || "Có lỗi xảy ra khi đăng tin.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-5 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Quy trình Đặt Sân
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Sân #{courtId} - Vui lòng chọn khung giờ và chọn vị trí
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Nhập liệu */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6 h-fit">
          {/* Step 1 */}
          <TimeSlotSelector
            playDate={playDate}
            onDateChange={setPlayDate}
            pricingSlots={pricingSlots}
            selectedTimeSlot={selectedTimeSlot}
            onTimeSlotChange={setSelectedTimeSlot}
            isSlotBooked={isSlotBooked}
          />

          {/* Step 2 */}
          {selectedTimeSlot && (
            <div className="animate-fade-in pt-4 border-t border-slate-100">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="bg-primary text-[#0b1c30] w-6 h-6 rounded-full flex items-center justify-center text-xs">
                  2
                </span>{" "}
                Chọn vị trí trên sân 3D
              </h3>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setMatchType("singles")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${matchType === "singles" ? "bg-[#0b1c30] text-primary" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                >
                  <User className="w-4 h-4" /> Đánh Đơn
                </button>
                <button
                  onClick={() => setMatchType("doubles")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${matchType === "doubles" ? "bg-[#0b1c30] text-primary" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                >
                  <Users className="w-4 h-4" /> Đánh Đôi
                </button>
                <button
                  onClick={() => setMatchType("fullCourt")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${matchType === "fullCourt" ? "bg-[#0b1c30] text-primary" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                >
                  <Maximize className="w-4 h-4" /> Bao Sân
                </button>
              </div>

              {isFullCourt ? (
                <div className="bg-primary/10 p-4 rounded-xl border border-primary/30 mb-4">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                    Chế độ
                  </p>
                  <p className="text-lg font-extrabold text-slate-900">
                    Bao toàn bộ sân
                  </p>
                  <p className="text-sm font-semibold text-primary mt-2">
                    Tổng tiền: {Number(selectedTimeSlot.price).toLocaleString()}
                    đ
                  </p>
                </div>
              ) : selectedPositions.length > 0 ? (
                <div className="bg-primary/10 p-4 rounded-xl border border-primary/30">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                    Đã chọn {selectedPositions.length} vị trí
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2 mb-3">
                    {selectedPositions.map((pos) => (
                      <span
                        key={pos.id}
                        className="px-2 py-1 bg-white text-slate-800 text-xs font-bold rounded shadow-sm border border-slate-200"
                      >
                        {pos.label}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm font-semibold text-primary border-t border-primary/20 pt-2">
                    Tổng tiền:{" "}
                    {(
                      Number(selectedTimeSlot.price) * selectedPositions.length
                    ).toLocaleString()}
                    đ
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800 text-sm">
                  <Info className="w-4 h-4 inline-block mr-1 -mt-0.5" /> Hãy
                  click vào các dấu (+) trống trên mô hình sân 3D bên phải.
                </div>
              )}

              <button
                onClick={onConfirmBooking}
                disabled={isLoading || !canBook}
                className={`w-full mt-6 py-3 rounded-xl font-bold text-base transition-colors shadow-lg flex items-center justify-center gap-2 ${!canBook ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" : "bg-primary text-[#0b1c30] hover:bg-[#a8d800] shadow-[0_0_15px_rgba(191,240,0,0.3)]"}`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Đang xử lý...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" /> Xác nhận đặt sân
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Khối mô hình sân 3D CSS */}
        <Court3D
          slots={slots3D}
          selectedSlot={selectedPositions[selectedPositions.length - 1] || null}
          selectedPositions={selectedPositions}
          selectedTimeSlot={selectedTimeSlot}
          onSlotClick={handleTogglePosition}
          occupiedSlots={occupiedSlots}
          isFullCourt={isFullCourt}
        />
      </div>

      {/* Popup Hỏi Tìm Giao Lưu */}
      {showMatchPopup && (
        <div className="fixed inset-0 bg-[#0b1c30]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl animate-fade-in text-center">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5">
              <Check className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
              Đặt sân thành công!
            </h2>
            <p className="text-slate-600 mb-8">
              Bạn có muốn đăng tin tìm đối thủ hoặc đồng đội để ghép kèo giao
              lưu không? Trận đấu của bạn sẽ xuất hiện trên trang chủ.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowMatchPopup(false);
                  navigate("/profile");
                }}
                className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                Không, tới Hồ sơ
              </button>
              <button
                onClick={onConfirmMatch}
                className="flex-1 py-3 bg-primary text-[#0b1c30] rounded-xl font-bold hover:bg-[#a8d800] transition-colors shadow-lg shadow-primary/20"
              >
                Có, tìm ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourtBooking;
