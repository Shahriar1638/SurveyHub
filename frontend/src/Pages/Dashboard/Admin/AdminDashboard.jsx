/* eslint-disable no-unused-vars */
import { useContext } from "react";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { AuthContext } from "../../../Firebase_AuthProvider/AuthProvider";
import useProfile from "../../../Hooks/useProfile";
import { useAdminOverview } from "../../../Hooks/useDashboardAdmin";
import { PageTransition } from "../../../Components/UI/PageTransition";

import AdminOverview from "./Components/AdminOverview";
import AdminModeration from "./Components/AdminModeration";
import AuditLogs from "./Components/AuditLogs";
import BroadcastControl from "./Components/BroadcastControl";
import FeedbackManagement from "./Components/FeedbackManagement";

export default function AdminDashboard({ activeSection, onSectionChange }) {
  const { user } = useContext(AuthContext);
  const { data: profile } = useProfile();
  const { data: overview, isLoading } = useAdminOverview();

  const firstName = (profile?.name || user?.displayName || "Admin").split(" ")[0];

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-10 w-1/3 bg-[--color-bg-inset] rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-[--color-bg-inset] rounded-xl" />
          ))}
        </div>
        <div className="h-56 bg-[--color-bg-inset] rounded-xl" />
      </div>
    );
  }

  const sections = {
    overview: <AdminOverview overview={overview} />,
    moderation: <AdminModeration />,
    "audit-logs": <AuditLogs />,
    broadcasts: <BroadcastControl />,
    feedback: <FeedbackManagement />,
  };

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
          <button
            onClick={() => onSectionChange?.("moderation")}
            className="btn btn-md font-semibold text-white flex items-center gap-2"
            style={{ backgroundColor: "var(--color-admin)" }}
          >
            <ShieldCheckIcon className="w-4 h-4" />
            {overview.pendingReports} Pending Reports
          </button>
        )}
      </div>

      {/* Active section */}
      {sections[activeSection] || sections.overview}
    </PageTransition>
  );
}

