import { useParams, useNavigate, Navigate } from "react-router-dom";
import {
  Users,
  User,
  Info,
  Check,
  ArrowLeft,
  Loader2,
  Maximize,
  Ticket,
} from "lucide-react";
import { useCourtBooking } from "../hooks/useCourtBooking";
import TimeSlotSelector from "../components/booking/TimeSlotSelector.jsx";
import Court3D from "../components/booking/Court3D.jsx";
import useAuthStore from "../store/useAuthStore";

const CourtBooking = () => {
  const user = useAuthStore((state) => state.user);
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
    showMatchPopup,
    isLoading,
    error,
    setPlayDate,
    setSelectedDuration,
    setSelectedTimeSlot,
    setMatchType,
    handleTogglePosition,
    isSlotBooked,
    handleBookCourt,
    handleCreateMatch,
    setShowMatchPopup,
    courtData,
    promotions,
    promoCode,
    promoError,
    appliedDiscount,
    isApplyingPromo,
    setPromoCode,
    handleApplyPromoCode,
    handleSelectPromotion,
  } = useCourtBooking(courtId);

  if (user && (user.roleid === 1 || user.roleId === 1)) {
    return <Navigate to="/" replace />;
  }

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
    <div className="max-w-5xl mx-auto px-5 py-8 animate-fade-in pb-24">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 bg-white/5 border border-white/10 rounded-full hover:bg-white/15 transition-colors text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Quy trình Đặt Sân
          </h1>
          <p className="text-slate-400 mt-1 text-sm font-semibold">
            {courtData?.venuename ? `${courtData.venuename} - ${courtData.courtname}` : `Sân #${courtId}`}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Nhập liệu (Glassmorphism Card) */}
        <div className="bg-background/40 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl space-y-6 h-fit text-white">
          {/* Step 1 */}
          <TimeSlotSelector
            playDate={playDate}
            onDateChange={setPlayDate}
            pricingSlots={pricingSlots}
            selectedTimeSlot={selectedTimeSlot}
            onTimeSlotChange={setSelectedTimeSlot}
            isSlotBooked={isSlotBooked}
            selectedDuration={selectedDuration}
            onDurationChange={setSelectedDuration}
            durationOptions={durationOptions}
          />

          {/* Step 2 */}
          {selectedTimeSlot && (
            <div className="animate-fade-in pt-4 border-t border-white/10 space-y-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <span className="bg-primary text-[#00272C] w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">
                  2
                </span>{" "}
                Chọn vị trí trên sân
              </h3>

              {/* Mode Selector (Responsive Grid) */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setMatchType("singles")}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                    matchType === "singles"
                      ? "bg-primary text-[#00272C] border-primary shadow-[0_0_10px_rgba(225,255,81,0.2)]"
                      : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <User className="w-3.5 h-3.5 shrink-0" />
                  <span>Đánh Đơn</span>
                </button>
                <button
                  onClick={() => setMatchType("doubles")}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                    matchType === "doubles"
                      ? "bg-primary text-[#00272C] border-primary shadow-[0_0_10px_rgba(225,255,81,0.2)]"
                      : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Users className="w-3.5 h-3.5 shrink-0" />
                  <span>Đánh Đôi</span>
                </button>
                <button
                  onClick={() => setMatchType("fullCourt")}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                    matchType === "fullCourt"
                      ? "bg-primary text-[#00272C] border-primary shadow-[0_0_10px_rgba(225,255,81,0.2)]"
                      : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Maximize className="w-3.5 h-3.5 shrink-0" />
                  <span>Bao Sân</span>
                </button>
              </div>

              {/* Position Information & Breakdown */}
              {isFullCourt ? (
                <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                    Chế độ chọn
                  </p>
                  <p className="text-lg font-extrabold text-white">
                    Bao toàn bộ sân
                  </p>
                </div>
              ) : selectedPositions.length > 0 ? (
                <div className="bg-primary/5 p-4 rounded-xl border border-primary/20">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                    Vị trí đã chọn trên 3D
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {selectedPositions.map((pos) => (
                      <span
                        key={pos.id}
                        className="px-2 py-0.5 bg-white/5 text-slate-300 text-xs font-semibold rounded-lg border border-white/10"
                      >
                        {pos.label}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-slate-300 text-xs leading-relaxed flex gap-2 items-start">
                  <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    Nhấp vào các dấu <strong>(+) trống</strong> trên mô hình sân 3D bên phải để chọn vị trí.
                  </div>
                </div>
              )}

              {/* Step 3: Khuyến mãi & Giảm giá */}
              {(isFullCourt || selectedPositions.length > 0) && (
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <span className="bg-primary text-[#00272C] w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">
                      3
                    </span>{" "}
                    Ưu đãi & Khuyến mãi
                  </h3>

                  {/* List of active promotions of the venue */}
                  {promotions && promotions.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Khuyến mãi đang chạy tại cơ sở:</p>
                      <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar max-h-24">
                        {promotions.map((promo) => {
                          const isSelected = appliedDiscount?.promotionId === promo.promotionid;
                          const valueStr = promo.discounttype === "Percent" || promo.discounttype === "Percentage"
                            ? `${Number(promo.discountvalue)}%`
                            : `${Number(promo.discountvalue).toLocaleString("vi-VN")}đ`;

                          return (
                            <button
                              key={promo.promotionid}
                              onClick={() => handleSelectPromotion(promo)}
                              className={`flex-shrink-0 p-2.5 rounded-xl text-left border transition-all text-xs w-[140px] flex flex-col justify-between h-[68px] ${
                                isSelected
                                  ? "bg-primary/20 border-primary text-primary"
                                  : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                              }`}
                            >
                              <span className="font-bold truncate w-full block text-white">{promo.promotionname}</span>
                              <span className="font-bold text-primary mt-1 block">Giảm {valueStr}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Enter Custom Promo Code */}
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="NHẬP MÃ GIẢM GIÁ"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs focus:outline-none focus:border-primary text-white uppercase placeholder-slate-500 font-bold tracking-wider"
                      />
                    </div>
                    <button
                      onClick={() => handleApplyPromoCode(promoCode)}
                      disabled={isApplyingPromo}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-xs font-bold text-white hover:bg-white/20 transition-all disabled:opacity-50"
                    >
                      {isApplyingPromo ? "Đang áp..." : "Áp dụng"}
                    </button>
                  </div>

                  {promoError && (
                    <p className="text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-lg">
                      {promoError}
                    </p>
                  )}

                  {appliedDiscount && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between">
                      <span>
                        Đã áp: <strong className="uppercase text-primary">{appliedDiscount.code || appliedDiscount.promotionName || "Khuyến mãi"}</strong>
                      </span>
                      <span>-{Number(appliedDiscount.discountAmount).toLocaleString("vi-VN")}đ</span>
                    </div>
                  )}
                </div>
              )}

              {/* Price Breakdown */}
              {selectedTimeSlot && (isFullCourt || selectedPositions.length > 0) && (
                <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-2 text-sm pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>Giá sân ({isFullCourt ? "Bao sân" : `${selectedPositions.length} vị trí`}):</span>
                    <span>
                      {isFullCourt
                        ? `${Number(selectedTimeSlot.price).toLocaleString("vi-VN")}đ/h`
                        : `${(Number(selectedTimeSlot.price) * selectedPositions.length).toLocaleString("vi-VN")}đ/h`}
                    </span>
                  </div>

                  {(() => {
                    const [sh, sm] = selectedTimeSlot.starttime.split(":").map(Number);
                    const [eh, em] = selectedTimeSlot.endtime.split(":").map(Number);
                    const durationHours = (eh * 60 + em - (sh * 60 + sm)) / 60;
                    const count = isFullCourt ? 1 : selectedPositions.length;
                    const subtotal = Number(selectedTimeSlot.price) * durationHours * count;
                    const discount = appliedDiscount?.discountAmount || 0;
                    const total = subtotal - discount;

                    return (
                      <>
                        <div className="flex justify-between items-center text-xs text-slate-400 border-b border-white/5 pb-2">
                          <span>Thời lượng chơi:</span>
                          <span>{selectedTimeSlot.durationLabel || `${durationHours} giờ`}</span>
                        </div>

                        <div className="flex justify-between items-center pt-1">
                          <span className="text-slate-300">Tạm tính:</span>
                          <span className="font-bold text-white">{subtotal.toLocaleString("vi-VN")}đ</span>
                        </div>

                        {discount > 0 && (
                          <div className="flex justify-between items-center text-emerald-400 text-xs font-semibold">
                            <span>Giảm giá ({appliedDiscount.code || "Khuyến mãi"}):</span>
                            <span>-{discount.toLocaleString("vi-VN")}đ</span>
                          </div>
                        )}

                        <div className="flex justify-between items-center border-t border-white/10 pt-2.5 mt-1">
                          <span className="font-bold text-white text-base">Tổng thanh toán:</span>
                          <span className="font-black text-primary text-xl [text-shadow:0_0_10px_rgba(225,255,81,0.2)]">
                            {total.toLocaleString("vi-VN")}đ
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={onConfirmBooking}
                disabled={isLoading || !canBook}
                className={`w-full mt-6 py-3 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 border ${
                  !canBook
                    ? "bg-white/5 text-slate-500 border-white/10 cursor-not-allowed shadow-none"
                    : "bg-primary text-[#00272C] border-primary hover:bg-[#C6D632] shadow-[0_0_15px_rgba(225,255,81,0.3)] hover:-translate-y-0.5 duration-200"
                }`}
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

      {/* Popup Hỏi Tìm Giao Lưu (Glassmorphic Dark Theme) */}
      {showMatchPopup && (
        <div className="fixed inset-0 bg-[#00272C]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#00272C]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-fade-in text-center text-white">
            <div className="w-20 h-20 bg-primary/10 border border-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-5 shadow-[0_0_15px_rgba(225,255,81,0.2)]">
              <Check className="w-10 h-10 stroke-[3px]" />
            </div>
            <h2 className="text-2xl font-extrabold text-white mb-2">
              Đặt sân thành công!
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Bạn có muốn đăng tin tìm đối thủ hoặc đồng đội để ghép kèo giao
              lưu không? Trận đấu của bạn sẽ xuất hiện trên trang chủ.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowMatchPopup(false);
                  navigate("/profile");
                }}
                className="flex-1 py-3 bg-white/5 border border-white/10 text-slate-300 rounded-xl font-bold hover:bg-white/10 hover:text-white transition-colors"
              >
                Không, tới Hồ sơ
              </button>
              <button
                onClick={onConfirmMatch}
                className="flex-1 py-3 bg-primary text-[#00272C] rounded-xl font-bold hover:bg-[#C6D632] transition-colors shadow-lg shadow-primary/20"
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
