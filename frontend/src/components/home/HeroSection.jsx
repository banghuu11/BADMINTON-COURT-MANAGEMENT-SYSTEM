import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock,
  Crosshair,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useHeroSearch } from "../../hooks/useHeroSearch";
import { apiFetch } from "../../services/api";
import defaultHeroImage from "../../assets/hero.png";

const HeroSection = () => {
  const {
    location,
    setLocation,
    time,
    setTime,
    duration,
    setDuration,
    isLocating,
    locationError,
    handleSearch,
    handleNearMe,
  } = useHeroSearch();
  const [bannerUrl, setBannerUrl] = useState(defaultHeroImage);

  const durationOptions = [
    { label: "1 tiếng", value: "60" },
    { label: "1 tiếng 30", value: "90" },
    { label: "2 tiếng", value: "120" },
  ];

  useEffect(() => {
    let mounted = true;

    const fetchSettings = async () => {
      try {
        const data = await apiFetch("/system/public-settings");
        if (mounted) setBannerUrl(data.bannerUrl || defaultHeroImage);
      } catch (err) {
        console.error("Không thể tải banner trang chủ:", err);
        if (mounted) setBannerUrl(defaultHeroImage);
      }
    };

    fetchSettings();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="relative -mt-24 min-h-[760px] overflow-hidden bg-slate-950 text-white">
      <img
        src={bannerUrl}
        alt="CourtLink banner"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-slate-950/55"></div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.88)_0%,rgba(2,6,23,0.70)_42%,rgba(2,6,23,0.26)_100%)]"></div>
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-50 to-transparent dark:from-background"></div>

      <div className="relative z-10 mx-auto flex min-h-[760px] max-w-7xl flex-col justify-center px-5 pb-14 pt-36 lg:px-8">
        <div className="space-y-7">
          <div className="max-w-3xl space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 backdrop-blur">
              <Sparkles className="h-4 w-4 text-primary" />
              Đặt sân trong vài thao tác, xác nhận rõ ràng
            </div>

            <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-normal text-white sm:text-5xl lg:text-6xl">
              Sân đẹp, giờ trống thật, đặt lịch gọn trong một nơi.
            </h1>
            <p className="max-w-xl text-base leading-8 text-slate-200 md:text-lg">
              CourtLink giúp bạn tìm sân cầu lông theo khu vực, chọn khung giờ
              phù hợp và theo dõi lịch đặt mà không phải nhắn tin qua lại.
            </p>
          </div>

          <div className="max-w-6xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="relative mx-auto flex w-full flex-col lg:flex-row items-center rounded-[32px] lg:rounded-full bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] p-2 lg:p-1.5 gap-2 lg:gap-0 lg:divide-x lg:divide-slate-200"
            >
              {/* Location */}
              <div className="group relative flex w-full flex-1 flex-col justify-center rounded-3xl lg:rounded-full px-6 py-3 transition-colors hover:bg-slate-100 lg:py-2 min-h-[72px]">
                <label className="flex flex-col cursor-text">
                  <span className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-0.5">
                    Địa điểm
                  </span>
                  <input
                    type="text"
                    placeholder="Quận 10, Tân Bình, tên sân..."
                    className="w-[90%] lg:w-full bg-transparent truncate text-base font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </label>
                <button
                   type="button"
                   onClick={handleNearMe}
                   disabled={isLocating}
                   title="Tìm sân gần tôi"
                   className="absolute right-3 lg:right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 disabled:opacity-50"
                >
                   <Crosshair className={`h-5 w-5 ${isLocating ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Date Time */}
              <div className="group flex w-full lg:w-[260px] flex-col justify-center rounded-3xl lg:rounded-none px-6 py-3 transition-colors hover:bg-slate-100 lg:py-2 min-h-[72px]">
                <label className="flex flex-col cursor-text">
                  <span className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-0.5">
                    Thời gian
                  </span>
                  <input
                    type="datetime-local"
                    className="w-full bg-transparent text-base font-bold text-slate-900 focus:outline-none cursor-pointer"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </label>
              </div>

              {/* Duration */}
              <div className="group flex w-full lg:w-[200px] flex-col justify-center rounded-3xl lg:rounded-none px-6 py-3 transition-colors hover:bg-slate-100 lg:py-2 min-h-[72px]">
                <label className="flex flex-col cursor-pointer relative">
                  <span className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500 mb-0.5">
                    Thời lượng
                  </span>
                  <select
                    className="w-full bg-transparent text-base font-bold text-slate-900 focus:outline-none cursor-pointer appearance-none"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  >
                    {durationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {/* Custom Arrow for select */}
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pt-4">
                    <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </label>
              </div>

              {/* Search Button */}
              <div className="w-full lg:w-auto p-1 lg:pl-2 shrink-0">
                <button
                  type="submit"
                  className="flex h-[60px] w-full lg:w-[60px] items-center justify-center gap-2 rounded-[24px] lg:rounded-full bg-emerald-600 text-white transition-all hover:scale-105 hover:bg-emerald-700 active:scale-95 lg:hover:w-32 group/btn shadow-[0_0_20px_rgba(5,150,105,0.3)]"
                >
                  <Search className="h-6 w-6 shrink-0" />
                  <span className="font-extrabold lg:hidden lg:group-hover/btn:inline-block">Tìm Sân</span>
                </button>
              </div>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold text-white/85">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Sân đang hoạt động
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">
                <Clock className="h-4 w-4 text-primary" />
                Ưu tiên sân gần bạn
              </span>
              {["Quận 10", "Tân Bình", "Phú Nhuận"].map((area) => (
                <button
                  key={area}
                  type="button"
                  onClick={() => setLocation(area)}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-white/75 transition-colors hover:bg-white hover:text-slate-950"
                >
                  {area}
                </button>
              ))}
              {locationError && (
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/15 px-3 py-2 text-amber-100 backdrop-blur">
                  {locationError}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default HeroSection;
