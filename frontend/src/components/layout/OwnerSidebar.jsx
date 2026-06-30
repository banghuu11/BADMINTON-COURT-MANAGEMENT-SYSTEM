import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarCheck,
  Building2,
  Map,
  BadgeDollarSign,
  Package,
  Tags,
  Crown,
  LogOut,
  X,
} from "lucide-react";
import useAuthStore from "../../store/useAuthStore";

const sidebarLinks = [
  { name: "Doanh thu", path: "/owner-dashboard", icon: LayoutDashboard },
  { name: "Lịch Check-in", path: "/reception", icon: CalendarCheck },
  { name: "Cơ sở", path: "/manage-venues", icon: Building2 },
  { name: "Sân đấu", path: "/manage-courts", icon: Map },
  { name: "Bảng giá", path: "/manage-pricing", icon: BadgeDollarSign },
  { name: "Kho & Dịch vụ", path: "/services", icon: Package },
  { name: "Khuyến mãi", path: "/manage-promotions", icon: Tags },
  { name: "Gói cước SaaS", path: "/my-subscription", icon: Crown },
];

const OwnerSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  return (
    <>
      {/* Overlay cho Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#00272C]/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar chính */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-[#00272C] text-slate-300 z-50 flex flex-col transition-transform duration-300 shadow-[20px_0_50px_rgba(0,0,0,0.1)] lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/10 shrink-0">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center transform rotate-3 shadow-[0_0_15px_rgba(225,255,81,0.2)] group-hover:rotate-6 transition-transform">
              <span className="text-on-primary font-black text-xl -rotate-3">
                C
              </span>
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-white">
              Court<span className="text-primary">Link</span>
            </span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cấu trúc Menu */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-6 px-4 flex flex-col gap-1.5">
          <p className="px-3 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
            Quản lý Sân
          </p>
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;

            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => onClose()}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl font-bold transition-all ${
                  isActive
                    ? "bg-primary text-[#00272C] shadow-[0_0_15px_rgba(225,255,81,0.15)]"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? "text-[#00272C]" : "text-slate-400"
                  }`}
                />
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* User / Logout */}
        <div className="p-4 border-t border-white/10 shrink-0">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Đăng xuất
          </button>
        </div>
      </aside>
    </>
  );
};

export default OwnerSidebar;
