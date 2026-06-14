import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Users, User, Info, Check, ArrowLeft } from "lucide-react";
import { apiFetch } from "../services/api";
import useAuthStore from "../store/useAuthStore";
import TimeSlotSelector from "../components/booking/TimeSlotSelector.jsx";
import Court3D from "../components/booking/Court3D.jsx";

const CourtBooking = () => {
  const { courtId } = useParams();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Khởi tạo ngày mặc định là hôm nay
  const today = new Date().toISOString().split("T")[0];
  const [playDate, setPlayDate] = useState(today);
  const [pricingSlots, setPricingSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [matchType, setMatchType] = useState("doubles");
  const [selectedSlot, setSelectedSlot] = useState(null);

  const slots =
    matchType === "doubles"
      ? [
          { id: 1, top: "25%", left: "25%", label: "Team A - Trái" },
          { id: 2, top: "25%", left: "75%", label: "Team A - Phải" },
          { id: 3, top: "75%", left: "25%", label: "Team B - Trái" },
          { id: 4, top: "75%", left: "75%", label: "Team B - Phải" },
        ]
      : [
          { id: 1, top: "25%", left: "50%", label: "Người chơi 1 (Team A)" },
          { id: 2, top: "75%", left: "50%", label: "Người chơi 2 (Team B)" },
        ];

  // Tự động tải lịch sân và các khung giờ khi đổi ngày
  useEffect(() => {
    const fetchData = async () => {
      setSelectedTimeSlot(null);
      setSelectedSlot(null);

      if (!playDate) return;
      try {
        const [scheduleData, pricingData] = await Promise.all([
          apiFetch(
            `/booking/court-schedule?courtId=${courtId}&playDate=${playDate}`,
          ),
          apiFetch(`/pricing/court/${courtId}`),
        ]);
        setBookedSlots(scheduleData.bookedSlots || []);

        // Lọc pricing theo DayType (Cuối tuần / Ngày thường)
        const dateObj = new Date(playDate);
        const dayOfWeek = dateObj.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const currentDayType = isWeekend ? "Weekend" : "Weekday";

        const validPricing = (pricingData.pricingList || [])
          .filter((p) => p.daytype === "All" || p.daytype === currentDayType)
          .sort((a, b) => a.starttime.localeCompare(b.starttime));

        setPricingSlots(validPricing);
      } catch (err) {
        console.error("Không thể tải dữ liệu sân", err);
        setError("Có lỗi khi tải danh sách khung giờ.");
      }
    };
    fetchData();
  }, [courtId, playDate]);

  const isSlotBooked = (pSlot) => {
    return bookedSlots.some((bSlot) => {
      return (
        (pSlot.starttime >= bSlot.starttime &&
          pSlot.starttime < bSlot.endtime) ||
        (pSlot.endtime > bSlot.starttime && pSlot.endtime <= bSlot.endtime) ||
        (pSlot.starttime <= bSlot.starttime && pSlot.endtime >= bSlot.endtime)
      );
    });
  };

  const handleBookCourt = async () => {
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để đặt sân!");
      navigate("/login");
      return;
    }
    if (!selectedSlot) {
      setError("Vui lòng chọn một vị trí trên sân 3D!");
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/booking", {
        method: "POST",
        body: JSON.stringify({
          bookingType: "Online",
          note: `Chế độ: ${matchType === "doubles" ? "Đánh đôi" : "Đánh đơn"} - Vị trí: ${selectedSlot.label}`,
          slots: [
            {
              courtId: parseInt(courtId),
              playDate,
              startTime: selectedTimeSlot.starttime,
              endTime: selectedTimeSlot.endtime,
              appliedPrice: selectedTimeSlot.price,
            },
          ],
        }),
      });
      alert("Đặt sân thành công! Bạn có thể xem lại trong hồ sơ.");
      navigate("/profile");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-5 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Quy trình Đặt Sân
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Sân #{courtId} - Vui lòng chọn khung giờ và chọn vị trí
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Nhập liệu */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6 h-fit">
          {/* Step 1 */}
          <TimeSlotSelector
            playDate={playDate}
            onDateChange={setPlayDate}
            pricingSlots={pricingSlots}
            selectedTimeSlot={selectedTimeSlot}
            onTimeSlotChange={setSelectedTimeSlot}
            isSlotBooked={isSlotBooked}
          />

          {/* Step 2 */}
          {selectedTimeSlot && (
            <div className="animate-fade-in pt-4 border-t border-slate-100">
              <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                <span className="bg-primary text-[#0b1c30] w-6 h-6 rounded-full flex items-center justify-center text-xs">
                  2
                </span>{" "}
                Xí chỗ trên sân 3D
              </h3>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => {
                    setMatchType("singles");
                    setSelectedSlot(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${matchType === "singles" ? "bg-[#0b1c30] text-primary" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                >
                  <User className="w-4 h-4" /> Đánh Đơn
                </button>
                <button
                  onClick={() => {
                    setMatchType("doubles");
                    setSelectedSlot(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${matchType === "doubles" ? "bg-[#0b1c30] text-primary" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                >
                  <Users className="w-4 h-4" /> Đánh Đôi
                </button>
              </div>

              {selectedSlot ? (
                <div className="bg-primary/10 p-4 rounded-xl border border-primary/30">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                    Đã chọn
                  </p>
                  <p className="text-lg font-extrabold text-slate-900">
                    {selectedSlot.label}
                  </p>
                  <p className="text-sm font-semibold text-primary mt-2">
                    Tổng tiền: {Number(selectedTimeSlot.price).toLocaleString()}
                    đ
                  </p>
                </div>
              ) : (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800 text-sm">
                  <Info className="w-4 h-4 inline-block mr-1 -mt-0.5" /> Hãy
                  click vào dấu (+) trên mô hình sân 3D bên phải.
                </div>
              )}

              <button
                onClick={handleBookCourt}
                disabled={loading || !selectedSlot}
                className={`w-full mt-6 py-3 rounded-xl font-bold text-base transition-colors shadow-lg flex items-center justify-center gap-2 ${!selectedSlot ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" : "bg-primary text-[#0b1c30] hover:bg-[#a8d800] shadow-[0_0_15px_rgba(191,240,0,0.3)]"}`}
              >
                {loading ? (
                  "Đang xử lý..."
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
          slots={slots}
          selectedSlot={selectedSlot}
          selectedTimeSlot={selectedTimeSlot}
          onSlotClick={setSelectedSlot}
        />
      </div>
    </div>
  );
};

export default CourtBooking;
