import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useAuthStore from "../../store/useAuthStore";
import { registerSchema, RegisterFormData } from "../../schemas/auth";

export const useRegister = () => {
  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    // 2. Sử dụng zodResolver để tích hợp Zod với React Hook Form
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      phoneNumber: "",
      email: "",
      confirmPassword: "",
      roleName: "Customer",
    },
  });

  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const register = useAuthStore((state: any) => state.register);

  const onSubmit = async (data: RegisterFormData) => {
    setApiError("");
    setLoading(true);

    try {
      await register(data);
      alert("Đăng ký thành công! Hãy đăng nhập nhé.");
      navigate("/login");
    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    formRegister,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    apiError,
    loading,
  };
};
