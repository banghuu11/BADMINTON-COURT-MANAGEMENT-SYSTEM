import { useState, useEffect } from "react";
import { Ticket, Copy, Check, Calendar, Landmark, AlertCircle } from "lucide-react";
import { apiFetch } from "../services/api";
import { Navigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

const Promotions = () => {
  const user = useAuthStore((state) => state.user);
  if (user && (user.roleid === 1 || user.roleId === 1)) {
    return <Navigate to="/" replace />;
  }

  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        const data = await apiFetch("/promotions");
        if (data.promotions) {
          setPromotions(data.promotions);
        }
      } catch (err) {
        console.error("Lỗi khi tải khuyến mãi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPromotions();
  }, []);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-5 py-8 pb-24 animate-fade-in">
      {/* Page Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex p-3 bg-primary/10 rounded-2xl border border-primary/20 text-primary mb-4 shadow-[0_0_15px_rgba(225,255,81,0.15)]">
          <Ticket className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Ưu Đãi & <span className="text-primary">Khuyến Mãi</span>
        </h1>
        <p className="text-slate-400 mt-2 text-sm sm:text-base max-w-md mx-auto">
          Nhận mã giảm giá độc quyền, đặt sân chơi cực chất với chi phí tiết kiệm nhất.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-semibold">Đang tải mã giảm giá...</p>
        </div>
      ) : promotions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo) => {
            const isDiscountPercent = promo.discounttype === "Percentage" || promo.discounttype === "Percent";
            const formattedValue = isDiscountPercent
              ? `${promo.discountvalue}%`
              : `${Number(promo.discountvalue).toLocaleString("vi-VN")}đ`;

            return (
              <div
                key={promo.promotionid}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-background/40 backdrop-blur-xl shadow-xl hover:border-primary/30 transition-all duration-300 group hover:-translate-y-1"
              >
                {/* Neon Top Bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-primary to-emerald-400 opacity-80"></div>

                {/* Card Body */}
                <div className="p-6 flex flex-col justify-between h-full min-h-[280px]">
                  {/* Promo info */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="inline-flex px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-bold text-primary">
                        Giảm {formattedValue}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-widest font-bold font-mono">
                        <Landmark className="w-3.5 h-3.5 text-primary" />
                        <span className="truncate max-w-[120px]">{promo.venuename}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                        {promo.promotionname}
                      </h3>
                      <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                        {promo.description || "Không có mô tả chi tiết."}
                      </p>
                    </div>
                  </div>

                  {/* Conditions & Action */}
                  <div className="mt-6 pt-4 border-t border-white/5 space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      <div>
                        Đơn tối thiểu:{" "}
                        <span className="text-white block mt-0.5">
                          {Number(promo.minorderamount || 0).toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                      {promo.maxdiscount && (
                        <div>
                          Giảm tối đa:{" "}
                          <span className="text-white block mt-0.5">
                            {Number(promo.maxdiscount).toLocaleString("vi-VN")}đ
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Calendar className="w-4 h-4 text-primary shrink-0" />
                      <span>
                        HSD: {new Date(promo.enddate).toLocaleDateString("vi-VN")}
                      </span>
                    </div>

                    {/* Copy Coupon Box */}
                    <div className="flex items-center justify-between gap-3 p-3 bg-white/5 rounded-xl border border-white/10 group/code hover:bg-white/10 transition-colors">
                      <div className="font-mono text-sm font-bold text-primary tracking-wider uppercase pl-1 select-all">
                        {promo.promotionname.toUpperCase().replace(/\s+/g, "_")}
                      </div>
                      <button
                        onClick={() => handleCopy(promo.promotionname.toUpperCase().replace(/\s+/g, "_"))}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                          copiedCode === promo.promotionname.toUpperCase().replace(/\s+/g, "_")
                            ? "bg-emerald-500 text-white"
                            : "bg-primary text-on-primary hover:bg-primary-hover shadow-md shadow-primary/10"
                        }`}
                      >
                        {copiedCode === promo.promotionname.toUpperCase().replace(/\s+/g, "_") ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Đã lưu
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Sao chép
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="max-w-md mx-auto text-center py-16 px-6 bg-background/20 rounded-3xl border border-white/10 backdrop-blur-md">
          <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Chưa có khuyến mãi nào</h3>
          <p className="text-slate-400 text-sm">
            Hiện tại các cơ sở chưa phát hành chương trình khuyến mãi nào. Hãy quay lại sau nhé!
          </p>
        </div>
      )}
    </div>
  );
};

export default Promotions;
