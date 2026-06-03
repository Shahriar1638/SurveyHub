import { useContext } from "react";
import { Link, useLocation } from "react-router";
import { AuthContext } from "../../../Firebase_AuthProvider/AuthProvider";
import useProfile from "../../../Hooks/useProfile";
import { PageTransition } from "../../../Components/UI/PageTransition";

export default function UserDashboard({ children }) {
  const { user } = useContext(AuthContext);
  const { data: profile } = useProfile();
  const location = useLocation();
  const activeSection = location.pathname.split("/").pop();

  const firstName = (profile?.name || user?.displayName || "Member").split(" ")[0];

  return (
    <PageTransition>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="type-heading-xl text-[--color-text-primary]">
            User Dashboard
          </h1>
          <p className="type-body-sm text-[--color-text-secondary] mt-1">
            Welcome back, {firstName}! Manage your surveys, reports, and rewards.
          </p>
        </div>
        {activeSection === "overview" && (
          <Link to="/dashboard/participation" className="btn btn-user btn-md font-semibold text-white flex items-center gap-2">
            View History
          </Link>
        )}
      </div>

      {children}
    </PageTransition>
  );
}
