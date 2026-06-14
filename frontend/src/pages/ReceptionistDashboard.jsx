import { useState, useEffect } from "react";
import { apiFetch } from "../services/api";
import useAuthStore from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Calendar,
  User,
  Phone,
  CheckCircle,
  LogOut,
  MapPin,
  Hash,
} from "lucide-react";
import AddServiceModal from "../components/reception/AddServiceModal.jsx";
import InvoiceModal from "../components/reception/InvoiceModal.jsx";

const ReceptionistDashboard = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [venues, setVenues] = useState([]);
  const [selectedVenueId, setSelectedVenueId] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // State cho Modal thêm dịch vụ
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [selectedSlotForService, setSelectedSlotForService] = useState(null);
  const [venueServices, setVenueServices] = useState([]);
  const [serviceForm, setServiceForm] = useState({
    serviceId: "",
    quantity: 1,
  });
  const [addingService, setAddingService] = useState(false);

  // State cho Modal Thanh toán
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedBookingForInvoice, setSelectedBookingForInvoice] =
    useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    paymentMethod: "Cash",
    note: "",
  });
  const [processingPayment, setProcessingPayment] = useState(false);

  // Lấy danh sách cơ sở
  useEffect(() => {
    const roleId = user?.roleid || user?.roleId;
    if (!isAuthenticated || ![1, 2, 3, 4].includes(roleId)) {
      alert("Truy cập bị từ chối!");
      navigate("/");
      return;
    }

    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const venueData = await apiFetch("/venues"); // api getMyVenues
        const userVenues = venueData.venues || [];
        setVenues(userVenues);

        if (userVenues.length > 0) {
          setSelectedVenueId(userVenues[0].venueid);
        }
      } catch (err) {
        console.error("Lỗi lấy danh sách cơ sở", err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) fetchInitialData();
  }, [isAuthenticated, navigate, user]);

  // Lấy danh sách ca đánh trong ngày
  useEffect(() => {
    const fetchBookings = async () => {
      if (!selectedVenueId) return;
      try {
        setLoading(true);
        const data = await apiFetch(
          `/booking/venue/${selectedVenueId}/today?date=${selectedDate}`,
        );
        setBookings(data.bookings || []);
      } catch (err) {
        console.error("Lỗi lấy danh sách đặt sân:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [selectedVenueId, selectedDate]);

  const handleCheckIn = async (slotId) => {
    if (!window.confirm("Xác nhận Check-in nhận sân?")) return;
    try {
      await apiFetch(`/booking/slot/${slotId}/check-in`, { method: "PATCH" });
      alert("Check-in thành công!");
      const data = await apiFetch(
        `/booking/venue/${selectedVenueId}/today?date=${selectedDate}`,
      );
      setBookings(data.bookings || []);
    } catch (err) {
      alert(err.message || "Lỗi Check-in");
    }
  };

  const handleCheckOut = async (slotId) => {
    if (!window.confirm("Xác nhận Check-out trả sân?")) return;
    try {
      await apiFetch(`/booking/slot/${slotId}/check-out`, { method: "PATCH" });
      alert("Check-out thành công!");
      const data = await apiFetch(
        `/booking/venue/${selectedVenueId}/today?date=${selectedDate}`,
      );
      setBookings(data.bookings || []);
    } catch (err) {
      alert(err.message || "Lỗi Check-out");
    }
  };

  // Xử lý mở Modal thêm dịch vụ
  const openServiceModal = async (slot) => {
    setSelectedSlotForService(slot);
    setServiceForm({ serviceId: "", quantity: 1 });
    setIsServiceModalOpen(true);

    try {
      const data = await apiFetch(`/services/venue/${selectedVenueId}`);
      setVenueServices(data.services || []);
      if (data.services && data.services.length > 0) {
        setServiceForm({ serviceId: data.services[0].serviceid, quantity: 1 });
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách dịch vụ", err);
    }
  };

  // Xử lý Gửi form thêm dịch vụ
  const handleAddService = async (e) => {
    e.preventDefault();
    if (!serviceForm.serviceId || serviceForm.quantity <= 0) return;

    setAddingService(true);
    try {
      await apiFetch(
        `/booking/${selectedSlotForService.bookingid}/add-service`,
        {
          method: "POST",
          body: JSON.stringify({
            serviceId: serviceForm.serviceId,
            quantity: serviceForm.quantity,
            slotId: selectedSlotForService.slotid,
          }),
        },
      );
      alert("Thêm sản phẩm thành công!");
      setIsServiceModalOpen(false);
    } catch (err) {
      alert(err.message || "Lỗi khi thêm dịch vụ");
    } finally {
      setAddingService(false);
    }
  };

  // Xử lý mở Modal Thanh Toán
  const openInvoiceModal = async (slot) => {
    try {
      setLoading(true);
      const res = await apiFetch(
        `/invoices/booking/${slot.bookingid}/generate`,
        {
          method: "POST",
        },
      );
      const inv = res.invoice;
      setInvoiceData(inv);
      setSelectedBookingForInvoice(slot);
      setPaymentForm({
        amount: Number(inv.totalamount) - Number(inv.paidamount || 0),
        paymentMethod: "Cash",
        note: "",
      });
      setIsInvoiceModalOpen(true);
    } catch (err) {
      alert(err.message || "Lỗi tạo hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý xác nhận thu tiền
  const handlePayment = async (e) => {
    e.preventDefault();
    if (paymentForm.amount <= 0) return;

    setProcessingPayment(true);
    try {
      await apiFetch(`/invoices/${invoiceData.invoiceid}/pay`, {
        method: "POST",
        body: JSON.stringify(paymentForm),
      });
      alert("Thanh toán thành công!");
      setIsInvoiceModalOpen(false);
    } catch (err) {
      alert(err.message || "Lỗi thanh toán");
    } finally {
      setProcessingPayment(false);
    }
  };

  // Tìm kiếm
  const filteredBookings = bookings.filter((b) => {
    const name = (b.customername || b.guestname || "").toLowerCase();
    const phone = (b.customerphone || b.guestphone || "").toLowerCase();
    const code = (b.bookingcode || "").toLowerCase();
    const q = searchQuery.toLowerCase();
    return name.includes(q) || phone.includes(q) || code.includes(q);
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "NotStarted":
        return (
          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-xs font-bold border border-slate-200 uppercase">
            Chưa bắt đầu
          </span>
        );
      case "Playing":
        return (
          <span className="bg-primary/20 text-[#0b1c30] px-3 py-1 rounded-md text-xs font-bold border border-primary/30 uppercase">
            Đang chơi
          </span>
        );
      case "Finished":
        return (
          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-md text-xs font-bold border border-emerald-200 uppercase">
            Đã xong
          </span>
        );
      case "Cancelled":
        return (
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-xs font-bold border border-red-200 uppercase">
            Đã hủy
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-5 py-8 animate-fade-in pb-24">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Lễ Tân / Check-in
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Quản lý nhận/trả sân và thông tin khách hàng trong ngày.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <select
            value={selectedVenueId}
            onChange={(e) => setSelectedVenueId(e.target.value)}
            className="w-full sm:w-auto bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold text-slate-900 focus:outline-none focus:border-primary shadow-sm"
          >
            {venues.map((v) => (
              <option key={v.venueid} value={v.venueid}>
                {v.venuename}
              </option>
            ))}
            {venues.length === 0 && <option value="">Chưa có cơ sở nào</option>}
          </select>

          <div className="relative w-full sm:w-auto">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary font-bold text-slate-900 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm tên khách, số điện thoại hoặc mã đơn..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-primary text-slate-900 shadow-sm"
        />
      </div>

      {/* Danh sách */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 text-slate-500">
            Đang tải danh sách...
          </div>
        ) : filteredBookings.length > 0 ? (
          filteredBookings.map((slot) => (
            <div
              key={slot.slotid}
              className={`bg-white border p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm transition-all ${slot.slotstatus === "Playing" ? "border-primary/50 shadow-primary/5" : "border-slate-200"}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-extrabold text-slate-900 text-lg">
                    {slot.starttime.slice(0, 5)} - {slot.endtime.slice(0, 5)}
                  </span>
                  {getStatusBadge(slot.slotstatus)}
                  <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                    <MapPin className="w-3 h-3" /> {slot.courtname}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-slate-600 mt-3">
                  <p className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-slate-400" />{" "}
                    <span className="font-bold text-slate-700">
                      {slot.customername || slot.guestname || "Khách lẻ"}
                    </span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-slate-400" />{" "}
                    {slot.customerphone || slot.guestphone || "Trống"}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Hash className="w-4 h-4 text-slate-400" /> Đơn:{" "}
                    {slot.bookingcode}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="text-right pr-4 border-r border-slate-100 hidden sm:block">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Tiền sân
                  </p>
                  <p className="font-extrabold text-slate-900">
                    {Number(slot.appliedprice).toLocaleString()}đ
                  </p>
                </div>

                <div className="flex flex-1 md:flex-none justify-end gap-2">
                  {slot.slotstatus === "NotStarted" && (
                    <button
                      onClick={() => handleCheckIn(slot.slotid)}
                      className="flex-1 md:flex-none bg-[#0b1c30] text-primary px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#1a2c42] transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" /> Check In
                    </button>
                  )}
                  {slot.slotstatus === "Playing" && (
                    <>
                      <button
                        onClick={() => openServiceModal(slot)}
                        className="flex-1 md:flex-none bg-blue-50 text-blue-600 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 border border-blue-200"
                        title="Thêm dịch vụ / nước"
                      >
                        <Coffee className="w-4 h-4" /> Thêm đồ
                      </button>
                      <button
                        onClick={() => handleCheckOut(slot.slotid)}
                        className="flex-1 md:flex-none bg-primary text-[#0b1c30] px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#a8d800] transition-colors shadow-[0_0_15px_rgba(191,240,0,0.3)] flex items-center justify-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> Check Out
                      </button>
                    </>
                  )}
                  {slot.slotstatus === "Finished" && (
                    <button
                      onClick={() => openInvoiceModal(slot)}
                      className="flex-1 md:flex-none bg-emerald-50 text-emerald-600 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-100 transition-colors border border-emerald-200 flex items-center justify-center gap-2"
                      title="Xem hóa đơn và thanh toán"
                    >
                      <Receipt className="w-4 h-4" /> Thanh toán
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium text-lg">
              Không có lịch đặt sân nào vào ngày này.
            </p>
          </div>
        )}
      </div>

      {/* Modal Thêm Dịch vụ */}
      <AddServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
        slot={selectedSlotForService}
        venueServices={venueServices}
        serviceForm={serviceForm}
        setServiceForm={setServiceForm}
        onSubmit={handleAddService}
        addingService={addingService}
      />

      {/* Modal Hóa đơn & Thanh toán */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        invoiceData={invoiceData}
        paymentForm={paymentForm}
        setPaymentForm={setPaymentForm}
        onSubmit={handlePayment}
        processingPayment={processingPayment}
      />
    </div>
  );
};

export default ReceptionistDashboard;
