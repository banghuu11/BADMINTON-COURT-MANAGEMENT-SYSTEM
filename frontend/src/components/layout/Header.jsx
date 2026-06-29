import { useState, useEffect } from "react";
import { Menu, UserCircle } from "lucide-react";
import NotificationPopup from "./NotificationPopup";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-lg border-b flex items-center justify-between px-5 h-16 ${
        scrolled
          ? "bg-[#00272C]/80 border-white/10 shadow-lg"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="flex items-center gap-3">
        <Menu className="text-white hover:text-primary w-6 h-6 cursor-pointer active:scale-95 transition-colors" />
        <span className="text-2xl font-bold tracking-tight text-primary">
          CourtLink
        </span>
      </div>
      <div className="flex items-center gap-4">
        <NotificationPopup />
        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center cursor-pointer active:scale-95 transition-all border border-primary/30 hover:bg-primary/20 shadow-[0_0_10px_rgba(225,255,81,0.15)]">
          <UserCircle className="w-6 h-6" />
        </div>
      </div>
    </header>
  );
};
export default Header;
