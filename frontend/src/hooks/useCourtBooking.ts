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

export const useCourtBooking = (courtId) => {
  const today = new Date().toISOString().split("T")[0];
  const [playDate, setPlayDate] = useState(today);
  const [pricingSlots, setPricingSlots] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [matchType, setMatchType] = useState("singles");
  const [selectedPositions, setSelectedPositions] = useState([]);
  const [showMatchPopup, setShowMatchPopup] = useState(false);

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
    if (pricingData) setPricingSlots(pricingData);
  }, [pricingData]);

  useEffect(() => {
    setSelectedPositions([]);
  }, [matchType, playDate, selectedTimeSlot?.pricingid]);

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
          });
        }
        return acc;
      }, [])
    : [];

  const getBookingsForSlot = (slot) =>
    bookedSlots.filter(
      (booked) =>
        booked.starttime.substring(0, 5) === slot.starttime.substring(0, 5) &&
        booked.endtime.substring(0, 5) === slot.endtime.substring(0, 5),
    );

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
    });

    setSelectedTimeSlot(null);
    setSelectedPositions([]);
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
    matchType,
    selectedPositions,
    selectedSlot,
    slots3D,
    occupiedSlots: computedOccupiedSlots,
    showMatchPopup,
    isFullCourt,
    canBook:
      !!selectedTimeSlot &&
      (isFullCourt || selectedPositions.length === activeMode.requiredCount),
    isLoading:
      pricingLoading ||
      scheduleLoading ||
      bookingMutation.isPending ||
      matchMutation.isPending,
    error:
      pricingError?.message ||
      scheduleError?.message ||
      bookingMutation.error?.message ||
      matchMutation.error?.message,
    setPlayDate,
    setSelectedTimeSlot,
    setMatchType,
    setSelectedSlot: (slot) => setSelectedPositions(slot ? [slot] : []),
    setSelectedPositions,
    handleTogglePosition,
    isSlotBooked,
    handleBookCourt,
    handleCreateMatch,
    setShowMatchPopup,
  };
};
