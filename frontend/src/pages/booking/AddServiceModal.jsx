import { Coffee, X, Plus } from "lucide-react";

const AddServiceModal = ({
  isOpen,
  onClose,
  slot,
  venueServices,
  serviceForm,
  setServiceForm,
  onSubmit,
  addingService,
}) => {
  if (!isOpen || !slot) return null;

  return (
    <div className="fixed inset-0 bg-[#00272C]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Coffee className="text-primary w-6 h-6" /> Thêm Dịch Vụ
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
          <p className="text-sm text-slate-500 mb-1">Đang thêm cho đơn:</p>
          <p className="font-bold text-slate-900">
            {slot.courtname} - {slot.customername || slot.guestname}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-700 text-sm font-bold mb-1.5">
              Chọn sản phẩm/dịch vụ
            </label>
            <select
              value={serviceForm.serviceId}
              onChange={(e) =>
                setServiceForm({ ...serviceForm, serviceId: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900"
              required
            >
              <option value="" disabled>
                -- Chọn sản phẩm --
              </option>
              {venueServices.map((s) => (
                <option
                  key={s.serviceid}
                  value={s.serviceid}
                  disabled={s.stockquantity <= 0}
                >
                  {s.servicename} ({Number(s.unitprice).toLocaleString()}đ){" "}
                  {s.stockquantity <= 0
                    ? "- Hết hàng"
                    : `- Còn ${s.stockquantity}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-bold mb-1.5">
              Số lượng
            </label>
            <input
              type="number"
              min="1"
              value={serviceForm.quantity}
              onChange={(e) =>
                setServiceForm({
                  ...serviceForm,
                  quantity: parseInt(e.target.value) || 1,
                })
              }
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900"
              required
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 bg-slate-200 hover:bg-slate-300 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={addingService}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm text-[#00272C] bg-primary hover:bg-[#C6D632] transition-colors shadow-lg shadow-primary/20 flex items-center gap-2 ${addingService ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Plus className="w-4 h-4" />{" "}
              {addingService ? "Đang thêm..." : "Thêm vào đơn"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddServiceModal;
