import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import {
  MapPin,
  Calendar,
  Clock,
  Award,
  Plus,
  Users,
  AlertCircle,
  Sparkles,
  Building2,
  User,
} from "lucide-react";
import {
  useMatches,
  useVenues,
  useCourtsByVenue,
} from "../hooks/booking/useMatches";
import JoinMatchModal from "../components/booking/JoinMatchModal";

const MatchesPage = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const { matches, isLoading } = useMatches();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    courtId: "",
    playDate: "",
    startTime: "",
    endTime: "",
    matchType: "doubles",
  });

  // State quản lý việc chọn Cơ sở
  const [selectedVenueId, setSelectedVenueId] = useState("");
  const { data: venues = [] } = useVenues();
  const { data: courts = [], isLoading: isLoadingCourts } =
    useCourtsByVenue(selectedVenueId);

  const [joiningMatch, setJoiningMatch] = useState<any>(null);

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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider mb-2">Cơ sở</label>
              <select
                required
                className="w-full bg-white dark:bg-background border border-slate-200 dark:border-white/10 p-3 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900 dark:text-white transition-colors"
                value={selectedVenueId}
                onChange={(e) => {
                  setSelectedVenueId(e.target.value);
                  setFormData({ ...formData, courtId: "" }); // Reset chọn sân khi đổi cơ sở
                }}
              >
                <option value="" disabled className="text-slate-500">
                  -- Chọn cơ sở --
                </option>
                {venues?.map((v: any) => (
                  <option key={v.venueId} value={v.venueId} className="bg-[#00272c] text-white">
                    {v.venueName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wider mb-2">Sân</label>
              <select
                required
                disabled={!selectedVenueId || isLoadingCourts}
                className="w-full bg-white dark:bg-background border border-slate-200 dark:border-white/10 p-3 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900 dark:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                value={formData.courtId}
                onChange={(e) =>
                  setFormData({ ...formData, courtId: e.target.value })
                }
              >
                <option value="" disabled className="text-slate-500">
                  -- Chọn sân --
                </option>
                {courts?.map((c: any) => (
                  <option key={c.courtId} value={c.courtId} className="bg-[#00272c] text-white">
                    {c.courtName}
                  </option>
                ))}
              </select>
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

      {/* Danh sách kèo ghép */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!matches || matches.length === 0 ? (
          <div className="max-w-md mx-auto col-span-full text-center py-16 px-6 bg-white dark:bg-background/20 rounded-3xl border border-slate-200 dark:border-white/10 backdrop-blur-md">
            <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-1">Chưa có ai tìm giao lưu</h3>
            <p className="text-slate-400 text-sm mb-6">
              Hiện tại chưa có ai đăng tin tìm người chơi ghép kèo. Hãy là người đầu tiên tạo kèo!
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-primary hover:bg-primary-hover text-on-primary font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg text-sm inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} /> Tạo kèo ngay
            </button>
          </div>
        ) : (
          matches?.map((match: any) => (
            <div
              key={match.waitid}
              className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-background/40 backdrop-blur-xl shadow-xl hover:border-primary/30 transition-all duration-300 group hover:-translate-y-1 p-6 flex flex-col justify-between min-h-[340px]"
            >
              <div>
                <div className="flex items-center space-x-3 mb-5 border-b border-slate-200 dark:border-white/5 pb-4">
                  <img
                    src={
                      match.avatarurl ||
                      "https://ui-avatars.com/api/?background=e1ff51&color=00272c&bold=true&name=" + encodeURIComponent(match.fullname)
                    }
                    alt={match.fullname}
                    className="w-12 h-12 rounded-full border border-primary/20 object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-slate-950 dark:text-white group-hover:text-primary transition-colors">
                      {match.fullname}
                    </h3>
                    <span className="inline-block mt-1 bg-primary/10 border border-primary/20 text-[10px] text-primary px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Đang tìm đồng đội
                    </span>
                  </div>
                </div>

                <div className="text-xs space-y-3 mb-6 text-slate-600 dark:text-slate-300">
                  <div className="flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <strong className="text-slate-950 dark:text-white block mb-0.5">Cơ sở:</strong>
                      <span className="text-slate-400">{match.venuename}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <strong className="text-slate-950 dark:text-white block mb-0.5">Địa chỉ:</strong>
                      <span className="text-slate-400 line-clamp-1">{match.address}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <strong className="text-slate-950 dark:text-white block mb-0.5">Sân:</strong>
                        <span className="text-slate-400">{match.courtname}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Award className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <strong className="text-slate-950 dark:text-white block mb-0.5">Trình độ:</strong>
                        <span className="text-slate-400">{match.skilllevel || "Chưa cập nhật"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <strong className="text-slate-950 dark:text-white block mb-0.5">Ngày chơi:</strong>
                        <span className="text-slate-400">{new Date(match.playdate).toLocaleDateString("vi-VN")}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <strong className="text-slate-950 dark:text-white block mb-0.5">Thời gian:</strong>
                        <span className="text-primary font-bold">
                          {match.starttime?.slice(0, 5)} - {match.endtime?.slice(0, 5)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-auto pt-4 border-t border-slate-200 dark:border-white/5">
                <button
                  onClick={() => handleJoin(match)}
                  className="flex-1 bg-primary text-on-primary py-3 rounded-xl hover:bg-primary-hover font-bold text-xs transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-primary/5"
                >
                  <Users className="w-4 h-4" />
                  Tham gia ngay
                </button>
                <button
                  onClick={() => navigate(`/booking/${match.courtid}`)}
                  className="flex-1 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 py-3 rounded-xl font-bold text-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  Đến đặt sân
                </button>
              </div>
            </div>
          ))
        )}
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
