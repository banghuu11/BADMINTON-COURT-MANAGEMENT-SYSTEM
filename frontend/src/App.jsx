import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingLayout from "./LandingLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Courts from "./pages/venue/Courts";
import VenueDetail from "./pages/venue/VenueDetail";
import ServiceManagement from "./pages/venue/ServiceManagement";
import CourtBooking from "./pages/CourtBooking";
import OwnerOnboarding from "./pages/OwnerOnboarding";
import AdminDashboard from "./pages/AdminDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import ReceptionistDashboard from "./pages/ReceptionistDashboard";
import PromotionManagement from "./pages/venue/PromotionManagement";
import CourtManagement from "./pages/venue/CourtManagement";
import VenueManagement from "./pages/venue/VenueManagement";
import PricingManagement from "./pages/venue/PricingManagement";
import useAuthStore from "./store/useAuthStore";

function App() {
  const fetchProfile = useAuthStore((state) => state.fetchProfile);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Nhóm các trang sử dụng LandingLayout */}
        <Route element={<LandingLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/courts" element={<Courts />} />
          <Route path="/venue/:id" element={<VenueDetail />} />
          <Route path="/booking/:courtId" element={<CourtBooking />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/owner-register" element={<OwnerOnboarding />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/services" element={<ServiceManagement />} />
          <Route path="/owner-dashboard" element={<OwnerDashboard />} />
          <Route path="/reception" element={<ReceptionistDashboard />} />
          <Route path="/manage-promotions" element={<PromotionManagement />} />
          <Route path="/manage-courts" element={<CourtManagement />} />
          <Route path="/manage-venues" element={<VenueManagement />} />
          <Route path="/manage-pricing" element={<PricingManagement />} />
        </Route>

        {/* Các trang độc lập, không dùng chung Layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
