import { useContext } from "react";
import { Navigate, useParams } from "react-router";
import { AuthContext } from "../../Firebase_AuthProvider/AuthProvider";
import useProfile from "../../Hooks/useProfile";
import { LoadingSpinner } from "../../Components/UI/LoadingSpinner";

import UserDashboard from "./User/UserDashboard";
import SurveyorDashboard from "./Surveyor/SurveyorDashboard";
import AdminDashboard from "./Admin/AdminDashboard";

import UserOverview from "./User/Components/UserOverview";
import ParticipationLedger from "./User/Components/ParticipationLedger";
import UserReports from "./User/Components/UserReports";
import UserSupport from "./User/Components/UserSupport";

import SurveyorOverview from "./Surveyor/Components/SurveyorOverview";
import MySurveys from "./Surveyor/Components/MySurveys";
import CreateSurvey from "./Surveyor/Components/CreateSurvey";
import AiAnalytics from "./Surveyor/Components/AiAnalytics";
import AiChat from "./Surveyor/Components/AiChat";
import BlogStudio from "./Surveyor/Components/BlogStudio";
import CreateBlog from "./Surveyor/Components/CreateBlog";
import FeedbackInbox from "./Surveyor/Components/FeedbackInbox";
import RecycleBin from "./Surveyor/Components/RecycleBin";

import AdminOverview from "./Admin/Components/AdminOverview";
import AdminModeration from "./Admin/Components/AdminModeration";
import AdminReports from "./Admin/Components/AdminReports";
import AuditLogs from "./Admin/Components/AuditLogs";
import BroadcastControl from "./Admin/Components/BroadcastControl";
import FeedbackManagement from "./Admin/Components/FeedbackManagement";

import MyProfile from "./Shared/MyProfile";
import ProfileSettings from "./Shared/ProfileSettings";

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
      <SectionComponent />
    </DashboardShell>
  );
}
