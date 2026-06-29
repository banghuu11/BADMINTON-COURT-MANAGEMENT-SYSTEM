import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Users, User, Info, Check, ArrowLeft, Maximize } from "lucide-react";
import useAuthStore from "../../store/useAuthStore";
import TimeSlotSelector from "../../components/booking/TimeSlotSelector";
import Court3D from "../../components/booking/Court3D";
import { useCourtBooking } from "../../hooks/useCourtBooking";

const CourtBooking = () => {
  const { courtId } = useParams();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const {
    playDate,
    pricingSlots,
    selectedTimeSlot,
    selectedDuration,
    durationOptions,
    matchType,
    selectedPositions,
    slots3D,
    occupiedSlots,
    isFullCourt,
    canBook,
    isLoading,
    error,
    setPlayDate,
    setSelectedDuration,
    setSelectedTimeSlot,
    setMatchType,
    handleTogglePosition,
    isSlotBooked,
    handleBookCourt,
  } = useCourtBooking(courtId);

  const onConfirmBooking = async () => {
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để đặt sân!");
      navigate("/login");
      return;
    }

    try {
      await handleBookCourt();
      alert("Đặt sân thành công! Bạn có thể xem lại trong hồ sơ.");
      navigate("/profile");
    } catch (err) {
      alert(err.message || "Có lỗi xảy ra khi đặt sân.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-5 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Quy trình Đặt Sân
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Sân #{courtId} - Vui lòng chọn khung giờ và chọn vị trí
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
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
            pricingSlots={pricingSlots
              .filter((p) => {
                const dateObj = new Date(playDate);
                const dayOfWeek = dateObj.getDay();
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                const currentDayType = isWeekend ? "Weekend" : "Weekday";
                return p.daytype === "All" || p.daytype === currentDayType;
              })
              .sort((a, b) => a.starttime.localeCompare(b.starttime))}
            selectedTimeSlot={selectedTimeSlot}
            onTimeSlotChange={setSelectedTimeSlot}
            isSlotBooked={isSlotBooked}
            selectedDuration={selectedDuration}
            onDurationChange={setSelectedDuration}
            durationOptions={durationOptions}
          />

          {/* Step 2 */}
          {selectedTimeSlot && (
            <div className="animate-fade-in pt-4 border-t border-slate-100">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="bg-primary text-[#00272C] w-6 h-6 rounded-full flex items-center justify-center text-xs">
                  2
                </span>{" "}
                Chọn vị trí trên sân 3D
              </h3>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setMatchType("singles")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${matchType === "singles" ? "bg-[#00272C] text-primary" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                >
                  <User className="w-4 h-4" /> Đánh Đơn
                </button>
                <button
                  onClick={() => setMatchType("doubles")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${matchType === "doubles" ? "bg-[#00272C] text-primary" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                >
                  <Users className="w-4 h-4" /> Đánh Đôi
                </button>
                <button
                  onClick={() => setMatchType("fullCourt")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${matchType === "fullCourt" ? "bg-[#00272C] text-primary" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                >
                  <Maximize className="w-4 h-4" /> Bao Sân
                </button>
              </div>

              {isFullCourt ? (
                <div className="bg-primary/10 p-4 rounded-xl border border-primary/30">
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
                className={`w-full mt-6 py-3 rounded-xl font-bold text-base transition-colors shadow-lg flex items-center justify-center gap-2 ${!canBook ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" : "bg-primary text-[#00272C] hover:bg-[#C6D632] shadow-[0_0_15px_rgba(225,255,81,0.3)]"}`}
              >
                {isLoading ? (
                  "Đang xử lý..."
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
    </div>
  );
};

export default CourtBooking;
