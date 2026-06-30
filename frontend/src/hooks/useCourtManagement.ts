import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../services/api";

export const useCourtManagement = () => {
  const queryClient = useQueryClient();
  const [selectedVenueId, setSelectedVenueId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      courtName: "",
      courtCode: "",
      surfaceType: "PVC 4.5mm",
      isIndoor: true,
    },
  });

  const { data: venues = [], isLoading: venuesLoading } = useQuery({
    queryKey: ["myVenues"],
    queryFn: async () => {
      const data = await apiFetch("/venues");
      return data.venues || [];
    },
  });

  useEffect(() => {
    if (!selectedVenueId && venues.length > 0) {
      setSelectedVenueId(String(venues[0].venueid));
    }
  }, [venues, selectedVenueId]);

  const { data: courts = [], isLoading: courtsLoading } = useQuery({
    queryKey: ["courts", selectedVenueId],
    queryFn: async () => {
      if (!selectedVenueId) return [];
      const data = await apiFetch(`/courts/venue/${selectedVenueId}`);
      return data.courts || [];
    },
    enabled: !!selectedVenueId,
  });

  const createMutation = useMutation({
    mutationFn: (values: any) =>
      apiFetch("/courts", {
        method: "POST",
        body: JSON.stringify({ ...values, venueId: selectedVenueId }),
      }),
    onSuccess: () => {
      reset();
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["courts", selectedVenueId] });
    },
  });

  return {
    venues,
    selectedVenueId,
    setSelectedVenueId,
    courts,
    isLoading: venuesLoading || courtsLoading,
    isModalOpen,
    setIsModalOpen,
    formRegister,
    errors,
    saving: createMutation.isPending,
    openModal: () => setIsModalOpen(true),
    handleSubmit: handleSubmit((values) => createMutation.mutate(values)),
  };
};
