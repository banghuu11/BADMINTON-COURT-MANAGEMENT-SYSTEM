import {
  Building2,
  UserCircle,
  ShieldCheck,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useOwnerOnboarding } from "../hooks/useOwnerOnboarding";

const OwnerOnboarding = () => {
  const {
    isAuthenticated,
    formRegister,
    handleSubmit,
    errors,
    loading,
    error,
  } = useOwnerOnboarding();

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-4xl mx-auto px-5 py-8 animate-fade-in pb-24">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          Trở thành <span className="text-primary">Đối tác Chủ Sân</span>
        </h1>
        <p className="text-slate-600 max-w-xl mx-auto text-sm">
          Đăng ký thông tin pháp lý để bắt đầu quản lý sân cầu lông của bạn trên
          hệ thống CourtLink, tiếp cận hàng ngàn khách hàng tiềm năng.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Block: Thông tin người đại diện */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 h-fit">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <UserCircle className="w-5 h-5 text-primary" /> Thông tin Người
              đại diện
            </h2>

            <div>
              <label className="block text-slate-700 text-sm font-bold mb-1.5">
                Họ và Tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...formRegister("repFullName")}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors text-slate-900"
                placeholder="VD: Nguyễn Văn A"
              />
              {errors.repFullName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.repFullName.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 text-sm font-bold mb-1.5">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  {...formRegister("repPhone")}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors text-slate-900"
                />
                {errors.repPhone && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.repPhone.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-bold mb-1.5">
                  Email liên hệ <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  {...formRegister("repEmail")}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors text-slate-900"
                />
                {errors.repEmail && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.repEmail.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-bold mb-1.5">
                Số CCCD / CMND <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...formRegister("repIdNumber")}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors text-slate-900"
              />
              {errors.repIdNumber && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.repIdNumber.message}
                </p>
              )}
            </div>
          </div>

          {/* Block: Thông tin Cơ sở kinh doanh */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 h-fit">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building2 className="w-5 h-5 text-primary" /> Thông tin Cơ sở /
              Doanh nghiệp
            </h2>

            <div>
              <label className="block text-slate-700 text-sm font-bold mb-1.5">
                Loại hình kinh doanh
              </label>
              <select
                {...formRegister("businessType")}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors text-slate-900"
              >
                <option value="Individual">Cá nhân / Hộ kinh doanh</option>
                <option value="Company">Công ty / Doanh nghiệp</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-bold mb-1.5">
                Tên cơ sở kinh doanh
              </label>
              <input
                type="text"
                {...formRegister("businessName")}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors text-slate-900"
                placeholder="VD: Sân cầu lông Kỳ Hòa"
              />
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-bold mb-1.5">
                Mã số thuế (nếu có)
              </label>
              <input
                type="text"
                {...formRegister("taxCode")}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors text-slate-900"
                placeholder="Nhập mã số thuế"
              />
            </div>

            <div>
              <label className="block text-slate-700 text-sm font-bold mb-1.5">
                Địa chỉ kinh doanh
              </label>
              <textarea
                {...formRegister("businessAddress")}
                rows="2"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors text-slate-900 resize-none"
                placeholder="Nhập địa chỉ đầy đủ..."
              ></textarea>
            </div>
          </div>
        </div>

        {/* Khối Cam kết và Submit */}
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex gap-4 items-start">
            <ShieldCheck className="w-8 h-8 text-primary flex-shrink-0" />
            <p className="text-sm text-slate-700">
              Bằng việc gửi hồ sơ này, bạn cam kết các thông tin khai báo là
              hoàn toàn chính xác và đồng ý với các
              <a
                href="#"
                className="font-bold text-primary hover:underline ml-1"
              >
                Điều khoản dịch vụ dành cho Đối tác
              </a>{" "}
              của CourtLink.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`flex items-center gap-2 bg-[#00272C] text-white px-8 py-3.5 rounded-xl font-bold text-sm whitespace-nowrap hover:bg-[#1a2c42] transition-colors shadow-lg ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...
              </>
            ) : (
              <>
                Gửi Hồ Sơ <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OwnerOnboarding;
