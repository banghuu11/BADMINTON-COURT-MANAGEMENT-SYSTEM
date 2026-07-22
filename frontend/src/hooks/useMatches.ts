import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../services/api";

export const useMatches = () => {
  const queryClient = useQueryClient();

  const {
    data: matches = [],
    isLoading: loading,
    refetch: fetchMatches,
  } = useQuery({
    queryKey: ["openMatches", "home"],
    queryFn: async () => {
      const data = await apiFetch("/booking/matches?limit=6");
      return data.matches || [];
    },
  });

  const joinMutation = useMutation({
    mutationFn: (waitId) =>
      apiFetch(`/booking/matches/${waitId}/join`, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["openMatches"] });
    },
  });

  const joinMatch = async (waitId) => {
    const data = await joinMutation.mutateAsync(waitId);
    return {
      message: data.message,
      contact: {
        fullname: data.contact?.FullName,
        phonenumber: data.contact?.PhoneNumber,
      },
    };
  };

  return { matches, loading, fetchMatches, joinMatch };
};
