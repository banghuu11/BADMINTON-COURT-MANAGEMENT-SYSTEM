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
  const [formData, setFormData] = useState<any>(defaultPricingForm);
  const [editingId, setEditingId] = useState<any>(null);

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

  const saveMutation = useMutation({
    mutationFn: ({ id, values }: any) =>
      apiFetch(id ? `/pricing/${id}` : "/pricing", {
        method: id ? "PUT" : "POST",
        body: JSON.stringify({
          ...values,
          courtId: selectedCourtId,
          price: Number(values.price),
        }),
      }),
    onSuccess: () => {
      setFormData(defaultPricingForm);
      setEditingId(null);
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["pricing", selectedCourtId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: any) => apiFetch(`/pricing/${id}`, { method: "DELETE" }),
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
    editingId,
    saving: saveMutation.isPending,
    openModal: (pricing: any = null) => {
      if (pricing) {
        setEditingId(pricing.pricingid);
        setFormData({
          slotName: pricing.slotname,
          dayType: pricing.daytype,
          price: pricing.price,
          startTime: pricing.starttime?.slice(0, 5),
          endTime: pricing.endtime?.slice(0, 5),
        });
      } else {
        setEditingId(null);
        setFormData(defaultPricingForm);
      }
      setIsModalOpen(true);
    },
    handleSubmit: () => saveMutation.mutate({ id: editingId, values: formData }),
    handleDelete: deleteMutation.mutate,
  };
};
