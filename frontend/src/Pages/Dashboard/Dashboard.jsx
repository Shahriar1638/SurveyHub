import { useContext } from "react";
import { Navigate } from "react-router";
import { AuthContext } from "../../Firebase_AuthProvider/AuthProvider";
import useProfile from "../../Hooks/useProfile";
import { LoadingSpinner } from "../../Components/UI/LoadingSpinner";

// ── Dashboard — entry point, redirects to overview ───────────────────────────
export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const { data: profile, isPending } = useProfile();

  if (!user) return <Navigate to="/login" replace />;
  if (isPending) return <LoadingSpinner />;
  if (!["admin", "surveyor", "user"].includes(profile?.role)) return <Navigate to="/" replace />;

  return <Navigate to="/dashboard/overview" replace />;
}
