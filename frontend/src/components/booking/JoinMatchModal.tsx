import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, X, Check, Users, User } from "lucide-react";
import { useCourtBooking } from "../../hooks/useCourtBooking";
import { apiFetch } from "../../services/api";

const JoinMatchModal = ({ match, onClose }) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const {
    pricingSlots,
    selectedTimeSlot,
    setSelectedTimeSlot,
    setPlayDate,
    setMatchType,
    setSelectedPositions,
    selectedPositions,
    slots3D,
    occupiedSlots,
    handleBookCourt,
    isLoading: isDataLoading,
  } = useCourtBooking(match.courtid);

  // Initialize booking hook with match data
  useEffect(() => {
    setPlayDate(String(match.playdate).slice(0, 10));
    setMatchType(match.matchtype || "doubles");
  }, [match]);

  // Find and set the correct time slot from pricing data
  useEffect(() => {
    if (pricingSlots.length > 0 && !selectedTimeSlot) {
      const targetSlot = pricingSlots.find(
        (slot) =>
          String(slot.starttime).slice(0, 5) === String(match.starttime).slice(0, 5) &&
          String(slot.endtime).slice(0, 5) === String(match.endtime).slice(0, 5)
      );
      if (targetSlot) {
        setSelectedTimeSlot(targetSlot);
      }
    }
  }, [pricingSlots, match, selectedTimeSlot]);

  // Handle Singles Auto-Join logic
  useEffect(() => {
    if (
      match.matchtype === "singles" &&
      selectedTimeSlot &&
      !isDataLoading &&
      !isProcessing
    ) {
      const availablePositions = slots3D.filter(
        (slot) => !occupiedSlots.some((occupied) => occupied.id === slot.id)
      );

      if (availablePositions.length === 1) {
        setSelectedPositions([availablePositions[0]]);
        processJoin([availablePositions[0]]);
      } else if (availablePositions.length === 0) {
        setErrorMsg("Kèo này đã đủ người.");
      }
    }
  }, [match.matchtype, selectedTimeSlot, isDataLoading, occupiedSlots]);

  const processJoin = async (positionsToBook = selectedPositions) => {
    if (positionsToBook.length === 0) {
      setErrorMsg("Vui lòng chọn vị trí.");
      return;
    }
    
    setIsProcessing(true);
    setErrorMsg("");

    try {
      // 1. Create booking
      const result = await handleBookCourt();
      
      if (result && result.booking) {
        // 2. Call join match API
        const joinResult = await apiFetch(`/booking/matches/${match.waitid}/join`, {
          method: "POST",
        });
        
        const contact = joinResult.contact;
        alert(
          `Đã đặt chỗ và tham gia kèo thành công!\nNgười tạo kèo: ${
            contact?.fullname || contact?.FullName || "Chưa rõ"
          } - ${contact?.phonenumber || contact?.PhoneNumber || "Chưa có SĐT"}`
        );
        
        // 3. Redirect to payment
        navigate(`/payment/${result.booking.bookingid}`);
      }
    } catch (err) {
      setErrorMsg(err.message || "Có lỗi xảy ra khi tham gia kèo.");
      setIsProcessing(false);
    }
  };

  const isSingles = match.matchtype === "singles";
  const isLoading = isDataLoading || isProcessing || (!selectedTimeSlot && !errorMsg);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-slate-950">
        <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-white/5 pb-4">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            {isSingles ? (
              <><User className="w-5 h-5 text-primary" /> Đang tham gia kèo Đơn...</>
            ) : (
              <><Users className="w-5 h-5 text-primary" /> Chọn vị trí đánh đôi</>
            )}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/5 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 mb-6">
            {errorMsg}
          </div>
        ) : isLoading && isSingles ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Hệ thống đang tự động xếp vị trí và tạo đơn...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {!isSingles && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Vui lòng chọn 1 vị trí còn trống trên sân:
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {slots3D.map((pos) => {
                    const isOccupied = occupiedSlots.some((o) => o.id === pos.id);
                    const isSelected = selectedPositions.some((s) => s.id === pos.id);

                    return (
                      <button
                        key={pos.id}
                        disabled={isOccupied || isProcessing}
                        onClick={() => setSelectedPositions([pos])}
                        className={`p-3 rounded-xl border text-sm font-bold flex flex-col items-center justify-center gap-2 transition-all ${
                          isOccupied
                            ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed dark:bg-white/5 dark:border-white/10 dark:text-slate-600"
                            : isSelected
                            ? "bg-primary border-primary text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] scale-105"
                            : "bg-white border-slate-200 text-slate-700 hover:border-primary hover:text-primary dark:bg-slate-900 dark:border-white/20 dark:text-slate-300 dark:hover:border-primary"
                        }`}
                      >
                        {isOccupied ? (
                          <span className="text-xs font-semibold bg-slate-200 dark:bg-white/10 px-2 py-0.5 rounded-full text-slate-500 dark:text-slate-400">Đã có người</span>
                        ) : (
                          <span className="text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 rounded-full text-emerald-600 dark:text-emerald-400">Còn trống</span>
                        )}
                        {pos.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {!isSingles && (
              <button
                onClick={() => processJoin()}
                disabled={selectedPositions.length === 0 || isProcessing}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-extrabold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Check className="w-5 h-5" />
                )}
                {isProcessing ? "Đang xử lý..." : "Xác nhận Tham gia"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinMatchModal;
