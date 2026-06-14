import { create } from "zustand";
import { authService } from "../services/auth.service";

const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null, // Lưu trên memory, an toàn trước XSS
  isAuthenticated: false,
  loading: true,

  setAccessToken: (token) =>
    set({ accessToken: token, isAuthenticated: !!token }),

  // Hàm tự động check token hợp lệ và lấy profile
  fetchProfile: async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      set({
        loading: false,
        isAuthenticated: false,
        user: null,
        accessToken: null,
      });
      return;
    }
    try {
      set({ loading: true });

      // Gọi Refresh Token trước để lấy Access Token tạm vào memory
      const res = await fetch("http://localhost:8080/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) throw new Error("Refresh token hết hạn");
      const data = await res.json();

      localStorage.setItem("refreshToken", data.refreshToken);
      set({ accessToken: data.accessToken, isAuthenticated: true });

      // Lúc này Axios interceptor đã có accessToken, tự động gọi profile
      const profileData = await authService.getProfile();
      set({ user: profileData.user, isAuthenticated: true, loading: false });
    } catch (error) {
      console.error("Lỗi xác thực:", error);
      get().logout(); // Token hết hạn thì đăng xuất
    }
  },

  login: async (username, password) => {
    const data = await authService.login(username, password);
    localStorage.setItem("refreshToken", data.refreshToken);
    set({
      accessToken: data.accessToken,
      isAuthenticated: true,
      user: data.user,
    });
    return data;
  },

  register: async (userData) => {
    return await authService.register(userData);
  },

  logout: () => {
    localStorage.removeItem("refreshToken");
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      loading: false,
    });
  },
}));

export default useAuthStore;
