import { Check, User, Phone, X } from "lucide-react";
import { useState } from "react";

const Court3D = ({
  slots,
  selectedSlot,
  selectedPositions = [],
  selectedTimeSlot,
  onSlotClick,
  occupiedSlots = [],
  isFullCourt,
}) => {
  const [showInfo, setShowInfo] = useState(null);

  return (
    <div
      className="lg:col-span-2 bg-[#0b1c30] rounded-3xl overflow-hidden relative min-h-[500px] flex items-center justify-center shadow-xl"
      style={{ perspective: "1200px" }}
    >
      <div
        className="relative w-48 sm:w-64 h-[350px] sm:h-[450px] bg-[#16a34a] border-4 border-white transition-all duration-500"
        style={{
          transform: "rotateX(60deg) rotateZ(-45deg)",
          boxShadow: "-20px 20px 40px rgba(0,0,0,0.6)",
        }}
      >
        {/* Lines */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-white -translate-y-1/2"></div>
        <div className="absolute top-[35%] left-0 w-full h-0.5 bg-white/70"></div>
        <div className="absolute bottom-[35%] left-0 w-full h-0.5 bg-white/70"></div>
        <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white/70 -translate-x-1/2"></div>
        <div className="absolute top-0 left-3 w-0.5 h-full bg-white/50"></div>
        <div className="absolute top-0 right-3 w-0.5 h-full bg-white/50"></div>
        <div className="absolute top-3 left-0 w-full h-0.5 bg-white/50"></div>
        <div className="absolute bottom-3 left-0 w-full h-0.5 bg-white/50"></div>

        {/* Net */}
        <div
          className="absolute top-1/2 left-[-10%] w-[120%] h-12 bg-white/20 border-t-4 border-white origin-bottom flex items-center justify-center"
          style={{ transform: "translateY(-100%) rotateX(-90deg)" }}
        >
          <div
            className="w-full h-full opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
              backgroundSize: "4px 4px",
            }}
          ></div>
        </div>

        {/* Full Court Overlay */}
        {isFullCourt && selectedTimeSlot && (
          <div
            className="absolute inset-1 bg-primary/80 z-20 flex items-center justify-center p-4 rounded-lg border-2 border-primary shadow-[0_0_20px_rgba(191,240,0,0.5)]"
            title="Bạn đã chọn bao trọn sân"
          >
            <span className="font-black text-3xl text-[#0b1c30] text-center tracking-widest uppercase">
              Bao Sân
            </span>
          </div>
        )}

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
              className="absolute w-12 h-12 flex items-center justify-center -translate-x-1/2 -translate-y-1/2 z-10"
              style={{
                top: slot.top,
                left: slot.left,
                transform: "rotateZ(45deg) rotateX(-60deg) translateZ(30px)",
              }}
            >
              <button
                onClick={() => {
                  if (isOccupied) {
                    setShowInfo(occupant);
                  } else {
                    onSlotClick(slot);
                  }
                }}
                disabled={!selectedTimeSlot}
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-2xl transition-all duration-300 border-2 shadow-2xl ${
                  !selectedTimeSlot
                    ? "bg-slate-400 text-slate-200 border-slate-300 cursor-not-allowed opacity-50"
                    : isOccupied
                      ? "bg-red-500 text-white border-red-600 opacity-90 scale-100 p-0 overflow-hidden cursor-pointer hover:scale-110 shadow-red-500/40"
                      : isSelected
                        ? "bg-[#0b1c30] text-primary border-primary scale-110 shadow-[0_10px_20px_rgba(191,240,0,0.6)] cursor-pointer hover:-translate-y-2"
                        : "bg-primary text-[#0b1c30] border-white cursor-pointer hover:scale-105 hover:bg-[#a8d800] hover:-translate-y-2 shadow-[0_10px_15px_rgba(0,0,0,0.5)]"
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

      {/* User Info Popup */}
      {showInfo && (
        <div className="absolute top-4 right-4 bg-white p-4 rounded-xl shadow-2xl border border-slate-200 z-50 animate-fade-in flex flex-col gap-3 min-w-[220px]">
          <button
            onClick={() => setShowInfo(null)}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-1 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3 pr-6">
            {showInfo.avatarUrl ? (
              <img
                src={showInfo.avatarUrl}
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-slate-400" />
              </div>
            )}
            <div>
              <p className="font-bold text-slate-900 text-sm leading-tight">
                {showInfo.fullName || "Người chơi"}
              </p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                Đã đặt vị trí này
              </p>
            </div>
          </div>
          {showInfo.phoneNumber ? (
            <a
              href={`tel:${showInfo.phoneNumber}`}
              className="flex items-center justify-center gap-2 bg-primary/10 text-primary py-2 rounded-lg text-sm font-bold hover:bg-primary hover:text-[#0b1c30] transition-colors border border-primary/20"
            >
              <Phone className="w-4 h-4" /> {showInfo.phoneNumber}
            </a>
          ) : (
            <p className="text-xs text-center text-slate-400 italic bg-slate-50 py-2 rounded-lg border border-slate-100">
              Không có liên hệ
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Court3D;
