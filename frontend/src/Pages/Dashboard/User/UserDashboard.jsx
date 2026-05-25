import { useContext } from "react";
import { AuthContext } from "../../../Firebase_AuthProvider/AuthProvider";
import useProfile from "../../../Hooks/useProfile";
import { useUserOverview } from "../../../Hooks/useDashboardUser";
import { PageTransition } from "../../../Components/UI/PageTransition";

import UserOverview from "./Components/UserOverview";
import ParticipationLedger from "./Components/ParticipationLedger";
import UserReports from "./Components/UserReports";
import UserSupport from "./Components/UserSupport";

export default function UserDashboard({ activeSection, onSectionChange }) {
  const { user } = useContext(AuthContext);
  const { data: profile } = useProfile();
  const { data: overview, isLoading } = useUserOverview();

  const firstName = (profile?.name || user?.displayName || "Member").split(" ")[0];

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

  // Section mapping
  const sections = {
    overview: <UserOverview overview={overview} profile={profile} onTabChange={onSectionChange} />,
    participation: <ParticipationLedger />,
    reports: <UserReports />,
    support: <UserSupport />,
  };

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
          <button
            onClick={() => onSectionChange?.("participation")}
            className="btn btn-user btn-md font-semibold text-white flex items-center gap-2"
          >
            View History
          </button>
        )}
      </div>

      {/* Active section */}
      {sections[activeSection] || sections.overview}
    </PageTransition>
  );
}
