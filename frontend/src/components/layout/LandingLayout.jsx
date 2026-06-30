import { Outlet } from "react-router-dom";
import AppTopBar from "./AppTopBar";
import Footer from "./Footer";
import BottomNav from "./BottomNav";

const LandingLayout = () => {
  return (
    <div className="min-h-screen bg-[#00272C] flex flex-col relative">
      <AppTopBar />
      <div className="pt-24 pb-24 md:pb-0 flex-grow">
        <Outlet />
      </div>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default LandingLayout;
