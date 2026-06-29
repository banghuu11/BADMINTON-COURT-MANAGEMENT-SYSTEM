import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiFetch } from "../services/api";

const matchModeConfig = {
  singles: {
    label: "1 vs 1",
    requiredCount: 1,
    positions: [
      {
        id: 1,
        label: "Người chơi 1 (Team A)",
        positionIndex: 1,
        top: "20%",
        left: "50%",
      },
      {
        id: 2,
        label: "Người chơi 2 (Team B)",
        positionIndex: 2,
        top: "80%",
        left: "50%",
      },
    ],
  },
  doubles: {
    label: "2 vs 2",
    requiredCount: 1,
    positions: [
      {
        id: 1,
        label: "Team A - Trái",
        positionIndex: 1,
        top: "20%",
        left: "28%",
      },
      {
        id: 2,
        label: "Team A - Phải",
        positionIndex: 2,
        top: "20%",
        left: "72%",
      },
      {
        id: 3,
        label: "Team B - Trái",
        positionIndex: 3,
        top: "80%",
        left: "28%",
      },
      {
        id: 4,
        label: "Team B - Phải",
        positionIndex: 4,
        top: "80%",
        left: "72%",
      },
    ],
  },
  fullCourt: {
    label: "Bao sân",
    requiredCount: 0,
    positions: [],
  },
};

const durationOptions = [
  { label: "1 tiếng", minutes: 60 },
  { label: "1 tiếng 30", minutes: 90 },
  { label: "2 tiếng", minutes: 120 },
];

const timeToMinutes = (time) => {
  const [hours, minutes] = time.substring(0, 5).split(":").map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (totalMinutes) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const getCurrentDayType = (playDate) => {
  const dateObj = new Date(playDate);
  const dayOfWeek = dateObj.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6 ? "Weekend" : "Weekday";
};

const buildBookableSlots = (pricingList, playDate, durationMinutes) => {
  const currentDayType = getCurrentDayType(playDate);

  return (pricingList || [])
    .filter((slot) => slot.daytype === "All" || slot.daytype === currentDayType)
    .sort((a, b) => a.starttime.localeCompare(b.starttime))
    .flatMap((slot) => {
      const windowStart = timeToMinutes(slot.starttime);
      const windowEnd = timeToMinutes(slot.endtime);
      const latestStart = windowEnd - durationMinutes;
      const starts = [];

      for (let start = windowStart; start <= latestStart; start += 30) {
        const end = start + durationMinutes;
        starts.push({
          ...slot,
          pricingid: `${slot.pricingid}-${start}-${durationMinutes}`,
          sourcePricingId: slot.pricingid,
          starttime: minutesToTime(start),
          endtime: minutesToTime(end),
          durationMinutes,
          durationLabel:
            durationOptions.find((option) => option.minutes === durationMinutes)
              ?.label || `${durationMinutes} phút`,
        });
      }

      return starts;
    });
};

export const useCourtBooking = (courtId) => {
  const today = new Date().toISOString().split("T")[0];
  const [playDate, setPlayDate] = useState(today);
  const [pricingSlots, setPricingSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [matchType, setMatchType] = useState("singles");
  const [selectedPositions, setSelectedPositions] = useState([]);
  const [showMatchPopup, setShowMatchPopup] = useState(false);

  // States cho khuyến mãi
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  // Query lấy chi tiết sân đấu để có VenueId
  const {
    data: courtData,
    isLoading: courtLoading,
    error: courtError,
  } = useQuery({
    queryKey: ["courtDetails", courtId],
    queryFn: async () => {
      if (!courtId) return null;
      const data = await apiFetch(`/courts/${courtId}`);
      return data.court || null;
    },
    enabled: !!courtId,
  });

  const venueId = courtData?.venueid;

  // Query lấy danh sách khuyến mãi của cơ sở (venue)
  const {
    data: promotionsData,
    isLoading: promotionsLoading,
  } = useQuery({
    queryKey: ["venuePromotions", venueId],
    queryFn: async () => {
      if (!venueId) return [];
      const data = await apiFetch(`/promotions/venue/${venueId}`);
      return data.promotions || [];
    },
    enabled: !!venueId,
  });

  const {
    data: pricingData,
    isLoading: pricingLoading,
    error: pricingError,
  } = useQuery({
    queryKey: ["pricing", courtId],
    queryFn: async () => {
      if (!courtId) return [];
      const data = await apiFetch(`/pricing/court/${courtId}`);
      return data.pricingList || [];
    },
    enabled: !!courtId,
  });

  const {
    data: scheduleData,
    isLoading: scheduleLoading,
    error: scheduleError,
  } = useQuery({
    queryKey: ["courtSchedule", courtId, playDate],
    queryFn: async () => {
      if (!courtId || !playDate) return [];
      const data = await apiFetch(
        `/booking/court-schedule?courtId=${encodeURIComponent(
          courtId,
        )}&playDate=${encodeURIComponent(playDate)}`,
      );
      return data.bookedSlots || [];
    },
    enabled: !!courtId && !!playDate,
  });

  const bookingMutation = useMutation({
    mutationFn: (values) =>
      apiFetch("/booking", { method: "POST", body: JSON.stringify(values) }),
  });

  const matchMutation = useMutation({
    mutationFn: (values) =>
      apiFetch("/booking/matches", {
        method: "POST",
        body: JSON.stringify(values),
      }),
  });

  useEffect(() => {
    setPricingSlots(buildBookableSlots(pricingData, playDate, selectedDuration));
  }, [pricingData, playDate, selectedDuration]);

  // Reset các lựa chọn và khuyến mãi khi đổi ca chơi/ngày/chế độ
  useEffect(() => {
    setSelectedPositions([]);
    setAppliedDiscount(null);
    setPromoError("");
  }, [matchType, playDate, selectedDuration, selectedTimeSlot?.pricingid]);

  useEffect(() => {
    setSelectedTimeSlot(null);
  }, [playDate, selectedDuration]);

  useEffect(() => {
    setAppliedDiscount(null);
    setPromoError("");
  }, [selectedPositions]);

  // Áp dụng mã giảm giá nhập tay
  const handleApplyPromoCode = async (codeStr) => {
    if (!codeStr || !codeStr.trim()) {
      setPromoError("Vui lòng nhập mã giảm giá!");
      return;
    }
    if (!selectedTimeSlot) {
      setPromoError("Vui lòng chọn ngày & giờ chơi trước khi áp dụng mã!");
      return;
    }

    setPromoError("");
    setIsApplyingPromo(true);

    try {
      const [sh, sm] = selectedTimeSlot.starttime.split(":").map(Number);
      const [eh, em] = selectedTimeSlot.endtime.split(":").map(Number);
      const durationHours = (eh * 60 + em - (sh * 60 + sm)) / 60;
      const count = isFullCourt ? 1 : selectedPositions.length || 1;
      const courtTotal = Number(selectedTimeSlot.price) * durationHours * count;

      const data = await apiFetch("/booking/validate-promotion", {
        method: "POST",
        body: JSON.stringify({
          code: codeStr.trim(),
          courtId: Number(courtId),
          playDate,
          courtTotal,
        }),
      });

      if (data.discountDetail) {
        setAppliedDiscount({
          ...data.discountDetail,
          code: codeStr.trim(),
        });
        setPromoError("");
      }
    } catch (err) {
      console.error(err);
      setPromoError(err.message || "Không thể áp dụng mã giảm giá.");
      setAppliedDiscount(null);
    } finally {
      setIsApplyingPromo(false);
    }
  };

  // Chọn khuyến mãi trực tiếp từ danh sách
  const handleSelectPromotion = async (promo) => {
    if (!selectedTimeSlot) {
      setPromoError("Vui lòng chọn ngày & giờ chơi trước khi chọn khuyến mãi!");
      return;
    }
    setPromoError("");
    setIsApplyingPromo(true);

    try {
      const [sh, sm] = selectedTimeSlot.starttime.split(":").map(Number);
      const [eh, em] = selectedTimeSlot.endtime.split(":").map(Number);
      const durationHours = (eh * 60 + em - (sh * 60 + sm)) / 60;
      const count = isFullCourt ? 1 : selectedPositions.length || 1;
      const courtTotal = Number(selectedTimeSlot.price) * durationHours * count;

      const data = await apiFetch("/booking/validate-promotion", {
        method: "POST",
        body: JSON.stringify({
          promotionId: promo.promotionid,
          courtId: Number(courtId),
          playDate,
          courtTotal,
        }),
      });

      if (data.discountDetail) {
        setAppliedDiscount({
          ...data.discountDetail,
          code: null,
          promotionName: promo.promotionname,
        });
        setPromoError("");
      }
    } catch (err) {
      console.error(err);
      setPromoError(err.message || "Không thể áp dụng chương trình khuyến mãi.");
      setAppliedDiscount(null);
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const bookedSlots = scheduleData || [];
  const isFullCourt = matchType === "fullCourt";
  const activeMode = matchModeConfig[matchType];
  const slots3D = activeMode.positions;
  const requiredPositions = slots3D;
  const selectedSlot = selectedPositions[0] || null;

  const computedOccupiedSlots = selectedTimeSlot
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
              Number(b.positionindex) === s.positionIndex)
          );
        });
        if (bookedSlot) {
          acc.push({
            ...s,
            avatarUrl: bookedSlot.avatarurl,
            fullName: bookedSlot.fullname || bookedSlot.guestname,
            phoneNumber: bookedSlot.phonenumber || bookedSlot.guestphone,
            skillLevel: bookedSlot.skilllevel || bookedSlot.SkillLevel || null,
          });
        }
        return acc;
      }, [])
    : [];

  const getBookingsForSlot = (slot) =>
    bookedSlots.filter((booked) => {
      const start1 = slot.starttime.substring(0, 5);
      const end1 = slot.endtime.substring(0, 5);
      const start2 = booked.starttime.substring(0, 5);
      const end2 = booked.endtime.substring(0, 5);
      return start1 < end2 && end1 > start2;
    });

  const isSlotBooked = (slot) => {
    const bookingsInSlot = getBookingsForSlot(slot);
    if (bookingsInSlot.length === 0) return "";

    const hasFullCourtBooking = bookingsInSlot.some(
      (booked) => Number(booked.positionindex) === 0,
    );
    if (hasFullCourtBooking) return "Đã bao sân";

    if (isFullCourt) return "Không còn trống";

    const bookedPositionIndexes = new Set(
      bookingsInSlot.map((booked) => Number(booked.positionindex)),
    );
    const availablePositions = requiredPositions.filter(
      (position) => !bookedPositionIndexes.has(position.positionIndex),
    );

    return availablePositions.length === 0 ? "Đã hết vị trí" : "";
  };

  const buildBookingSlots = () => {
    const baseSlot = {
      courtId: Number(courtId),
      playDate,
      startTime: selectedTimeSlot.starttime,
      endTime: selectedTimeSlot.endtime,
      appliedPrice: Number(selectedTimeSlot.price),
    };

    if (isFullCourt) {
      return [{ ...baseSlot, positionIndex: 0 }];
    }

    return selectedPositions.map((position) => ({
      ...baseSlot,
      positionIndex: position.positionIndex,
    }));
  };

  const handleTogglePosition = (position) => {
    if (isFullCourt || !selectedTimeSlot) return;

    setSelectedPositions((current) => {
      const exists = current.some((item) => item.id === position.id);
      if (exists) return []; // Nếu click lại thì bỏ chọn
      return [position]; // Chỉ lưu duy nhất 1 vị trí vừa click
    });
  };

  const handleBookCourt = async () => {
    if (!selectedTimeSlot) return;
    if (!isFullCourt && selectedPositions.length < activeMode.requiredCount) {
      return;
    }

    await bookingMutation.mutateAsync({
      bookingType: "Online",
      note:
        matchType === "fullCourt"
          ? "Đặt bao toàn bộ sân"
          : matchType === "doubles"
            ? "Tìm đồng đội đánh đôi"
            : "Đánh đơn",
      slots: buildBookingSlots(),
      promotionId: appliedDiscount?.promotionId || null,
      codeId: appliedDiscount?.codeId || null,
      discountCode: appliedDiscount?.code || null,
    });

    setSelectedTimeSlot(null);
    setSelectedPositions([]);
    setAppliedDiscount(null);
    setShowMatchPopup(true);
  };

  const handleCreateMatch = async () => {
    if (!selectedTimeSlot) return;

    await matchMutation.mutateAsync({
      courtId: Number(courtId),
      playDate,
      startTime: selectedTimeSlot.starttime,
      endTime: selectedTimeSlot.endtime,
    });
  };

  return {
    playDate,
    pricingSlots,
    selectedTimeSlot,
    selectedDuration,
    durationOptions,
    matchType,
    selectedPositions,
    selectedSlot,
    slots3D,
    occupiedSlots: computedOccupiedSlots,
    showMatchPopup,
    isFullCourt,
    courtData,
    promotions: promotionsData,
    promoCode,
    promoError,
    appliedDiscount,
    isApplyingPromo,
    canBook:
      !!selectedTimeSlot &&
      (isFullCourt || selectedPositions.length === activeMode.requiredCount),
    isLoading:
      pricingLoading ||
      scheduleLoading ||
      courtLoading ||
      promotionsLoading ||
      bookingMutation.isPending ||
      matchMutation.isPending,
    error:
      pricingError?.message ||
      scheduleError?.message ||
      courtError?.message ||
      bookingMutation.error?.message ||
      matchMutation.error?.message,
    setPlayDate,
    setSelectedDuration,
    setSelectedTimeSlot,
    setMatchType,
    setSelectedSlot: (slot) => setSelectedPositions(slot ? [slot] : []),
    setSelectedPositions,
    handleTogglePosition,
    isSlotBooked,
    handleBookCourt,
    handleCreateMatch,
    setShowMatchPopup,
    setPromoCode,
    handleApplyPromoCode,
    handleSelectPromotion,
    setPromoError,
  };
};
