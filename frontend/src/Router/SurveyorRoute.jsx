import { useContext } from "react";
import { Navigate, Outlet } from "react-router";
import { AuthContext } from "../Firebase_AuthProvider/AuthProvider";
import useProfile from "../Hooks/useProfile";
import { LoadingSpinner } from "../Components/UI/LoadingSpinner";

export default function SurveyorRoute() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const { data: profile, isPending: isProfilePending } = useProfile();

  if (authLoading || isProfilePending) {
    return <LoadingSpinner />;
  }

  if (!user) return <Navigate to="/" replace />;
  if (profile?.role !== "surveyor") return <Navigate to="/" replace />;

  return <Outlet />;
}
