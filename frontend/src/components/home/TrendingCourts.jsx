import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, MapPin, Star } from "lucide-react";
import { apiFetch } from "../../services/api";
import fallbackImage from "../../assets/hero.png";

const TrendingCourts = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const data = await apiFetch("/venues/all");
        setVenues((data.venues || []).slice(0, 8));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-5 lg:px-8">
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-primary">Đề xuất hôm nay</p>
          <h2 className="text-3xl font-extrabold tracking-normal text-slate-950 dark:text-white">
            Sân được đặt nhiều
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            Chọn nhanh các cơ sở đang hoạt động, có thông tin địa chỉ và lịch mở cửa rõ ràng.
          </p>
        </div>
        <Link
          to="/courts"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-950 transition-colors hover:text-primary dark:text-white"
        >
          Xem tất cả <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          [...Array(8)].map((_, i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="skeleton mb-4 h-48 rounded-md"></div>
              <div className="space-y-2">
                <div className="skeleton h-5 w-3/4 rounded"></div>
                <div className="skeleton h-3 w-1/2 rounded"></div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-white/10">
                <div className="skeleton h-5 w-1/3 rounded"></div>
                <div className="skeleton h-8 w-20 rounded-lg"></div>
              </div>
            </div>
          ))
        ) : venues.length > 0 ? (
          venues.map((venue) => {
            const imageUrl = venue.mainimage || fallbackImage;
            return (
              <Link
                to={`/venue/${venue.venueid}`}
                key={venue.venueid}
                className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20"
              >
                <div className="relative h-52 overflow-hidden bg-slate-200">
                  <img
                    src={imageUrl}
                    alt={venue.venuename}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded bg-white/95 px-2.5 py-1 text-xs font-bold text-slate-950 shadow-sm">
                    {venue.rating || "5.0"}{" "}
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-xs font-bold uppercase text-primary">
                      Cơ sở đang hoạt động
                    </p>
                    <h3 className="mt-1 line-clamp-2 text-xl font-extrabold text-white">
                      {venue.venuename}
                    </h3>
                  </div>
                </div>
                <div className="p-4">
                  <p className="line-clamp-2 flex min-h-10 items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" /> {venue.address}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-white/10">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                      <Clock className="h-4 w-4" />
                      {venue.opentime?.slice(0, 5) || "06:00"} - {venue.closetime?.slice(0, 5) || "23:00"}
                    </span>
                    <span className="rounded bg-slate-950 px-3 py-2 text-xs font-bold text-white transition-colors group-hover:bg-primary group-hover:text-on-primary dark:bg-white dark:text-slate-950">
                      Xem sân
                    </span>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <p className="text-sm text-slate-500 dark:text-white/50 md:col-span-2 xl:col-span-4">
            Chưa có cơ sở sân nào hoạt động.
          </p>
        )}
      </div>
    </section>
  );
};
export default TrendingCourts;
