import { Link } from "react-router-dom";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  MessageCircle,
  Share2,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-[#00272C] text-slate-600 dark:text-slate-300 pt-16 pb-8 border-t border-slate-200 dark:border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand & Giới thiệu */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transform rotate-3 shadow-[0_0_10px_rgba(225,255,81,0.3)]">
                <span className="text-[#00272C] font-black text-lg -rotate-3">
                  C
                </span>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-950 dark:text-white">
                Court<span className="text-primary">Link</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Nền tảng đặt sân cầu lông hàng đầu, kết nối đam mê, bứt phá mọi
              giới hạn của bạn.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-primary hover:text-[#00272C] transition-colors border border-slate-200 dark:border-white/10 hover:border-primary"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-primary hover:text-[#00272C] transition-colors border border-slate-200 dark:border-white/10 hover:border-primary"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center hover:bg-primary hover:text-[#00272C] transition-colors border border-slate-200 dark:border-white/10 hover:border-primary"
              >
                <Share2 className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Khám phá */}
          <div>
            <h3 className="text-slate-950 dark:text-white font-bold mb-4 uppercase tracking-wider text-sm">
              Khám phá
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/courts"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Tìm sân cầu lông
                </Link>
              </li>
              <li>
                <Link
                  to="/matches"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Giao lưu / Bắt cặp
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Khuyến mãi
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Tin tức cầu lông
                </Link>
              </li>
            </ul>
          </div>

          {/* Hỗ trợ */}
          <div>
            <h3 className="text-slate-950 dark:text-white font-bold mb-4 uppercase tracking-wider text-sm">
              Hỗ trợ
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="#"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Câu hỏi thường gặp
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="text-sm hover:text-primary transition-colors"
                >
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link
                  to="/owner-register"
                  className="text-sm hover:text-primary transition-colors text-primary font-medium"
                >
                  Đăng ký làm Chủ sân
                </Link>
              </li>
            </ul>
          </div>

          {/* Liên hệ */}
          <div>
            <h3 className="text-slate-950 dark:text-white font-bold mb-4 uppercase tracking-wider text-sm">
              Liên hệ
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="leading-relaxed">
                  Tòa nhà CourtLink, Quận 10, TP. Hồ Chí Minh
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <span>1900 1234</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <span>support@courtlink.vn</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-500 text-center md:text-left">
            &copy; {new Date().getFullYear()} CourtLink. Đã đăng ký bản quyền.
          </p>
          <div className="flex gap-4 text-sm text-slate-500">
            <button className="hover:text-slate-950 dark:hover:text-white transition-colors">VN</button>
            <span>|</span>
            <button className="hover:text-slate-950 dark:hover:text-white transition-colors">EN</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
