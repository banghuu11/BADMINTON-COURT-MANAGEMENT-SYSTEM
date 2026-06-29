import { useState } from "react";
import { MapPin, Clock, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const [location, setLocation] = useState("");
  const [time, setTime] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    // Chuyển hướng sang trang Courts, có thể truyền thêm query parameters để lọc
    // VD: navigate(`/courts?location=${location}&time=${time}`);
    navigate("/courts");
  };

  return (
    <section className="relative min-h-[500px] flex flex-col justify-center px-6 py-16 mt-6 mx-4 rounded-3xl bg-[#00272C] overflow-hidden shadow-2xl">
      {/* Abstract Background Decorators */}
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-emerald-500/20 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="relative z-10 space-y-8">
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl text-white leading-tight font-extrabold tracking-tight">
            TÌM SÂN NHANH.
            <br />
            <span className="text-primary">CHƠI CỰC CHẤT.</span>
          </h1>
          <p className="text-slate-300 text-sm md:text-base max-w-sm leading-relaxed">
            Nền tảng đặt sân cầu lông hàng đầu, kết nối đam mê, bứt phá mọi giới
            hạn của bạn.
          </p>
        </div>

        {/* Quick Search Glass Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-primary opacity-80"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest text-slate-300">
                ĐỊA ĐIỂM
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                <input
                  type="text"
                  placeholder="Hồ Chí Minh..."
                  className="w-full bg-white/10 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-primary focus:bg-white/20 transition-colors"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest text-slate-300">
                THỜI GIAN
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                <input
                  type="datetime-local"
                  className="w-full bg-white/10 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-primary focus:bg-white/20 transition-colors"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="w-full bg-primary text-[#00272C] py-4 rounded-xl font-bold text-base active:scale-[0.98] hover:bg-[#C6D632] shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-5 h-5" />
            TÌM SÂN NGAY
          </button>
        </div>
      </div>
    </section>
  );
};
export default HeroSection;
