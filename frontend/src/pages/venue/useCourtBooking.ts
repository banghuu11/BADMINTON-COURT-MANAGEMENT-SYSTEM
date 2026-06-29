import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../services/api";
import useAuthStore from "../../store/useAuthStore";
import {
  PricingSlot,
  BookedSlot,
  Slot3D,
  BookingPayload,
  MatchPayload,
} from "../../types/booking";

export const useCourtBooking = (courtId: string | undefined) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore() as any;

  // --- UI State ---
  const today = new Date().toISOString().split("T")[0];
  const [playDate, setPlayDate] = useState(today);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<PricingSlot | null>(
    null,
  );
  const [matchType, setMatchType] = useState<"doubles" | "singles">("doubles");
  const [selectedSlot, setSelectedSlot] = useState<Slot3D | null>(null);
  const [showMatchPopup, setShowMatchPopup] = useState(false);

  // --- Data Fetching with React Query ---
  const {
    data,
    isLoading: isFetchingData,
    error: fetchError,
  } = useQuery({
    queryKey: ["courtData", courtId, playDate],
    queryFn: async () => {
      if (!courtId || !playDate) return { bookedSlots: [], pricingList: [] };

      const [scheduleData, pricingData] = await Promise.all([
        apiFetch(
          `/booking/court-schedule?courtId=${courtId}&playDate=${playDate}`,
        ),
        apiFetch(`/pricing/court/${courtId}`),
      ]);

      return {
        bookedSlots: scheduleData.bookedSlots || [],
        pricingList: pricingData.pricingList || [],
      };
    },
    enabled: !!courtId && !!playDate,
  });

  useEffect(() => {
    setSelectedTimeSlot(null);
    setSelectedSlot(null);
  }, [playDate]);

  // --- Memoized Derived State ---
  const bookedSlots: BookedSlot[] = data?.bookedSlots || [];

  const pricingSlots = useMemo(() => {
    const dateObj = new Date(playDate);
    const dayOfWeek = dateObj.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const currentDayType = isWeekend ? "Weekend" : "Weekday";

    return (data?.pricingList || [])
      .filter(
        (p: PricingSlot) => p.daytype === "All" || p.daytype === currentDayType,
      )
      .sort((a: PricingSlot, b: PricingSlot) =>
        a.starttime.localeCompare(b.starttime),
      );
  }, [data?.pricingList, playDate]);

  const slots3D = useMemo(
    () =>
      matchType === "doubles"
        ? [
            {
              id: 1,
              positionIndex: 1,
              top: "20%",
              left: "28%",
              label: "Team A - Trái",
            },
            {
              id: 2,
              positionIndex: 2,
              top: "20%",
              left: "72%",
              label: "Team A - Phải",
            },
            {
              id: 3,
              positionIndex: 3,
              top: "80%",
              left: "28%",
              label: "Team B - Trái",
            },
            {
              id: 4,
              positionIndex: 4,
              top: "80%",
              left: "72%",
              label: "Team B - Phải",
            },
          ]
        : [
            {
              id: 1,
              positionIndex: 1,
              top: "20%",
              left: "50%",
              label: "Người chơi 1 (Team A)",
            },
            {
              id: 2,
              positionIndex: 2,
              top: "80%",
              left: "50%",
              label: "Người chơi 2 (Team B)",
            },
          ],
    [matchType],
  );

  const occupiedSlots = useMemo(
    () =>
      selectedTimeSlot
        ? slots3D.reduce((acc, s) => {
            const bookedSlot = bookedSlots.find((b) => {
              const start1 = selectedTimeSlot.starttime.substring(0, 5);
              const end1 = selectedTimeSlot.endtime.substring(0, 5);
              const start2 = b.starttime.substring(0, 5);
              const end2 = b.endtime.substring(0, 5);
              const overlaps = start1 < end2 && end1 > start2;
              return (
                overlaps &&
                (Number(b.positionindex) === 0 ||
                  Number(b.positionindex) === s.id)
              );
            });
            if (bookedSlot) {
              acc.push({
                ...s,
                avatarUrl: (bookedSlot as any).avatarurl,
                fullName:
                  (bookedSlot as any).fullname || (bookedSlot as any).guestname,
                skillLevel: (bookedSlot as any).skilllevel || (bookedSlot as any).SkillLevel || null,
              });
            }
            return acc;
          }, [] as any[])
        : [],
    [selectedTimeSlot, slots3D, bookedSlots],
  );

  const isSlotBooked = (pSlot: PricingSlot): string | false => {
    const bookingsInSlot = bookedSlots.filter((bSlot) => {
      const start1 = pSlot.starttime.substring(0, 5);
      const end1 = pSlot.endtime.substring(0, 5);
      const start2 = bSlot.starttime.substring(0, 5);
      const end2 = bSlot.endtime.substring(0, 5);
      return start1 < end2 && end1 > start2;
    });
    if (bookingsInSlot.length === 0) return false;
    if (bookingsInSlot.some((b) => Number(b.positionindex) === 0))
      return "Đã bao sân";
    if (bookingsInSlot.length >= 4) return "Đủ 4 người";
    return false;
  };

  // --- Mutations ---
  const bookCourtMutation = useMutation({
    mutationFn: (bookingPayload: BookingPayload) =>
      apiFetch("/booking", {
        method: "POST",
        body: JSON.stringify(bookingPayload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["courtData", courtId, playDate],
      });
      setShowMatchPopup(true);
    },
  });

  const createMatchMutation = useMutation({
    mutationFn: (matchPayload: MatchPayload) =>
      apiFetch("/booking/matches", {
        method: "POST",
        body: JSON.stringify(matchPayload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      navigate("/");
    },
    onError: (err: any) => {
      alert(err.message || "Lỗi khi đăng tin giao lưu.");
      navigate("/profile");
    },
  });

  // --- Event Handlers ---
  const handleBookCourt = () => {
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để đặt sân!");
      navigate("/login");
      return;
    }
    if (!selectedSlot || !selectedTimeSlot || !courtId) return;

    const payload: BookingPayload = {
      bookingType: "Online",
      note: `Chế độ: ${matchType === "doubles" ? "Đánh đôi" : "Đánh đơn"} - Vị trí: ${selectedSlot.label}`,
      slots: [
        {
          courtId: parseInt(courtId),
          playDate,
          startTime: selectedTimeSlot.starttime,
          endTime: selectedTimeSlot.endtime,
          appliedPrice: selectedTimeSlot.price,
          positionIndex: selectedSlot.id,
        },
      ],
    };
    bookCourtMutation.mutate(payload);
  };

  const handleCreateMatch = () => {
    const successfulSlot = (bookCourtMutation.variables as BookingPayload)
      ?.slots[0];
    if (!successfulSlot) return;

    const payload: MatchPayload = {
      courtId: successfulSlot.courtId,
      playDate: successfulSlot.playDate,
      startTime: successfulSlot.startTime,
      endTime: successfulSlot.endTime,
    };
    createMatchMutation.mutate(payload);
  };

  return {
    playDate,
    pricingSlots,
    selectedTimeSlot,
    matchType,
    selectedSlot,
    slots3D,
    occupiedSlots,
    showMatchPopup,
    isLoading: isFetchingData || bookCourtMutation.isPending,
    error:
      (fetchError as Error)?.message ||
      (bookCourtMutation.error as Error)?.message,
    setPlayDate,
    setSelectedTimeSlot,
    setMatchType,
    setSelectedSlot,
    isSlotBooked,
    handleBookCourt,
    handleCreateMatch,
    setShowMatchPopup,
  };
};
