import React, { useState, useEffect } from "react";
import { useNavigate, useLocation as useRouterLocation } from "react-router-dom";
import { MapPin, X } from "lucide-react";

const GlobalLocationPrompt = () => {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();

  useEffect(() => {
    // Only prompt if we haven't asked in this session
    const hasAsked = sessionStorage.getItem("hasAskedLocation");
    
    // Don't show if they are already searching with location
    const searchParams = new URLSearchParams(routerLocation.search);
    const hasLat = searchParams.has("lat");
    const hasNear = searchParams.get("near") === "1";

    if (!hasAsked && !hasLat && !hasNear) {
      // Small delay to let the initial animation finish
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [routerLocation.search]);

  const handleDecline = () => {
    setShow(false);
    sessionStorage.setItem("hasAskedLocation", "1");
  };

  const handleAccept = () => {
    setShow(false);
    sessionStorage.setItem("hasAskedLocation", "1");

    if (!navigator.geolocation) {
      alert("Trình duyệt của bạn không hỗ trợ định vị.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        // Redirect to courts page with location params
        navigate(`/courts?near=1&lat=${lat}&lng=${lng}`);
      },
      (error) => {
        console.error("Lỗi lấy vị trí:", error);
        alert("Không thể lấy vị trí. Vui lòng kiểm tra quyền truy cập vị trí của trình duyệt.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5 * 60 * 1000 }
    );
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 w-[320px] animate-fade-in sm:bottom-6 sm:left-6 shadow-2xl">
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-white/10 p-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]">
        <button
          onClick={handleDecline}
          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
            <MapPin className="h-5 w-5" />
          </div>
          <div className="flex-1 pt-0.5">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Tìm sân gần bạn?
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Bật vị trí để CourtLink ưu tiên gợi ý các sân đang trống ở gần bạn nhất.
            </p>
            <button
              onClick={handleAccept}
              className="mt-3 w-full rounded-lg bg-primary py-2 text-xs font-bold text-slate-900 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Cho phép bật vị trí
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalLocationPrompt;
