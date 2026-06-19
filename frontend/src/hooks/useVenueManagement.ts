import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../services/api";

const defaultVenueForm = {
  venueName: "",
  address: "",
  district: "",
  city: "",
  openTime: "06:00",
  closeTime: "23:00",
};

export const useVenueManagement = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedVenueForImage, setSelectedVenueForImage] = useState(null);
  const [formData, setFormData] = useState(defaultVenueForm);

  const { data: venues = [], isLoading } = useQuery({
    queryKey: ["myVenues"],
    queryFn: async () => {
      const data = await apiFetch("/venues");
      return data.venues || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (values) =>
      apiFetch("/venues", { method: "POST", body: JSON.stringify(values) }),
    onSuccess: () => {
      setFormData(defaultVenueForm);
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["myVenues"] });
    },
  });

  return {
    venues,
    isLoading,
    isModalOpen,
    setIsModalOpen,
    isImageModalOpen,
    setIsImageModalOpen,
    selectedVenueForImage,
    setSelectedVenueForImage,
    formData,
    setFormData,
    saving: createMutation.isPending,
    openModal: () => setIsModalOpen(true),
    handleSubmit: createMutation.mutate,
  };
};
