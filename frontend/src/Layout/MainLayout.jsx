import { Outlet } from "react-router";
import { Navbar } from "../Components/Shared/Navbar";
import { Footer } from "../Components/Shared/Footer";

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-[--color-bg-primary]">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
