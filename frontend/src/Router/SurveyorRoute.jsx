import { useContext } from "react";
import { Navigate, Outlet } from "react-router";
import { AuthContext } from "../Firebase_AuthProvider/AuthProvider";
import useProfile from "../Hooks/useProfile";
import { ThreeDot } from "react-loading-indicators";

export default function SurveyorRoute() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const { data: profile, isPending: isProfilePending } = useProfile();

  if (authLoading || isProfilePending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <ThreeDot color="#32cd32" size="medium" text="" textColor="" />
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;
  if (profile?.role !== "surveyor") return <Navigate to="/" replace />;

  return <Outlet />;
}
