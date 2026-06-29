import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../services/api";

export const useAdminManagement = () => {
  const queryClient = useQueryClient();

  // ==========================================
  // QUERIES
  // ==========================================

  const usersQuery = useQuery({
    queryKey: ["adminUsers"],
    queryFn: () => apiFetch("/admin/users"),
  });

  const plansQuery = useQuery({
    queryKey: ["adminPlans"],
    queryFn: () => apiFetch("/admin/plans"),
  });

  const venuesQuery = useQuery({
    queryKey: ["adminVenues"],
    queryFn: () => apiFetch("/admin/venues"),
  });

  const courtsQuery = useQuery({
    queryKey: ["adminCourts"],
    queryFn: () => apiFetch("/admin/courts"),
  });

  const ownersQuery = useQuery({
    queryKey: ["adminOwners"],
    queryFn: () => apiFetch("/admin/owners"),
  });

  const bookingsQuery = useQuery({
    queryKey: ["adminBookings"],
    queryFn: () => apiFetch("/admin/bookings"),
  });

  const invoicesQuery = useQuery({
    queryKey: ["adminInvoices"],
    queryFn: () => apiFetch("/admin/invoices"),
  });

  const promotionsQuery = useQuery({
    queryKey: ["adminPromotions"],
    queryFn: () => apiFetch("/admin/promotions"),
  });

  const servicesQuery = useQuery({
    queryKey: ["adminServices"],
    queryFn: () => apiFetch("/admin/services"),
  });

  const reviewsQuery = useQuery({
    queryKey: ["adminReviews"],
    queryFn: () => apiFetch("/admin/reviews"),
  });

  // ==========================================
  // MUTATIONS: USERS
  // ==========================================

  const createUserMutation = useMutation({
    mutationFn: (userData) =>
      apiFetch("/admin/users", {
        method: "POST",
        body: JSON.stringify(userData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, ...userData }) =>
      apiFetch(`/admin/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(userData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id) =>
      apiFetch(`/admin/users/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
  });

  // ==========================================
  // MUTATIONS: PLANS
  // ==========================================

  const createPlanMutation = useMutation({
    mutationFn: (planData) =>
      apiFetch("/admin/plans", {
        method: "POST",
        body: JSON.stringify(planData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPlans"] });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({ id, ...planData }) =>
      apiFetch(`/admin/plans/${id}`, {
        method: "PUT",
        body: JSON.stringify(planData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPlans"] });
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: (id) =>
      apiFetch(`/admin/plans/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPlans"] });
    },
  });

  // ==========================================
  // MUTATIONS: VENUES
  // ==========================================

  const createVenueMutation = useMutation({
    mutationFn: (venueData) =>
      apiFetch("/admin/venues", {
        method: "POST",
        body: JSON.stringify(venueData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminVenues"] });
    },
  });

  const updateVenueMutation = useMutation({
    mutationFn: ({ id, ...venueData }) =>
      apiFetch(`/admin/venues/${id}`, {
        method: "PUT",
        body: JSON.stringify(venueData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminVenues"] });
    },
  });

  const deleteVenueMutation = useMutation({
    mutationFn: (id) =>
      apiFetch(`/admin/venues/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminVenues"] });
    },
  });

  // ==========================================
  // MUTATIONS: COURTS
  // ==========================================

  const createCourtMutation = useMutation({
    mutationFn: (courtData) =>
      apiFetch("/admin/courts", {
        method: "POST",
        body: JSON.stringify(courtData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCourts"] });
    },
  });

  const updateCourtMutation = useMutation({
    mutationFn: ({ id, ...courtData }) =>
      apiFetch(`/admin/courts/${id}`, {
        method: "PUT",
        body: JSON.stringify(courtData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCourts"] });
    },
  });

  const deleteCourtMutation = useMutation({
    mutationFn: (id) =>
      apiFetch(`/admin/courts/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCourts"] });
    },
  });

  // ==========================================
  // MUTATIONS: OTHER ENTITIES (DELETE ONLY)
  // ==========================================

  const deleteBookingMutation = useMutation({
    mutationFn: (id) =>
      apiFetch(`/admin/bookings/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBookings"] });
    },
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: (id) =>
      apiFetch(`/admin/invoices/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminInvoices"] });
    },
  });

  const deletePromotionMutation = useMutation({
    mutationFn: (id) =>
      apiFetch(`/admin/promotions/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPromotions"] });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id) =>
      apiFetch(`/admin/services/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminServices"] });
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: (id) =>
      apiFetch(`/admin/reviews/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminReviews"] });
    },
  });

  return {
    // Data lists
    users: usersQuery.data?.users || [],
    plans: plansQuery.data?.plans || [],
    venues: venuesQuery.data?.venues || [],
    courts: courtsQuery.data?.courts || [],
    owners: ownersQuery.data?.owners || [],
    bookings: bookingsQuery.data?.bookings || [],
    invoices: invoicesQuery.data?.invoices || [],
    promotions: promotionsQuery.data?.promotions || [],
    services: servicesQuery.data?.services || [],
    reviews: reviewsQuery.data?.reviews || [],

    // Loadings
    isLoading:
      usersQuery.isLoading ||
      plansQuery.isLoading ||
      venuesQuery.isLoading ||
      courtsQuery.isLoading ||
      ownersQuery.isLoading ||
      bookingsQuery.isLoading ||
      invoicesQuery.isLoading ||
      promotionsQuery.isLoading ||
      servicesQuery.isLoading ||
      reviewsQuery.isLoading,

    // Errors
    error:
      usersQuery.error?.message ||
      plansQuery.error?.message ||
      venuesQuery.error?.message ||
      courtsQuery.error?.message ||
      ownersQuery.error?.message ||
      bookingsQuery.error?.message ||
      invoicesQuery.error?.message ||
      promotionsQuery.error?.message ||
      servicesQuery.error?.message ||
      reviewsQuery.error?.message,

    // Actions
    createUser: createUserMutation.mutateAsync,
    updateUser: updateUserMutation.mutateAsync,
    deleteUser: deleteUserMutation.mutateAsync,

    createPlan: createPlanMutation.mutateAsync,
    updatePlan: updatePlanMutation.mutateAsync,
    deletePlan: deletePlanMutation.mutateAsync,

    createVenue: createVenueMutation.mutateAsync,
    updateVenue: updateVenueMutation.mutateAsync,
    deleteVenue: deleteVenueMutation.mutateAsync,

    createCourt: createCourtMutation.mutateAsync,
    updateCourt: updateCourtMutation.mutateAsync,
    deleteCourt: deleteCourtMutation.mutateAsync,

    deleteBooking: deleteBookingMutation.mutateAsync,
    deleteInvoice: deleteInvoiceMutation.mutateAsync,
    deletePromotion: deletePromotionMutation.mutateAsync,
    deleteService: deleteServiceMutation.mutateAsync,
    deleteReview: deleteReviewMutation.mutateAsync,
  };
};
