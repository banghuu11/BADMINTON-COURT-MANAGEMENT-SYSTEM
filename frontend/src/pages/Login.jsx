import { Link } from "react-router-dom";
import { Loader2, LockKeyhole, User } from "lucide-react";
import { useLogin } from "../hooks/useLogin";
import heroImage from "../assets/hero.png";

const Login = () => {
  const { formRegister, handleSubmit, errors, loading } = useLogin();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-background dark:text-white">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <div className="relative hidden overflow-hidden bg-slate-950 lg:block">
          <img
            src={heroImage}
            alt="CourtLink"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-950/60"></div>
          <div className="absolute inset-x-0 bottom-0 p-10">
            <p className="mb-3 inline-flex rounded bg-primary px-3 py-1 text-xs font-extrabold text-on-primary">
              CourtLink
            </p>
            <h1 className="max-w-lg text-4xl font-extrabold leading-tight text-white">
              Quản lý lịch chơi và đặt sân rõ ràng hơn.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-200">
              Đăng nhập để theo dõi lịch đặt, thanh toán và nhận thông báo từ cơ sở sân.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center px-5 py-12">
          <div className="w-full max-w-md">
            <Link to="/" className="mb-8 inline-flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-xl font-black text-on-primary">
                C
              </span>
              <span className="text-2xl font-extrabold tracking-normal">
                Court<span className="text-primary">Link</span>
              </span>
            </Link>

            <div className="rounded-lg border border-slate-200 bg-white p-7 shadow-sm dark:border-white/10 dark:bg-white/5">
              <h2 className="text-3xl font-extrabold tracking-normal text-slate-950 dark:text-white">
                Đăng nhập
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Tiếp tục đặt sân và quản lý lịch chơi của bạn.
              </p>

        <form onSubmit={handleSubmit} className="mt-7">
          <div className="mb-4">
            <label
              className="mb-2 block text-xs font-bold uppercase text-slate-500 dark:text-slate-300"
              htmlFor="username"
            >
              Tên đăng nhập
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                id="username"
                {...formRegister("username")}
                className="h-12 w-full rounded-md border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-950 transition-colors focus:border-slate-950 focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="Nhập username"
              />
            </div>
            {errors.username && (
              <p className="text-red-400 text-xs mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label
              className="mb-2 block text-xs font-bold uppercase text-slate-500 dark:text-slate-300"
              htmlFor="password"
            >
              Mật khẩu
            </label>
            <div className="relative">
              <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                id="password"
                {...formRegister("password")}
                className="h-12 w-full rounded-md border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold text-slate-950 transition-colors focus:border-slate-950 focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                placeholder="Nhập mật khẩu"
              />
            </div>
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
            <div className="flex justify-end mt-2">
              <Link
                to="/forgot-password"
                className="text-sm font-bold text-slate-950 hover:text-primary dark:text-white"
              >
                Quên mật khẩu?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`h-12 w-full rounded-md bg-primary px-4 font-extrabold text-on-primary transition-colors hover:bg-primary-hover ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Đang đăng nhập...
              </span>
            ) : (
              "Đăng nhập"
            )}
          </button>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
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
        </div>
      </div>
    </div>
  );
};

export default Login;
