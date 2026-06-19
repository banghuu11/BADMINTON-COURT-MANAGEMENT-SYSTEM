import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../services/api";

const defaultServiceForm = {
  serviceName: "",
  unitPrice: "",
  stockQuantity: "",
  unit: "Cái",
  isActive: true,
};

export const useServiceManagement = () => {
  const queryClient = useQueryClient();
  const [selectedVenueId, setSelectedVenueId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ defaultValues: defaultServiceForm });

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

  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ["services", selectedVenueId],
    queryFn: async () => {
      if (!selectedVenueId) return [];
      const data = await apiFetch(`/services/venue/${selectedVenueId}`);
      return data.services || [];
    },
    enabled: !!selectedVenueId,
  });

  const saveMutation = useMutation({
    mutationFn: (values) =>
      apiFetch(editingId ? `/services/${editingId}` : "/services", {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify({
          venueId: selectedVenueId,
          serviceName: values.serviceName,
          unitPrice: Number(values.unitPrice),
          costPrice: null,
          unit: values.unit,
          stockQuantity: values.stockQuantity ? Number(values.stockQuantity) : 0,
          minStockAlert: 5,
          imageUrl: null,
          isRentable: false,
          rentalPrice: null,
          isActive: values.isActive,
        }),
      }),
    onSuccess: () => {
      reset(defaultServiceForm);
      setEditingId(null);
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["services", selectedVenueId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiFetch(`/services/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services", selectedVenueId] });
    },
  });

  const openModal = (service = null) => {
    setEditingId(service?.serviceid || null);
    reset(
      service
        ? {
            serviceName: service.servicename || "",
            unitPrice: service.unitprice || "",
            stockQuantity: service.stockquantity || "",
            unit: service.unit || "Cái",
            isActive: service.isactive,
          }
        : defaultServiceForm,
    );
    setIsModalOpen(true);
  };

  return {
    venues,
    selectedVenueId,
    setSelectedVenueId,
    services,
    isLoading: venuesLoading || servicesLoading,
    isModalOpen,
    setIsModalOpen,
    editingId,
    formRegister,
    handleSubmit: handleSubmit(saveMutation.mutate),
    errors,
    openModal,
    handleDelete: deleteMutation.mutate,
    saving: saveMutation.isPending,
  };
};
