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
      className="lg:col-span-2 bg-[#001f23]/60 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden relative min-h-[500px] flex items-center justify-center shadow-2xl p-6"
      style={{ perspective: "1500px" }}
    >
      {/* Background Court Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none"></div>

      <div
        className="relative w-56 sm:w-72 h-[380px] sm:h-[480px] bg-[#0b3d36] border-4 border-primary/80 transition-all duration-700 rounded-sm"
        style={{
          transform: "rotateX(55deg) rotateZ(-40deg)",
          boxShadow: "-25px 25px 50px rgba(0,0,0,0.7), 0 0 30px rgba(225,255,81,0.15)",
        }}
      >
        {/* Court Lines - Neon White/Green */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-primary/70 -translate-y-1/2"></div>
        <div className="absolute top-[35%] left-0 w-full h-0.5 bg-primary/50"></div>
        <div className="absolute bottom-[35%] left-0 w-full h-0.5 bg-primary/50"></div>
        <div className="absolute top-0 left-1/2 w-0.5 h-full bg-primary/50 -translate-x-1/2"></div>
        <div className="absolute top-0 left-3 w-0.5 h-full bg-primary/30"></div>
        <div className="absolute top-0 right-3 w-0.5 h-full bg-primary/30"></div>
        <div className="absolute top-3 left-0 w-full h-0.5 bg-primary/30"></div>
        <div className="absolute bottom-3 left-0 w-full h-0.5 bg-primary/30"></div>

        {/* 3D Net Posts */}
        <div
          className="absolute top-1/2 w-1.5 h-16 bg-slate-300 border border-slate-500 origin-bottom"
          style={{
            transform: "translateY(-100%) rotateX(-90deg)",
            left: "-6px",
            boxShadow: "-2px 2px 5px rgba(0,0,0,0.5)",
          }}
        ></div>
        <div
          className="absolute top-1/2 w-1.5 h-16 bg-slate-300 border border-slate-500 origin-bottom"
          style={{
            transform: "translateY(-100%) rotateX(-90deg)",
            right: "-6px",
            boxShadow: "-2px 2px 5px rgba(0,0,0,0.5)",
          }}
        ></div>

        {/* Net Mesh */}
        <div
          className="absolute top-1/2 left-[-1.5%] w-[103%] h-12 bg-white/10 border-t-2 border-b-2 border-white/80 origin-bottom flex items-center justify-center"
          style={{ transform: "translateY(-100%) rotateX(-90deg)" }}
        >
          <div
            className="w-full h-full opacity-40"
            style={{
              backgroundImage:
                "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
              backgroundSize: "3px 3px",
            }}
          ></div>
        </div>

        {/* Full Court Overlay */}
        {isFullCourt && selectedTimeSlot && (
          <div
            className="absolute inset-1 bg-primary/25 backdrop-blur-[2px] z-20 flex items-center justify-center p-4 rounded-sm border-2 border-primary shadow-[0_0_30px_rgba(225,255,81,0.35)] animate-pulse"
            title="Bạn đã chọn bao trọn sân"
          >
            <span className="font-black text-3xl text-primary text-center tracking-widest uppercase [text-shadow:0_0_10px_rgba(225,255,81,0.6)]">
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
                transform: "rotateZ(40deg) rotateX(-55deg) translateZ(35px)",
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
                className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-2xl transition-all duration-300 border-2 shadow-[0_10px_20px_rgba(0,0,0,0.5)] ${
                  !selectedTimeSlot
                    ? "bg-slate-700 text-slate-500 border-slate-800 cursor-not-allowed opacity-40 shadow-none"
                    : isOccupied
                      ? "bg-red-500/90 text-white border-red-400 hover:bg-red-600 hover:scale-110 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                      : isSelected
                        ? "bg-[#00272C] text-primary border-primary scale-115 shadow-[0_0_20px_rgba(225,255,81,0.8)] cursor-pointer"
                        : "bg-primary text-[#00272C] border-white hover:scale-110 hover:bg-[#C6D632] cursor-pointer shadow-[0_0_10px_rgba(225,255,81,0.3)]"
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
                    <User className="w-5 h-5" />
                  )
                ) : isSelected ? (
                  <Check className="w-5 h-5 stroke-[3px]" />
                ) : (
                  "+"
                )}
              </button>
              {/* Fake shadow on the ground */}
              <div
                className="absolute -bottom-8 w-8 h-2 bg-black/60 blur-[3px] rounded-full transition-all duration-300"
                style={{
                  transform: "rotateX(55deg)",
                  opacity:
                    isSelected || isOccupied ? 0.9 : selectedTimeSlot ? 0.5 : 0,
                }}
              ></div>
            </div>
          );
        })}
      </div>

      {/* Occupier User Info Popup (Glassmorphic Dark Mode) */}
      {showInfo && (
        <div className="absolute top-4 right-4 bg-[#00272C]/90 backdrop-blur-xl p-4 rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.5)] border border-white/10 z-50 animate-fade-in flex flex-col gap-3 min-w-[240px] text-white">
          <button
            onClick={() => setShowInfo(null)}
            className="absolute top-2 right-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/15 p-1 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3 pr-6 mt-1">
            {showInfo.avatarUrl ? (
              <img
                src={showInfo.avatarUrl}
                alt="Avatar"
                className="w-10 h-10 rounded-full object-cover border border-white/10"
              />
            ) : (
              <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                <User className="w-5 h-5 text-slate-400" />
              </div>
            )}
            <div>
              <p className="font-bold text-white text-sm leading-tight">
                {showInfo.fullName || "Người chơi"}
              </p>
              {showInfo.skillLevel && (
                <div className="mt-1">
                  <span className="inline-block text-[9px] bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
                    Trình độ: {showInfo.skillLevel}
                  </span>
                </div>
              )}
              <p className="text-[10px] text-slate-400 font-medium mt-1">
                Đã đặt vị trí này
              </p>
            </div>
          </div>
          {showInfo.phoneNumber ? (
            <a
              href={`tel:${showInfo.phoneNumber}`}
              className="flex items-center justify-center gap-2 bg-primary/10 text-primary py-2 rounded-xl text-sm font-bold hover:bg-primary hover:text-[#00272C] transition-colors border border-primary/20"
            >
              <Phone className="w-4 h-4" /> {showInfo.phoneNumber}
            </a>
          ) : (
            <p className="text-xs text-center text-slate-400 italic bg-white/5 py-2 rounded-xl border border-white/5">
              Không có liên hệ
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Court3D;

