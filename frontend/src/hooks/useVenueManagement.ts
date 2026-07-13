import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../services/api";

const defaultVenueForm = {
  venueName: "",
  address: "",
  district: "",
  city: "",
  latitude: "",
  longitude: "",
  openTime: "06:00",
  closeTime: "23:00",
};

export const useVenueManagement = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedVenueForImage, setSelectedVenueForImage] = useState(null);
  const [formData, setFormData] = useState<any>(defaultVenueForm);
  const [editingId, setEditingId] = useState<any>(null);

  const { data: venues = [], isLoading } = useQuery({
    queryKey: ["myVenues"],
    queryFn: async () => {
      const data = await apiFetch("/venues");
      return data.venues || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: ({ id, values }: any) =>
      apiFetch(id ? `/venues/${id}` : "/venues", {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(values),
      }),
    onSuccess: () => {
      setFormData(defaultVenueForm);
      setEditingId(null);
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["myVenues"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: any) => apiFetch(`/venues/${id}`, { method: "DELETE" }),
    onSuccess: () => {
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
    saving: saveMutation.isPending,
    openModal: (venue: any = null) => {
      if (venue) {
        setEditingId(venue.venueid);
        setFormData({
          venueName: venue.venuename,
          address: venue.address,
          district: venue.district || "",
          city: venue.city || "",
          latitude: venue.latitude || "",
          longitude: venue.longitude || "",
          openTime: venue.opentime?.slice(0, 5) || "06:00",
          closeTime: venue.closetime?.slice(0, 5) || "23:00",
        });
      } else {
        setEditingId(null);
        setFormData(defaultVenueForm);
      }
      setIsModalOpen(true);
    },
    handleSubmit: (values: any) => saveMutation.mutate({ id: editingId, values }),
    handleDelete: (id: any) => {
      if (window.confirm("Bạn có chắc chắn muốn xóa cơ sở này? (Xóa mềm)")) {
        deleteMutation.mutate(id);
      }
    },
  };
};
