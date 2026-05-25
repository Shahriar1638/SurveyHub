import { useContext } from "react";
import { Navigate } from "react-router";
import { AuthContext } from "../Firebase_AuthProvider/AuthProvider";
import useProfile from "../Hooks/useProfile";
import { ThreeDot } from "react-loading-indicators";

export default function AdminRoute({ children }) {
  const { user, loading: authLoading } = useContext(AuthContext);
  const { data: profile, isPending: isProfilePending } = useProfile();

  if (authLoading || isProfilePending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <ThreeDot color="#32cd32" size="medium" text="" textColor="" />
      </div>
    );
  }

  // If not logged in, go to home
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // If logged in but NOT an admin, redirect to their specific home
  if (profile?.role !== "admin") {
    const target = profile?.role === "surveyor" ? "/surveyor" : "/user";
    return <Navigate to={target} replace />;
  }

  return children;
}
