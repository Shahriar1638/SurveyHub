import { useContext } from "react";
import { Link, useLocation } from "react-router";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { AuthContext } from "../../../Firebase_AuthProvider/AuthProvider";
import useProfile from "../../../Hooks/useProfile";
import { useAdminOverview } from "../../../Hooks/useDashboardAdmin";
import { PageTransition } from "../../../Components/UI/PageTransition";

export default function AdminDashboard({ children }) {
  const { user } = useContext(AuthContext);
  const { data: profile } = useProfile();
  const { data: overview } = useAdminOverview();
  const location = useLocation();
  const activeSection = location.pathname.split("/").pop();

  const firstName = (profile?.name || user?.displayName || "Admin").split(" ")[0];

  return (
    <PageTransition>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="type-heading-xl text-[--color-text-primary]">
            Admin Control Center
          </h1>
          <p className="type-body-sm text-[--color-text-secondary] mt-1">
            Welcome back, {firstName}. Here's the platform status.
          </p>
        </div>
        {activeSection === "overview" && overview?.pendingReports > 0 && (
          <Link to="/dashboard/reports" className="btn btn-md font-semibold text-white flex items-center gap-2" style={{ backgroundColor: "var(--color-admin)" }}>
            <ShieldCheckIcon className="w-4 h-4" />
            {overview.pendingReports} Pending Reports
          </Link>
        )}
      </div>

      {children}
    </PageTransition>
  );
}

