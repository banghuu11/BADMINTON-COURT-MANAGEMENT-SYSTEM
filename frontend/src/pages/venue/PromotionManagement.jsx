import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tag, Plus, Edit2, Trash2 } from "lucide-react";
import { apiFetch } from "../../services/api";
import useAuthStore from "../../store/useAuthStore";
import PromotionModal from "../../components/venue/PromotionModal.jsx";

const PromotionManagement = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [venues, setVenues] = useState([]);
  const [selectedVenueId, setSelectedVenueId] = useState("");
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    promotionName: "",
    description: "",
    discountType: "Percent",
    discountValue: "",
    minOrderAmount: "",
    maxDiscount: "",
    startDate: "",
    endDate: "",
    usageLimit: "",
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
    const fetchPromos = async () => {
      if (!selectedVenueId) return;
      try {
        setLoading(true);
        const data = await apiFetch(`/promotions/venue/${selectedVenueId}`);
        setPromotions(data.promotions || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPromos();
  }, [selectedVenueId]);

  const openModal = (promo = null) => {
    if (promo) {
      setEditingId(promo.promotionid);
      setFormData({
        promotionName: promo.promotionname,
        description: promo.description || "",
        discountType: promo.discounttype,
        discountValue: promo.discountvalue,
        minOrderAmount: promo.minorderamount,
        maxDiscount: promo.maxdiscount || "",
        startDate: new Date(promo.startdate).toISOString().slice(0, 16),
        endDate: new Date(promo.enddate).toISOString().slice(0, 16),
        usageLimit: promo.usagelimit || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        promotionName: "",
        description: "",
        discountType: "Percent",
        discountValue: "",
        minOrderAmount: "",
        maxDiscount: "",
        startDate: "",
        endDate: "",
        usageLimit: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await apiFetch(`/promotions/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
      } else {
        await apiFetch("/promotions", {
          method: "POST",
          body: JSON.stringify({ ...formData, venueId: selectedVenueId }),
        });
      }
      setIsModalOpen(false);
      const data = await apiFetch(`/promotions/venue/${selectedVenueId}`);
      setPromotions(data.promotions || []);
    } catch (err) {
      alert(err.message || "Lỗi lưu khuyến mãi");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Ngừng áp dụng khuyến mãi này?")) return;
    try {
      await apiFetch(`/promotions/${id}`, { method: "DELETE" });
      setPromotions(promotions.filter((p) => p.promotionid !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-5 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Quản lý Khuyến mãi
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Tạo các chương trình ưu đãi để thu hút khách hàng.
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
            onClick={() => openModal()}
            disabled={!selectedVenueId}
            className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 ${!selectedVenueId ? "bg-slate-200 text-slate-400" : "bg-[#0b1c30] text-primary hover:bg-[#1a2c42]"}`}
          >
            <Plus className="w-4 h-4" /> Tạo mới
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Đang tải...</div>
        ) : promotions.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm text-slate-500">
                <th className="p-4 font-bold">Chương trình KM</th>
                <th className="p-4 font-bold">Mức giảm</th>
                <th className="p-4 font-bold">Thời hạn</th>
                <th className="p-4 font-bold text-center">Đã dùng</th>
                <th className="p-4 font-bold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((p) => (
                <tr
                  key={p.promotionid}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="p-4 font-bold text-slate-900">
                    <Tag className="w-4 h-4 text-primary inline mr-2" />
                    {p.promotionname}
                  </td>
                  <td className="p-4 text-emerald-600 font-extrabold">
                    {p.discounttype === "Percent"
                      ? `${p.discountvalue}%`
                      : `${Number(p.discountvalue).toLocaleString()}đ`}
                  </td>
                  <td className="p-4 text-xs text-slate-500">
                    {new Date(p.startdate).toLocaleDateString("vi-VN")} -{" "}
                    {new Date(p.enddate).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="p-4 text-center text-sm font-medium text-slate-700">
                    {p.usagecount} / {p.usagelimit || "∞"}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => openModal(p)}
                      className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.promotionid)}
                      className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg"
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
            <Tag className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            Chưa có chương trình khuyến mãi nào.
          </div>
        )}
      </div>

      <PromotionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        isEditing={!!editingId}
        saving={saving}
      />
    </div>
  );
};
export default PromotionManagement;
