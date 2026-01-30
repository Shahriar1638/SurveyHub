import { Outlet } from "react-router-dom";
import Sidebar from "../Pages/Shared/Dashboardsidebar/Sidebar";

const DashboardLayout = () => {
  return (
    <div className="flex bg-gray-50 min-h-screen font-sans">
      {/* Sidebar Fixed */}
      <aside className="hidden lg:block w-72 h-screen sticky top-0 bg-navy-950 z-50">
        <Sidebar />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-12 py-10">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay (if needed later) could go here */}
    </div>
  );
};

export default DashboardLayout;
