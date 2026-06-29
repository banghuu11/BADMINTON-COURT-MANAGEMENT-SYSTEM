import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const useHeroSearch = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("60");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location.trim()) params.set("location", location.trim());
    if (time) params.set("time", time);
    if (duration) params.set("duration", duration);

    navigate(`/courts${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return { location, setLocation, time, setTime, duration, setDuration, handleSearch };
};
