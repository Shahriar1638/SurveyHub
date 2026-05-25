import { useContext } from "react";
import { Navigate, useLocation } from "react-router";
import { AuthContext } from "../Firebase_AuthProvider/AuthProvider";
import { ThreeDot } from "react-loading-indicators";

export default function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <ThreeDot color="#32cd32" size="medium" text="" textColor="" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
}
