import { Calendar } from "lucide-react";

const TimeSlotSelector = ({
  playDate,
  onDateChange,
  pricingSlots,
  selectedTimeSlot,
  onTimeSlotChange,
  isSlotBooked,
}) => {
  return (
    <div>
      <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
        <span className="bg-primary text-[#00272C] w-6 h-6 rounded-full flex items-center justify-center text-xs">
          1
        </span>{" "}
        Chọn ngày & giờ chơi
      </h3>
      <div className="space-y-3">
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="date"
            value={playDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900"
          />
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-900 mb-2 mt-4">
            Các khung giờ có sẵn:
          </h4>
          {pricingSlots.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
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
                    className={`p-2 rounded-xl border text-sm flex flex-col items-center transition-all ${isBooked ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60" : isSelected ? "bg-primary border-primary text-[#00272C] shadow-md" : "bg-white border-slate-200 text-slate-700 hover:border-primary hover:text-primary"}`}
                  >
                    <span className="font-bold">
                      {pSlot.starttime.slice(0, 5)} -{" "}
                      {pSlot.endtime.slice(0, 5)}
                    </span>
                    <span
                      className={`text-xs ${isBooked ? "font-bold text-red-500" : isSelected ? "text-[#00272C]/80" : "text-slate-500"}`}
                    >
                      {isBooked
                        ? bookedStatus
                        : `${Number(pSlot.price).toLocaleString()}đ`}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="bg-slate-50 text-slate-500 p-4 rounded-xl text-sm text-center border border-slate-200">
              Chưa có khung giờ nào được thiết lập cho ngày này.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeSlotSelector;
