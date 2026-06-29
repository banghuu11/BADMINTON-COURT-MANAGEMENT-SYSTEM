import { Calendar } from "lucide-react";

const TimeSlotSelector = ({
  playDate,
  onDateChange,
  pricingSlots,
  selectedTimeSlot,
  onTimeSlotChange,
  isSlotBooked,
  selectedDuration = 60,
  onDurationChange,
  durationOptions = [],
}) => {
  return (
    <div>
      <h3 className="font-bold text-white mb-3 flex items-center gap-2">
        <span className="bg-primary text-[#00272C] w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">
          1
        </span>{" "}
        Chọn ngày & giờ chơi
      </h3>
      <div className="space-y-3">
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/70" />
          <input
            type="date"
            value={playDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-primary text-white [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-80"
          />
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-300 mb-2">
            Chọn giờ bắt đầu:
          </h4>
          {pricingSlots.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {pricingSlots.map((pSlot) => {
                const bookedStatus = isSlotBooked(pSlot);
                const isBooked = !!bookedStatus;
                const isSelected =
                  selectedTimeSlot?.pricingid === pSlot.pricingid;

                return (
                  <button
                    key={pSlot.pricingid}
                    disabled={isBooked}
                    onClick={() => onTimeSlotChange(pSlot)}
                    className={`w-24 min-w-24 min-h-[74px] rounded-xl border px-2 py-2 text-sm flex flex-col items-center justify-center transition-all ${
                      isBooked
                        ? "bg-white/5 border-white/5 text-slate-500 cursor-not-allowed opacity-40"
                        : isSelected
                          ? "bg-primary border-primary text-[#00272C] shadow-[0_0_15px_rgba(225,255,81,0.45)] font-bold scale-[1.02]"
                          : "bg-white/5 border-white/10 text-slate-300 hover:border-primary hover:text-primary hover:bg-white/10"
                    }`}
                  >
                    <span className="font-bold">
                      {pSlot.starttime.slice(0, 5)}
                    </span>
                    <span className="text-[10px] font-semibold opacity-80">
                      đến {pSlot.endtime.slice(0, 5)}
                    </span>
                    <span
                      className={`text-xs mt-0.5 ${
                        isBooked
                          ? "font-bold text-red-400"
                          : isSelected
                            ? "text-[#00272C]/80"
                            : "text-slate-400"
                      }`}
                    >
                      {isBooked
                        ? bookedStatus
                        : `${Number(pSlot.price).toLocaleString()}đ/h`}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="bg-white/5 text-slate-400 p-4 rounded-xl text-sm text-center border border-white/5">
              Không có giờ bắt đầu phù hợp với thời lượng đã chọn.
            </div>
          )}
        </div>

        {durationOptions.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-slate-300 mb-2">
              Thời lượng chơi:
            </h4>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {durationOptions.map((option) => {
                const isSelected = selectedDuration === option.minutes;

                return (
                  <button
                    key={option.minutes}
                    type="button"
                    onClick={() => onDurationChange?.(option.minutes)}
                    className={`min-w-24 min-h-10 rounded-xl border px-2 text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-primary border-primary text-[#00272C] shadow-[0_0_15px_rgba(225,255,81,0.35)]"
                        : "bg-white/5 border-white/10 text-slate-300 hover:border-primary hover:text-primary hover:bg-white/10"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeSlotSelector;
