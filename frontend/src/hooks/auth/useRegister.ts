import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiFetch } from "../../services/api";
import { registerSchema, RegisterFormData } from "../../schemas/auth";
import toast from "react-hot-toast";

export const useRegister = () => {
  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      phoneNumber: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);

    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username: data.username,
          password: data.password,
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
        }),
      });

      toast.success("Đăng ký thành công! Hãy đăng nhập nhé.");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.message || "Lỗi đăng ký");
    } finally {
      setLoading(false);
    }
  };

  return {
    formRegister,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    loading,
  };
};
