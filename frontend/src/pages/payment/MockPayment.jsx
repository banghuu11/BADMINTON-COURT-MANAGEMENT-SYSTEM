import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CreditCard, CheckCircle2, ArrowRight, Loader2, ShieldCheck, QrCode } from "lucide-react";
import { apiFetch } from "../../services/api";

const MockPayment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [method, setMethod] = useState("VNPay");

  const handlePayment = async () => {
    setLoading(true);
    try {
      await apiFetch("/payment/mock-pay", {
        method: "POST",
        body: JSON.stringify({ bookingId, method }),
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/profile");
      }, 3000);
    } catch (err) {
      alert(err.message || "Có lỗi xảy ra khi thanh toán.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl animate-fade-in">
          <div className="w-24 h-24 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-2">Thanh toán thành công!</h2>
          <p className="text-slate-300 mb-6">Cảm ơn bạn đã sử dụng dịch vụ. Hóa đơn của bạn đã được cập nhật.</p>
          <p className="text-sm text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Đang chuyển hướng về Hồ sơ...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl max-w-md w-full shadow-2xl z-10 relative">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/30">
            <CreditCard className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Cổng Thanh Toán</h2>
          <p className="text-slate-400 text-sm mt-1">Đơn hàng: #{bookingId}</p>
        </div>

        <div className="space-y-4 mb-8">
          <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider block mb-2">
            Chọn phương thức thanh toán
          </label>
          
          <div 
            onClick={() => setMethod("VNPay")}
            className={`cursor-pointer p-4 rounded-xl border flex items-center gap-4 transition-all ${method === "VNPay" ? "bg-blue-500/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
          >
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-black text-xl tracking-tighter">VNPAY</span>
            </div>
            <div className="flex-1">
              <h4 className="text-white font-bold">Thanh toán qua VNPAY</h4>
              <p className="text-xs text-slate-400">Quét mã QR qua ứng dụng ngân hàng</p>
            </div>
            {method === "VNPay" && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
          </div>

          <div 
            onClick={() => setMethod("Momo")}
            className={`cursor-pointer p-4 rounded-xl border flex items-center gap-4 transition-all ${method === "Momo" ? "bg-pink-500/10 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.2)]" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
          >
            <div className="w-12 h-12 bg-[#a50064] rounded-lg flex items-center justify-center">
              <QrCode className="text-white w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-bold">Thanh toán qua MoMo</h4>
              <p className="text-xs text-slate-400">Ví điện tử MoMo</p>
            </div>
            {method === "Momo" && <CheckCircle2 className="w-5 h-5 text-pink-500" />}
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3 mb-8">
          <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-300 leading-relaxed">
            Đây là môi trường thanh toán <strong>Mock (Giả lập)</strong> dành cho đồ án môn học. Giao dịch này sẽ không trừ tiền thật của bạn.
          </p>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-primary hover:bg-[#C6D632] text-[#00272C] font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Xác nhận thanh toán <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <button
          onClick={() => navigate("/profile")}
          className="w-full mt-4 text-slate-400 hover:text-white font-medium text-sm transition-colors py-2"
        >
          Thanh toán sau (Tới Hồ sơ)
        </button>
      </div>
    </div>
  );
};

export default MockPayment;
