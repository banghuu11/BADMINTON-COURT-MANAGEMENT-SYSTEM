import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const useHeroSearch = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [time, setTime] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location.trim()) params.set("location", location.trim());
    if (time) params.set("time", time);

    navigate(`/courts${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return { location, setLocation, time, setTime, handleSearch };
};
