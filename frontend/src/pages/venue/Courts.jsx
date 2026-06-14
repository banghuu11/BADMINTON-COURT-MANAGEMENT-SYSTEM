import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Star, Filter, ShieldCheck } from "lucide-react";
import { apiFetch } from "../../services/api";

// Mảng màu sắc luân phiên để giao diện sinh động như Mock Data
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
  {
    color: "from-emerald-900 to-slate-900",
    accent: "text-emerald-500 border-emerald-500/30 bg-emerald-500/10",
  },
];

const Courts = () => {
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
    <div className="max-w-7xl mx-auto px-5 py-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Khám phá Cơ sở sân
          </h1>
          <p className="text-slate-500 mt-2 text-sm">
            Tìm kiếm và đặt sân cầu lông phù hợp nhất với bạn
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-3">
          <div className="relative group flex-1 md:w-72">
            <input
              type="text"
              placeholder="Tên sân, khu vực..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
          <button className="bg-white border border-slate-200 p-2.5 rounded-xl text-slate-600 hover:text-primary hover:border-primary transition-colors shadow-sm">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12 text-slate-500 font-medium">
          Đang tải danh sách sân...
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center font-medium border border-red-100">
          {error}
        </div>
      )}

      {!loading && !error && filteredVenues.length === 0 && (
        <div className="text-center py-12 text-slate-500 font-medium">
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
              className="block group cursor-pointer bg-white rounded-2xl p-3 border border-slate-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all"
            >
              {/* Image Placeholder */}
              <div
                className={`relative h-44 rounded-xl overflow-hidden mb-4 bg-gradient-to-br ${style.color} flex items-center justify-center`}
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

                <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md border border-white/20 px-2.5 py-1 rounded-full text-white font-bold text-xs flex items-center gap-1 shadow-sm">
                  {venue.rating || "5.0"}{" "}
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                </div>
                <div
                  className={`absolute bottom-3 left-3 backdrop-blur-md border px-2 py-1 rounded-md uppercase tracking-wider font-bold text-[10px] ${style.accent}`}
                >
                  Sân Tiêu Chuẩn
                </div>
              </div>

              {/* Info */}
              <div className="space-y-1 px-1">
                <h3 className="text-slate-900 font-bold text-lg truncate group-hover:text-primary transition-colors">
                  {venue.venuename}
                </h3>
                <p className="text-slate-500 text-xs flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {venue.address}
                </p>
              </div>

              {/* Price & Action */}
              <div className="flex justify-between items-center px-1 mt-4 pt-4 border-t border-slate-100">
                <span className="text-slate-900 font-extrabold text-lg">
                  Từ 100k
                  <span className="text-xs text-slate-400 font-normal">
                    {" "}
                    /giờ
                  </span>
                </span>
                <button className="bg-slate-100 hover:bg-primary text-slate-700 hover:text-[#0b1c30] border border-transparent font-bold px-4 py-2 rounded-lg text-xs transition-all">
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

export default Courts;
