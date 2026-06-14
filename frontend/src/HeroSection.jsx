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
    <section className="relative min-h-[500px] flex flex-col justify-center px-5 py-12 mt-12 overflow-hidden">
      {/* Abstract Background Decorators */}
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="relative z-10 space-y-8">
        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl text-white leading-tight font-extrabold tracking-tight">
            TÌM SÂN NHANH.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#9acc00]">
              CHƠI CỰC CHẤT.
            </span>
          </h1>
          <p className="text-white/60 text-sm max-w-sm leading-relaxed">
            Nền tảng đặt sân cầu lông hàng đầu, kết nối đam mê, bứt phá mọi giới
            hạn của bạn.
          </p>
        </div>

        {/* Quick Search Glass Card */}
        <div className="bg-[#1a2c42]/60 backdrop-blur-xl border border-white/10 p-6 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent opacity-50"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest text-white/50">
                ĐỊA ĐIỂM
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                <input
                  type="text"
                  placeholder="Hồ Chí Minh..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary transition-colors"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold tracking-widest text-white/50">
                THỜI GIAN
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                <input
                  type="datetime-local"
                  style={{ colorScheme: "dark" }}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary transition-colors"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="w-full bg-primary text-[#0b1c30] py-4 rounded-xl font-bold text-base active:scale-[0.98] hover:bg-[#a8d800] hover:shadow-[0_0_20px_rgba(191,240,0,0.3)] transition-all flex items-center justify-center gap-2"
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
