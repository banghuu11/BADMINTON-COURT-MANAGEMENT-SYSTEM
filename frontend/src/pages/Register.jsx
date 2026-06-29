import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useRegister } from "../hooks/useRegister";

const Register = () => {
  const { formRegister, handleSubmit, errors, apiError, loading } =
    useRegister();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
      <div className="max-w-md w-full bg-background/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          Đăng ký Tài Khoản
        </h2>

        {apiError && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl mb-4 text-sm">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 font-bold text-xs uppercase tracking-wider mb-2">
              Họ và tên
            </label>
            <input
              type="text"
              {...formRegister("fullName", {
                required: "Vui lòng nhập họ và tên",
              })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary text-white transition-colors"
            />
            {errors.fullName && (
              <p className="text-red-400 text-xs mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-slate-300 font-bold text-xs uppercase tracking-wider mb-2">
              Số điện thoại
            </label>
            <input
              type="tel"
              {...formRegister("phoneNumber", {
                required: "Vui lòng nhập số điện thoại",
              })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary text-white transition-colors"
            />
            {errors.phoneNumber && (
              <p className="text-red-400 text-xs mt-1">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-slate-300 font-bold text-xs uppercase tracking-wider mb-2">
              Email
            </label>
            <input
              type="email"
              {...formRegister("email", {
                required: "Vui lòng nhập email",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Email không hợp lệ",
                },
              })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary text-white transition-colors"
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-slate-300 font-bold text-xs uppercase tracking-wider mb-2">
              Tên đăng nhập
            </label>
            <input
              type="text"
              {...formRegister("username", {
                required: "Vui lòng nhập tên đăng nhập",
              })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary text-white transition-colors"
            />
            {errors.username && (
              <p className="text-red-400 text-xs mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-slate-300 font-bold text-xs uppercase tracking-wider mb-2">
              Mật khẩu
            </label>
            <input
              type="password"
              {...formRegister("password", {
                required: "Vui lòng nhập mật khẩu",
                minLength: {
                  value: 6,
                  message: "Mật khẩu phải có ít nhất 6 ký tự",
                },
              })}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary text-white transition-colors"
            />
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-slate-300 font-bold text-xs uppercase tracking-wider mb-2">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              {...formRegister("confirmPassword")}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary text-white transition-colors"
            />
            {errors.confirmPassword && (
              <p className="text-red-400 text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>



          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-primary text-on-primary font-bold py-3 px-4 rounded-xl hover:bg-primary-hover transition-all duration-200 mt-2 shadow-lg shadow-primary/20 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Đang tạo tài
                khoản...
              </span>
            ) : (
              "Đăng Ký Thành Viên"
            )}
          </button>

          <p className="text-center text-sm text-slate-400 mt-4">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="text-primary font-bold hover:underline"
            >
              Đăng nhập
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
