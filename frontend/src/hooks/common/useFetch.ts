import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../services/api";

export const useFetch = <T = any>(
  url: string,
  initialData: T | null = null,
) => {
  const {
    data,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: [url], // Dùng chính URL làm cache key
    queryFn: async () => {
      if (!url) return initialData;
      const result = await apiFetch(url);
      return result as T;
    },
    enabled: !!url, // Chỉ gọi API khi có URL
    initialData: initialData as any,
  });

  return {
    data,
    loading,
    error: error ? (error as Error).message : null,
    refetch,
  };
};
