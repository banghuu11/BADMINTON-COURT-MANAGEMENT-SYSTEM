import {
  BarChart3,
  Users,
  DollarSign,
  CheckCircle,
  XCircle,
  FileText,
} from "lucide-react";
import { useAdminDashboard } from "../hooks/useAdminDashboard";

const AdminDashboard = () => {
  const {
    dashboardData,
    pendingOwners,
    isLoading: loading,
    error,
    handleReview,
  } = useAdminDashboard();

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
        Đang tải dữ liệu...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-red-500">
        {error}
      </div>
    );

  const totalRevenue =
    dashboardData?.platformRevenue?.reduce(
      (sum, item) => sum + Number(item.totalrevenue),
      0,
    ) || 0;

  return (
    <div className="max-w-7xl mx-auto px-5 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Dashboard Quản Trị
        </h1>
        <p className="text-slate-500 mt-2 text-sm">
          Xem thống kê doanh thu nền tảng và quản lý đối tác Chủ sân.
        </p>
      </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <DollarSign className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">
              Tổng doanh thu nền tảng
            </p>
            <p className="text-2xl font-black text-slate-900">
              {totalRevenue.toLocaleString()}đ
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500">Hồ sơ chờ duyệt</p>
            <p className="text-2xl font-black text-slate-900">
              {dashboardData?.pendingApprovals || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Doanh thu theo tháng */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm h-fit">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <BarChart3 className="w-5 h-5 text-primary" /> Doanh thu theo tháng
          </h2>
          {dashboardData?.platformRevenue?.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.platformRevenue.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <span className="font-bold text-slate-700">
                    Tháng {item.revenuemonth}/{item.revenueyear}
                  </span>
                  <span className="font-extrabold text-primary">
                    {Number(item.totalrevenue).toLocaleString()}đ
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-6 bg-slate-50 rounded-xl border border-slate-100">
              Chưa có dữ liệu doanh thu.
            </p>
          )}
        </div>

        {/* Danh sách chờ duyệt */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Users className="w-5 h-5 text-primary" /> Hồ sơ Đối tác chờ duyệt
          </h2>
          {pendingOwners.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-sm text-slate-500">
                    <th className="pb-3 font-bold">Người đại diện</th>
                    <th className="pb-3 font-bold">Thông tin Cơ sở</th>
                    <th className="pb-3 font-bold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingOwners.map((owner) => (
                    <tr
                      key={owner.ownerid}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-4 pr-4">
                        <p className="font-bold text-slate-900">
                          {owner.repfullname}
                        </p>
                        <p className="text-xs text-slate-500">
                          {owner.repphone}
                        </p>
                        <p className="text-xs text-slate-500">
                          {owner.repemail}
                        </p>
                      </td>
                      <td className="py-4 pr-4">
                        <p className="font-bold text-slate-900">
                          {owner.businessname}
                        </p>
                        <p className="text-xs text-slate-500 truncate max-w-xs">
                          {owner.businessaddress}
                        </p>
                        <span className="inline-block mt-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                          Chờ duyệt
                        </span>
                      </td>
                      <td className="py-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => handleReview(owner.ownerid, "Approve")}
                          className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200 inline-flex items-center gap-1"
                          title="Duyệt"
                        >
                          <CheckCircle className="w-4 h-4" />{" "}
                          <span className="text-xs font-bold hidden sm:inline">
                            Duyệt
                          </span>
                        </button>
                        <button
                          onClick={() => handleReview(owner.ownerid, "Reject")}
                          className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-200 inline-flex items-center gap-1"
                          title="Từ chối"
                        >
                          <XCircle className="w-4 h-4" />{" "}
                          <span className="text-xs font-bold hidden sm:inline">
                            Từ chối
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">
                Không có hồ sơ nào đang chờ duyệt.
              </p>
              <p className="text-sm text-slate-400">
                Bạn đã xử lý hết tất cả các yêu cầu!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
