import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../../services/api";
import { MapPin } from "lucide-react";

const PrintableInvoice = () => {
  const { invoiceId } = useParams();
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const data = await apiFetch(`/invoices/${invoiceId}/details`);
        setInvoiceData(data);
        
        // Đợi một chút để render xong rồi in
        setTimeout(() => {
          window.print();
        }, 1000);
      } catch (err) {
        setError(err.message || "Không thể tải hóa đơn.");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [invoiceId]);

  if (loading) return <div className="p-10 text-center font-bold">Đang tải hóa đơn...</div>;
  if (error) return <div className="p-10 text-center text-red-500 font-bold">{error}</div>;
  if (!invoiceData || !invoiceData.invoice) return <div className="p-10 text-center">Không tìm thấy hóa đơn.</div>;

  const { invoice, slots = [], services = [] } = invoiceData;

  const qrAmount = Number(invoice.totalamount) - Number(invoice.paidamount || 0);
  const qrBankName = invoice.bankname || "MB"; 
  const qrBankAccount = invoice.bankaccount || "";
  const qrBankOwner = invoice.bankowner || "COURTLINK";
  const qrUrl = qrBankAccount 
    ? `https://img.vietqr.io/image/${qrBankName}-${qrBankAccount}-compact2.png?amount=${qrAmount}&addInfo=Thanh toan hoa don ${invoice.invoicecode}&accountName=${encodeURIComponent(qrBankOwner)}`
    : null;

  return (
    <div className="bg-white min-h-screen text-slate-900 font-sans print:p-0 p-8 flex justify-center">
      <div className="w-full max-w-[80mm] print:max-w-full mx-auto p-4 border border-slate-200 rounded-xl print:border-none print:p-0">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center items-center gap-1 mb-2">
            <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black">
              C
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase">CourtLink</h1>
          </div>
          <h2 className="text-base font-bold uppercase">{invoice.venuename || "Hệ Thống Sân"}</h2>
          <div className="text-xs text-slate-500 mt-1 flex flex-col items-center gap-0.5">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {invoice.venueaddress || "Địa chỉ"}</span>
          </div>
        </div>

        <div className="text-center border-y border-dashed border-slate-300 py-3 mb-6">
          <h3 className="font-bold uppercase text-lg mb-1">Phiếu Thanh Toán</h3>
          <p className="text-xs text-slate-500">Mã: {invoice.invoicecode}</p>
          <p className="text-xs text-slate-500">Ngày: {new Date().toLocaleDateString('vi-VN')}</p>
        </div>

        {/* Customer Info */}
        <div className="mb-4 text-sm">
          <p><span className="font-bold">Khách hàng:</span> {invoice.customername || "Khách vãng lai"}</p>
        </div>

        {/* Items */}
        <div className="mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 font-bold">Mặt hàng</th>
                <th className="text-right py-2 font-bold">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot, idx) => (
                <tr key={idx}>
                  <td className="py-2">
                    <div className="font-bold">Thuê sân ({slot.courtname})</div>
                    <div className="text-xs text-slate-500">{slot.starttime?.slice(0, 5)} - {slot.endtime?.slice(0, 5)}</div>
                  </td>
                  <td className="text-right py-2 font-medium">
                    {Number(slot.appliedprice * (slot.durationminutes / 60)).toLocaleString()}đ
                  </td>
                </tr>
              ))}
              
              {services.map((svc, idx) => (
                <tr key={`svc-${idx}`}>
                  <td className="py-2">
                    <div className="font-bold">{svc.servicename} x {svc.quantity}</div>
                  </td>
                  <td className="text-right py-2 font-medium">
                    {Number(svc.totalprice).toLocaleString()}đ
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t border-dashed border-slate-300 pt-3 mb-6 text-sm">
          {Number(invoice.discountamount) > 0 && (
            <div className="flex justify-between mb-1">
              <span>Giảm giá</span>
              <span>-{Number(invoice.discountamount).toLocaleString()}đ</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base mt-2">
            <span>Tổng cộng</span>
            <span>{Number(invoice.totalamount).toLocaleString()}đ</span>
          </div>
          {Number(invoice.paidamount) > 0 && (
            <div className="flex justify-between mt-1 text-slate-600">
              <span>Đã thanh toán</span>
              <span>{Number(invoice.paidamount).toLocaleString()}đ</span>
            </div>
          )}
          <div className="flex justify-between font-black text-lg mt-2 border-t border-slate-800 pt-2">
            <span>Cần thanh toán</span>
            <span>{qrAmount.toLocaleString()}đ</span>
          </div>
        </div>

        {/* QR Code */}
        {qrAmount > 0 ? (
          qrUrl ? (
            <div className="text-center mt-6 mb-4">
              <p className="text-xs font-bold uppercase mb-2">Quét mã để thanh toán</p>
              <img src={qrUrl} alt="QR Code" className="w-48 h-48 mx-auto" />
              <p className="text-xs text-slate-500 mt-2">Ngân hàng: {qrBankName}</p>
              <p className="text-xs text-slate-500">STK: {qrBankAccount}</p>
              <p className="text-xs text-slate-500">CTK: {qrBankOwner}</p>
            </div>
          ) : (
             <div className="text-center mt-6 mb-4 border border-slate-200 p-4 rounded-xl">
               <p className="text-xs font-bold uppercase mb-2 text-slate-500">Thanh toán tiền mặt</p>
               <p className="text-xs text-slate-400">Cơ sở chưa cung cấp tài khoản ngân hàng</p>
             </div>
          )
        ) : (
          <div className="text-center mt-6 mb-4">
            <p className="font-bold text-lg uppercase border border-slate-800 rounded-full inline-block px-4 py-1">Đã Thanh Toán</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-slate-500">
          <p>Cảm ơn quý khách và hẹn gặp lại!</p>
          <p className="mt-1 font-bold italic">Powered by CourtLink</p>
        </div>
      </div>
      
      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
          }
          .print-hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintableInvoice;
