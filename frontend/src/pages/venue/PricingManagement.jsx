import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DollarSign, Plus, Clock, MapPin, Trash2 } from "lucide-react";
import { apiFetch } from "../../services/api";
import useAuthStore from "../../store/useAuthStore";
import PricingModal from "../../components/venue/PricingModal.jsx";

// Component quản lý bảng giá sân
const PricingManagement = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [venues, setVenues] = useState([]);
  const [selectedVenueId, setSelectedVenueId] = useState("");

  const [courts, setCourts] = useState([]);
  const [selectedCourtId, setSelectedCourtId] = useState("");

  const [pricingList, setPricingList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    slotName: "",
    dayType: "All",
    startTime: "05:00",
    endTime: "06:30",
    price: "",
  });

  // 1. Fetch Cơ sở
  useEffect(() => {
    const roleId = user?.roleid || user?.roleId;
    if (!isAuthenticated || (roleId !== 1 && roleId !== 2)) {
      navigate("/");
      return;
    }
    const fetchVenues = async () => {
      try {
        const data = await apiFetch("/venues");
        setVenues(data.venues || []);
        if (data.venues?.length > 0) setSelectedVenueId(data.venues[0].venueid);
      } catch (err) {
        console.error(err);
      }
    };
    fetchVenues();
  }, [isAuthenticated, user, navigate]);

  // 2. Fetch Sân khi đổi Cơ sở
  useEffect(() => {
    const fetchCourts = async () => {
      if (!selectedVenueId) return;
      try {
        setCourts([]);
        setSelectedCourtId("");
        setPricingList([]);
        const data = await apiFetch(`/courts/venue/${selectedVenueId}`);
        setCourts(data.courts || []);
        if (data.courts?.length > 0) setSelectedCourtId(data.courts[0].courtid);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourts();
  }, [selectedVenueId]);

  // 3. Fetch Bảng giá khi đổi Sân
  useEffect(() => {
    const fetchPricing = async () => {
      if (!selectedCourtId) return;
      try {
        setLoading(true);
        const data = await apiFetch(`/pricing/court/${selectedCourtId}`);
        setPricingList(data.pricingList || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPricing();
  }, [selectedCourtId]);

  const openModal = () => {
    setFormData({
      slotName: "",
      dayType: "All",
      startTime: "05:00",
      endTime: "06:30",
      price: "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch("/pricing", {
        method: "POST",
        body: JSON.stringify({ ...formData, courtId: selectedCourtId }),
      });
      setIsModalOpen(false);
      const data = await apiFetch(`/pricing/court/${selectedCourtId}`);
      setPricingList(data.pricingList || []);
      alert("Thêm khung giờ thành công!");
    } catch (err) {
      alert(err.message || "Lỗi lưu bảng giá.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa cấu hình giá này?")) return;
    try {
      await apiFetch(`/pricing/${id}`, { method: "DELETE" });
      setPricingList(pricingList.filter((p) => p.pricingid !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const translateDayType = (type) => {
    const dict = {
      All: "Tất cả các ngày",
      Weekday: "Ngày thường (T2-T6)",
      Weekend: "Cuối tuần",
      Holiday: "Ngày Lễ",
    };
    return dict[type] || type;
  };

  return (
    <div className="max-w-7xl mx-auto px-5 py-8 animate-fade-in pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Cấu hình Bảng giá
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Thiết lập giá tiền theo từng khung giờ cho mỗi sân.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={selectedVenueId}
              onChange={(e) => setSelectedVenueId(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary shadow-sm"
            >
              {venues.map((v) => (
                <option key={v.venueid} value={v.venueid}>
                  {v.venuename}
                </option>
              ))}
              {venues.length === 0 && (
                <option value="">Chưa có cơ sở nào</option>
              )}
            </select>
          </div>

          <select
            value={selectedCourtId}
            onChange={(e) => setSelectedCourtId(e.target.value)}
            disabled={courts.length === 0}
            className="w-full sm:w-auto px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-primary shadow-sm disabled:bg-slate-100 disabled:text-slate-400"
          >
            {courts.map((c) => (
              <option key={c.courtid} value={c.courtid}>
                {c.courtname}
              </option>
            ))}
            {courts.length === 0 && <option value="">Chưa có sân nào</option>}
          </select>

          <button
            onClick={openModal}
            disabled={!selectedCourtId}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${!selectedCourtId ? "bg-slate-200 text-slate-400 cursor-not-allowed" : "bg-[#0b1c30] text-primary hover:bg-[#1a2c42] shadow-sm"}`}
          >
            <Plus className="w-4 h-4" /> Thêm Giá
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">
            Đang tải cấu hình giá...
          </div>
        ) : pricingList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500">
                  <th className="p-4 font-bold">Tên Ca</th>
                  <th className="p-4 font-bold">Khung giờ</th>
                  <th className="p-4 font-bold">Áp dụng cho</th>
                  <th className="p-4 font-bold">Giá tiền</th>
                  <th className="p-4 font-bold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {pricingList.map((p) => (
                  <tr
                    key={p.pricingid}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-4 font-bold text-slate-900">
                      {p.slotname}
                    </td>
                    <td className="p-4 font-bold text-primary bg-primary/10 rounded-lg inline-flex items-center gap-1 my-2 mx-4 px-2 py-1">
                      <Clock className="w-3.5 h-3.5" />{" "}
                      {p.starttime.slice(0, 5)} - {p.endtime.slice(0, 5)}
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-600">
                      {translateDayType(p.daytype)}
                    </td>
                    <td className="p-4 font-extrabold text-slate-900 text-lg">
                      {Number(p.price).toLocaleString()}đ
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(p.pricingid)}
                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-200 inline-block"
                        title="Xóa"
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
          <div className="p-16 text-center">
            <DollarSign className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-sm">
              Sân này chưa được cấu hình bảng giá nào.
            </p>
          </div>
        )}
      </div>
      <PricingModal
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
export default PricingManagement;
