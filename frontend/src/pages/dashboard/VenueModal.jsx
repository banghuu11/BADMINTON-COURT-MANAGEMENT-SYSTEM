import { Building2, X, Check } from "lucide-react";

const VenueModal = ({
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
    <div className="fixed inset-0 bg-[#00272C]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="text-primary w-6 h-6" /> Thêm Cơ sở mới
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
              Tên cơ sở <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="venueName"
              value={formData.venueName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900"
              placeholder="VD: Sân cầu lông Quận 10"
            />
          </div>

          <div>
            <label className="block text-slate-700 text-sm font-bold mb-1.5">
              Địa chỉ chi tiết <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900"
              placeholder="VD: 123 Đường ABC..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 text-sm font-bold mb-1.5">
                Quận/Huyện
              </label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900"
                placeholder="VD: Quận 10"
              />
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-bold mb-1.5">
                Tỉnh/Thành phố
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900"
                placeholder="VD: TP. HCM"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 text-sm font-bold mb-1.5">
                Vĩ độ
              </label>
              <input
                type="number"
                step="any"
                name="latitude"
                value={formData.latitude || ""}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900"
                placeholder="VD: 10.7761"
              />
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-bold mb-1.5">
                Kinh độ
              </label>
              <input
                type="number"
                step="any"
                name="longitude"
                value={formData.longitude || ""}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900"
                placeholder="VD: 106.6713"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 text-sm font-bold mb-1.5">
                Giờ mở cửa
              </label>
              <input
                type="time"
                name="openTime"
                value={formData.openTime}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900"
              />
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-bold mb-1.5">
                Giờ đóng cửa
              </label>
              <input
                type="time"
                name="closeTime"
                value={formData.closeTime}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900"
              />
            </div>
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
              className={`px-5 py-2.5 rounded-xl font-bold text-sm text-[#00272C] bg-primary hover:bg-[#C6D632] transition-colors flex items-center gap-2 ${saving ? "opacity-50" : "shadow-lg shadow-primary/20"}`}
            >
              <Check className="w-4 h-4" />{" "}
              {saving ? "Đang lưu..." : "Thêm Cơ sở"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default VenueModal;
