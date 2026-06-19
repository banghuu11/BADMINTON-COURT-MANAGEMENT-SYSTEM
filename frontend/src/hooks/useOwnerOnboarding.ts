import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "../services/api";
import useAuthStore from "../store/useAuthStore";
import { ownerSchema, OwnerFormData } from "../schemas/owner";

export const useOwnerOnboarding = () => {
  const { isAuthenticated } = useAuthStore();
  const [error, setError] = useState("");

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OwnerFormData>({
    resolver: zodResolver(ownerSchema),
    defaultValues: {
      businessType: "Individual",
      businessName: "",
      taxCode: "",
      businessAddress: "",
      repFullName: "",
      repPosition: "",
      repPhone: "",
      repEmail: "",
      repIdType: "CCCD",
      repIdNumber: "",
      repIdIssuedDate: "",
      repIdIssuedPlace: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: (data: OwnerFormData) =>
      apiFetch("/owner/profile", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      setError("");
      reset();
      alert("Hồ sơ chủ sân đã được gửi thành công!");
    },
    onError: (err: any) => {
      setError(err.message || "Không thể gửi hồ sơ chủ sân.");
    },
  });

  return {
    isAuthenticated,
    formRegister,
    handleSubmit: handleSubmit((data) => submitMutation.mutate(data)),
    errors,
    loading: submitMutation.isPending,
    error,
  };
};
