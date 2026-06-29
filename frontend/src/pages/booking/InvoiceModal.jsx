import { Receipt, X, DollarSign } from "lucide-react";

const InvoiceModal = ({
  isOpen,
  onClose,
  invoiceData,
  paymentForm,
  setPaymentForm,
  onSubmit,
  processingPayment,
}) => {
  if (!isOpen || !invoiceData) return null;

  return (
    <div className="fixed inset-0 bg-[#00272C]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-fade-in overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="text-primary w-6 h-6" /> Hóa đơn thanh toán
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="text-center mb-6">
            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">
              Mã hóa đơn
            </p>
            <p className="text-2xl font-black text-slate-900">
              {invoiceData.invoicecode}
            </p>
            {invoiceData.paymentstatus === "Paid" ? (
              <span className="inline-block mt-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase border border-emerald-200">
                Đã thanh toán toàn bộ
              </span>
            ) : (
              <span className="inline-block mt-2 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase border border-amber-200">
                Chưa thanh toán đủ
              </span>
            )}
          </div>

          <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Tiền thuê sân</span>
              <span className="font-bold text-slate-900">
                {Number(invoiceData.courttotal).toLocaleString()}đ
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">
                Tiền dịch vụ (nước, vợt...)
              </span>
              <span className="font-bold text-slate-900">
                {Number(invoiceData.servicetotal).toLocaleString()}đ
              </span>
            </div>
            {Number(invoiceData.discountamount) > 0 && (
              <div className="flex justify-between items-center text-emerald-600">
                <span>Giảm giá</span>
                <span className="font-bold">
                  -{Number(invoiceData.discountamount).toLocaleString()}đ
                </span>
              </div>
            )}
            <div className="border-t border-slate-200 pt-3 mt-3 flex justify-between items-center">
              <span className="font-bold text-slate-900">Tổng cộng</span>
              <span className="text-xl font-black text-primary">
                {Number(invoiceData.totalamount).toLocaleString()}đ
              </span>
            </div>
            {Number(invoiceData.paidamount) > 0 && (
              <div className="flex justify-between items-center text-blue-600">
                <span>Đã thanh toán trước đó</span>
                <span className="font-bold">
                  {Number(invoiceData.paidamount).toLocaleString()}đ
                </span>
              </div>
            )}
            <div className="border-t border-slate-200 pt-3 mt-3 flex justify-between items-center">
              <span className="font-bold text-red-500">Số tiền cần thu</span>
              <span className="text-xl font-black text-red-500">
                {(
                  Number(invoiceData.totalamount) -
                  Number(invoiceData.paidamount || 0)
                ).toLocaleString()}
                đ
              </span>
            </div>
          </div>

          {invoiceData.paymentstatus !== "Paid" && (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 text-sm font-bold mb-1.5">
                    Hình thức TT
                  </label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        paymentMethod: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900"
                    required
                  >
                    <option value="Cash">Tiền mặt</option>
                    <option value="Transfer">Chuyển khoản</option>
                    <option value="Card">Quẹt thẻ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-bold mb-1.5">
                    Số tiền thu (VNĐ)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={paymentForm.amount}
                    onChange={(e) =>
                      setPaymentForm({
                        ...paymentForm,
                        amount: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900 font-bold"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-bold mb-1.5">
                  Ghi chú (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={paymentForm.note}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, note: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900"
                  placeholder="Nhập ghi chú thanh toán..."
                />
              </div>

              <button
                type="submit"
                disabled={processingPayment}
                className={`w-full py-3.5 rounded-xl font-bold text-base transition-colors shadow-lg flex items-center justify-center gap-2 mt-2 ${processingPayment ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" : "bg-primary text-[#00272C] hover:bg-[#C6D632] shadow-[0_0_15px_rgba(225,255,81,0.3)]"}`}
              >
                <DollarSign className="w-5 h-5" />{" "}
                {processingPayment ? "Đang xử lý..." : "Xác nhận thu tiền"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
export default InvoiceModal;
