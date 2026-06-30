import axios from "axios";
import useAuthStore from "../store/useAuthStore";

const BASE_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    // Xóa Content-Type mặc định để trình duyệt tự đính kèm boundary khi gửi FormData (File)
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    // Lấy Access Token từ memory (Zustand state) thay vì localStorage (An toàn khỏi XSS)
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 (Hết hạn Access Token) và chưa retry lần nào
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          useAuthStore.getState().logout();
          return Promise.reject(error);
        }

        // Gọi API cấp lại token
        const res = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = res.data;

        // Lưu token mới
        localStorage.setItem("refreshToken", newRefreshToken);
        useAuthStore.getState().setAccessToken(accessToken);

        // Cập nhật lại header và tự động gửi lại request cũ bị fail
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Nếu Refresh Token cũng hết hạn -> Đăng xuất người dùng
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    const errMessage = error.response?.data?.error || error.message;
    return Promise.reject(new Error(errMessage));
  },
);

// Wrapper giữ nguyên chữ ký hàm cũ để tương thích 100% với các file giao diện đang gọi apiFetch
/**
 * @param {string} endpoint
 * @param {Object} [options={}]
 * @returns {Promise<any>}
 */
export const apiFetch = async (endpoint, options = {}) => {
  const method = options.method || "GET";
  let data;

  if (options.body instanceof FormData) {
    data = options.body; // Gửi thẳng FormData (File)
  } else if (options.body) {
    data =
      typeof options.body === "string"
        ? JSON.parse(options.body)
        : options.body; // Parse JSON nếu là chuỗi
  }

  return api({
    url: endpoint,
    method,
    data,
    headers: options.headers,
  });
};
