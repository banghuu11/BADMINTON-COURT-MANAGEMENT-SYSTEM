import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";

const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  const roleId = Number(user?.roleid || user?.roleId || user?.RoleId);
  if (!allowedRoles.includes(roleId)) {
    if (roleId === 1) {
      return <Navigate to="/" replace />;
    }
    return (
      <div className="min-h-screen bg-[#00272c] flex items-center justify-center text-white">
        <div className="max-w-md w-full bg-background/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 text-center animate-scale-in">
          <h2 className="text-2xl font-black text-white mb-2">
            Truy cập bị từ chối
          </h2>
          <p className="text-slate-400 text-sm mb-6">
            Bạn không có quyền truy cập vào trang này.
          </p>
          <button
            onClick={() => window.history.back()}
            className="w-full bg-primary text-on-primary hover:bg-primary-hover px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }
  return children;
};

RoleProtectedRoute.defaultProps = {
  allowedRoles: [],
};

export default RoleProtectedRoute;
