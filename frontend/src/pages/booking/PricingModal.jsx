import { DollarSign, X, Check } from "lucide-react";

const PricingModal = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  saving,
}) => {
  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="fixed inset-0 bg-[#0b1c30]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="text-primary w-6 h-6" /> Thêm Khung Giờ & Giá
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-700 text-sm font-bold mb-1.5">
              Tên Ca (Slot Name) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="slotName"
              value={formData.slotName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900"
              placeholder="VD: Ca Sáng Sớm, Giờ Vàng..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 text-sm font-bold mb-1.5">
                Loại Ngày <span className="text-red-500">*</span>
              </label>
              <select
                name="dayType"
                value={formData.dayType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900"
              >
                <option value="All">Tất cả các ngày</option>
                <option value="Weekday">Ngày thường (T2-T6)</option>
                <option value="Weekend">Cuối tuần (T7-CN)</option>
                <option value="Holiday">Ngày Lễ</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-bold mb-1.5">
                Giá tiền (VNĐ) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900 font-bold"
                placeholder="100000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 text-sm font-bold mb-1.5">
                Giờ Bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-bold mb-1.5">
                Giờ Kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900"
              />
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-2">
            <p className="text-xs text-blue-800 font-medium">
              Lưu ý: Giờ kết thúc phải lớn hơn giờ bắt đầu. Nếu có nhiều khung
              giờ bị trùng lặp thời gian, hệ thống sẽ tự động ưu tiên giá của
              "Ngày Lễ" &gt; "Cuối tuần" &gt; "Ngày thường" &gt; "Tất cả".
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 bg-slate-200 hover:bg-slate-300 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm text-[#0b1c30] bg-primary hover:bg-[#a8d800] transition-colors flex items-center gap-2 ${saving ? "opacity-50" : "shadow-lg shadow-primary/20"}`}
            >
              <Check className="w-4 h-4" />{" "}
              {saving ? "Đang lưu..." : "Lưu Bảng Giá"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PricingModal;
