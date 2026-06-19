import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../services/api";

export const useOwnerDashboard = () => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));

  const { data, isLoading, error } = useQuery({
    queryKey: ["ownerDashboard", selectedMonth, selectedYear],
    queryFn: () =>
      apiFetch(
        `/dashboard/owner?month=${encodeURIComponent(
          selectedMonth,
        )}&year=${encodeURIComponent(selectedYear)}`,
      ),
  });

  const noProfile =
    error?.message?.includes("Không tìm thấy hồ sơ chủ sân") ||
    error?.message?.includes("Bạn chưa nộp hồ sơ đăng ký chủ sân");

  return {
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    dashboardData: data,
    isLoading,
    error: noProfile ? null : error?.message,
    noProfile,
    currentDate: now,
  };
};
