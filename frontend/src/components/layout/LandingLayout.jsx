import { Outlet } from "react-router-dom";
import AppTopBar from "./AppTopBar";
import Footer from "./Footer";

const LandingLayout = () => {
  return (
    <div className="min-h-screen bg-[#0b1c30] flex flex-col">
      <AppTopBar />
      <div className="pt-24 flex-grow">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default LandingLayout;
