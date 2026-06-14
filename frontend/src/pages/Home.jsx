import HeroSection from "../HeroSection";
import TrendingCourts from "../TrendingCourts";
import MatchSection from "../MatchSection";
import StatsSection from "../StatsSection";

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
