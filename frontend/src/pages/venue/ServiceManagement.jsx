import { Plus, Edit2, Trash2, Package, Check, X } from "lucide-react";
import { useServiceManagement } from "../../hooks/useServiceManagement";

const ServiceManagement = () => {
  const {
    venues,
    selectedVenueId,
    setSelectedVenueId,
    services,
    isLoading,
    isModalOpen,
    editingId,
    formRegister,
    handleSubmit,
    errors,
    openModal,
    handleDelete,
    saving,
    onClose,
  } = useServiceManagement();

  return (
    <div className="max-w-7xl mx-auto px-5 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Quản lý Kho & Dịch vụ
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Thêm và quản lý sản phẩm, nước uống, dịch vụ cho cơ sở của bạn
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedVenueId}
            onChange={(e) => setSelectedVenueId(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-primary shadow-sm dark:bg-white/5 dark:border-white/10 dark:text-white"
          >
            {venues.map((v) => (
              <option key={v.venueid} value={v.venueid}>
                {v.venuename}
              </option>
            ))}
            {venues.length === 0 && <option value="">Chưa có cơ sở nào</option>}
          </select>
          <button
            onClick={() => openModal()}
            disabled={!selectedVenueId}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 shadow-sm ${!selectedVenueId ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-[#00272C] text-primary hover:bg-[#1a2c42]"}`}
          >
            <Plus className="w-4 h-4" /> Thêm mới
          </button>
        </div>
      </div>

      {/* Danh sách Dịch vụ */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden dark:bg-white/5 dark:border-white/10">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">
            Đang tải danh sách dịch vụ...
          </div>
        ) : services.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500 dark:bg-white/5 dark:border-white/10 dark:text-slate-400">
                  <th className="p-4 font-bold">Tên sản phẩm</th>
                  <th className="p-4 font-bold">Đơn giá</th>
                  <th className="p-4 font-bold">Tồn kho</th>
                  <th className="p-4 font-bold">Đơn vị</th>
                  <th className="p-4 font-bold text-center">Trạng thái</th>
                  <th className="p-4 font-bold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr
                    key={service.serviceid}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors dark:border-white/10 dark:hover:bg-white/5"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                          <Package className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {service.servicename}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-extrabold text-slate-900 dark:text-white">
                      {Number(service.unitprice).toLocaleString()}đ
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-bold border ${service.stockquantity <= service.minstockalert ? "bg-red-50 text-red-700 border-red-200" : "bg-slate-50 text-slate-700 border-slate-200"}`}
                      >
                        {service.stockquantity}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 text-sm font-medium">
                      {service.unit}
                    </td>
                    <td className="p-4 text-center">
                      {service.isactive ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border border-emerald-200">
                          <Check className="w-3 h-3" /> Đang bán
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-500 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border border-slate-200">
                          Ngừng bán
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => openModal(service)}
                        className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 inline-block"
                        title="Sửa"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(service.serviceid)}
                        disabled={!service.isactive}
                        className={`p-2 rounded-lg transition-colors border inline-block ${!service.isactive ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed" : "bg-red-50 text-red-600 hover:bg-red-100 border-red-200"}`}
                        title="Ngừng bán"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Kho đang trống
            </h3>
            <p className="text-slate-500 text-sm mb-4">
              Cơ sở này chưa có sản phẩm hoặc dịch vụ nào để bán.
            </p>
            <button
              onClick={() => openModal()}
              disabled={!selectedVenueId}
              className="bg-primary text-[#00272C] px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#C6D632] transition-colors inline-flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Thêm ngay
            </button>
          </div>
        )}
      </div>

      {/* Modal Thêm/Sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#00272C]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-6 ">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Package className="text-primary w-6 h-6" />{" "}
                {editingId ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
              </h2>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-slate-700 text-sm font-bold mb-1.5">
                  Tên sản phẩm/Dịch vụ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...formRegister("serviceName")}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900"
                  placeholder="VD: Nước suối Aquafina"
                />
                {errors.serviceName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.serviceName.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 text-sm font-bold mb-1.5">
                    Đơn giá (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    {...formRegister("unitPrice")}
                    min="0"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900"
                    placeholder="10000"
                  />
                  {errors.unitPrice && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.unitPrice.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-slate-700 text-sm font-bold mb-1.5">
                    Tồn kho ban đầu
                  </label>
                  <input
                    type="number"
                    {...formRegister("stockQuantity")}
                    min="0"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900"
                    placeholder="100"
                  />
                  {errors.stockQuantity && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.stockQuantity.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 text-sm font-bold mb-1.5">
                    Đơn vị tính
                  </label>
                  <input
                    type="text"
                    {...formRegister("unit")}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary text-slate-900"
                    placeholder="Chai, Lon, Quả..."
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      {...formRegister("isActive")}
                      className="w-5 h-5 rounded text-primary focus:ring-primary"
                    />
                    <span className="text-sm font-bold text-slate-700">
                      Đang bán (Active)
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 mt-6">
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
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm text-[#00272C] bg-primary hover:bg-[#C6D632] transition-colors shadow-lg shadow-primary/20 flex items-center gap-2 ${saving ? "opacity-50" : ""}`}
                >
                  <Check className="w-4 h-4" />{" "}
                  {saving ? "Đang lưu..." : "Lưu thông tin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManagement;
