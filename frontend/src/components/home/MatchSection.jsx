import { useEffect } from "react";
import { Users, MapPin, Calendar, Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMatches } from "../../hooks/useMatches";

const MatchSection = () => {
  const { matches, loading, fetchMatches, joinMatch } = useMatches();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleJoinMatch = async (waitId) => {
    try {
      const res = await joinMatch(waitId);
      alert(
        `${res.message}\nThông tin người tạo phòng:\n- Tên: ${res.contact.fullname}\n- SĐT: ${res.contact.phonenumber}`,
      );
    } catch (err) {
      if (err.message === "AUTH_REQUIRED") {
        alert("Vui lòng đăng nhập để tham gia giao lưu!");
        navigate("/login");
      } else {
        alert(err.message);
      }
    }
  };

  if (loading)
    return (
      <div className="py-16 text-center text-slate-500">
        Đang tải danh sách giao lưu...
      </div>
    );
  if (matches.length === 0) return null; // Ẩn section nếu không có trận nào

  return (
    <section className="py-16 bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-5">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Giao Lưu Ngay
            </h2>
            <p className="text-slate-400 mt-2 text-sm md:text-base">
              Tìm kiếm đồng đội và đối thủ phù hợp với trình độ của bạn
            </p>
          </div>
          <button
            className="text-primary font-bold hover:underline hidden sm:flex items-center gap-1"
            onClick={() => navigate("/matches")}
          >
            Xem tất cả <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <div
              key={match.waitid}
              className="bg-background rounded-3xl p-6 border border-primary/10 shadow-lg hover:shadow-primary/20 hover:border-primary/20 transition-all"
            >
              <div className="flex items-center gap-4 mb-5 border-b border-white/10 pb-5">
                <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden shrink-0">
                  {match.avatarurl ? (
                    <img
                      src={match.avatarurl}
                      alt={match.fullname}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary font-bold text-lg">
                      {match.fullname.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-white">{match.fullname}</h3>
                  <p className="text-xs text-slate-400">Đang tìm đồng đội</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2 text-sm text-slate-300">
                  <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span className="font-medium">
                    {match.venuename} - {match.courtname}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-medium">
                    {new Date(match.playdate).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-medium">
                    {match.starttime.slice(0, 5)} - {match.endtime.slice(0, 5)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleJoinMatch(match.waitid)}
                className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                <Users className="w-5 h-5" /> Tham gia ngay
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MatchSection;
