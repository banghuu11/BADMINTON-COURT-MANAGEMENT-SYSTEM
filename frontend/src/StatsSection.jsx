import { useState, useEffect } from "react";
import { Dumbbell, Users } from "lucide-react";
import { apiFetch } from "./services/api";

const StatsSection = () => {
  const [stats, setStats] = useState({ totalMatches: 0, totalUsers: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiFetch("/dashboard/public");
        if (data.stats) setStats(data.stats);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  return (
    <section className="mt-12 px-5 grid grid-cols-2 gap-4">
      <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col justify-between aspect-square hover:bg-white/10 transition-colors">
        <Dumbbell className="text-primary w-8 h-8" />
        <div>
          <p className="text-4xl font-bold text-white">{stats.totalMatches}</p>
          <p className="text-white/50 text-xs uppercase tracking-wider font-bold">
            Trận Đã Đấu
          </p>
        </div>
      </div>
      <div className="bg-gradient-to-br from-primary to-[#9acc00] p-6 rounded-2xl flex flex-col justify-between aspect-square shadow-[0_5px_20px_rgba(191,240,0,0.3)]">
        <Users className="text-[#0b1c30] w-8 h-8" />
        <div>
          <p className="text-4xl font-bold text-on-primary">
            {stats.totalUsers}
          </p>
          <p className="text-on-primary/70 text-xs uppercase tracking-wider font-bold">
            Thành Viên
          </p>
        </div>
      </div>
    </section>
  );
};
export default StatsSection;
