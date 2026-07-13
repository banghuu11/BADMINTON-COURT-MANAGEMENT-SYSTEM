import { Receipt, X, DollarSign, Printer } from "lucide-react";
import { useEffect, useState } from "react";

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

  const { invoice, slots = [], services = [] } = invoiceData.invoice ? invoiceData : { invoice: invoiceData };
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const amountToPay = Number(invoice.totalamount) - Number(invoice.paidamount || 0);

  // Generate VietQR URL
  const qrUrl = (invoice.bankname && invoice.bankaccount) 
    ? `https://img.vietqr.io/image/${invoice.bankname}-${invoice.bankaccount}-compact2.png?amount=${amountToPay}&addInfo=${invoice.invoicecode}&accountName=${encodeURIComponent(invoice.bankowner || "")}`
    : null;

  return (
    <div className="fixed inset-0 bg-[#00272C]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:p-0 print:bg-white print:static print:h-auto print:block">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl animate-fade-in overflow-hidden flex flex-col md:flex-row max-h-[90vh] print:shadow-none print:max-h-none print:w-full print:rounded-none">
        
        {/* === RECEIPT SECTION (Left) - This will be printed === */}
        <div className="w-full md:w-1/2 p-8 border-r border-slate-100 overflow-y-auto bg-slate-50 print:bg-white print:w-full print:overflow-visible print:border-none print:p-0" id="print-area">
          <div className="text-center mb-6">
            <h2 className="text-xl font-black text-slate-900 mb-1">{invoice.venuename || "SÂN CẦU LÔNG"}</h2>
            <p className="text-sm text-slate-600">{invoice.venueaddress || "Địa chỉ"}</p>
            <p className="text-sm text-slate-600">SĐT: {invoice.venuephone || "N/A"}</p>
            <div className="my-4 border-b-2 border-dashed border-slate-300"></div>
            <h3 className="text-lg font-bold text-slate-900">HÓA ĐƠN THANH TOÁN</h3>
            <p className="text-xs text-slate-500">Mã: {invoice.invoicecode}</p>
            <p className="text-xs text-slate-500">Ngày: {new Date(invoice.createdat || new Date()).toLocaleString('vi-VN')}</p>
          </div>

          <div className="mb-4 text-sm text-slate-900">
            <p><strong>Khách hàng:</strong> {invoice.customername || invoice.guestname || "Khách lẻ"}</p>
            <p><strong>SĐT:</strong> {invoice.customerphone || invoice.guestphone || "N/A"}</p>
          </div>

          <div className="my-4 border-b-2 border-dashed border-slate-300"></div>

          {/* Slots */}
          <div className="mb-4">
            <h4 className="text-sm font-bold text-slate-900 mb-2">Chi tiết thuê sân</h4>
            <div className="space-y-2">
              {slots.map((s, idx) => (
                <div key={idx} className="text-sm flex justify-between">
                  <div>
                    <span className="font-medium text-slate-800">{s.courtname}</span>
                    <p className="text-xs text-slate-500">{new Date(s.playdate).toLocaleDateString('vi-VN')} ({s.starttime.slice(0,5)} - {s.endtime.slice(0,5)})</p>
                  </div>
                  <span className="font-bold text-slate-900">{Number(s.appliedprice).toLocaleString()}đ</span>
                </div>
              ))}
              {slots.length === 0 && <p className="text-xs text-slate-500 italic">Không có sân nào</p>}
            </div>
          </div>

          {/* Services */}
          {services.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-bold text-slate-900 mb-2">Dịch vụ</h4>
              <div className="space-y-2">
                {services.map((s, idx) => (
                  <div key={idx} className="text-sm flex justify-between">
                    <div>
                      <span className="font-medium text-slate-800">{s.servicename}</span>
                      <p className="text-xs text-slate-500">{s.quantity} x {Number(s.unitprice).toLocaleString()}đ</p>
                    </div>
                    <span className="font-bold text-slate-900">{Number(s.totalprice).toLocaleString()}đ</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="my-4 border-b-2 border-dashed border-slate-300"></div>

          <div className="space-y-2 text-sm text-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-600">Tổng tiền sân:</span>
              <span>{Number(invoice.courttotal).toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Tổng dịch vụ:</span>
              <span>{Number(invoice.servicetotal).toLocaleString()}đ</span>
            </div>
            {Number(invoice.discountamount) > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Giảm giá:</span>
                <span>-{Number(invoice.discountamount).toLocaleString()}đ</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-black mt-2 pt-2 border-t border-slate-200">
              <span className="text-slate-900">TỔNG CỘNG:</span>
              <span className="text-slate-900">{Number(invoice.totalamount).toLocaleString()}đ</span>
            </div>
            {Number(invoice.paidamount) > 0 && (
              <div className="flex justify-between text-blue-600 mt-1">
                <span>Đã thanh toán:</span>
                <span>-{Number(invoice.paidamount).toLocaleString()}đ</span>
              </div>
            )}
          </div>

          <div className="my-4 border-b-2 border-dashed border-slate-300"></div>

          {/* QR Code section for printing */}
          <div className="text-center mt-6">
            <p className="text-sm font-bold text-slate-900 mb-2">QUÉT MÃ ĐỂ THANH TOÁN</p>
            {qrUrl ? (
              <img src={qrUrl} alt="VietQR" className="mx-auto w-48 h-48 object-contain rounded-lg border border-slate-200 p-2" crossOrigin="anonymous" />
            ) : (
              <p className="text-xs text-slate-500 italic">(Chưa cấu hình tài khoản ngân hàng)</p>
            )}
            <p className="text-xs text-slate-500 mt-2">Cảm ơn quý khách và hẹn gặp lại!</p>
          </div>
        </div>

        {/* === ACTION SECTION (Right) - Hidden on print === */}
        <div className="w-full md:w-1/2 flex flex-col print:hidden bg-white">
          <div className="flex justify-between items-center p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="text-primary w-6 h-6" /> Thanh Toán
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 flex-1 overflow-y-auto">
            {invoice.paymentstatus === "Paid" ? (
              <div className="text-center bg-emerald-50 text-emerald-700 p-6 rounded-2xl border border-emerald-100 mb-6">
                <p className="font-bold text-lg mb-1">Đã thanh toán toàn bộ</p>
                <p className="text-sm">Hóa đơn này đã được thanh toán đủ.</p>
              </div>
            ) : (
              <>
                <div className="bg-red-50 text-red-700 p-4 rounded-2xl border border-red-100 mb-6 text-center">
                  <p className="text-sm font-bold mb-1">SỐ TIỀN CẦN THU</p>
                  <p className="text-3xl font-black">{amountToPay.toLocaleString()}đ</p>
                </div>

                <form onSubmit={onSubmit} className="space-y-4 mb-6">
                  <div>
                    <label className="block text-slate-700 text-sm font-bold mb-1.5">Hình thức thanh toán</label>
                    <select
                      value={paymentForm.paymentMethod}
                      onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900 font-medium"
                      required
                    >
                      <option value="Cash">Tiền mặt</option>
                      <option value="Transfer">Chuyển khoản</option>
                      <option value="Card">Quẹt thẻ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm font-bold mb-1.5">Số tiền khách đưa (VNĐ)</label>
                    <input
                      type="number"
                      min="1"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900 font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 text-sm font-bold mb-1.5">Ghi chú (Tùy chọn)</label>
                    <input
                      type="text"
                      value={paymentForm.note}
                      onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900"
                      placeholder="Ghi chú thanh toán..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={processingPayment}
                    className={`w-full py-3.5 rounded-xl font-bold text-base transition-colors shadow-lg flex items-center justify-center gap-2 mt-4 ${processingPayment ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" : "bg-primary text-[#00272C] hover:bg-[#C6D632] shadow-[0_0_15px_rgba(225,255,81,0.3)]"}`}
                  >
                    <DollarSign className="w-5 h-5" /> {processingPayment ? "Đang xử lý..." : "Xác nhận thu tiền"}
                  </button>
                </form>
              </>
            )}

            <div className="border-t border-slate-100 pt-6">
              <button
                onClick={handlePrint}
                type="button"
                className="w-full py-3.5 rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                <Printer className="w-5 h-5" /> In Hóa Đơn (Print Bill)
              </button>
              <p className="text-xs text-center text-slate-400 mt-2">Tính năng in sẽ ẩn giao diện này và chỉ in phần biên lai.</p>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            height: auto !important;
            background: white !important;
            padding: 20px !important;
          }
        }
      `}} />
    </div>
  );
};

export default InvoiceModal;
