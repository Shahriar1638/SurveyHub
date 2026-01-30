/* eslint-disable no-unused-vars */
import { NavLink } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import { IoIosPeople } from "react-icons/io";
import { RiDraftFill } from "react-icons/ri";
import { IoCreateOutline } from "react-icons/io5";
import { GrAnalytics } from "react-icons/gr";
import { MdRateReview } from "react-icons/md";
import { VscFeedback } from "react-icons/vsc";
import useAdmin from "@/Hooks/useAdmin";
import useSurveyor from "@/Hooks/useSurveyor";
import { useEffect, useState } from "react";
import logo from "../../../assets/Logo.png";

// Helper Component for consistent links
// eslint-disable-next-line react/prop-types
const MenuLink = ({ to, icon: Icon, text }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 mx-3 rounded-lg transition-all duration-200 group ${
        isActive
          ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20"
          : "text-gray-400 hover:bg-navy-900 hover:text-white"
      }`
    }
  >
    <Icon className="text-xl transition-transform group-hover:scale-110" />
    <span className="font-medium tracking-wide text-sm">{text}</span>
  </NavLink>
);

const Sidebar = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin] = useAdmin();
  const [isSurveyor] = useSurveyor();

  useEffect(() => {
    if (
      (isAdmin === true || isAdmin === false) &&
      (isSurveyor === true || isSurveyor === false)
    ) {
      setLoading(false);
    }
  }, [isAdmin, isSurveyor]);

  if (loading) {
    return (
      <div className="flex h-full w-full justify-center items-center bg-navy-950">
        <span className="loading loading-spinner loading-lg text-brand-500"></span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-navy-950 text-white shadow-2xl border-r border-navy-900">
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-8 py-8 mb-6 border-b border-navy-800">
        <div className="w-10 h-10 rounded-full bg-white/5 p-1 border border-white/10 flex items-center justify-center backdrop-blur-sm">
          <img
            src={logo}
            alt="Logo"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Survey<span className="text-brand-500">Hub</span>
          </h1>
          <p className="text-xs text-navy-400 font-medium tracking-wider uppercase">
            Dashboard
          </p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto space-y-1">
        {isAdmin && (
          <>
            <div className="px-6 py-2 text-xs font-bold text-navy-500 uppercase tracking-wider mt-4">
              Admin Control
            </div>
            <MenuLink
              to="/dashboard/manageusers"
              icon={IoIosPeople}
              text="Manage Users"
            />
            <MenuLink
              to="/dashboard/managesurveystatus"
              icon={RiDraftFill}
              text="Survey Status"
            />
            <MenuLink
              to="/dashboard/statistics"
              icon={GrAnalytics}
              text="Statistics"
            />
          </>
        )}

        {isSurveyor && (
          <>
            <div className="px-6 py-2 text-xs font-bold text-navy-500 uppercase tracking-wider mt-4">
              Survey Management
            </div>
            <MenuLink
              to="/dashboard/createsurvey"
              icon={IoCreateOutline}
              text="Create Survey"
            />
            <MenuLink
              to="/dashboard/userreviews"
              icon={MdRateReview}
              text="User Reviews"
            />
            <MenuLink
              to="/dashboard/adminfeedback"
              icon={VscFeedback}
              text="Admin Feedback"
            />
          </>
        )}
      </nav>

      {/* Footer Action */}
      <div className="p-4 border-t border-navy-800 mt-auto">
        <NavLink
          to="/"
          className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-navy-900 border border-navy-800 rounded-lg text-gray-300 hover:text-white hover:border-brand-500 hover:bg-navy-800 transition-all group"
        >
          <FaHome className="group-hover:-translate-y-0.5 transition-transform text-brand-500" />
          <span className="font-semibold text-sm">Return Home</span>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
