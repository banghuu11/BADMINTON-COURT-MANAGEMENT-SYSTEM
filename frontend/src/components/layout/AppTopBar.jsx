import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Bell, User, Menu, X, LogOut } from "lucide-react";
import useAuthStore from "../../store/useAuthStore";
import NotificationPopup from "./NotificationPopup";

const AppTopBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  // Hiệu ứng đổi màu nền khi cuộn trang
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [];
  
  if (user && (user.roleid === 1 || user.roleId === 1)) {
    navLinks.push({ name: "Quản lý Dữ liệu", path: "/" });
  } else {
    navLinks.push({ name: "Trang chủ", path: "/" });
    navLinks.push({ name: "Tìm sân", path: "/courts" });
    navLinks.push({ name: "Giao lưu", path: "/matches" });
    navLinks.push({ name: "Khuyến mãi", path: "/promotions" });

    if (user && (user.roleid === 2 || user.roleId === 2)) {
      navLinks.push({ name: "Lễ tân", path: "/reception" });
      navLinks.push({ name: "Cơ sở", path: "/manage-venues" });
      navLinks.push({ name: "Quản lý Sân", path: "/manage-courts" });
      navLinks.push({ name: "Bảng giá", path: "/manage-pricing" });
      navLinks.push({ name: "Kho & Dịch vụ", path: "/services" });
      navLinks.push({ name: "Quản lý KM", path: "/manage-promotions" });
    }
  }

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/90 backdrop-blur-md border-b border-white/10 shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 z-50">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center transform rotate-3 shadow-[0_0_15px_rgba(225,255,81,0.4)]">
            <span className="text-on-primary font-black text-xl -rotate-3">
              C
            </span>
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-white hidden sm:block">
            Court<span className="text-primary">Link</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-slate-300 hover:text-primary font-semibold text-sm transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-5">
          {/* Thanh tìm kiếm */}
          <div className="relative group">
            <input
              type="text"
              placeholder="Tìm kiếm khu vực..."
              className="bg-white/10 border border-white/10 rounded-full py-2 pl-4 pr-10 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-primary/50 focus:bg-white/20 transition-all w-48 group-hover:w-64"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>

          {/* Thông báo */}
          <NotificationPopup />

          {/* Auth / Profile */}
          {isAuthenticated ? (
            <div className="flex items-center gap-4 pl-4 border-l border-white/20">
              <Link
                to="/profile"
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="text-right">
                  <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                    {user?.fullname || "Tài khoản"}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                    {user?.roleid === 1 || user?.roleId === 1
                      ? "Admin"
                      : user?.roleid === 2
                        ? "Chủ sân"
                        : "Thành viên"}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary group-hover:scale-105 transition-transform overflow-hidden">
                  {user?.avatarurl ? (
                    <img src={user.avatarurl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
              </Link>
              <button
                onClick={logout}
                className="text-slate-400 hover:text-red-500 transition-colors"
                title="Đăng xuất"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 pl-4 border-l border-white/20">
              <Link
                to="/login"
                className="text-white hover:text-primary font-bold text-sm transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="bg-primary hover:bg-primary-hover text-on-primary px-5 py-2 rounded-full font-bold text-sm transition-colors shadow-[0_0_15px_rgba(225,255,81,0.3)]"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="md:hidden p-2 text-white z-50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="w-7 h-7" />
          ) : (
            <Menu className="w-7 h-7" />
          )}
        </button>
      </div>

      {/* Mobile Sidebar Menu */}
      <div
        className={`md:hidden fixed inset-0 bg-background pt-24 px-5 transition-transform duration-300 ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex flex-col gap-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm khu vực..."
              className="w-full bg-white/10 border border-white/10 rounded-xl py-3 pl-4 pr-10 text-white placeholder-slate-400 focus:outline-none focus:border-primary"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-white text-lg font-semibold py-2 border-b border-white/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="mt-4 pt-6 border-t border-white/10 flex flex-col gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary overflow-hidden shrink-0 border border-primary/20">
                    {user?.avatarurl ? (
                      <img src={user.avatarurl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-white text-lg">
                      Tài khoản của tôi
                    </p>
                    <p className="text-sm text-primary">
                      Xem thông tin & Lịch sử
                    </p>
                  </div>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-red-500/10 text-red-500 hover:bg-red-500/20 py-3 rounded-xl font-bold text-center transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-5 h-5" /> Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl font-bold text-center transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold text-center transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Đăng ký tài khoản
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppTopBar;
