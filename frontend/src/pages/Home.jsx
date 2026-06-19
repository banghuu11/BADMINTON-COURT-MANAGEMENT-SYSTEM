import HeroSection from "../components/home/HeroSection";
import TrendingCourts from "../components/home/TrendingCourts";
import MatchSection from "../components/home/MatchSection";
import StatsSection from "../components/home/StatsSection";

const Home = () => {
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
