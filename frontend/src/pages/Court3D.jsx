import { Check } from "lucide-react";

const Court3D = ({ slots, selectedSlot, selectedTimeSlot, onSlotClick }) => {
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

        {/* Slots */}
        {slots.map((slot) => (
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
              onClick={() => onSlotClick(slot)}
              disabled={!selectedTimeSlot}
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-2xl transition-all duration-300 border-2 shadow-2xl ${!selectedTimeSlot ? "bg-slate-400 text-slate-200 border-slate-300 cursor-not-allowed opacity-50" : selectedSlot?.id === slot.id ? "bg-[#0b1c30] text-primary border-primary scale-110 shadow-[0_10px_20px_rgba(191,240,0,0.6)] cursor-pointer hover:-translate-y-2" : "bg-primary text-[#0b1c30] border-white cursor-pointer hover:scale-105 hover:bg-[#a8d800] hover:-translate-y-2 shadow-[0_10px_15px_rgba(0,0,0,0.5)]"}`}
            >
              {selectedSlot?.id === slot.id ? (
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
                  selectedSlot?.id === slot.id
                    ? 0.8
                    : selectedTimeSlot
                      ? 0.4
                      : 0,
              }}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Court3D;
