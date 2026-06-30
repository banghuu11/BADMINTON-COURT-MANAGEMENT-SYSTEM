import { Link, useLocation } from "react-router-dom";
import { Compass, Dumbbell, Users, User } from "lucide-react";
import useAuthStore from "../../store/useAuthStore";

const BottomNav = () => {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const navItems = [
    { path: "/", label: "Trang chủ", icon: Compass },
    { path: "/courts", label: "Tìm sân", icon: Dumbbell },
    { path: "/matches", label: "Giao lưu", icon: Users },
    { path: isAuthenticated ? "/profile" : "/login", label: "Hồ sơ", icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-[#00272C]/90 backdrop-blur-xl border-t border-white/10 flex justify-around items-center px-4 pb-8 pt-3 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center transition-all duration-200 active:scale-90 ${
              isActive
                ? "text-on-primary bg-primary rounded-full px-4 py-1"
                : "text-slate-400 hover:text-primary px-4 py-1"
            }`}
          >
            <Icon className={`w-6 h-6 ${isActive ? "text-[#00272C]" : ""}`} />
            <span className={`text-[10px] font-bold mt-1 ${isActive ? "text-[#00272C]" : ""}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};
export default BottomNav;
