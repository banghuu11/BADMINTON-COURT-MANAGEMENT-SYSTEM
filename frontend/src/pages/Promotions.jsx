import { useState, useEffect } from "react";
import { AlertCircle, Calendar, Check, Copy, Landmark, Ticket } from "lucide-react";
import { apiFetch } from "../services/api";
import { Navigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

const Promotions = () => {
  const user = useAuthStore((state) => state.user);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);
  const roleId = Number(user?.roleid || user?.roleId || user?.RoleId);

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

  if (roleId === 1) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="animate-fade-in pb-24">
      <section className="border-b border-slate-200 bg-white dark:border-white/10 dark:bg-background">
        <div className="mx-auto max-w-7xl px-5 py-12 text-center lg:px-8">
          <p className="mx-auto mb-4 inline-flex items-center gap-2 rounded bg-primary px-3 py-1 text-xs font-extrabold text-on-primary">
            <Ticket className="h-4 w-4" />
            Ưu đãi đang chạy
          </p>
          <h1 className="text-4xl font-extrabold tracking-normal text-slate-950 dark:text-white">
            Mã giảm giá đặt sân
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            Lưu nhanh mã khuyến mãi từ các cơ sở đang hoạt động và áp dụng khi đặt sân.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-sm font-semibold text-slate-400">Đang tải mã giảm giá...</p>
          </div>
        ) : promotions.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {promotions.map((promo) => {
              const isDiscountPercent = promo.discounttype === "Percentage" || promo.discounttype === "Percent";
              const formattedValue = isDiscountPercent
                ? `${promo.discountvalue}%`
                : `${Number(promo.discountvalue).toLocaleString("vi-VN")}đ`;
              const code = promo.promotionname.toUpperCase().replace(/\s+/g, "_");

              return (
                <div
                  key={promo.promotionid}
                  className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl dark:border-white/10 dark:bg-white/5"
                >
                  <div className="border-b border-slate-100 p-5 dark:border-white/10">
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div className="rounded-md bg-primary px-4 py-3 text-on-primary">
                        <p className="text-xs font-bold uppercase">Giảm</p>
                        <p className="text-2xl font-extrabold leading-none">
                          {formattedValue}
                        </p>
                      </div>
                      <span className="inline-flex max-w-[160px] items-center gap-1 truncate text-xs font-bold uppercase text-slate-400">
                        <Landmark className="h-4 w-4 text-primary" />
                        {promo.venuename}
                      </span>
                    </div>

                    <h3 className="text-xl font-extrabold text-slate-950 dark:text-white">
                      {promo.promotionname}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {promo.description || "Không có mô tả chi tiết."}
                    </p>
                  </div>

                  <div className="space-y-4 p-5">
                    <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
                      <div>
                        <span className="block uppercase">Đơn tối thiểu</span>
                        <span className="mt-1 block text-sm font-extrabold text-slate-950 dark:text-white">
                          {Number(promo.minorderamount || 0).toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                      {promo.maxdiscount && (
                        <div>
                          <span className="block uppercase">Giảm tối đa</span>
                          <span className="mt-1 block text-sm font-extrabold text-slate-950 dark:text-white">
                            {Number(promo.maxdiscount).toLocaleString("vi-VN")}đ
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                      <Calendar className="h-4 w-4 shrink-0 text-primary" />
                      <span>
                        HSD: {new Date(promo.enddate).toLocaleDateString("vi-VN")}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 transition-colors dark:border-white/10 dark:bg-white/5">
                      <div className="select-all truncate pl-1 font-mono text-sm font-bold uppercase tracking-wider text-slate-950 dark:text-white">
                        {code}
                      </div>
                      <button
                        onClick={() => handleCopy(code)}
                        className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-bold transition-all active:scale-95 ${
                          copiedCode === code
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-950 text-white hover:bg-primary hover:text-on-primary dark:bg-white dark:text-slate-950"
                        }`}
                      >
                        {copiedCode === code ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            Đã lưu
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            Sao chép
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white px-6 py-16 text-center dark:border-white/10 dark:bg-white/5">
            <AlertCircle className="mx-auto mb-3 h-12 w-12 text-slate-500" />
            <h3 className="mb-1 text-lg font-bold text-slate-950 dark:text-white">Chưa có khuyến mãi nào</h3>
            <p className="text-sm text-slate-400">
              Hiện tại các cơ sở chưa phát hành chương trình khuyến mãi nào. Hãy quay lại sau nhé!
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Promotions;
