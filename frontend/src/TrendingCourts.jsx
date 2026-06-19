import { Link } from "react-router-dom";
import { Star, MapPin, Activity, ShieldCheck } from "lucide-react";
import { useFetch } from "./hooks/useFetch";

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
  const { data, loading } = useFetch("/venues/all");
  const venues = (data?.venues || []).slice(0, 5); // Lấy 5 sân đầu tiên

  return (
    <section className="mt-8 space-y-6">
      <div className="px-5 flex justify-between items-end">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Activity className="text-[#0b1c30] bg-primary rounded-full p-1 w-7 h-7" />{" "}
          Sân Đang Hot
        </h2>
        <Link
          to="/courts"
          className="text-slate-400 font-medium text-sm cursor-pointer hover:text-primary transition-colors"
        >
          Xem tất cả
        </Link>
      </div>
      <div className="flex overflow-x-auto gap-5 px-5 no-scrollbar pb-4 snap-x">
        {loading ? (
          <p className="text-slate-400 text-sm">Đang tải danh sách sân...</p>
        ) : venues.length > 0 ? (
          venues.map((venue, index) => {
            const style = stylePresets[index % stylePresets.length];
            return (
              <Link
                to={`/venue/${venue.venueid}`}
                key={venue.venueid}
                className="flex-shrink-0 w-[280px] group cursor-pointer snap-center bg-white rounded-2xl p-3 border border-slate-200 hover:border-primary/50 shadow-sm hover:shadow-md transition-all block"
              >
                <div
                  className={`relative h-44 rounded-xl overflow-hidden mb-4 bg-gradient-to-br ${style.color} flex items-center justify-center`}
                >
                  <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent"></div>
                  <ShieldCheck
                    className="w-16 h-16 text-white/10"
                    strokeWidth={1}
                  />
                  <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full text-white font-bold text-xs flex items-center gap-1 shadow-lg">
                    {venue.rating || "5.0"}{" "}
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div
                    className={`absolute bottom-3 left-3 backdrop-blur-md border text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${style.accent}`}
                  >
                    Sân Tiêu Chuẩn
                  </div>
                </div>
                <div className="space-y-1 px-1">
                  <h3 className="text-slate-900 font-bold text-lg truncate group-hover:text-primary transition-colors">
                    {venue.venuename}
                  </h3>
                  <p className="text-slate-500 text-xs flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 flex-shrink-0" /> {venue.address}
                  </p>
                </div>
                <div className="flex justify-between items-center px-1 mt-4 pt-4 border-t border-slate-100">
                  <span className="text-slate-900 font-extrabold text-lg">
                    Từ 100k
                    <span className="text-xs text-slate-400 font-normal">
                      /giờ
                    </span>
                  </span>
                  <button className="bg-slate-50 hover:bg-[#0b1c30] text-slate-700 hover:text-primary border border-slate-200 hover:border-[#0b1c30] text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                    Đặt Ngay
                  </button>
                </div>
              </Link>
            );
          })
        ) : (
          <p className="text-slate-400 text-sm">
            Chưa có cơ sở sân nào hoạt động.
          </p>
        )}
      </div>
    </section>
  );
};
export default TrendingCourts;
