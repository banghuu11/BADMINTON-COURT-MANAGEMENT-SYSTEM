import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../services/api";
import { VenueImage } from "../../types/venue";

export const useVenueImages = (venueId: number | undefined) => {
  const queryClient = useQueryClient();

  const { data: images = [], isLoading } = useQuery<VenueImage[]>({
    queryKey: ["venueImages", venueId],
    queryFn: async () => {
      const data = await apiFetch(`/venues/${venueId}/images`);
      return data.images || [];
    },
    enabled: !!venueId,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      return apiFetch(`/venues/${venueId}/images`, {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venueImages", venueId] });
    },
    onError: (err: any) => alert(err.message || "Upload thất bại"),
  });

  const deleteMutation = useMutation({
    mutationFn: (imageId: number) =>
      apiFetch(`/venues/images/${imageId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venueImages", venueId] });
    },
    onError: (err: any) => alert(err.message || "Lỗi khi xóa ảnh"),
  });

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) uploadMutation.mutate(e.target.files[0]);
  };

  return { images, isLoading, handleUpload, deleteMutation };
};
