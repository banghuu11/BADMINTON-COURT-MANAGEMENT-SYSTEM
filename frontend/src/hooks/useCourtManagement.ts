import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../services/api";

export const useCourtManagement = () => {
  const queryClient = useQueryClient();
  const [selectedVenueId, setSelectedVenueId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<any>(null);

  const defaultCourtForm = {
    courtName: "",
    courtCode: "",
    surfaceType: "PVC 4.5mm",
    isIndoor: true,
  };

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: defaultCourtForm,
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

  const saveMutation = useMutation({
    mutationFn: ({ id, values }: any) =>
      apiFetch(id ? `/courts/${id}` : "/courts", {
        method: id ? "PUT" : "POST",
        body: JSON.stringify({ ...values, venueId: selectedVenueId }),
      }),
    onSuccess: () => {
      reset(defaultCourtForm);
      setEditingId(null);
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["courts", selectedVenueId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: any) => apiFetch(`/courts/${id}`, { method: "DELETE" }),
    onSuccess: () => {
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
    editingId,
    saving: saveMutation.isPending,
    openModal: (court: any = null) => {
      if (court) {
        setEditingId(court.courtid);
        reset({
          courtName: court.courtname,
          courtCode: court.courtcode,
          surfaceType: court.surfacetype || "PVC 4.5mm",
          isIndoor: court.isindoor,
        });
      } else {
        setEditingId(null);
        reset(defaultCourtForm);
      }
      setIsModalOpen(true);
    },
    handleSubmit: handleSubmit((values: any) => saveMutation.mutate({ id: editingId, values })),
    handleDelete: (id: any) => {
      if (window.confirm("Bạn có chắc chắn muốn xóa sân này? (Xóa mềm)")) {
        deleteMutation.mutate(id);
      }
    },
  };
};
