import useAuthStore from "../store/useAuthStore";
import HeroSection from "../components/home/HeroSection";
import TrendingCourts from "../components/home/TrendingCourts";
import MatchSection from "../components/home/MatchSection";
import StatsSection from "../components/home/StatsSection";
import AdminDashboard from "./AdminDashboard";
import OwnerDashboard from "./OwnerDashboard";

const Home = () => {
  const user = useAuthStore((state) => state.user);
  const roleId = Number(user?.roleid || user?.roleId || user?.RoleId);

  if (roleId === 1) {
    return <AdminDashboard />;
  }
  if (roleId === 2) {
    return <OwnerDashboard />;
  }

  return (
    <div className="pb-12 animate-fade-in">
      <HeroSection />
      <TrendingCourts />
      <MatchSection />
      <StatsSection />
    </div>
  );
};

export default Home;
