import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useAuthStore from "../../store/useAuthStore";
import { loginSchema, LoginFormData } from "../../schemas/auth";

export const useLogin = () => {
  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state: any) => state.login);

  const onSubmit = async (data: LoginFormData) => {
    setApiError("");
    setLoading(true);

    try {
      await login(data.username, data.password);
      navigate("/");
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
