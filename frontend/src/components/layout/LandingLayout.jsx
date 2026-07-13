import { Outlet } from "react-router-dom";
import AppTopBar from "./AppTopBar";
import Footer from "./Footer";
import BottomNav from "./BottomNav";

const LandingLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-background dark:text-white flex flex-col relative transition-colors">
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
