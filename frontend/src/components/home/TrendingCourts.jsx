import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, MapPin, Activity, ShieldCheck } from "lucide-react";
import { apiFetch } from "../../services/api";

const stylePresets = [
  {
    color: "from-slate-800 to-slate-900",
    accent: "text-primary border-primary/30 bg-primary/20",
  },
  {
    color: "from-blue-900 to-slate-900",
    accent: "text-blue-500 border-blue-500/30 bg-blue-500/10",
  },
  {
    color: "from-indigo-900 to-slate-900",
    accent: "text-indigo-500 border-indigo-500/30 bg-indigo-500/10",
  },
];

const TrendingCourts = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const data = await apiFetch("/venues/all");
        setVenues((data.venues || []).slice(0, 5)); // Lấy 5 sân đầu tiên
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  return (
    <section className="mt-8 space-y-6">
      <div className="px-5 flex justify-between items-end">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Activity className="text-primary w-6 h-6" /> Sân Đang Hot
        </h2>
        <Link
          to="/courts"
          className="text-white/50 font-medium text-sm cursor-pointer hover:text-primary transition-colors"
        >
          Xem tất cả
        </Link>
      </div>
      <div className="flex overflow-x-auto gap-5 px-5 no-scrollbar pb-4 snap-x">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[280px] snap-center bg-[#122843] rounded-2xl p-3 border border-white/5">
              <div className="skeleton h-44 rounded-xl mb-4"></div>
              <div className="space-y-2 px-1">
                <div className="skeleton h-5 w-3/4 rounded"></div>
                <div className="skeleton h-3 w-1/2 rounded"></div>
              </div>
              <div className="flex justify-between items-center px-1 mt-4 pt-4 border-t border-white/5">
                <div className="skeleton h-5 w-1/3 rounded"></div>
                <div className="skeleton h-8 w-20 rounded-lg"></div>
              </div>
            </div>
          ))
        ) : venues.length > 0 ? (
          venues.map((venue, index) => {
            const style = stylePresets[index % stylePresets.length];
            return (
              <Link
                to={`/venue/${venue.venueid}`}
                key={venue.venueid}
                className="flex-shrink-0 w-[280px] group cursor-pointer snap-center bg-[#122843] rounded-2xl p-3 border border-white/5 hover:border-white/10 transition-all block"
              >
                <div
                  className={`relative h-44 rounded-xl overflow-hidden mb-4 bg-gradient-to-br ${style.color} flex items-center justify-center`}
                >
                  <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary via-transparent to-transparent"></div>
                  <ShieldCheck
                    className="w-16 h-16 text-white/10"
                    strokeWidth={1}
                  />
                  <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full text-white font-bold text-xs flex items-center gap-1 shadow-lg">
                    {venue.rating || "5.0"}{" "}
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div
                    className={`absolute bottom-3 left-3 bg-primary/20 backdrop-blur-md border border-primary/30 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${style.accent}`}
                  >
                    Sân Tiêu Chuẩn
                  </div>
                </div>
                <div className="space-y-1 px-1">
                  <h3 className="text-white font-bold text-lg truncate">
                    {venue.venuename}
                  </h3>
                  <p className="text-white/50 text-xs flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 flex-shrink-0" /> {venue.address}
                  </p>
                </div>
                <div className="flex justify-between items-center px-1 mt-4 pt-4 border-t border-white/5">
                  <span className="text-primary font-bold text-lg">
                    Từ 100k
                    <span className="text-xs text-white/40 font-normal">
                      /giờ
                    </span>
                  </span>
                  <button className="bg-white/5 hover:bg-primary hover:text-[#00272C] border border-white/10 hover:border-primary text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                    Đặt Ngay
                  </button>
                </div>
              </Link>
            );
          })
        ) : (
          <p className="text-white/50 text-sm">
            Chưa có cơ sở sân nào hoạt động.
          </p>
        )}
      </div>
    </section>
  );
};
export default TrendingCourts;
