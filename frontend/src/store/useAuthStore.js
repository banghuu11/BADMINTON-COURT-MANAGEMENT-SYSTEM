import { create } from "zustand";
import { authService } from "../services/auth.service";

const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: true,

  setAccessToken: (token) =>
    set({ accessToken: token, isAuthenticated: !!token }),

  updateUser: (newUser) =>
    set({ user: newUser }),

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
      const res = await fetch("http://localhost:8080/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) throw new Error("Refresh token hết hạn");
      const data = await res.json();

      localStorage.setItem("refreshToken", data.refreshToken);
      set({ accessToken: data.accessToken, isAuthenticated: true });

      const profileData = await authService.getProfile();
      set({ user: profileData.user, isAuthenticated: true, loading: false });
    } catch (error) {
      console.error("Lỗi xác thực:", error);
      get().logout();
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
    
    // Fetch full profile immediately after login to get avatarurl and other details
    try {
      const profileData = await authService.getProfile();
      set({ user: profileData.user });
    } catch (err) {
      console.error("Lỗi lấy thông tin sau khi login:", err);
    }
    
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
  hasRole: (roleId) => {
    const user = get().user;
    const currentRoleId = Number(user?.roleid ?? user?.roleId ?? user?.RoleId);
    return currentRoleId === roleId;
  },
  isAdmin: () => {
    return get().hasRole(1);
  },
  isOwner: () => {
    return get().hasRole(2);
  },
  isManager: () => {
    return get().hasRole(3);
  },
  isStaff: () => {
    return get().hasRole(4);
  },
  isCustomer: () => {
    return get().hasRole(5);
  },
}));

export default useAuthStore;
