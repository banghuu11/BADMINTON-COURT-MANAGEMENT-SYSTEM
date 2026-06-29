import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { Search, MapPin, Star, Filter, ShieldCheck } from "lucide-react";
import { apiFetch } from "../../services/api";
import useAuthStore from "../../store/useAuthStore";

// Mảng màu sắc gradient tối thượng và nhãn đi kèm
const stylePresets = [
  {
    color: "from-emerald-950/80 to-slate-900",
    accent: "text-primary border-primary/20 bg-primary/10",
  },
  {
    color: "from-[#00272c] to-slate-900",
    accent: "text-primary border-primary/20 bg-primary/10",
  },
  {
    color: "from-teal-950/80 to-slate-900",
    accent: "text-primary border-primary/20 bg-primary/10",
  },
  {
    color: "from-cyan-950/80 to-slate-900",
    accent: "text-primary border-primary/20 bg-primary/10",
  },
];

const Courts = () => {
  const user = useAuthStore((state) => state.user);
  if (user && (user.roleid === 1 || user.roleId === 1)) {
    return <Navigate to="/" replace />;
  }

  const [searchQuery, setSearchQuery] = useState("");
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoading(true);
        const data = await apiFetch("/venues/all");
        setVenues(data.venues || []);
      } catch (err) {
        setError(err.message || "Không thể tải danh sách cơ sở sân.");
      } finally {
        setLoading(false);
      }
    };
    fetchVenues();
  }, []);

  // Lọc danh sách sân theo từ khóa tìm kiếm
  const filteredVenues = venues.filter(
    (venue) =>
      (venue.venuename || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (venue.address || "").toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="max-w-7xl mx-auto px-5 py-8 animate-fade-in text-white">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Building2Icon className="w-8 h-8 text-primary" /> Khám phá Cơ sở sân
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Tìm kiếm và đặt sân cầu lông phù hợp nhất với bạn
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative group flex-1 md:w-72">
            <input
              type="text"
              placeholder="Tên sân, khu vực..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-all shadow-sm"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
          <button className="bg-white/5 border border-white/10 p-2.5 rounded-xl text-slate-300 hover:text-primary hover:border-primary/50 transition-colors shadow-sm">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-20 text-slate-400 font-medium flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm">Đang tải danh sách sân...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-center font-medium border border-red-500/20">
          {error}
        </div>
      )}

      {!loading && !error && filteredVenues.length === 0 && (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 text-slate-400">
          Không tìm thấy cơ sở sân nào phù hợp.
        </div>
      )}

      {/* Grid Layout for Courts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredVenues.map((venue, index) => {
          const style = stylePresets[index % stylePresets.length];
          return (
            <Link
              to={`/venue/${venue.venueid}`}
              key={venue.venueid}
              className="block group cursor-pointer bg-background/40 backdrop-blur-xl rounded-3xl p-3.5 border border-white/10 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
            >
              {/* Image Placeholder */}
              <div
                className={`relative h-44 rounded-2xl overflow-hidden mb-4 bg-gradient-to-br ${style.color} flex items-center justify-center`}
              >
                {venue.mainimage ? (
                  <img
                    src={venue.mainimage}
                    alt={venue.venuename}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent"></div>
                    <ShieldCheck
                      className="w-16 h-16 text-white/20"
                      strokeWidth={1}
                    />
                  </>
                )}

                <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full text-white font-bold text-xs flex items-center gap-1 shadow-sm">
                  {venue.rating || "5.0"}{" "}
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                </div>
                <div
                  className={`absolute bottom-3 left-3 backdrop-blur-md border px-2.5 py-1 rounded-lg uppercase tracking-wider font-extrabold text-[9px] ${style.accent}`}
                >
                  Sân Tiêu Chuẩn
                </div>
              </div>

              {/* Info */}
              <div className="space-y-1 px-1">
                <h3 className="text-white font-black text-base truncate group-hover:text-primary transition-colors">
                  {venue.venuename}
                </h3>
                <p className="text-slate-400 text-xs flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-primary/80" /> {venue.address}
                </p>
              </div>

              {/* Price & Action */}
              <div className="flex justify-between items-center px-1 mt-4 pt-4 border-t border-white/5">
                <span className="text-white font-black text-base">
                  Từ 100k
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider ml-1">
                    /giờ
                  </span>
                </span>
                <button className="bg-white/5 hover:bg-primary text-white hover:text-[#00272C] border border-white/10 hover:border-transparent font-bold px-3.5 py-2 rounded-xl text-xs transition-all duration-300">
                  Chi tiết
                </button>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

// Khai báo icon nội bộ để giảm thiểu import dư thừa
const Building2Icon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" />
    <path d="M6 12H4a2 2 0 0 0-2 2v8" />
    <path d="M18 16h2a2 2 0 0 1 2 2v4" />
    <path d="M10 8h4" />
    <path d="M10 12h4" />
    <path d="M10 16h4" />
  </svg>
);

export default Courts;
