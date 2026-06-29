import { Tag, X, Check } from "lucide-react";

const PromotionModal = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  isEditing,
  saving,
}) => {
  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="fixed inset-0 bg-[#00272C]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Tag className="text-primary w-6 h-6" />{" "}
            {isEditing ? "Sửa Khuyến mãi" : "Tạo Khuyến mãi mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-700 text-sm font-bold mb-1.5">
              Tên chương trình KM <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="promotionName"
              value={formData.promotionName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900"
              placeholder="VD: Giảm giá khai trương"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 text-sm font-bold mb-1.5">
                Loại giảm <span className="text-red-500">*</span>
              </label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900"
              >
                <option value="Percent">Phần trăm (%)</option>
                <option value="FixedAmount">Số tiền (VNĐ)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-bold mb-1.5">
                Mức giảm <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900"
                placeholder="VD: 10 hoặc 50000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 text-sm font-bold mb-1.5">
                Đơn tối thiểu (VNĐ)
              </label>
              <input
                type="number"
                name="minOrderAmount"
                value={formData.minOrderAmount}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-bold mb-1.5">
                Giảm tối đa (VNĐ)
              </label>
              <input
                type="number"
                name="maxDiscount"
                value={formData.maxDiscount}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900"
                placeholder="Tùy chọn"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 text-sm font-bold mb-1.5">
                Bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-bold mb-1.5">
                Kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-bold mb-1.5">
              Giới hạn số lượt dùng (Tùy chọn)
            </label>
            <input
              type="number"
              name="usageLimit"
              value={formData.usageLimit}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900"
              placeholder="Để trống nếu không giới hạn"
            />
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-bold mb-1.5">
              Mô tả thêm
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="2"
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900 resize-none"
            ></textarea>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm text-[#00272C] bg-primary hover:bg-[#C6D632] transition-colors flex items-center gap-2 ${saving ? "opacity-50" : ""}`}
            >
              <Check className="w-4 h-4" />{" "}
              {saving ? "Đang lưu..." : "Lưu Khuyến mãi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default PromotionModal;
