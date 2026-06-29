import { apiFetch } from "./api";

export const authService = {
  login: (username, password) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  register: (userData) =>
    apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  getProfile: () => apiFetch("/auth/profile", { method: "GET" }),
  updateProfile: (formData) => apiFetch("/auth/profile", { method: "PUT", body: formData }),
};
