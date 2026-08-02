import { lazy, Suspense, useContext } from "react";
import { Navigate, useParams } from "react-router";
import { AuthContext } from "../../Firebase_AuthProvider/AuthProvider";
import useProfile from "../../Hooks/useProfile";
import { LoadingSpinner } from "../../Components/UI/LoadingSpinner";
import { ErrorBoundary } from "../../Components/ErrorBoundary";

// ── Lazy-loaded section components ────────────────────────────────────────────
// User sections
const UserOverview = lazy(() => import("./User/Components/UserOverview"));
const ParticipationLedger = lazy(() => import("./User/Components/ParticipationLedger"));
const UserReports = lazy(() => import("./User/Components/UserReports"));
const UserSupport = lazy(() => import("./User/Components/UserSupport"));

// Surveyor sections
const SurveyorOverview = lazy(() => import("./Surveyor/Components/SurveyorOverview"));
const MySurveys = lazy(() => import("./Surveyor/Components/MySurveys"));
const CreateSurvey = lazy(() => import("./Surveyor/Components/CreateSurvey"));
const AiAnalytics = lazy(() => import("./Surveyor/Components/AiAnalytics"));
const AiChat = lazy(() => import("./Surveyor/Components/AiChat"));
const BlogStudio = lazy(() => import("./Surveyor/Components/BlogStudio"));
const CreateBlog = lazy(() => import("./Surveyor/Components/CreateBlog"));
const FeedbackInbox = lazy(() => import("./Surveyor/Components/FeedbackInbox"));
const RecycleBin = lazy(() => import("./Surveyor/Components/RecycleBin"));

// Admin sections
const AdminOverview = lazy(() => import("./Admin/Components/AdminOverview"));
const AdminModeration = lazy(() => import("./Admin/Components/AdminModeration"));
const AdminReports = lazy(() => import("./Admin/Components/AdminReports"));
const AuditLogs = lazy(() => import("./Admin/Components/AuditLogs"));
const BroadcastControl = lazy(() => import("./Admin/Components/BroadcastControl"));
const FeedbackManagement = lazy(() => import("./Admin/Components/FeedbackManagement"));

// Shared sections
const MyProfile = lazy(() => import("./Shared/MyProfile"));
const ProfileSettings = lazy(() => import("./Shared/ProfileSettings"));

const USER_SECTIONS = {
  overview: UserOverview,
  participation: ParticipationLedger,
  reports: UserReports,
  support: UserSupport,
  "my-profile": MyProfile,
  "profile-settings": ProfileSettings,
};

const SURVEYOR_SECTIONS = {
  overview: SurveyorOverview,
  surveys: MySurveys,
  "create-survey": CreateSurvey,
  analytics: AiAnalytics,
  "analytics-chat": AiChat,
  "blog-studio": BlogStudio,
  "create-blog": CreateBlog,
  "feedback-inbox": FeedbackInbox,
  reports: UserReports,
  "recycle-bin": RecycleBin,
  "my-profile": MyProfile,
  "profile-settings": ProfileSettings,
};

const ADMIN_SECTIONS = {
  overview: AdminOverview,
  moderation: AdminModeration,
  reports: AdminReports,
  "audit-logs": AuditLogs,
  broadcasts: BroadcastControl,
  feedback: FeedbackManagement,
  "my-profile": MyProfile,
  "profile-settings": ProfileSettings,
};

const ROLE_SECTIONS = {
  user: USER_SECTIONS,
  surveyor: SURVEYOR_SECTIONS,
  admin: ADMIN_SECTIONS,
};

// Dashboard shells are kept as static imports since they're lightweight wrappers
import UserDashboard from "./User/UserDashboard";
import SurveyorDashboard from "./Surveyor/SurveyorDashboard";
import AdminDashboard from "./Admin/AdminDashboard";

const ROLE_DASHBOARDS = {
  user: UserDashboard,
  surveyor: SurveyorDashboard,
  admin: AdminDashboard,
};

export default function DashboardSection() {
  const { user } = useContext(AuthContext);
  const { data: profile, isPending } = useProfile();
  const { section } = useParams();

  if (!user) return <Navigate to="/login" replace />;
  if (isPending) return <LoadingSpinner />;

  const role = profile?.role;
  if (!role || !["user", "surveyor", "admin"].includes(role)) return <Navigate to="/" replace />;

  const sections = ROLE_SECTIONS[role];
  const SectionComponent = sections?.[section];

  if (!SectionComponent) return <Navigate to="/dashboard/overview" replace />;

  const DashboardShell = ROLE_DASHBOARDS[role];

  return (
    <DashboardShell>
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <SectionComponent />
        </Suspense>
      </ErrorBoundary>
    </DashboardShell>
  );
}
