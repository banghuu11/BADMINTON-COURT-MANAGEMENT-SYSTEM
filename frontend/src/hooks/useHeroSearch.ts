import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const useHeroSearch = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location.trim()) params.set("location", location.trim());
    if (time) params.set("time", time);
    if (duration) params.set("duration", duration);

    navigate(`/courts${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleNearMe = () => {
    const params = new URLSearchParams();
    params.set("near", "1");
    if (time) params.set("time", time);
    if (duration) params.set("duration", duration);

    if (!navigator.geolocation) {
      setLocationError("Trình duyệt không hỗ trợ lấy vị trí.");
      navigate(`/courts?${params.toString()}`);
      return;
    }

    setIsLocating(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        params.set("lat", String(position.coords.latitude));
        params.set("lng", String(position.coords.longitude));
        setIsLocating(false);
        navigate(`/courts?${params.toString()}`);
      },
      (geoError) => {
        const message =
          geoError.code === geoError.PERMISSION_DENIED
            ? "Bạn chưa cho phép truy cập vị trí."
            : "Không lấy được vị trí hiện tại của bạn.";
        setLocationError(message);
        setIsLocating(false);
        navigate(`/courts?${params.toString()}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000,
      },
    );
  };

  return {
    location,
    setLocation,
    time,
    setTime,
    duration,
    setDuration,
    isLocating,
    locationError,
    handleSearch,
    handleNearMe,
  };
};
