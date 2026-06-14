import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dumbbell, Plus } from "lucide-react";
import { apiFetch } from "../../services/api";
import useAuthStore from "../../store/useAuthStore";
import CourtModal from "./CourtModal.jsx";

const CourtManagement = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [venues, setVenues] = useState([]);
  const [selectedVenueId, setSelectedVenueId] = useState("");
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    courtName: "",
    courtCode: "",
    surfaceType: "PVC 4.5mm",
    isIndoor: true,
  });

  useEffect(() => {
    const roleId = user?.roleid || user?.roleId;
    if (!isAuthenticated || (roleId !== 1 && roleId !== 2)) {
      alert("Trang này chỉ dành cho Admin và Chủ sân.");
      navigate("/");
      return;
    }

    const init = async () => {
      try {
        const venueData = await apiFetch("/venues");
        setVenues(venueData.venues || []);
        if (venueData.venues?.length > 0)
          setSelectedVenueId(venueData.venues[0].venueid);
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const fetchCourts = async () => {
      if (!selectedVenueId) return;
      try {
        setLoading(true);
        const data = await apiFetch(`/courts/venue/${selectedVenueId}`);
        setCourts(data.courts || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourts();
  }, [selectedVenueId]);

  const openModal = () => {
    setFormData({
      courtName: "",
      courtCode: "",
      surfaceType: "PVC 4.5mm",
      isIndoor: true,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch("/courts", {
        method: "POST",
        body: JSON.stringify({ ...formData, venueId: selectedVenueId }),
      });
      setIsModalOpen(false);
      const data = await apiFetch(`/courts/venue/${selectedVenueId}`);
      setCourts(data.courts || []);
      alert("Thêm sân thành công!");
    } catch (err) {
      alert(err.message || "Lỗi lưu sân");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-5 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Quản lý Sân
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Thêm sân mới vào cơ sở của bạn.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedVenueId}
            onChange={(e) => setSelectedVenueId(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold text-slate-900 focus:outline-none shadow-sm"
          >
            {venues.map((v) => (
              <option key={v.venueid} value={v.venueid}>
                {v.venuename}
              </option>
            ))}
          </select>
          <button
            onClick={openModal}
            disabled={!selectedVenueId}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 ${!selectedVenueId ? "bg-slate-200 text-slate-400" : "bg-[#0b1c30] text-primary hover:bg-[#1a2c42]"}`}
          >
            <Plus className="w-4 h-4" /> Thêm sân
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Đang tải...</div>
        ) : courts.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500">
                <th className="p-4 font-bold">Tên Sân</th>
                <th className="p-4 font-bold">Mã Sân</th>
                <th className="p-4 font-bold">Mặt Thảm</th>
                <th className="p-4 font-bold text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {courts.map((c) => (
                <tr
                  key={c.courtid}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="p-4 font-bold text-slate-900">
                    <Dumbbell className="w-4 h-4 text-primary inline mr-2" />
                    {c.courtname}
                  </td>
                  <td className="p-4 text-slate-500 font-medium">
                    {c.courtcode || "-"}
                  </td>
                  <td className="p-4 text-slate-500 text-sm">
                    {c.surfacetype}{" "}
                    {c.isindoor ? "(Trong nhà)" : "(Ngoài trời)"}
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border border-emerald-200">
                      {c.status}
                    </span>
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
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        saving={saving}
      />
    </div>
  );
};
export default CourtManagement;
