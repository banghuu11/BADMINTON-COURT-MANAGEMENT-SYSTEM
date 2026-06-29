import { Compass, Dumbbell, Users, User } from "lucide-react";

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 bg-[#00272C]/80 backdrop-blur-lg border-t border-white/10 flex justify-around items-center px-4 pb-8 pt-3 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      <div className="flex flex-col items-center justify-center bg-primary text-on-primary rounded-full px-4 py-1 cursor-pointer active:scale-90 transition-transform">
        <Compass className="w-6 h-6" />
        <span className="text-xs font-bold mt-0.5">Explore</span>
      </div>
      <div className="flex flex-col items-center justify-center text-gray-400 hover:text-primary transition-colors cursor-pointer active:scale-90 transition-transform">
        <Dumbbell className="w-6 h-6" />
        <span className="text-xs font-bold mt-0.5">Courts</span>
      </div>
      <div className="flex flex-col items-center justify-center text-gray-400 hover:text-primary transition-colors cursor-pointer active:scale-90 transition-transform">
        <Users className="w-6 h-6" />
        <span className="text-xs font-bold mt-0.5">Matches</span>
      </div>
      <div className="flex flex-col items-center justify-center text-gray-400 hover:text-primary transition-colors cursor-pointer active:scale-90 transition-transform">
        <User className="w-6 h-6" />
        <span className="text-xs font-bold mt-0.5">Profile</span>
      </div>
    </nav>
  );
};
export default BottomNav;
