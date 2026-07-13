import { Check, User } from "lucide-react";

const Court3D = ({
  slots,
  selectedSlot,
  selectedPositions = [],
  selectedTimeSlot,
  onSlotClick,
  occupiedSlots = [],
}) => {
  return (
    <div
      className="lg:col-span-2 bg-[#00272C] rounded-3xl overflow-hidden relative min-h-[500px] flex items-center justify-center shadow-xl"
      style={{ perspective: "1200px" }}
    >
      <div
        className="relative w-[200px] sm:w-[260px] h-[440px] sm:h-[572px] bg-[#13843c] border-[3px] border-white transition-all duration-500"
        style={{
          transform: "rotateX(60deg) rotateZ(-45deg)",
          boxShadow: "-20px 20px 40px rgba(0,0,0,0.6)",
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 80px)",
        }}
      >
        {/* Các vạch kẻ chuẩn trên sân (Lines) */}
        <div className="absolute top-1/2 left-0 w-full h-[3px] bg-white -translate-y-1/2 shadow-sm z-0"></div>
        <div className="absolute top-[35%] left-0 w-full h-0.5 bg-white/90"></div>
        <div className="absolute bottom-[35%] left-0 w-full h-0.5 bg-white/90"></div>
        <div className="absolute top-[5.6%] left-0 w-full h-0.5 bg-white/90"></div>
        <div className="absolute bottom-[5.6%] left-0 w-full h-0.5 bg-white/90"></div>
        <div className="absolute top-0 left-[7.5%] w-0.5 h-full bg-white/90"></div>
        <div className="absolute top-0 right-[7.5%] w-0.5 h-full bg-white/90"></div>
        <div className="absolute top-0 left-1/2 w-0.5 h-[35%] bg-white/90 -translate-x-1/2"></div>
        <div className="absolute bottom-0 left-1/2 w-0.5 h-[35%] bg-white/90 -translate-x-1/2"></div>

        {/* Lưới cầu lông (Net) */}
        <div
          className="absolute top-1/2 left-[-6%] w-[112%] h-16 sm:h-20 origin-bottom flex items-end justify-between px-1 pointer-events-none z-20"
          style={{ transform: "translateY(-100%) rotateX(-90deg)" }}
        >
          {/* Cột lưới trái */}
          <div className="w-2 sm:w-2.5 h-full bg-gradient-to-t from-slate-400 to-slate-200 rounded-t-sm shadow-xl border-r border-slate-400"></div>

          {/* Phần lưới Caro */}
          <div className="flex-1 h-[75%] bg-black/10 border-t-[3px] border-white shadow-sm flex items-start overflow-hidden relative">
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
                backgroundSize: "6px 6px",
              }}
            ></div>
            <div className="w-full h-1 bg-white/60"></div>
          </div>

          {/* Cột lưới phải */}
          <div className="w-2 sm:w-2.5 h-full bg-gradient-to-t from-slate-400 to-slate-200 rounded-t-sm shadow-xl border-l border-slate-400"></div>
        </div>

        {/* Slots */}
        {slots.map((slot) => {
          const occupant = occupiedSlots.find((o) => o.id === slot.id);
          const isOccupied = !!occupant;
          const isSelected =
            selectedPositions.some((p) => p.id === slot.id) ||
            selectedSlot?.id === slot.id;

          return (
            <div
              key={slot.id}
              className="absolute w-12 h-12 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 z-30"
              style={{
                top: slot.top,
                left: slot.left,
                transform: "rotateZ(45deg) rotateX(-60deg) translateZ(30px)",
              }}
            >
              <button
                onClick={() => !isOccupied && onSlotClick(slot)}
                disabled={!selectedTimeSlot || isOccupied}
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-2xl transition-all duration-300 border-2 shadow-2xl ${
                  !selectedTimeSlot
                    ? "bg-slate-400 text-slate-200 border-slate-300 cursor-not-allowed opacity-50"
                    : isOccupied
                      ? "bg-red-500 text-white border-red-600 cursor-not-allowed opacity-90 scale-100 p-0 overflow-hidden"
                      : isSelected
                        ? "bg-[#00272C] text-primary border-primary scale-110 shadow-[0_10px_20px_rgba(16,185,129,0.6)] cursor-pointer hover:-translate-y-2"
                        : "bg-primary text-white border-white cursor-pointer hover:scale-105 hover:bg-[#059669] hover:-translate-y-2 shadow-[0_10px_15px_rgba(0,0,0,0.5)]"
                }`}
                title={
                  isOccupied
                    ? `Đã được đặt bởi: ${occupant.fullName || "Người chơi"}`
                    : slot.label || "Trống"
                }
              >
                {isOccupied ? (
                  occupant.avatarUrl ? (
                    <img
                      src={occupant.avatarUrl}
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6" />
                  )
                ) : isSelected ? (
                  <Check className="w-6 h-6" />
                ) : (
                  "+"
                )}
              </button>
              <div
                className="absolute -bottom-10 w-6 h-2 bg-black/50 blur-[4px] rounded-full transition-all duration-300"
                style={{
                  transform: "rotateX(60deg)",
                  opacity:
                    isSelected || isOccupied ? 0.8 : selectedTimeSlot ? 0.4 : 0,
                }}
              ></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Court3D;
