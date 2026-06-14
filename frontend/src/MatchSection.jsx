import { useState, useEffect } from "react";
import { MapPin, Swords, Users } from "lucide-react";
import { apiFetch } from "./services/api";

const MatchSection = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await apiFetch("/booking/matches");
        setMatches(data.matches || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  return (
    <section className="mt-10 px-5 space-y-5">
      <div className="flex justify-between items-end">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Swords className="text-primary w-6 h-6" /> Giao Lưu Ngay
        </h2>
      </div>
      <div className="space-y-4">
        {loading ? (
          <p className="text-white/50 text-sm">Đang tải danh sách...</p>
        ) : matches.length > 0 ? (
          matches.map((match) => (
            <div
              key={match.waitid}
              className="bg-gradient-to-r from-[#122843] to-[#0d1f35] border border-white/5 p-4 rounded-2xl flex items-center justify-between border-l-4 !border-l-primary shadow-sm hover:shadow-[0_0_15px_rgba(191,240,0,0.1)] transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-lg border-2 border-[#122843] overflow-hidden">
                    {match.avatarurl ? (
                      <img
                        src={match.avatarurl}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      match.fullname.charAt(0)
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-white font-bold text-base">
                    {match.fullname}
                  </p>
                  <p className="text-white/60 text-[11px] mt-0.5 flex items-center gap-1 uppercase tracking-wide">
                    <Users className="w-3 h-3" />{" "}
                    {new Date(match.playdate).toLocaleDateString("vi-VN")} •{" "}
                    {match.starttime.slice(0, 5)}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="text-primary w-3 h-3" />
                    <span className="text-white/50 text-[11px]">
                      {match.venuename}
                    </span>
                  </div>
                </div>
              </div>
              <button className="bg-white/5 hover:bg-primary hover:text-[#0b1c30] border border-white/10 hover:border-primary text-white px-4 py-2 rounded-xl font-bold text-xs active:scale-95 transition-all">
                THAM GIA
              </button>
            </div>
          ))
        ) : (
          <div className="bg-[#122843] border border-white/5 p-6 rounded-2xl text-center">
            <p className="text-white/50 text-sm">
              Hiện chưa có kèo giao lưu nào. Hãy tạo Booking để tìm bạn chơi
              nhé!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
export default MatchSection;
