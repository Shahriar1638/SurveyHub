import { Suspense, lazy, useContext, useState } from "react";
import { Navigate } from "react-router";
import { AuthContext } from "../../Firebase_AuthProvider/AuthProvider";
import useProfile from "../../Hooks/useProfile";
import DashboardLayout from "../../Layout/DashboardLayout";

const AdminDashboard = lazy(() => import("./Admin/AdminDashboard"));
const SurveyorDashboard = lazy(() => import("./Surveyor/SurveyorDashboard"));
const UserDashboard = lazy(() => import("./User/UserDashboard"));

// ── Skeleton while profile resolves ──────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-10 w-1/3 bg-[--color-bg-inset] rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-[--color-bg-inset] rounded-xl" />
        ))}
      </div>
      <div className="h-64 bg-[--color-bg-inset] rounded-xl" />
      <div className="h-48 bg-[--color-bg-inset] rounded-xl" />
    </div>
  );
}

// ── Dashboard — single entry point, delegates by role ────────────────────────
export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const { data: profile, isPending } = useProfile();
  const [activeSection, setActiveSection] = useState("overview");

  // Not logged in — should not reach here (PrivateRoute catches), but just in case
  if (!user) return <Navigate to="/login" replace />;

  // Still loading profile
  if (isPending) {
    return (
      <DashboardLayout activeSection="overview" onSectionChange={() => {}}>
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  // Non-admin/surveyor/user users don't have a dashboard
  if (profile?.role !== "admin" && profile?.role !== "surveyor" && profile?.role !== "user") {
    return <Navigate to="/" replace />;
  }

  return (
    <DashboardLayout activeSection={activeSection} onSectionChange={setActiveSection}>
      <Suspense fallback={<DashboardSkeleton />}>
        {profile?.role === "admin" ? (
          <AdminDashboard activeSection={activeSection} onSectionChange={setActiveSection} />
        ) : profile?.role === "surveyor" ? (
          <SurveyorDashboard activeSection={activeSection} onSectionChange={setActiveSection} />
        ) : (
          <UserDashboard activeSection={activeSection} onSectionChange={setActiveSection} />
        )}
      </Suspense>
    </DashboardLayout>
  );
}
