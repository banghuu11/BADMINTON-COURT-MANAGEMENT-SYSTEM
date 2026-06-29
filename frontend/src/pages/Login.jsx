import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useLogin } from "../hooks/useLogin";

const Login = () => {
  const { formRegister, handleSubmit, errors, apiError, loading } = useLogin();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-background/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          Đăng nhập
        </h2>

        {apiError && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl mb-4 text-sm">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-slate-300 font-bold text-xs uppercase tracking-wider mb-2"
              htmlFor="username"
            >
              Tên đăng nhập
            </label>
            <input
              type="text"
              id="username"
              {...formRegister("username")}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary text-white transition-colors"
              placeholder="Nhập username..."
            />
            {errors.username && (
              <p className="text-red-400 text-xs mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label
              className="block text-slate-300 font-bold text-xs uppercase tracking-wider mb-2"
              htmlFor="password"
            >
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              {...formRegister("password")}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary text-white transition-colors"
              placeholder="Nhập mật khẩu..."
            />
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-primary text-on-primary font-bold py-3 px-4 rounded-xl hover:bg-primary-hover transition-all duration-200 shadow-lg shadow-primary/20 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Đang đăng nhập...
              </span>
            ) : (
              "Đăng Nhập"
            )}
          </button>

          <p className="mt-6 text-center text-sm text-slate-400">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-primary font-bold hover:underline"
            >
              Đăng ký ngay
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
