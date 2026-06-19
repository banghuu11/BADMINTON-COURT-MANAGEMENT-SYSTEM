import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../services/api";

const defaultPricingForm = {
  slotName: "",
  dayType: "All",
  price: "",
  startTime: "",
  endTime: "",
};

export const usePricingManagement = () => {
  const queryClient = useQueryClient();
  const [selectedVenueId, setSelectedVenueId] = useState("");
  const [selectedCourtId, setSelectedCourtId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(defaultPricingForm);

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
    setSelectedCourtId("");
  }, [selectedVenueId, venues]);

  const { data: courts = [], isLoading: courtsLoading } = useQuery({
    queryKey: ["courts", selectedVenueId],
    queryFn: async () => {
      if (!selectedVenueId) return [];
      const data = await apiFetch(`/courts/venue/${selectedVenueId}`);
      return data.courts || [];
    },
    enabled: !!selectedVenueId,
  });

  const { data: pricingList = [], isLoading: pricingLoading } = useQuery({
    queryKey: ["pricing", selectedCourtId],
    queryFn: async () => {
      if (!selectedCourtId) return [];
      const data = await apiFetch(`/pricing/court/${selectedCourtId}`);
      return data.pricingList || [];
    },
    enabled: !!selectedCourtId,
  });

  const createMutation = useMutation({
    mutationFn: (values) =>
      apiFetch("/pricing", {
        method: "POST",
        body: JSON.stringify({
          ...values,
          courtId: selectedCourtId,
          price: Number(values.price),
          effectiveFrom: null,
          effectiveTo: null,
        }),
      }),
    onSuccess: () => {
      setFormData(defaultPricingForm);
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["pricing", selectedCourtId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiFetch(`/pricing/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pricing", selectedCourtId] });
    },
  });

  return {
    venues,
    selectedVenueId,
    setSelectedVenueId,
    courts,
    selectedCourtId,
    setSelectedCourtId,
    pricingList,
    isLoading: venuesLoading || courtsLoading || pricingLoading,
    isModalOpen,
    setIsModalOpen,
    formData,
    setFormData,
    saving: createMutation.isPending,
    openModal: () => setIsModalOpen(true),
    handleSubmit: createMutation.mutate,
    handleDelete: deleteMutation.mutate,
  };
};
