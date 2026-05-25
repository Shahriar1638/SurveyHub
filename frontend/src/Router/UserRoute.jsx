import { useContext } from "react";
import { Navigate } from "react-router";
import { AuthContext } from "../Firebase_AuthProvider/AuthProvider";
import useProfile from "../Hooks/useProfile";
import { ThreeDot } from "react-loading-indicators";

export default function UserRoute({ children }) {
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

  // If logged in but NOT a regular user (i.e., is Admin or Surveyor), 
  // redirect them to their specific privileged dashboard.
  if (profile?.role !== "user") {
    const target = profile?.role === "admin" ? "/admin" : "/surveyor";
    return <Navigate to={target} replace />;
  }

  return children;
}
