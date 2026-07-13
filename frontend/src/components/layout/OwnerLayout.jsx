import { useState } from "react";
import { Outlet } from "react-router-dom";
import OwnerSidebar from "./OwnerSidebar";
import OwnerHeader from "./OwnerHeader";

const OwnerLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-background font-sans transition-colors">
      <OwnerSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      {/* Căn lề chính bằng padding-left tương đương chiều rộng Sidebar (64 = 16rem = 256px) trên Desktop */}
      <div className="flex-1 flex flex-col lg:pl-64 transition-all duration-300 min-h-screen w-full">
        <OwnerHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-background overflow-x-hidden transition-colors">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default OwnerLayout;
