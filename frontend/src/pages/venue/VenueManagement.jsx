import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Plus,
  MapPin,
  Clock,
  Image as ImageIcon,
} from "lucide-react";
import { apiFetch } from "../../services/api";
import useAuthStore from "../../store/useAuthStore";
import VenueModal from "./VenueModal.jsx";
import VenueImageModal from "./VenueImageModal.jsx";

const VenueManagement = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedVenueForImage, setSelectedVenueForImage] = useState(null);

  const [formData, setFormData] = useState({
    venueName: "",
    address: "",
    district: "",
    city: "",
    openTime: "06:00",
    closeTime: "23:00",
  });

  useEffect(() => {
    const roleId = user?.roleid || user?.roleId;
    if (!isAuthenticated || (roleId !== 1 && roleId !== 2)) {
      alert("Trang này chỉ dành cho Admin và Chủ sân.");
      navigate("/");
      return;
    }

    const fetchVenues = async () => {
      try {
        setLoading(true);
        const data = await apiFetch("/venues"); // Lấy danh sách cơ sở của tôi
        setVenues(data.venues || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVenues();
  }, [isAuthenticated, user, navigate]);

  const openModal = () => {
    setFormData({
      venueName: "",
      address: "",
      district: "",
      city: "",
      openTime: "06:00",
      closeTime: "23:00",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch("/venues", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setIsModalOpen(false);

      // Tải lại danh sách cơ sở
      const data = await apiFetch("/venues");
      setVenues(data.venues || []);
      alert("Thêm cơ sở mới thành công!");
    } catch (err) {
      alert(err.message || "Lỗi khi thêm cơ sở.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-5 py-8 animate-fade-in pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Quản lý Cơ sở
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Quản lý các chi nhánh sân cầu lông của bạn.
          </p>
        </div>
        <button
          onClick={openModal}
          className="px-5 py-2.5 bg-[#0b1c30] text-primary hover:bg-[#1a2c42] rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Thêm chi nhánh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            Đang tải danh sách cơ sở...
          </div>
        ) : venues.length > 0 ? (
          venues.map((venue) => (
            <div
              key={venue.venueid}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <h3
                className="text-xl font-bold text-slate-900 mb-2 truncate"
                title={venue.venuename}
              >
                {venue.venuename}
              </h3>
              <div className="space-y-2 text-sm text-slate-600 mb-4">
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />{" "}
                  <span className="line-clamp-2">
                    {venue.address}{" "}
                    {venue.district ? `, ${venue.district}` : ""}{" "}
                    {venue.city ? `, ${venue.city}` : ""}
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />{" "}
                  <span>
                    {venue.opentime?.slice(0, 5)} -{" "}
                    {venue.closetime?.slice(0, 5)}
                  </span>
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border ${venue.status === "Active" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200"}`}
                >
                  {venue.status === "Active" ? "Hoạt động" : "Tạm ngưng"}
                </span>
                <button
                  onClick={() => {
                    setSelectedVenueForImage(venue);
                    setIsImageModalOpen(true);
                  }}
                  className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200 flex items-center gap-1.5"
                  title="Quản lý ảnh"
                >
                  <ImageIcon className="w-4 h-4" />{" "}
                  <span className="text-xs font-bold">Ảnh cơ sở</span>
                </button>
              </div>
            </div>
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
