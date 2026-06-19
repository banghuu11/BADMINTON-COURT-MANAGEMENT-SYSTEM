import { Dumbbell, Users } from "lucide-react";
import { useFetch } from "./hooks/useFetch";

const StatsSection = () => {
  const { data } = useFetch("/dashboard/public");
  const stats = data?.stats || { totalMatches: 0, totalUsers: 0 };

  return (
    <section className="mt-12 px-5 grid grid-cols-2 gap-4">
      <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl flex flex-col justify-between aspect-square hover:border-primary/50 transition-colors">
        <Dumbbell className="text-[#0b1c30] w-8 h-8" />
        <div>
          <p className="text-4xl font-extrabold text-slate-900">
            {stats.totalMatches}
          </p>
          <p className="text-slate-500 text-xs uppercase tracking-wider font-bold mt-1">
            Trận Đã Đấu
          </p>
        </div>
      </div>
      <div className="bg-[#0b1c30] p-6 rounded-2xl flex flex-col justify-between aspect-square shadow-lg relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 opacity-10">
          <Users className="w-24 h-24 text-white" />
        </div>
        <Users className="text-primary w-8 h-8 relative z-10" />
        <div className="relative z-10">
          <p className="text-4xl font-extrabold text-white">
            {stats.totalUsers}
          </p>
          <p className="text-primary/80 text-xs uppercase tracking-wider font-bold mt-1">
            Thành Viên
          </p>
        </div>
      </div>
    </section>
  );
};
export default StatsSection;
