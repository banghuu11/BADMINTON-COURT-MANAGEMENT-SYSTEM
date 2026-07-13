import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useRegister } from "../hooks/useRegister";
import heroImage from "../assets/hero.png";

const Register = () => {
  const { formRegister, handleSubmit, errors, loading } =
    useRegister();

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
              Thành viên CourtLink
            </p>
            <h1 className="max-w-lg text-4xl font-extrabold leading-tight text-white">
              Tạo tài khoản để đặt sân nhanh hơn mỗi lần chơi.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-200">
              Lưu thông tin cá nhân, xem lịch sử đặt sân và nhận khuyến mãi từ các cơ sở.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center px-5 py-12">
          <div className="w-full max-w-lg">
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
                Đăng ký tài khoản
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Nhập thông tin cơ bản để bắt đầu đặt sân.
              </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-slate-500 dark:text-slate-300">
              Họ và tên
            </label>
            <input
              type="text"
              {...formRegister("fullName", {
                required: "Vui lòng nhập họ và tên",
              })}
              className="h-12 w-full rounded-md border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-950 transition-colors focus:border-slate-950 focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
            {errors.fullName && (
              <p className="text-red-400 text-xs mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-slate-500 dark:text-slate-300">
              Số điện thoại
            </label>
            <input
              type="tel"
              {...formRegister("phoneNumber", {
                required: "Vui lòng nhập số điện thoại",
              })}
              className="h-12 w-full rounded-md border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-950 transition-colors focus:border-slate-950 focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
            {errors.phoneNumber && (
              <p className="text-red-400 text-xs mt-1">
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-slate-500 dark:text-slate-300">
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
              className="h-12 w-full rounded-md border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-950 transition-colors focus:border-slate-950 focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-slate-500 dark:text-slate-300">
              Tên đăng nhập
            </label>
            <input
              type="text"
              {...formRegister("username", {
                required: "Vui lòng nhập tên đăng nhập",
              })}
              className="h-12 w-full rounded-md border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-950 transition-colors focus:border-slate-950 focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
            {errors.username && (
              <p className="text-red-400 text-xs mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-slate-500 dark:text-slate-300">
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
              className="h-12 w-full rounded-md border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-950 transition-colors focus:border-slate-950 focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase text-slate-500 dark:text-slate-300">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              {...formRegister("confirmPassword")}
              className="h-12 w-full rounded-md border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-950 transition-colors focus:border-slate-950 focus:bg-white focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
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
            className={`mt-2 h-12 w-full rounded-md bg-primary px-4 font-extrabold text-on-primary transition-colors hover:bg-primary-hover ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Đang tạo tài
                khoản...
              </span>
            ) : (
              "Đăng ký thành viên"
            )}
          </button>

          <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
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
        </div>
      </div>
    </div>
  );
};

export default Register;
