import { Link } from "react-router-dom";
import {
  DollarSign,
  MapPin,
  CreditCard,
  ShoppingBag,
  Calendar,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { useOwnerDashboard } from "../hooks/useOwnerDashboard";

const OwnerDashboard = () => {
  const {
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    dashboardData,
    isLoading: loading,
    error,
    noProfile,
    currentDate,
  } = useOwnerDashboard();

  // Render nếu chưa nộp hồ sơ chủ sân
  if (noProfile) {
    return (
      <div className="max-w-4xl mx-auto px-5 py-24 text-center animate-fade-in">
        <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Chưa tìm thấy hồ sơ Chủ sân
        </h2>
        <p className="text-slate-600 mb-6">
          Bạn cần đăng ký thông tin cơ sở kinh doanh và được Admin duyệt trước
          khi xem thống kê.
        </p>
        <Link
          to="/owner-register"
          className="bg-primary text-[#00272C] px-6 py-3 rounded-xl font-bold hover:bg-[#C6D632] transition-colors shadow-lg"
        >
          Đăng ký / Kiểm tra hồ sơ
        </Link>
      </div>
    );
  }

  if (loading && !dashboardData)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
        Đang tính toán dữ liệu...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-red-500">
        {error}
      </div>
    );

  const summary = dashboardData?.summary || {
    total_revenue: 0,
    court_revenue: 0,
    service_revenue: 0,
    total_invoices: 0,
  };
  const venues = dashboardData?.venueRevenues || [];

  return (
    <div className="max-w-7xl mx-auto px-5 py-8 animate-fade-in pb-24">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Thống kê Doanh thu
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Theo dõi hiệu quả kinh doanh của các cơ sở sân
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 px-3 border-r border-slate-100">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent font-bold text-slate-900 focus:outline-none"
            >
              {[...Array(12).keys()].map((i) => (
                <option key={i + 1} value={i + 1}>
                  Tháng {i + 1}
                </option>
              ))}
            </select>
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-transparent font-bold text-slate-900 focus:outline-none px-3"
          >
            {[
              currentDate.getFullYear() - 1,
              currentDate.getFullYear(),
              currentDate.getFullYear() + 1,
            ].map((y) => (
              <option key={y} value={y}>
                Năm {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tổng quan (Summary Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-[#00272C] to-[#1a2c42] p-6 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 opacity-10">
            <DollarSign className="w-32 h-32 text-white" />
          </div>
          <p className="text-white/70 text-sm font-bold uppercase tracking-wider mb-2 relative z-10">
            Tổng Doanh Thu
          </p>
          <p className="text-3xl font-black text-primary relative z-10">
            {Number(summary.total_revenue).toLocaleString()}đ
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">
              Tiền thuê sân
            </p>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {Number(summary.court_revenue).toLocaleString()}đ
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">
              Bán dịch vụ
            </p>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {Number(summary.service_revenue).toLocaleString()}đ
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">
              Tổng số hóa đơn
            </p>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {summary.total_invoices}
          </p>
        </div>
      </div>

      {/* Breakdown theo Cơ sở */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-slate-900">
            Doanh thu theo từng cơ sở
          </h2>
        </div>

        {venues.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-sm text-slate-500 border-b border-slate-200">
                  <th className="p-4 font-bold">Mã cơ sở</th>
                  <th className="p-4 font-bold">Tên cơ sở kinh doanh</th>
                  <th className="p-4 font-bold text-right">Doanh thu (VNĐ)</th>
                </tr>
              </thead>
              <tbody>
                {venues.map((v) => (
                  <tr
                    key={v.venueid}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="p-4 font-medium text-slate-500">
                      #{v.venueid}
                    </td>
                    <td className="p-4 font-bold text-slate-900">
                      {v.venuename}
                    </td>
                    <td className="p-4 text-right font-extrabold text-primary text-lg">
                      {Number(v.venuerevenue).toLocaleString()}đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">
            Không phát sinh giao dịch nào trong tháng {selectedMonth}/
            {selectedYear}.
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
