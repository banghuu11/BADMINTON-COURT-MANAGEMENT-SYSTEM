import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../services/api";

const defaultPromotionForm = {
  promotionName: "",
  description: "",
  discountType: "Percent",
  discountValue: "",
  minOrderAmount: "",
  maxDiscount: "",
  startDate: "",
  endDate: "",
  usageLimit: "",
};

export const usePromotionManagement = () => {
  const queryClient = useQueryClient();
  const [selectedVenueId, setSelectedVenueId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ defaultValues: defaultPromotionForm });

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

  const { data: promotions = [], isLoading: promotionsLoading } = useQuery({
    queryKey: ["promotions", selectedVenueId],
    queryFn: async () => {
      if (!selectedVenueId) return [];
      const data = await apiFetch(`/promotions/venue/${selectedVenueId}`);
      return data.promotions || [];
    },
    enabled: !!selectedVenueId,
  });

  const saveMutation = useMutation({
    mutationFn: ({ id, values }) =>
      apiFetch(id ? `/promotions/${id}` : "/promotions", {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(values),
      }),
    onSuccess: () => {
      reset(defaultPromotionForm);
      setEditingId(null);
      setIsModalOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["promotions", selectedVenueId],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiFetch(`/promotions/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["promotions", selectedVenueId],
      });
    },
  });

  const openModal = (promotion = null) => {
    setEditingId(promotion?.promotionid || null);
    reset(
      promotion
        ? {
            promotionName: promotion.promotionname || "",
            description: promotion.description || "",
            discountType: promotion.discounttype || "Percent",
            discountValue: promotion.discountvalue || "",
            minOrderAmount: promotion.minorderamount || "",
            maxDiscount: promotion.maxdiscount || "",
            startDate: promotion.startdate
              ? new Date(promotion.startdate).toISOString().slice(0, 16)
              : "",
            endDate: promotion.enddate
              ? new Date(promotion.enddate).toISOString().slice(0, 16)
              : "",
            usageLimit: promotion.usagelimit || "",
          }
        : defaultPromotionForm,
    );
    setIsModalOpen(true);
  };

  const buildPayload = (values) => ({
    venueId: selectedVenueId,
    promotionName: values.promotionName,
    description: values.description,
    discountType: values.discountType,
    discountValue: Number(values.discountValue),
    minOrderAmount: values.minOrderAmount ? Number(values.minOrderAmount) : 0,
    maxDiscount: values.maxDiscount ? Number(values.maxDiscount) : null,
    startDate: values.startDate,
    endDate: values.endDate,
    usageLimit: values.usageLimit ? Number(values.usageLimit) : null,
  });

  return {
    venues,
    selectedVenueId,
    setSelectedVenueId,
    promotions,
    isLoading: venuesLoading || promotionsLoading,
    isModalOpen,
    setIsModalOpen,
    editingId,
    saving: saveMutation.isPending,
    formRegister,
    handleSubmit: handleSubmit((values) =>
      saveMutation.mutate({ id: editingId, values: buildPayload(values) }),
    ),
    errors,
    openModal,
    handleDelete: deleteMutation.mutate,
  };
};
