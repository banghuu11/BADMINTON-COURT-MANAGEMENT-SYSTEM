import { useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, Navigate, useSearchParams } from "react-router-dom";
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
import { apiFetch } from "../services/api";

const timeToMinutes = (time) => {
  const [hours, minutes] = time.substring(0, 5).split(":").map(Number);
  return hours * 60 + minutes;
};

const CourtBooking = () => {
  const user = useAuthStore((state) => state.user);
  const { courtId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initializedMatchFlow = useRef(false);
  const autoSelectedSingles = useRef(false);
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
    setSelectedPositions,
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

  const matchFlow = searchParams.get("flow");
  const matchWaitId = searchParams.get("waitId");
  const queryMatchType = searchParams.get("matchType") || "doubles";
  const queryPlayDate = searchParams.get("playDate");
  const queryStartTime = searchParams.get("startTime");
  const queryEndTime = searchParams.get("endTime");
  const isMatchFlow = matchFlow === "createMatch" || matchFlow === "joinMatch";

  const queryDuration = useMemo(() => {
    if (!queryStartTime || !queryEndTime) return null;
    return timeToMinutes(queryEndTime) - timeToMinutes(queryStartTime);
  }, [queryEndTime, queryStartTime]);

  useEffect(() => {
    if (!isMatchFlow || initializedMatchFlow.current) return;
    initializedMatchFlow.current = true;

    if (queryPlayDate) setPlayDate(queryPlayDate);
    if (queryDuration && queryDuration > 0) setSelectedDuration(queryDuration);
    setMatchType(queryMatchType === "singles" ? "singles" : "doubles");
  }, [
    isMatchFlow,
    queryDuration,
    queryMatchType,
    queryPlayDate,
    setMatchType,
    setPlayDate,
    setSelectedDuration,
  ]);

  useEffect(() => {
    if (!isMatchFlow || !queryStartTime || !queryEndTime || selectedTimeSlot) return;
    const targetSlot = pricingSlots.find(
      (slot) =>
        slot.starttime.slice(0, 5) === queryStartTime.slice(0, 5) &&
        slot.endtime.slice(0, 5) === queryEndTime.slice(0, 5),
    );
    if (targetSlot) {
      setSelectedTimeSlot(targetSlot);
    }
  }, [
    isMatchFlow,
    pricingSlots,
    queryEndTime,
    queryStartTime,
    selectedTimeSlot,
    setSelectedTimeSlot,
  ]);

  useEffect(() => {
    if (
      matchFlow !== "joinMatch" ||
      queryMatchType !== "singles" ||
      !selectedTimeSlot ||
      autoSelectedSingles.current ||
      selectedPositions.length > 0
    ) {
      return;
    }

    const availablePositions = slots3D.filter(
      (slot) => !occupiedSlots.some((occupied) => occupied.id === slot.id),
    );

    if (availablePositions.length === 1) {
      autoSelectedSingles.current = true;
      setSelectedPositions([availablePositions[0]]);
    }
  }, [
    matchFlow,
    occupiedSlots,
    queryMatchType,
    selectedPositions.length,
    selectedTimeSlot,
    setSelectedPositions,
    slots3D,
  ]);

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
      const result = await handleBookCourt({
        createMatchAfterBooking: matchFlow === "createMatch",
      });
      if (result && result.booking) {
        if (matchFlow === "joinMatch" && matchWaitId) {
          const joinResult = await apiFetch(`/booking/matches/${matchWaitId}/join`, {
            method: "POST",
          });
          const contact = joinResult.contact;
          alert(
            `Đã đặt chỗ và tham gia kèo thành công!\nNgười tạo kèo: ${contact?.fullname || contact?.FullName || "Chưa rõ"} - ${contact?.phonenumber || contact?.PhoneNumber || "Chưa có SĐT"}`,
          );
        } else if (matchFlow === "createMatch") {
          alert("Đã đặt chỗ và đăng kèo giao lưu thành công!");
        }
        navigate(`/payment/${result.booking.bookingid}`);
      }
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
    <div className="mx-auto max-w-6xl px-5 py-8 animate-fade-in pb-24 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="rounded-md border border-slate-200 bg-white p-2.5 text-slate-700 transition-colors hover:border-slate-950 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold tracking-normal text-slate-950 dark:text-white">
            Đặt sân
          </h1>
          <p className="text-slate-400 mt-1 text-sm font-semibold">
            {courtData?.venuename ? `${courtData.venuename} - ${courtData.courtname}` : `Sân #${courtId}`}
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Nhập liệu (Glassmorphism Card) */}
        <div className="h-fit space-y-6 rounded-lg border border-slate-200 bg-white p-6 text-slate-950 shadow-sm dark:border-white/10 dark:bg-slate-950 dark:text-white">
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
            <div className="animate-fade-in space-y-4 border-t border-slate-200 pt-4 dark:border-white/10">
              <h3 className="flex items-center gap-2 font-bold text-slate-950 dark:text-white">
                <span className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs font-black text-on-primary">
                  2
                </span>{" "}
                Chọn vị trí trên sân
              </h3>

              {/* Mode Selector (Responsive Grid) */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setMatchType("singles")}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 rounded-md border px-2 py-2.5 text-xs font-bold transition-all ${
                    matchType === "singles"
                      ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
                  }`}
                >
                  <User className="w-3.5 h-3.5 shrink-0" />
                  <span>Đánh Đơn</span>
                </button>
                <button
                  onClick={() => setMatchType("doubles")}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 rounded-md border px-2 py-2.5 text-xs font-bold transition-all ${
                    matchType === "doubles"
                      ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
                  }`}
                >
                  <Users className="w-3.5 h-3.5 shrink-0" />
                  <span>Đánh Đôi</span>
                </button>
                <button
                  onClick={() => setMatchType("fullCourt")}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 rounded-md border px-2 py-2.5 text-xs font-bold transition-all ${
                    matchType === "fullCourt"
                      ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
                  }`}
                >
                  <Maximize className="w-3.5 h-3.5 shrink-0" />
                  <span>Bao Sân</span>
                </button>
              </div>

              {/* Position Information & Breakdown */}
              {isFullCourt ? (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                    Chế độ chọn
                  </p>
                  <p className="text-lg font-extrabold text-slate-950 dark:text-white">
                    Bao toàn bộ sân
                  </p>
                </div>
              ) : selectedPositions.length > 0 ? (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                    Vị trí đã chọn trên 3D
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {selectedPositions.map((pos) => (
                      <span
                        key={pos.id}
                        className="rounded border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                      >
                        {pos.label}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                  <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    Nhấp vào các dấu <strong>(+) trống</strong> trên mô hình sân 3D bên phải để chọn vị trí.
                  </div>
                </div>
              )}

              {/* Step 3: Khuyến mãi & Giảm giá */}
              {(isFullCourt || selectedPositions.length > 0) && (
                <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-white/10">
                  <h3 className="flex items-center gap-2 font-bold text-slate-950 dark:text-white">
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs font-black text-on-primary">
                      3
                    </span>{" "}
                    Ưu đãi & Khuyến mãi
                  </h3>

                  {/* List of active promotions of the venue */}
                  {promotions && promotions.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold uppercase text-slate-400">Khuyến mãi đang chạy tại cơ sở:</p>
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
                              className={`flex h-[68px] w-[140px] flex-shrink-0 flex-col justify-between rounded-md border p-2.5 text-left text-xs transition-all ${
                                isSelected
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
                              }`}
                            >
                              <span className="block w-full truncate font-bold text-slate-950 dark:text-white">{promo.promotionname}</span>
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
                        className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs font-bold uppercase tracking-wider text-slate-950 placeholder-slate-400 focus:border-slate-950 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                      />
                    </div>
                    <button
                      onClick={() => handleApplyPromoCode(promoCode)}
                      disabled={isApplyingPromo}
                      className="rounded-md border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-950 transition-all hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/10 dark:text-white"
                    >
                      {isApplyingPromo ? "Đang áp..." : "Áp dụng"}
                    </button>
                  </div>

                  {promoError && (
                    <p className="rounded-md border border-red-500/20 bg-red-500/10 px-2 py-1 text-xs font-semibold text-red-400">
                      {promoError}
                    </p>
                  )}

                  {appliedDiscount && (
                    <div className="flex items-center justify-between rounded-md border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-500">
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
                <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-4 pt-4 text-sm dark:border-white/10 dark:bg-white/5">
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
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-xs text-slate-400 dark:border-white/10">
                          <span>Thời lượng chơi:</span>
                          <span>{selectedTimeSlot.durationLabel || `${durationHours} giờ`}</span>
                        </div>

                        <div className="flex justify-between items-center pt-1">
                          <span className="text-slate-500 dark:text-slate-300">Tạm tính:</span>
                          <span className="font-bold text-slate-950 dark:text-white">{subtotal.toLocaleString("vi-VN")}đ</span>
                        </div>

                        {discount > 0 && (
                          <div className="flex justify-between items-center text-emerald-400 text-xs font-semibold">
                            <span>Giảm giá ({appliedDiscount.code || "Khuyến mãi"}):</span>
                            <span>-{discount.toLocaleString("vi-VN")}đ</span>
                          </div>
                        )}

                        <div className="mt-1 flex items-center justify-between border-t border-slate-200 pt-2.5 dark:border-white/10">
                          <span className="text-base font-bold text-slate-950 dark:text-white">Tổng thanh toán:</span>
                          <span className="text-xl font-black text-primary">
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
                className={`mt-6 flex w-full items-center justify-center gap-2 rounded-md border py-3 text-base font-bold transition-all ${
                  !canBook
                    ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 shadow-none dark:border-white/10 dark:bg-white/5"
                    : "border-primary bg-primary text-on-primary duration-200 hover:-translate-y-0.5 hover:bg-primary-hover"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md animate-fade-in rounded-lg border border-slate-200 bg-white p-6 text-center shadow-2xl dark:border-white/10 dark:bg-slate-950 md:p-8">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
              <Check className="w-10 h-10 stroke-[3px]" />
            </div>
            <h2 className="mb-2 text-2xl font-extrabold text-slate-950 dark:text-white">
              Đặt sân thành công!
            </h2>
            <p className="mb-8 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Bạn có muốn đăng tin tìm đối thủ hoặc đồng đội để ghép kèo giao
              lưu không? Trận đấu của bạn sẽ xuất hiện trên trang chủ.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowMatchPopup(false);
                  navigate("/profile");
                }}
                className="flex-1 rounded-md border border-slate-200 bg-white py-3 font-bold text-slate-600 transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
              >
                Không, tới Hồ sơ
              </button>
              <button
                onClick={onConfirmMatch}
                className="flex-1 rounded-md bg-primary py-3 font-bold text-on-primary transition-colors hover:bg-primary-hover"
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
