import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { CreditCard, CheckCircle2, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { apiFetch } from "../../services/api";

const MockPayment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [method, setMethod] = useState("SePay");
  const paymentStatus = searchParams.get("status");
  const [bookingStatus, setBookingStatus] = useState(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!paymentStatus || !bookingId) return;

    let retryTimer;
    let cancelled = false;
    let attempts = 0;

    const checkStatus = async () => {
      setChecking(true);
      attempts += 1;
      try {
        const result = await apiFetch(`/payment/status/${bookingId}`);
        if (cancelled) return;
        setBookingStatus(result);
        const paid = result.bookingstatus === "Paid" || result.paymentstatus === "Paid";
        if (!paid && paymentStatus === "success" && attempts < 10) {
          retryTimer = window.setTimeout(checkStatus, 1500);
          return;
        }
      } catch {
        if (cancelled) return;
        setBookingStatus({ bookingstatus: "Pending" });
        if (paymentStatus === "success" && attempts < 10) {
          retryTimer = window.setTimeout(checkStatus, 1500);
          return;
        }
      }
      setChecking(false);
    };

    checkStatus();
    return () => {
      cancelled = true;
      window.clearTimeout(retryTimer);
    };
  }, [paymentStatus, bookingId]);

  const handlePayment = async () => {
    setLoading(true);
    try {
      if (method === "SePay") {
        const result = await apiFetch("/payment/sepay/checkout", {
          method: "POST",
          body: JSON.stringify({ bookingId }),
        });

        const checkoutForm = document.createElement("form");
        checkoutForm.method = "POST";
        checkoutForm.action = result.checkoutUrl;
        Object.entries(result.fields || {}).forEach(([name, value]) => {
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

  const goHome = () => navigate("/profile");

  const paymentConfirmed = bookingStatus?.bookingstatus === "Paid" || bookingStatus?.paymentstatus === "Paid";
  if (success || (paymentStatus === "success" && paymentConfirmed)) {
    const paid = success || paymentConfirmed;
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl animate-fade-in">
          <div className={`w-24 h-24 ${paid ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"} rounded-full flex items-center justify-center mx-auto mb-6 border ${paid ? "border-emerald-500/30" : "border-red-500/30"}`}>
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-2">{paid ? "Thanh toán thành công!" : "Thanh toán không thành công"}</h2>
          <p className="text-slate-300 mb-6">
            {paid
              ? "Cảm ơn bạn đã sử dụng dịch vụ. Hóa đơn của bạn đã được cập nhật."
              : "Giao dịch chưa hoàn tất. Bạn có thể thử lại hoặc thanh toán sau."}
          </p>
          <button
            onClick={goHome}
            className="w-full bg-primary hover:bg-[#C6D632] text-[#00272C] font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20"
          >
            {paid ? "Về trang Hồ sơ" : "Quay lại"}
          </button>
        </div>
      </div>
    );
  }

  const paymentFailed = paymentStatus === "failure" || paymentStatus === "cancel";
  const paymentSuccessReturn = paymentStatus === "success";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
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

        {paymentFailed && (
          <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-xs text-red-300">
            {paymentStatus === "cancel"
              ? "Bạn đã hủy giao dịch SePay. Đơn đặt sân vẫn đang chờ thanh toán."
              : "Thanh toán không thành công. Vui lòng thử lại hoặc chọn phương thức khác."}
          </div>
        )}

        {paymentSuccessReturn && checking && (
          <div className="mb-6 rounded-xl border border-blue-500/40 bg-blue-500/10 p-4 text-xs text-blue-300 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Đang xác nhận trạng thái thanh toán...
          </div>
        )}

        {(paymentSuccessReturn && !checking) && (
          <div className="mb-6 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs text-emerald-300">
            SePay đã chuyển hướng về hệ thống. Trạng thái chính thức được xác nhận bằng IPN.
          </div>
        )}

        <div className={`space-y-4 mb-8 ${(paymentSuccessReturn && checking) ? "opacity-50 pointer-events-none" : ""}`}>
          <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider block mb-2">
            Chọn phương thức thanh toán
          </label>

          <div
            onClick={() => setMethod("Demo")}
            className={`cursor-pointer p-4 rounded-xl border flex items-center gap-4 transition-all ${method === "Demo" ? "bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
          >
            <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-black text-xs">
              DEMO
            </div>
            <div className="flex-1">
              <h4 className="text-white font-bold">Thanh toán Demo</h4>
              <p className="text-xs text-slate-400">Hoàn tất ngay để kiểm tra luồng đặt sân</p>
            </div>
            {method === "Demo" && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          </div>

          <div
            onClick={() => setMethod("SePay")}
            className={`cursor-pointer p-4 rounded-xl border flex items-center gap-4 transition-all ${method === "SePay" ? "bg-blue-500/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
          >
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-black text-sm tracking-tighter">SEPAY</span>
            </div>
            <div className="flex-1">
              <h4 className="text-white font-bold">Thanh toán qua SePay</h4>
              <p className="text-xs text-slate-400">Mở trang SePay và quét mã QR ngân hàng</p>
            </div>
            {method === "SePay" && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3 mb-8">
          <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-300 leading-relaxed">
            SePay Sandbox sẽ hiển thị mã QR ở bước tiếp theo. Gói đặt sân chỉ được đánh dấu đã thanh toán sau khi IPN hợp lệ được gửi về hệ thống.
          </p>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading || (paymentSuccessReturn && checking)}
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
