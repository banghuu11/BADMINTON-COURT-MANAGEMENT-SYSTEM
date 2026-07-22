import { useState, useEffect } from "react";
import { CreditCard, Crown, CheckCircle2, Clock, ShieldAlert, ArrowRight, Loader2, Zap, X, FileText } from "lucide-react";
import { apiFetch } from "../../services/api";

const MySubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [billingCycle, setBillingCycle] = useState("Monthly");
  
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("SePay");

  const paymentResult = new URLSearchParams(window.location.search).get("payment");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subData, plansData, invData] = await Promise.all([
          apiFetch("/plans/my-subscription"),
          apiFetch("/plans"),
          apiFetch("/plans/my-invoices")
        ]);
        setSubscription(subData.subscription);
        setPlans(plansData.plans || []);
        setInvoices(invData.invoices || []);
      } catch (err) {
        console.error("Lỗi lấy dữ liệu gói:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleConfirmPayment = async () => {
    if (!selectedPlanId) return alert("Vui lòng chọn một gói dịch vụ!");
    setProcessing(true);
    try {
      if (paymentMethod === "SePay") {
        const res = await apiFetch("/plans/sepay/checkout", {
          method: "POST",
          body: JSON.stringify({
            planId: selectedPlanId,
            billingCycle,
            autoRenew: false,
          }),
        });

        const checkoutForm = document.createElement("form");
        checkoutForm.method = "POST";
        checkoutForm.action = res.checkoutUrl;

        Object.entries(res.fields || {}).forEach(([name, value]) => {
          if (value === null || value === undefined) return;
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = name;
          input.value = String(value);
          checkoutForm.appendChild(input);
        });

        document.body.appendChild(checkoutForm);
        checkoutForm.submit();
        return;
      }

      if (paymentMethod === "Momo") {
        // Call backend to create MoMo QR
        const res = await apiFetch("/plans/create-momo-qr", {
          method: "POST",
          body: JSON.stringify({
            planId: selectedPlanId,
            billingCycle: billingCycle
          })
        });
        if (res.payUrl) {
          window.location.href = res.payUrl;
          return; // Stop here, redirecting
        }
      }
      throw new Error("Phương thức thanh toán chưa được hỗ trợ.");
    } catch (err) {
      alert(err.message || "Lỗi thanh toán gói dịch vụ.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const isActive = subscription && subscription.status === "Active" && new Date(subscription.enddate) >= new Date();
  const isExpired = subscription && (subscription.status === "Expired" || new Date(subscription.enddate) < new Date());
  
  let daysLeft = 0;
  if (isActive) {
    const end = new Date(subscription.enddate);
    const now = new Date();
    end.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
    daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-8 animate-fade-in pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Crown className="w-8 h-8 text-amber-500" /> Quản lý Gói dịch vụ
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Theo dõi và gia hạn gói dịch vụ kinh doanh của bạn trên hệ thống.</p>
      </div>

      {paymentResult && (
        <div className={`mb-6 rounded-2xl border p-4 text-sm font-semibold ${
          paymentResult === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300"
            : paymentResult === "cancel"
              ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
        }`}>
          {paymentResult === "success"
            ? "Đã quay lại từ SePay. Hệ thống sẽ kích hoạt gói sau khi nhận xác nhận thanh toán từ SePay; vui lòng tải lại trang sau vài giây."
            : paymentResult === "cancel"
              ? "Bạn đã hủy giao dịch SePay. Gói hiện tại không bị thay đổi."
              : "Giao dịch SePay chưa hoàn tất. Vui lòng thử lại hoặc chọn phương thức khác."}
        </div>
      )}

      {/* Tình trạng gói hiện tại */}
      <div className={`p-6 rounded-3xl border mb-10 shadow-sm relative overflow-hidden ${isActive ? "bg-gradient-to-br from-[#00272C] to-[#1a2c42] border-[#00272C]" : "bg-white border-red-200 dark:bg-white/5 dark:border-red-500/30"}`}>
        {isActive && <div className="absolute -right-4 -bottom-4 opacity-10"><Crown className="w-48 h-48 text-white" /></div>}
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
          <div>
            <h2 className={`text-sm font-bold uppercase tracking-wider mb-2 ${isActive ? "text-primary" : "text-red-500"}`}>
              {isActive ? "Gói Đang Kích Hoạt" : isExpired ? "Gói Đã Hết Hạn" : "Chưa Đăng Ký Gói Nào"}
            </h2>
            <div className="flex items-center gap-4">
              <span className={`text-4xl font-black ${isActive ? "text-white" : "text-slate-900 dark:text-white"}`}>
                {subscription ? subscription.planname : "Gói Mặc Định (Free)"}
              </span>
              {isActive && (
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Đang hoạt động
                </span>
              )}
              {isExpired && (
                <span className="px-3 py-1 bg-red-100 text-red-600 border border-red-200 rounded-full text-xs font-bold flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4" /> Đã hết hạn
                </span>
              )}
            </div>
            {subscription && (
              <p className={`mt-3 flex items-center gap-2 ${isActive ? "text-slate-300" : "text-slate-600"}`}>
                <Clock className="w-4 h-4" /> Hết hạn vào: <strong>{new Date(subscription.enddate).toLocaleDateString('vi-VN')}</strong> 
                {isActive && <span className="ml-2 text-primary">({daysLeft} ngày nữa)</span>}
              </p>
            )}
          </div>
          
          <div className="text-right">
            {!isActive && (
              <p className="text-sm text-red-500 font-medium max-w-xs mb-3">Tài khoản của bạn đang bị giới hạn tính năng. Vui lòng gia hạn để tiếp tục.</p>
            )}
            <a href="#plans" className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${isActive ? "bg-primary text-[#00272C] hover:bg-[#C6D632] shadow-primary/20" : "bg-red-500 text-white hover:bg-red-600 shadow-red-500/20"}`}>
              {isActive ? "Gia hạn / Nâng cấp" : "Đăng ký gói ngay"} <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Bảng giá */}
      <div id="plans" className="scroll-mt-24">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Bảng giá Gói Dịch Vụ</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Chọn chu kỳ thanh toán để được nhận ưu đãi tốt nhất</p>
          
          <div className="inline-flex bg-slate-100 p-1 rounded-full mt-6">
            <button 
              onClick={() => setBillingCycle("Monthly")}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${billingCycle === "Monthly" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
            >
              Thanh toán Tháng
            </button>
            <button 
              onClick={() => setBillingCycle("Yearly")}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all flex items-center gap-1 ${billingCycle === "Yearly" ? "bg-primary text-[#00272C] shadow-sm" : "text-slate-500"}`}
            >
              Thanh toán Năm <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-md ml-1">Giảm 10%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isSelected = selectedPlanId === plan.planid;
            const price = billingCycle === "Yearly" ? Number(plan.pricepercycle) * 12 * 0.9 : Number(plan.pricepercycle);
            
            return (
              <div 
                key={plan.planid}
                onClick={() => setSelectedPlanId(plan.planid)}
                className={`cursor-pointer bg-white rounded-3xl p-6 border-2 transition-all relative overflow-hidden dark:bg-white/5 ${isSelected ? "border-[#00272C] dark:border-primary shadow-xl shadow-[#00272C]/10 scale-105" : "border-slate-100 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-md"}`}
              >
                {isSelected && <div className="absolute top-0 right-0 bg-[#00272C] text-primary text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl">Đang chọn</div>}
                
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">{plan.planname}</h3>
                <p className="text-slate-500 text-sm mb-4 h-10">{plan.description || "Phù hợp cho cơ sở kinh doanh " + plan.planname.toLowerCase()}</p>
                
                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">{price.toLocaleString('vi-VN')}đ</span>
                  <span className="text-sm font-bold text-slate-500">/{billingCycle === "Yearly" ? "Năm" : "Tháng"}</span>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Tối đa {plan.maxvenues} cơ sở
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {plan.maxcourtspervenue} sân / cơ sở
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Tối đa {plan.maxstaff} nhân viên
                  </div>
                  {plan.hasadvancedreport && (
                    <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
                      <Zap className="w-4 h-4 text-amber-500" /> Báo cáo doanh thu nâng cao
                    </div>
                  )}
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPlanId(plan.planid);
                    // Scroll to checkout
                    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                  }}
                  className={`w-full py-3 rounded-xl font-bold transition-colors ${isSelected ? "bg-[#00272C] text-primary" : "bg-slate-100 text-slate-700"}`}
                >
                  {isSelected ? "Đã Chọn" : "Chọn Gói Này"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Checkout */}
      {selectedPlanId && (
        <div className="mt-12 bg-[#00272C] p-6 md:p-8 rounded-3xl border border-[#1a2c42] shadow-2xl text-white flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-10 pointer-events-none"></div>
          
          <div>
            <h3 className="text-xl font-extrabold mb-2 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-primary" /> Thanh Toán & Kích Hoạt
            </h3>
            <p className="text-slate-400 text-sm max-w-md">
              Bạn đang chọn đăng ký Gói dịch vụ. Gói mới chỉ được kích hoạt sau khi SePay xác nhận giao dịch thành công.
            </p>
          </div>
          <button 
            onClick={() => setShowCheckoutModal(true)}
            className="w-full md:w-auto px-8 py-4 bg-primary text-[#00272C] rounded-xl font-black text-lg hover:bg-[#C6D632] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 shrink-0 relative z-10"
          >
            Tiếp Tục Thanh Toán <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Lịch sử giao dịch */}
      {invoices.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" /> Lịch sử Thanh Toán Gói
          </h2>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden dark:bg-white/5 dark:border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                    <th className="py-4 px-6 font-bold">Mã Giao dịch</th>
                    <th className="py-4 px-6 font-bold">Gói Dịch vụ</th>
                    <th className="py-4 px-6 font-bold">Chu kỳ</th>
                    <th className="py-4 px-6 font-bold">Số tiền</th>
                    <th className="py-4 px-6 font-bold">Phương thức</th>
                    <th className="py-4 px-6 font-bold">Ngày TT</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.invoiceid} className="border-b border-slate-100 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5">
                      <td className="py-4 px-6 font-bold text-slate-900 dark:text-white uppercase text-xs">{inv.invoicecode}</td>
                      <td className="py-4 px-6 font-bold text-[#00272C] uppercase text-xs">{inv.planname}</td>
                      <td className="py-4 px-6 text-slate-600 font-medium text-sm">{inv.billingcycle === 'Yearly' ? 'Năm' : 'Tháng'}</td>
                      <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">{Number(inv.amount).toLocaleString('vi-VN')}đ</td>
                      <td className="py-4 px-6 text-slate-600 font-medium text-sm">{inv.paymentmethod}</td>
                      <td className="py-4 px-6 text-slate-500 text-sm">{new Date(inv.paidat).toLocaleString('vi-VN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-[#00272C]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-transparent dark:border-white/10">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Thanh toán Gói</h3>
                  <button onClick={() => setShowCheckoutModal(false)} className="text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 p-2 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div 
                    onClick={() => setPaymentMethod("SePay")}
                    className={`cursor-pointer p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${paymentMethod === "SePay" ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10" : "border-slate-100 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/30"}`}
                  >
                    <div className="w-12 h-12 bg-white border border-slate-100 rounded-lg flex items-center justify-center shadow-sm">
                      <span className="text-blue-600 font-black text-sm">SEPAY</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-white">Thanh toán qua SePay</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Chuyển khoản ngân hàng qua SePay Sandbox</p>
                    </div>
                    {paymentMethod === "SePay" && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
                  </div>

                  <div 
                    onClick={() => setPaymentMethod("Momo")}
                    className={`cursor-pointer p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${paymentMethod === "Momo" ? "border-pink-500 bg-pink-50 dark:bg-pink-500/10" : "border-slate-100 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/30"}`}
                  >
                    <div className="w-12 h-12 bg-[#a50064] rounded-lg flex items-center justify-center shadow-sm">
                      <span className="text-white font-bold text-xs">MOMO</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-white">Thanh toán qua MoMo</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Ví điện tử MoMo</p>
                    </div>
                    {paymentMethod === "Momo" && <CheckCircle2 className="w-5 h-5 text-pink-500" />}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 mb-6">
                  <p className="text-xs text-amber-800 leading-relaxed font-medium">
                    * Lưu ý: Khi nâng cấp gói, thời gian sẽ được tính ngay từ hôm nay. Gói cũ sẽ được tự động chuyển đổi.
                  </p>
                </div>

                <button 
                  onClick={handleConfirmPayment}
                  disabled={processing}
                  className="w-full py-4 bg-[#00272C] text-primary rounded-xl font-black text-lg hover:bg-[#003840] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00272C]/20 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {processing ? <><Loader2 className="w-5 h-5 animate-spin" /> Đang xử lý...</> : "Xác Nhận & Thanh Toán"}
                </button>
              </div>
            </div>
          </div>
      )}
    </div>
  );
};

export default MySubscription;
