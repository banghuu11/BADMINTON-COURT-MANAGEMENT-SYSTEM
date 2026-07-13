import { useState, useEffect } from "react";
import { CalendarCheck, Dumbbell, Users } from "lucide-react";
import { apiFetch } from "../../services/api";

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
    <section className="mx-auto max-w-7xl px-5 lg:px-8">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_1fr_1fr]">
        <div className="rounded-lg bg-slate-950 p-7 text-white dark:bg-white dark:text-slate-950">
          <p className="text-sm font-bold text-primary dark:text-on-primary">
            CourtLink cho người chơi
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-normal">
            Ít thao tác hơn, nhiều thời gian trên sân hơn.
          </h2>
          <p className="mt-4 text-sm leading-6 text-slate-300 dark:text-slate-600">
            Từ tìm sân, xem khung giờ đến theo dõi lịch đặt, mọi thứ được gom
            lại để người chơi quyết định nhanh và chắc.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-white/5">
          <Dumbbell className="h-8 w-8 text-primary" />
          <p className="mt-8 text-4xl font-extrabold text-slate-950 dark:text-white">{stats.totalMatches}</p>
          <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-white/50">
            trận giao lưu đã tạo
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-white/5">
          <Users className="h-8 w-8 text-primary" />
          <p className="mt-8 text-4xl font-extrabold text-slate-950 dark:text-white">
            {stats.totalUsers}
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-white/50">
            thành viên trên hệ thống
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-white/5 lg:col-span-2 lg:col-start-2">
          <CalendarCheck className="h-8 w-8 text-primary" />
          <p className="mt-4 text-lg font-bold text-slate-950 dark:text-white">
            Sẵn sàng cho đặt lịch theo ngày, giờ và thời lượng chơi.
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Phù hợp cả người chơi lẻ, nhóm cố định và chủ sân cần vận hành lịch đặt rõ ràng.
          </p>
        </div>
      </div>
    </section>
  );
};
export default StatsSection;
