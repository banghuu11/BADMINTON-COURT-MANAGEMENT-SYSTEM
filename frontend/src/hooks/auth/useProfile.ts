import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../services/api";
import useAuthStore from "../../store/useAuthStore";
import { ReviewForm } from "../../types/profile";

export const useProfile = () => {
  const { isAuthenticated } = useAuthStore() as any;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State for Modal
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState<ReviewForm>({
    venueId: "",
    bookingId: "",
    rating: 5,
    comment: "",
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // Fetch booking history
  const {
    data: bookings = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["bookingHistory"],
    queryFn: async () => {
      const data = await apiFetch("/booking/history");
      return data.bookings || [];
    },
    enabled: isAuthenticated,
  });

  // Mutation for cancelling a booking
  const cancelBookingMutation = useMutation({
    mutationFn: ({
      bookingId,
      reason,
    }: {
      bookingId: string;
      reason: string;
    }) =>
      apiFetch(`/booking/${bookingId}/cancel`, {
        method: "PATCH",
        body: JSON.stringify({ cancelReason: reason }),
      }),
    onSuccess: () => {
      alert("Hủy đặt sân thành công!");
      queryClient.invalidateQueries({ queryKey: ["bookingHistory"] });
    },
    onError: (err: any) => {
      alert(err.message || "Có lỗi xảy ra khi hủy đặt sân.");
    },
  });

  // Mutation for submitting a review
  const submitReviewMutation = useMutation({
    mutationFn: (form: ReviewForm) =>
      apiFetch("/reviews", { method: "POST", body: JSON.stringify(form) }),
    onSuccess: () => {
      alert("Cảm ơn bạn đã đánh giá!");
      setIsReviewModalOpen(false);
    },
    onError: (err: any) => {
      alert(err.message || "Lỗi khi gửi đánh giá.");
    },
  });

  const handleCancelBooking = (bookingId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đơn đặt sân này không?")) {
      const reason =
        window.prompt("Vui lòng nhập lý do hủy (không bắt buộc):") ||
        "Khách yêu cầu hủy";
      cancelBookingMutation.mutate({ bookingId, reason });
    }
  };

  return {
    bookings,
    isLoading,
    error: (error as Error)?.message,
    isReviewModalOpen,
    setIsReviewModalOpen,
    reviewForm,
    setReviewForm,
    submittingReview: submitReviewMutation.isPending,
    handleCancelBooking,
    handleSubmitReview: (e: React.FormEvent) => {
      e.preventDefault();
      submitReviewMutation.mutate(reviewForm);
    },
  };
};
