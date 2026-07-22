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
      <h3 className="flex items-center gap-2 font-bold text-slate-950 dark:text-white mb-3">
        <span className="bg-primary text-on-primary w-6 h-6 rounded-full flex items-center justify-center text-xs font-black">
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
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-950 focus:border-primary focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white dark:[&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70"
          />
        </div>

        <div>
          <h4 className="mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">
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
                    className={`flex flex-col items-center justify-center w-24 min-w-24 min-h-[74px] rounded-xl border px-2 py-2 text-sm transition-all ${
                      isBooked
                        ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 opacity-70 dark:border-white/5 dark:bg-white/5 dark:text-slate-500 dark:opacity-40"
                        : isSelected
                          ? "scale-[1.02] border-primary bg-primary text-on-primary font-bold shadow-[0_0_15px_rgba(16,185,129,0.45)]"
                          : "border-slate-200 bg-white text-slate-700 hover:border-primary hover:bg-emerald-50 hover:text-emerald-800 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-primary"
                    }`}
                  >
                    <span className="font-bold">
                      {pSlot.starttime.slice(0, 5)}
                    </span>
                    <span className="text-[10px] font-semibold opacity-80">
                      đến {pSlot.endtime.slice(0, 5)}
                    </span>
                    <span
                      className={`mt-1 text-xs font-semibold ${
                        isBooked
                          ? "text-red-400"
                          : isSelected
                            ? "text-on-primary/80"
                            : "text-slate-500 dark:text-slate-400"
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
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500 dark:border-white/5 dark:bg-white/5 dark:text-slate-400">
              Không có giờ bắt đầu phù hợp với thời lượng đã chọn.
            </div>
          )}
        </div>

        {durationOptions.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">
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
                    className={`flex items-center justify-center gap-2 min-w-24 min-h-10 rounded-xl border px-2 text-xs font-bold transition-all ${
                      isSelected
                        ? "border-primary bg-primary text-on-primary shadow-[0_0_15px_rgba(16,185,129,0.35)]"
                        : "border-slate-200 bg-white text-slate-700 hover:border-primary hover:bg-emerald-50 hover:text-emerald-800 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-primary"
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
