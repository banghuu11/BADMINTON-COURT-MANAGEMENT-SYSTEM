import { Tag, X, Check } from "lucide-react";

const PromotionModal = ({
  isOpen,
  onClose,
  formRegister,
  onSubmit,
  errors,
  isEditing,
  saving,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#00272C]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-2xl shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Tag className="text-primary w-6 h-6" />{" "}
            {isEditing ? "Cập nhật Khuyến mãi" : "Tạo Khuyến mãi mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-700 text-sm font-bold mb-1.5">
              Tên chương trình <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...formRegister("promotionName")}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900"
              placeholder="VD: Khuyến mãi khai trương..."
            />
            {errors.promotionName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.promotionName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-bold mb-1.5">
              Mô tả
            </label>
            <textarea
              {...formRegister("description")}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900"
              rows={3}
            ></textarea>
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 text-sm font-bold mb-1.5">
                Loại giảm giá
              </label>
              <select
                {...formRegister("discountType")}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900"
              >
                <option value="Percent">Phần trăm (%)</option>
                <option value="FixedAmount">Số tiền (VNĐ)</option>
              </select>
              {errors.discountType && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.discountType.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-bold mb-1.5">
                Giá trị giảm <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                {...formRegister("discountValue")}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900"
              />
              {errors.discountValue && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.discountValue.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 text-sm font-bold mb-1.5">
                Đơn tối thiểu (VNĐ)
              </label>
              <input
                type="number"
                {...formRegister("minOrderAmount")}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900"
              />
              {errors.minOrderAmount && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.minOrderAmount.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-bold mb-1.5">
                Giảm tối đa (VNĐ)
              </label>
              <input
                type="number"
                {...formRegister("maxDiscount")}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900"
              />
              {errors.maxDiscount && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.maxDiscount.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 text-sm font-bold mb-1.5">
                Ngày bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                {...formRegister("startDate")}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900"
              />
              {errors.startDate && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.startDate.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-bold mb-1.5">
                Ngày kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                {...formRegister("endDate")}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900"
              />
              {errors.endDate && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.endDate.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-bold mb-1.5">
                Giới hạn lượt dùng
              </label>
              <input
                type="number"
                {...formRegister("usageLimit")}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900"
              />
              {errors.usageLimit && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.usageLimit.message}
                </p>
              )}
            </div>
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
              className={`px-5 py-2.5 rounded-xl font-bold text-sm text-[#00272C] bg-primary hover:bg-[#C6D632] transition-colors flex items-center gap-2 ${saving ? "opacity-50" : "shadow-lg shadow-primary/20"}`}
            >
              <Check className="w-4 h-4" />{" "}
              {saving ? "Đang lưu..." : "Lưu Thông Tin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default PromotionModal;
