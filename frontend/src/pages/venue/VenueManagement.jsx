import { Building2, Plus } from "lucide-react";
import VenueModal from "./VenueModal.jsx";
import VenueImageModal from "./VenueImageModal.jsx";
import VenueCard from "./VenueCard.jsx";
import { useVenueManagement } from "../../hooks/useVenueManagement";

const VenueManagement = () => {
  const {
    venues,
    isLoading,
    isModalOpen,
    setIsModalOpen,
    isImageModalOpen,
    setIsImageModalOpen,
    selectedVenueForImage,
    setSelectedVenueForImage,
    formData,
    setFormData,
    saving,
    openModal,
    handleSubmit,
  } = useVenueManagement();

  return (
    <div className="max-w-7xl mx-auto px-5 py-8 animate-fade-in pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Quản lý Cơ sở
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Quản lý các chi nhánh sân cầu lông của bạn.
          </p>
        </div>
        <button
          onClick={openModal}
          className="px-5 py-2.5 bg-primary text-[#0b1c30] hover:bg-[#a8d800] rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20 transition-colors"
        >
          <Plus className="w-4 h-4" /> Thêm chi nhánh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            Đang tải danh sách cơ sở...
          </div>
        ) : venues.length > 0 ? (
          venues.map((venue) => (
            <VenueCard
              key={venue.venueid}
              venue={venue}
              onManageImages={(v) => {
                setSelectedVenueForImage(v);
                setIsImageModalOpen(true);
              }}
            />
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Chưa có cơ sở nào
            </h3>
            <p className="text-slate-500 text-sm mb-4">
              Bạn chưa thêm chi nhánh sân cầu lông nào. Hãy thêm ngay!
            </p>
            <button
              onClick={openModal}
              className="bg-primary text-[#0b1c30] px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#a8d800] transition-colors inline-flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Thêm cơ sở đầu tiên
            </button>
          </div>
        )}
      </div>

      <VenueModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        saving={saving}
      />
      <VenueImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        venue={selectedVenueForImage}
      />
    </div>
  );
};
export default VenueManagement;
