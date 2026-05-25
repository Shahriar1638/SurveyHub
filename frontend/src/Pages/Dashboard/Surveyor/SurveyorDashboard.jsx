/* eslint-disable no-unused-vars */
import { useContext } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { AuthContext } from "../../../Firebase_AuthProvider/AuthProvider";
import useProfile from "../../../Hooks/useProfile";
import useDashboardSurveyor from "../../../Hooks/useDashboardSurveyor";
import { PageTransition } from "../../../Components/UI/PageTransition";

import SurveyorOverview from "./Components/SurveyorOverview";
import MySurveys from "./Components/MySurveys";
import AiAnalytics from "./Components/AiAnalytics";
import BlogStudio from "./Components/BlogStudio";
import FeedbackInbox from "./Components/FeedbackInbox";

export default function SurveyorDashboard({ activeSection, onSectionChange }) {
  const { user } = useContext(AuthContext);
  const { data: profile } = useProfile();
  const { data, isLoading } = useDashboardSurveyor();

  const firstName = (profile?.name || user?.displayName || "Surveyor").split(" ")[0];

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
    overview: <SurveyorOverview data={data} profile={profile} />,
    surveys: <MySurveys data={data} />,
    analytics: <AiAnalytics />,
    "blog-studio": <BlogStudio data={data} />,
    "feedback-inbox": <FeedbackInbox />,
  };

  return (
    <PageTransition>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="type-heading-xl text-[--color-text-primary]">
            Surveyor Workspace
          </h1>
          <p className="type-body-sm text-[--color-text-secondary] mt-1">
            Welcome back, {firstName}. Here's your insight cockpit.
          </p>
        </div>
        {activeSection === "overview" && (
          <button
            onClick={() => onSectionChange?.("surveys")}
            className="btn btn-surveyor btn-md flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Create Survey
          </button>
        )}
      </div>

      {/* Active section */}
      {sections[activeSection] || sections.overview}
    </PageTransition>
  );
}


