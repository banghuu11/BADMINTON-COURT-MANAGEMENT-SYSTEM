import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useAuthStore from "../../store/useAuthStore";
import { loginSchema, LoginFormData } from "../../schemas/auth";
import toast from "react-hot-toast";

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

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state: any) => state.login);

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);

    try {
      const res = await login(data.username, data.password);
      toast.success("Đăng nhập thành công!");

      const roleId = Number(res.user?.roleid ?? res.user?.roleId ?? res.user?.RoleId);
      if (roleId === 1) {
        navigate("/admin-dashboard");
      } else if (roleId === 2) {
        navigate("/owner-dashboard");
      } else {
        navigate("/");
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi đăng nhập");
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
