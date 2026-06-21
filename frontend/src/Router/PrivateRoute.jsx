import { useContext } from "react";
import { Navigate, useLocation } from "react-router";
import { AuthContext } from "../Firebase_AuthProvider/AuthProvider";
import { LoadingSpinner } from "../Components/UI/LoadingSpinner";

export default function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
