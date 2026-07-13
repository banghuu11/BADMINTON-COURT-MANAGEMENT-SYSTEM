import { Menu, User } from "lucide-react";
import { Link } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import NotificationPopup from "./NotificationPopup";
import ThemeToggle from "./ThemeToggle";

const OwnerHeader = ({ onMenuClick }) => {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="h-20 bg-white dark:bg-background border-b border-slate-200 dark:border-white/10 px-5 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-sm transition-colors">
      <div className="flex items-center gap-4">
        {/* Nút mở Menu trên Mobile */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white hidden sm:block">
            Quản trị Chủ sân
          </h1>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 hidden sm:block">
            Chào mừng trở lại!
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Thông báo */}
        <ThemeToggle />
        <NotificationPopup />

        {/* Profile */}
        <Link
          to="/profile"
          className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-white/10 cursor-pointer group"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
              {user?.fullname || "Chủ sân"}
            </p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              Owner
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary group-hover:scale-105 transition-transform overflow-hidden shadow-sm">
            {user?.avatarurl ? (
              <img src={user.avatarurl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>
        </Link>
      </div>
    </header>
  );
};

export default OwnerHeader;
