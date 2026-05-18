import { useContext } from "react";
import { AuthContext } from "../../Firebase_AuthProvider/AuthProvider";
import useProfile from "../../Hooks/useProfile";
import { PageTransition } from "../../Components/UI/PageTransition";
import GuestHome from "./GuestHome";
import UserHome from "./UserHome";
import SurveyorHome from "./SurveyorHome";
import AdminHome from "./AdminHome";

// ── Skeleton while profile resolves ──────────────────────────────────────────
function RoleSkeleton() {
  return (
    <PageTransition className="container-app mx-auto py-12">
      <div className="animate-pulse space-y-8">
        <div className="h-10 w-1/3 bg-[--color-bg-inset] rounded-xl" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-[--color-bg-inset] rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-[--color-bg-inset] rounded-xl" />
          ))}
        </div>
      </div>
    </PageTransition>
  );
}

// ── Home — single entry point, delegates by role ──────────────────────────────
export default function Home() {
  const { user } = useContext(AuthContext);
  const { data: profile, isPending } = useProfile();

  // Not logged in — show guest page immediately
  if (!user) return <GuestHome />;

  // Logged in but profile still loading — show skeleton
  if (isPending) return <RoleSkeleton />;

  const role = profile?.role;

  if (role === "admin")    return <AdminHome />;
  if (role === "surveyor") return <SurveyorHome />;

  // Default: registered user
  return <UserHome />;
}
