import { useContext } from "react";
import { Link, useLocation } from "react-router";
import { PlusIcon } from "@heroicons/react/24/outline";
import { AuthContext } from "../../../Firebase_AuthProvider/AuthProvider";
import useProfile from "../../../Hooks/useProfile";
import { PageTransition } from "../../../Components/UI/PageTransition";

export default function SurveyorDashboard({ children }) {
  const { user } = useContext(AuthContext);
  const { data: profile } = useProfile();
  const location = useLocation();
  const activeSection = location.pathname.split("/").pop();

  const firstName = (profile?.name || user?.displayName || "Surveyor").split(" ")[0];

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
          <Link to="/dashboard/create-survey" className="btn btn-primary btn-md flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            Create Survey
          </Link>
        )}
      </div>

      {children}
    </PageTransition>
  );
}


