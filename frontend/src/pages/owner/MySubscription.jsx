import { useState, useEffect } from "react";
import { CreditCard, Crown, CheckCircle2, Clock, ShieldAlert, ArrowRight, Loader2, Zap } from "lucide-react";
import { apiFetch } from "../../services/api";
import useAuthStore from "../../store/useAuthStore";

const MySubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [billingCycle, setBillingCycle] = useState("Monthly");

  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subData, plansData] = await Promise.all([
          apiFetch("/plans/my-subscription"),
          apiFetch("/plans")
        ]);
        setSubscription(subData.subscription);
        setPlans(plansData.plans || []);
      } catch (err) {
        console.error("Lỗi lấy dữ liệu gói:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubscribe = async () => {
    if (!selectedPlanId) return alert("Vui lòng chọn một gói dịch vụ!");
    setProcessing(true);
    try {
      const result = await apiFetch("/plans/subscribe", {
        method: "POST",
        body: JSON.stringify({
          planId: selectedPlanId,
          billingCycle: billingCycle,
          paymentMethod: "VNPay", // Mock
          autoRenew: false
        })
      });
      alert(result.message);
      window.location.reload();
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
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <Crown className="w-8 h-8 text-amber-500" /> Quản lý Gói dịch vụ
        </h1>
        <p className="text-slate-500 mt-2">Theo dõi và gia hạn gói dịch vụ kinh doanh của bạn trên hệ thống.</p>
      </div>

      {/* Tình trạng gói hiện tại */}
      <div className={`p-6 rounded-3xl border mb-10 shadow-sm relative overflow-hidden ${isActive ? "bg-gradient-to-br from-[#00272C] to-[#1a2c42] border-[#00272C]" : "bg-white border-red-200"}`}>
        {isActive && <div className="absolute -right-4 -bottom-4 opacity-10"><Crown className="w-48 h-48 text-white" /></div>}
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
          <div>
            <h2 className={`text-sm font-bold uppercase tracking-wider mb-2 ${isActive ? "text-primary" : "text-red-500"}`}>
              {isActive ? "Gói Đang Kích Hoạt" : isExpired ? "Gói Đã Hết Hạn" : "Chưa Đăng Ký Gói Nào"}
            </h2>
            <div className="flex items-center gap-4">
              <span className={`text-4xl font-black ${isActive ? "text-white" : "text-slate-900"}`}>
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
          <h2 className="text-2xl font-extrabold text-slate-900">Bảng giá Gói Dịch Vụ</h2>
          <p className="text-slate-500 mt-2">Chọn chu kỳ thanh toán để được nhận ưu đãi tốt nhất</p>
          
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
                className={`cursor-pointer bg-white rounded-3xl p-6 border-2 transition-all relative overflow-hidden ${isSelected ? "border-[#00272C] shadow-xl shadow-[#00272C]/10 scale-105" : "border-slate-100 hover:border-slate-300 hover:shadow-md"}`}
              >
                {isSelected && <div className="absolute top-0 right-0 bg-[#00272C] text-primary text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-xl">Đang chọn</div>}
                
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">{plan.planname}</h3>
                <p className="text-slate-500 text-sm mb-4 h-10">{plan.description || "Phù hợp cho cơ sở kinh doanh " + plan.planname.toLowerCase()}</p>
                
                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">{price.toLocaleString('vi-VN')}đ</span>
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

      {/* Checkout Mock */}
      {selectedPlanId && (
        <div className="mt-12 bg-[#00272C] p-6 md:p-8 rounded-3xl border border-[#1a2c42] shadow-2xl text-white flex flex-col md:flex-row items-center justify-between gap-6 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-10 pointer-events-none"></div>
          
          <div>
            <h3 className="text-xl font-extrabold mb-2 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-primary" /> Thanh Toán & Kích Hoạt
            </h3>
            <p className="text-slate-400 text-sm max-w-md">
              Bạn đang chọn đăng ký Gói dịch vụ. Bằng việc nhấn thanh toán, hệ thống sẽ thực hiện giao dịch Mock (giả lập) qua VNPay và kích hoạt tự động.
            </p>
          </div>
          <button 
            onClick={handleSubscribe}
            disabled={processing}
            className="w-full md:w-auto px-8 py-4 bg-primary text-[#00272C] rounded-xl font-black text-lg hover:bg-[#C6D632] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shrink-0 relative z-10"
          >
            {processing ? <><Loader2 className="w-5 h-5 animate-spin" /> Đang xử lý...</> : "Thanh Toán Ngay"}
          </button>
        </div>
      )}
    </div>
  );
};

export default MySubscription;
