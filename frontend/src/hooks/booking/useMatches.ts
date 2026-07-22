import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../services/api";

export const useMatches = () => {
  const queryClient = useQueryClient();

  // Lấy danh sách các trận giao lưu đang mở
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["openMatches", "all"],
    queryFn: async () => {
      const data = await apiFetch("/booking/matches");
      return data.matches || [];
    },
  });

  // Tham gia trận đấu
  const joinMatchMutation = useMutation({
    mutationFn: (waitId: string) =>
      apiFetch(`/booking/matches/${waitId}/join`, {
        method: "POST",
      }),
    onSuccess: (data: any) => {
      alert(
        `Tham gia thành công! Vui lòng liên hệ: ${data.contact.FullName} - Số ĐT: ${data.contact.PhoneNumber}`,
      );
      queryClient.invalidateQueries({ queryKey: ["openMatches"] });
    },
    onError: (err: any) => {
      alert(err.message || "Lỗi khi tham gia giao lưu.");
    },
  });

  // Tạo yêu cầu tìm người chơi
  const createMatchMutation = useMutation({
    mutationFn: (matchData: {
      courtId: number;
      playDate: string;
      startTime: string;
      endTime: string;
    }) =>
      apiFetch("/booking/matches", {
        method: "POST",
        body: JSON.stringify(matchData),
      }),
    onSuccess: () => {
      alert("Tạo yêu cầu tìm đồng đội thành công!");
      queryClient.invalidateQueries({ queryKey: ["openMatches"] });
    },
    onError: (err: any) => {
      alert(err.message || "Lỗi khi đăng tin giao lưu.");
    },
  });

  return {
    matches,
    isLoading,
    joinMatch: joinMatchMutation.mutate,
    createMatch: createMatchMutation.mutate,
    isJoining: joinMatchMutation.isPending,
    isCreating: createMatchMutation.isPending,
  };
};

// Lấy danh sách tất cả cơ sở
export const useVenues = () => {
  return useQuery({
    queryKey: ["allVenues"],
    queryFn: async () => {
      const data = await apiFetch("/venues/all");
      return (data.venues || []).map((venue: any) => ({
        ...venue,
        venueId: venue.venueid ?? venue.VenueId,
        venueName: venue.venuename ?? venue.VenueName,
      }));
    },
  });
};

// Lấy danh sách sân theo cơ sở đã chọn
export const useCourtsByVenue = (venueId: string) => {
  return useQuery({
    queryKey: ["courtsByVenue", venueId],
    queryFn: async () => {
      if (!venueId) return [];
      const data = await apiFetch(`/courts/venue/${venueId}`);
      return (data.courts || []).map((court: any) => ({
        ...court,
        courtId: court.courtid ?? court.CourtId,
        courtName: court.courtname ?? court.CourtName,
      }));
    },
    enabled: !!venueId, // Chỉ gọi API khi đã có venueId
  });
};

export const useCourtSuggestions = (query: string) => {
  return useQuery({
    queryKey: ["courtSuggestions", query],
    queryFn: async () => {
      const data = await apiFetch(`/courts/suggestions?q=${encodeURIComponent(query)}`);
      return (data.courts || []).map((court: any) => ({
        ...court,
        courtId: court.courtid ?? court.CourtId,
        courtName: court.courtname ?? court.CourtName,
        venueName: court.venuename ?? court.VenueName,
      }));
    },
  });
};
