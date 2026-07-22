import { Dumbbell, Plus, Edit2, Trash2 } from "lucide-react";
import CourtModal from "./CourtModal.jsx";
import { useCourtManagement } from "../../hooks/useCourtManagement";

const CourtManagement = () => {
  const {
    venues,
    selectedVenueId,
    setSelectedVenueId,
    courts,
    isLoading,
    isModalOpen,
    setIsModalOpen,
    formRegister,
    errors,
    saving,
    openModal,
    handleSubmit,
    handleDelete,
  } = useCourtManagement();

  return (
    <div className="max-w-7xl mx-auto px-5 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
            Quản lý Sân
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Thêm sân mới vào cơ sở của bạn.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedVenueId}
            onChange={(e) => setSelectedVenueId(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold text-slate-900 focus:outline-none shadow-sm dark:bg-white/5 dark:border-white/10 dark:text-white"
          >
            {venues.map((v) => (
              <option key={v.venueid} value={v.venueid}>
                {v.venuename}
              </option>
            ))}
          </select>
          <button
            onClick={() => openModal()}
            disabled={!selectedVenueId}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 ${!selectedVenueId ? "bg-slate-200 text-slate-400" : "bg-primary text-[#00272C] hover:bg-[#C6D632] shadow-lg shadow-primary/20"}`}
          >
            <Plus className="w-4 h-4" /> Thêm sân
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden dark:bg-white/5 dark:border-white/10">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Đang tải...</div>
        ) : courts.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500 dark:bg-white/5 dark:border-white/10 dark:text-slate-400">
                <th className="p-4 font-bold">Tên Sân</th>
                <th className="p-4 font-bold">Mã Sân</th>
                <th className="p-4 font-bold">Mặt Thảm</th>
                <th className="p-4 font-bold text-center">Trạng thái</th>
                <th className="p-4 font-bold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {courts.map((c) => (
                <tr
                  key={c.courtid}
                  className="border-b border-slate-100 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5"
                >
                  <td className="p-4 font-bold text-slate-900 dark:text-white">
                    <Dumbbell className="w-4 h-4 text-primary inline mr-2" />
                    {c.courtname}
                  </td>
                  <td className="p-4 text-slate-500 dark:text-slate-400 font-medium">
                    {c.courtcode || "-"}
                  </td>
                  <td className="p-4 text-slate-500 dark:text-slate-400 text-sm">
                    {c.surfacetype}{" "}
                    {c.isindoor ? "(Trong nhà)" : "(Ngoài trời)"}
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border border-emerald-200">
                      {c.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => openModal(c)}
                      className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 inline-block"
                      title="Sửa"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.courtid)}
                      disabled={c.status === 'Inactive'}
                      className={`p-2 rounded-lg transition-colors border inline-block ${c.status === 'Inactive' ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed' : 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200'}`}
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-slate-500">
            <Dumbbell className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            Cơ sở này chưa có sân nào.
          </div>
        )}
      </div>
      <CourtModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formRegister={formRegister}
        errors={errors}
        onSubmit={handleSubmit}
        saving={saving}
      />
    </div>
  );
};
export default CourtManagement;
