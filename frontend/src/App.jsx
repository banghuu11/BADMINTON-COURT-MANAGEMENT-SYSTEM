import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingLayout from "./components/layout/LandingLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
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
import MatchesPage from "./pages/MatchesPage";
import RoleProtectedRoute from "./components/auth/RoleProtectedRoute";
import Promotions from "./pages/Promotions";
import NotificationsPage from "./pages/NotificationsPage";

function App() {
  const fetchProfile = useAuthStore((state) => state.fetchProfile);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LandingLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/courts" element={<Courts />} />
          <Route path="/venue/:id" element={<VenueDetail />} />
          <Route path="/booking/:courtId" element={<CourtBooking />} />
          <Route path="/profile" element={<RoleProtectedRoute allowedRoles={[1,2,3,4,5]}><Profile /></RoleProtectedRoute>} />
          <Route path="/edit-profile" element={<RoleProtectedRoute allowedRoles={[1,2,3,4,5]}><EditProfile /></RoleProtectedRoute>} />
          <Route path="/owner-register" element={<OwnerOnboarding />} />
          <Route path="/admin-dashboard" element={<RoleProtectedRoute allowedRoles={[1]}><AdminDashboard /></RoleProtectedRoute>} />
          <Route path="/services" element={<RoleProtectedRoute allowedRoles={[1,2,3,4]}><ServiceManagement /></RoleProtectedRoute>} />
          <Route path="/owner-dashboard" element={<RoleProtectedRoute allowedRoles={[1,2]}><OwnerDashboard /></RoleProtectedRoute>} />
          <Route path="/reception" element={<RoleProtectedRoute allowedRoles={[1,2,3,4]}><ReceptionistDashboard /></RoleProtectedRoute>} />
          <Route path="/manage-promotions" element={<RoleProtectedRoute allowedRoles={[1,2,3]}><PromotionManagement /></RoleProtectedRoute>} />
          <Route path="/manage-courts" element={<RoleProtectedRoute allowedRoles={[1,2,3]}><CourtManagement /></RoleProtectedRoute>} />
          <Route path="/manage-venues" element={<RoleProtectedRoute allowedRoles={[1,2,3]}><VenueManagement /></RoleProtectedRoute>} />
          <Route path="/manage-pricing" element={<RoleProtectedRoute allowedRoles={[1,2,3]}><PricingManagement /></RoleProtectedRoute>} />
          <Route path="/matches" element={<RoleProtectedRoute allowedRoles={[1,2,3,4,5]}><MatchesPage /></RoleProtectedRoute>} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/notifications" element={<RoleProtectedRoute allowedRoles={[1,2,3,4,5]}><NotificationsPage /></RoleProtectedRoute>} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

