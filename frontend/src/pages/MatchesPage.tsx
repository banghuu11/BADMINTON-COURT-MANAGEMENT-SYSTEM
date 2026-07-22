import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import {
  MapPin,
  Calendar,
  Clock,
  Plus,
  Users,
  AlertCircle,
  Sparkles,
  Building2,
  User,
  Search,
  ChevronDown,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import {
  useMatches,
  useCourtSuggestions,
} from "../hooks/booking/useMatches";
import JoinMatchModal from "../components/booking/JoinMatchModal";
import fallbackImage from "../assets/hero.png";

const MatchesPage = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const { matches, isLoading } = useMatches();
  const feedRef = useRef<HTMLDivElement>(null);
  const hasAutoScrolled = useRef(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    courtId: "",
    playDate: "",
    startTime: "",
    endTime: "",
    matchType: "doubles",
  });

  const [courtQuery, setCourtQuery] = useState("");
  const [showCourtSuggestions, setShowCourtSuggestions] = useState(false);
  const { data: matchingCourts = [], isLoading: isLoadingCourts } = useCourtSuggestions(courtQuery);

  const [joiningMatch, setJoiningMatch] = useState<any>(null);
  const [filters, setFilters] = useState({
    recent: false,
    district: "",
    skillLevel: "",
    playDate: "",
    playTime: "",
  });

  const districtOptions = useMemo(
    () => [...new Set(matches.map((match: any) => match.district).filter(Boolean))].sort(),
    [matches],
  );
  const skillOptions = useMemo(
    () => [...new Set(matches.map((match: any) => match.skilllevel).filter(Boolean))].sort(),
    [matches],
  );
  const filteredMatches = useMemo(() => {
    const result = matches.filter((match: any) => {
      if (filters.district && match.district !== filters.district) return false;
      if (filters.skillLevel && match.skilllevel !== filters.skillLevel) return false;
      if (filters.playDate) {
        const date = new Date(match.playdate);
        const localDate = [
          date.getFullYear(),
          String(date.getMonth() + 1).padStart(2, "0"),
          String(date.getDate()).padStart(2, "0"),
        ].join("-");
        if (localDate !== filters.playDate) return false;
      }
      if (filters.playTime) {
        const selectedTime = filters.playTime.slice(0, 5);
        const startTime = String(match.starttime).slice(0, 5);
        const endTime = String(match.endtime).slice(0, 5);
        if (selectedTime < startTime || selectedTime >= endTime) return false;
      }
      return true;
    });
    if (filters.recent) {
      result.sort(
        (a: any, b: any) =>
          new Date(b.requestedat).getTime() - new Date(a.requestedat).getTime(),
      );
    }
    return result;
  }, [matches, filters]);

  const hasActiveFilters = Object.values(filters).some(Boolean);

  useEffect(() => {
    feedRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [filters]);

  useEffect(() => {
    if (isLoading || !matches?.length || hasAutoScrolled.current) return;
    hasAutoScrolled.current = true;
    const frameId = window.requestAnimationFrame(() => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      feedRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "center",
      });
      feedRef.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [isLoading, matches?.length]);

  if (user && (user.roleid === 1 || user.roleId === 1)) {
    return <Navigate to="/" replace />;
  }

  const handleJoin = (match: any) => {
    if (!user) {
      alert("Vui lòng đăng nhập để tham gia giao lưu!");
      navigate("/login");
      return;
    }
    setJoiningMatch(match);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.courtId) {
      alert("Hãy chọn một sân từ danh sách gợi ý.");
      return;
    }
    const params = new URLSearchParams({
      flow: "createMatch",
      playDate: formData.playDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      matchType: formData.matchType,
    });
    navigate(`/booking/${formData.courtId}?${params.toString()}`);
  };

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 min-h-[500px]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm font-semibold">Đang tải dữ liệu giao lưu...</p>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-5 py-8 pb-24 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight flex items-center gap-2">
            Cộng đồng <span className="text-primary">Giao Lưu & Ghép Kèo</span>
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Kết nối đam mê, tìm đồng đội và đối thủ chơi cầu lông cùng trình độ.
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-primary hover:bg-primary-hover text-on-primary font-bold px-5 py-3 rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          {showCreateForm ? "Hủy tạo" : (
            <>
              <Plus className="w-5 h-5" strokeWidth={2.5} />
              Đăng tin tìm người
            </>
          )}
        </button>
      </div>

      {/* Form đăng tin (hiện khi bấm nút) */}
      {showCreateForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white dark:bg-background/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 rounded-3xl mb-10 shadow-2xl relative overflow-hidden animate-fade-in"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-emerald-400 opacity-80"></div>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> Tạo kèo ghép mới
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            <div className="relative">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider mb-2">Tên sân</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                type="text"
                className="w-full rounded-xl border border-slate-200 bg-white p-3 pl-9 text-sm text-slate-900 transition-colors focus:border-primary focus:outline-none dark:border-white/10 dark:bg-background dark:text-white"
                placeholder={isLoadingCourts ? "Đang tải sân..." : "Nhập tên sân hoặc cơ sở"}
                value={courtQuery}
                onFocus={() => setShowCourtSuggestions(true)}
                onBlur={() => window.setTimeout(() => setShowCourtSuggestions(false), 150)}
                onChange={(e) => {
                  setCourtQuery(e.target.value);
                  setFormData({ ...formData, courtId: "" });
                  setShowCourtSuggestions(true);
                }}
                autoComplete="off"
                aria-autocomplete="list"
                aria-expanded={showCourtSuggestions}
              />
              </div>
              {showCourtSuggestions && !isLoadingCourts && (
                <div className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-white/10 dark:bg-[#00272c]">
                  {matchingCourts.length > 0 ? (
                    matchingCourts.map((court: any) => (
                      <button
                        key={court.courtId}
                        type="button"
                        className="flex w-full items-center px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-primary"
                        onClick={() => {
                          setCourtQuery(court.courtName);
                          setFormData({ ...formData, courtId: String(court.courtId) });
                          setShowCourtSuggestions(false);
                        }}
                      >
                        <span>{court.courtName}</span>
                        <span className="ml-2 truncate text-xs text-slate-400 dark:text-slate-400">{court.venueName}</span>
                      </button>
                    ))
                  ) : (
                    <p className="px-3 py-2.5 text-sm text-slate-500 dark:text-slate-400">Không tìm thấy sân phù hợp.</p>
                  )}
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider mb-2">
                Ngày chơi
              </label>
              <input
                type="date"
                required
                className="w-full bg-white dark:bg-background border border-slate-200 dark:border-white/10 p-2.5 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900 dark:text-white transition-colors"
                value={formData.playDate}
                onChange={(e) =>
                  setFormData({ ...formData, playDate: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider mb-2">
                Giờ bắt đầu
              </label>
              <input
                type="time"
                required
                className="w-full bg-white dark:bg-background border border-slate-200 dark:border-white/10 p-2.5 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900 dark:text-white transition-colors"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider mb-2">
                Giờ kết thúc
              </label>
              <input
                type="time"
                required
                className="w-full bg-white dark:bg-background border border-slate-200 dark:border-white/10 p-2.5 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900 dark:text-white transition-colors"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider mb-2">
                Loại kèo
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, matchType: "singles" })}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    formData.matchType === "singles"
                      ? "bg-primary text-on-primary border-primary"
                      : "bg-white dark:bg-background border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <User className="w-3.5 h-3.5" /> Đơn
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, matchType: "doubles" })}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    formData.matchType === "doubles"
                      ? "bg-primary text-on-primary border-primary"
                      : "bg-white dark:bg-background border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" /> Đôi
                </button>
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={false}
            className="mt-6 bg-primary hover:bg-primary-hover text-on-primary font-bold px-6 py-3 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
          >
            Chọn chỗ & đăng kèo
          </button>
        </form>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5 lg:sticky lg:top-24">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white">
              <SlidersHorizontal className="h-4 w-4 text-primary" /> Bộ lọc
            </h2>
            <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-black text-emerald-700 dark:text-primary">
              {filteredMatches.length} kèo
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-1">
            <label className="col-span-2 flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 sm:col-span-1 lg:col-span-1">
              <input
                type="checkbox"
                checked={filters.recent}
                onChange={(event) => setFilters({ ...filters, recent: event.target.checked })}
                className="h-4 w-4 rounded accent-emerald-600"
              />
              Kèo mới đăng
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Địa điểm</span>
              <select
                value={filters.district}
                onChange={(event) => setFilters({ ...filters, district: event.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-primary dark:border-white/10 dark:bg-[#00272c] dark:text-white"
              >
                <option value="">Tất cả khu vực</option>
                {districtOptions.map((district) => <option key={district} value={district}>{district}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Trình độ</span>
              <select
                value={filters.skillLevel}
                onChange={(event) => setFilters({ ...filters, skillLevel: event.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-primary dark:border-white/10 dark:bg-[#00272c] dark:text-white"
              >
                <option value="">Mọi trình độ</option>
                {skillOptions.map((level) => <option key={level} value={level}>{level}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Ngày chơi</span>
              <input
                type="date"
                value={filters.playDate}
                onChange={(event) => setFilters({ ...filters, playDate: event.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-primary dark:border-white/10 dark:bg-[#00272c] dark:text-white"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Giờ chơi</span>
              <input
                type="time"
                value={filters.playTime}
                onChange={(event) => setFilters({ ...filters, playTime: event.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-primary dark:border-white/10 dark:bg-[#00272c] dark:text-white"
              />
            </label>
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            Có thể chọn riêng từng mục, không bắt buộc điền tất cả.
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => setFilters({ recent: false, district: "", skillLevel: "", playDate: "", playTime: "" })}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Xóa bộ lọc
            </button>
          )}
        </aside>

        <div className="min-w-0">
          {/* Feed kèo dạng vuốt dọc */}
          <div
        ref={feedRef}
        className="relative mx-auto h-[calc(100svh-10rem)] min-h-[560px] max-h-[760px] max-w-5xl overflow-y-auto snap-y snap-mandatory overscroll-contain rounded-[1.75rem] bg-slate-950 shadow-2xl no-scrollbar"
        tabIndex={0}
        aria-label="Danh sách kèo giao lưu, vuốt dọc để chuyển kèo"
      >
        {!filteredMatches || filteredMatches.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center text-white">
            <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold mb-1">Không tìm thấy kèo phù hợp</h3>
            <p className="text-slate-400 text-sm mb-6">
              Hãy thử bỏ bớt tiêu chí hoặc tạo một kèo giao lưu mới.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-primary hover:bg-primary-hover text-on-primary font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg text-sm inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} /> Tạo kèo ngay
            </button>
          </div>
        ) : (
          filteredMatches.map((match: any, index: number) => (
            <article
              key={match.waitid}
              className="group relative h-full snap-start snap-always overflow-hidden bg-slate-950 text-white"
            >
              <img
                src={match.venueimage || fallbackImage}
                alt={match.venuename}
                loading={index < 2 ? "eager" : "lazy"}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/45 via-slate-950/25 to-slate-950/95" />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 sm:p-6">
                <span className="rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-xs font-extrabold backdrop-blur-md">
                  Kèo {index + 1}/{filteredMatches.length}
                </span>
                <span className="rounded-full border border-primary/30 bg-primary/15 px-3 py-1.5 text-xs font-extrabold text-primary backdrop-blur-md">
                  {match.matchtype === "singles" ? "Đánh đơn" : "Đánh đôi"}
                </span>
              </div>

              <div className="absolute inset-0 flex items-center p-5 pb-7 pt-20 sm:p-7 sm:pb-8 sm:pt-20">
                <div className="mx-auto w-full max-w-3xl">
                  <div className="mb-4 flex items-center gap-3">
                  <img
                    src={
                      match.avatarurl ||
                      "https://ui-avatars.com/api/?background=e1ff51&color=00272c&bold=true&name=" + encodeURIComponent(match.fullname)
                    }
                    alt={match.fullname}
                    className="h-10 w-10 rounded-full border-2 border-primary object-cover shadow-lg"
                  />
                  <div>
                    <h3 className="font-extrabold text-white">
                      {match.fullname}
                    </h3>
                    <p className="text-xs font-semibold text-white/70">
                      Trình độ {match.skilllevel || "chưa cập nhật"} · đang tìm đồng đội
                    </p>
                  </div>
                </div>

                  <h2 className="max-w-3xl text-xl font-black leading-tight sm:text-3xl">
                    {match.venuename}
                  </h2>
                  <p className="mt-2 flex items-start gap-2 text-sm font-medium text-white/75">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{match.address}{match.district ? `, ${match.district}` : ""}</span>
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
                    <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 backdrop-blur-md">
                      <Building2 className="h-4 w-4 text-primary" /> {match.courtname}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 backdrop-blur-md">
                      <Calendar className="h-4 w-4 text-primary" /> {new Date(match.playdate).toLocaleDateString("vi-VN")}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 backdrop-blur-md">
                      <Clock className="h-4 w-4 text-primary" /> {match.starttime?.slice(0, 5)} - {match.endtime?.slice(0, 5)}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
                    <button
                      onClick={() => handleJoin(match)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-black text-on-primary shadow-lg shadow-primary/20 transition hover:bg-primary-hover active:scale-[0.98]"
                    >
                      <Users className="h-5 w-5" /> Tham gia kèo
                    </button>
                    <button
                      onClick={() => navigate(`/booking/${match.courtid}`)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-black text-white backdrop-blur-md transition hover:bg-white hover:text-slate-950 active:scale-[0.98]"
                    >
                      <Calendar className="h-5 w-5" /> Xem và đặt sân
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
          </div>
          {filteredMatches.length > 1 && (
        <p className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
          <ChevronDown className="h-4 w-4 animate-bounce text-primary" /> Vuốt lên hoặc cuộn để xem kèo tiếp theo
        </p>
      )}
        </div>
      </div>

      {joiningMatch && (
        <JoinMatchModal
          match={joiningMatch}
          onClose={() => setJoiningMatch(null)}
        />
      )}
    </div>
  );
};

export default MatchesPage;
