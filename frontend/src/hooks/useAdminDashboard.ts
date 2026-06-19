import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../services/api";

export const useAdminDashboard = () => {
  const queryClient = useQueryClient();

  const dashboardQuery = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: () => apiFetch("/dashboard/admin"),
  });

  const pendingQuery = useQuery({
    queryKey: ["pendingOwners"],
    queryFn: () => apiFetch("/admin/owners/pending"),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ ownerId, decision, note }) =>
      apiFetch("/admin/owners/review", {
        method: "POST",
        body: JSON.stringify({ ownerId, decision, note }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingOwners"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
    },
  });

  return {
    dashboardData: dashboardQuery.data,
    pendingOwners: pendingQuery.data?.owners || [],
    isLoading: dashboardQuery.isLoading || pendingQuery.isLoading,
    error: dashboardQuery.error?.message || pendingQuery.error?.message,
    handleReview: (ownerId, decision) =>
      reviewMutation.mutate({ ownerId, decision, note: "" }),
  };
};
