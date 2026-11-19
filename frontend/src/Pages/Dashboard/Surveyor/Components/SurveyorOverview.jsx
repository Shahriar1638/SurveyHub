/* eslint-disable no-unused-vars */
import { Link } from "react-router";
import { motion } from "motion/react";
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";
import { StatCard } from "../../../../Components/UI/StatCard";
import { LoadingSpinner } from "../../../../Components/UI/LoadingSpinner";
import useDashboardSurveyor from "../../../../Hooks/useDashboardSurveyor";
import useProfile from "../../../../Hooks/useProfile";

// ── Motion variants ──────────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

/** Returns a human-readable relative time string, e.g. "2h ago" */
function relativeTime(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function SurveyorOverview() {
  const { data, isLoading, isError } = useDashboardSurveyor();
  const { data: profile } = useProfile();

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return (
      <div className="text-center py-12">
        <p className="type-body-sm text-[--color-error]">Failed to load dashboard.</p>
      </div>
    );

  const kpis = data?.kpis || {};
  const publishedSurveys = data?.publishedSurveys || [];
  const draftSurveys = data?.draftSurveys || [];
  const recentBlogActivity = data?.recentBlogActivity || [];
  const rejectedSurveys = data?.rejectedSurveys || [];
  const rejectedBlogs = data?.rejectedBlogs || [];

  const aiReadyCount = publishedSurveys.filter(
    (s) => s?.aiInsight?.status === "ready"
  ).length;

  const rejectedTotal = rejectedSurveys.length + rejectedBlogs.length;
  const newResponses = kpis.newResponsesLast7Days ?? 0;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">

      {/* ── Rejected Content Warning ───────────────────────────────────────── */}
      {rejectedTotal > 0 && (
        <motion.div
          variants={item}
          className="card p-4 flex items-start gap-3"
          style={{
            borderColor: "var(--color-warning, #F59E0B)",
            borderLeftWidth: "4px",
            background: "color-mix(in srgb, var(--color-warning, #F59E0B) 8%, transparent)",
          }}
        >
          <ExclamationTriangleIcon
            className="w-5 h-5 mt-0.5 shrink-0"
            style={{ color: "var(--color-warning, #F59E0B)" }}
          />
          <div className="flex-1 min-w-0">
            <p
              className="type-body-sm font-semibold"
              style={{ color: "var(--color-warning, #F59E0B)" }}
            >
              You have {rejectedTotal} item{rejectedTotal !== 1 ? "s" : ""} needing attention
            </p>
            <div className="flex gap-3 mt-2 flex-wrap">
              {rejectedSurveys.length > 0 && (
                <Link to="/dashboard/surveys" className="btn btn-ghost btn-sm">
                  My Surveys ({rejectedSurveys.length})
                </Link>
              )}
              {rejectedBlogs.length > 0 && (
                <Link to="/dashboard/blogs" className="btn btn-ghost btn-sm">
                  Blog Studio ({rejectedBlogs.length})
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── KPI Row ────────────────────────────────────────────────────────── */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Responses"
          value={kpis.totalResponses?.toLocaleString() || "0"}
          icon={ChartBarIcon}
        />
        <StatCard
          title="Active Surveys"
          value={kpis.activeSurveys?.toString() || "0"}
          icon={ClipboardDocumentListIcon}
        />
        <StatCard
          title="Completion Rate"
          value={kpis.avgCompletionRate ? `${kpis.avgCompletionRate}%` : "—"}
          icon={CheckCircleIcon}
        />
        <StatCard
          title="New Responses (7d)"
          value={
            <span className="flex items-center gap-2">
              {newResponses.toLocaleString()}
              {newResponses > 0 && (
                <span
                  className="text-xs font-semibold px-1.5 py-0.5 rounded"
                  style={{
                    color: "var(--color-success, #16A34A)",
                    background: "color-mix(in srgb, var(--color-success, #16A34A) 12%, transparent)",
                  }}
                >
                  +{newResponses}
                </span>
              )}
            </span>
          }
          icon={ArrowTrendingUpIcon}
        />
      </motion.div>

      {/* ── Quick Action Cards ─────────────────────────────────────────────── */}
      <motion.div variants={item}>
        <h3 className="type-heading-sm text-[--color-text-primary] mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Published Surveys */}
          <Link
            to="/dashboard/surveys"
            className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <span
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: "color-mix(in srgb, var(--color-accent) 12%, transparent)",
              }}
            >
              <DocumentTextIcon className="w-5 h-5" style={{ color: "var(--color-accent)" }} />
            </span>
            <div>
              <p
                className="font-[--font-mono] text-2xl font-semibold text-[--color-text-primary]"
              >
                {publishedSurveys.length}
              </p>
              <p className="type-meta text-[--color-text-tertiary]">Published Surveys</p>
            </div>
          </Link>

          {/* Drafts */}
          <Link
            to="/dashboard/surveys"
            className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <span
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: "color-mix(in srgb, var(--color-text-tertiary) 10%, transparent)",
              }}
            >
              <PencilSquareIcon className="w-5 h-5 text-[--color-text-secondary]" />
            </span>
            <div>
              <p className="font-[--font-mono] text-2xl font-semibold text-[--color-text-primary]">
                {draftSurveys.length}
              </p>
              <p className="type-meta text-[--color-text-tertiary]">Drafts</p>
            </div>
          </Link>

          {/* AI Insights Ready */}
          <Link
            to="/dashboard/analytics"
            className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <span
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: "color-mix(in srgb, var(--color-primary, #0B3056) 10%, transparent)",
              }}
            >
              <SparklesIcon
                className="w-5 h-5"
                style={{ color: "var(--color-primary, #0B3056)" }}
              />
            </span>
            <div>
              <p className="font-[--font-mono] text-2xl font-semibold text-[--color-text-primary]">
                {aiReadyCount}
              </p>
              <p className="type-meta text-[--color-text-tertiary]">AI Insights Ready</p>
            </div>
          </Link>
        </div>
      </motion.div>

      {/* ── Recent Blog Activity + Top Published Surveys ───────────────────── */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Blog Activity feed */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="type-heading-sm text-[--color-text-primary]">Recent Blog Activity</h3>
            <ChatBubbleLeftIcon className="w-4 h-4 text-[--color-text-tertiary]" />
          </div>

          {recentBlogActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ChatBubbleLeftIcon className="w-8 h-8 text-[--color-text-tertiary] mb-2 opacity-40" />
              <p className="type-body-sm text-[--color-text-tertiary]">No recent comments yet.</p>
              <p className="type-meta text-[--color-text-tertiary] mt-1 opacity-70">
                Publish a blog post to start collecting comments.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {recentBlogActivity.map((activity, idx) => (
                <li
                  key={activity._id || idx}
                  className="flex items-start gap-3 pb-3 border-b border-[--color-border] last:border-0 last:pb-0"
                >
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{
                      background: "color-mix(in srgb, var(--color-accent) 12%, transparent)",
                    }}
                  >
                    <ChatBubbleLeftIcon className="w-3.5 h-3.5" style={{ color: "var(--color-accent)" }} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="type-label-sm text-[--color-text-primary] truncate">
                      {activity.blogTitle || "Untitled Blog"}
                    </p>
                    <p className="type-meta text-[--color-text-secondary] truncate mt-0.5">
                      {(activity.comment || activity.commentText)
                        ? (activity.comment || activity.commentText).length > 80
                          ? (activity.comment || activity.commentText).slice(0, 80) + "…"
                          : (activity.comment || activity.commentText)
                        : "New comment"}
                    </p>
                  </div>
                  <span className="type-meta text-[--color-text-tertiary] shrink-0 whitespace-nowrap">
                    {relativeTime(activity.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Top Published Surveys */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="type-heading-sm text-[--color-text-primary]">Top Published Surveys</h3>
            <Link to="/dashboard/surveys" className="btn btn-ghost btn-sm">
              View all
            </Link>
          </div>

          {publishedSurveys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ClipboardDocumentListIcon className="w-8 h-8 text-[--color-text-tertiary] mb-2 opacity-40" />
              <p className="type-body-sm text-[--color-text-tertiary]">No published surveys yet.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {publishedSurveys.slice(0, 3).map((survey) => (
                <li key={survey._id}>
                  <Link
                    to={`/surveys/${survey._id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-[--color-surface-alt] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="type-label-sm text-[--color-text-primary] truncate font-medium">
                        {survey.title}
                      </p>
                      <p className="type-meta text-[--color-text-tertiary] mt-0.5">
                        {(survey.participantCount || 0).toLocaleString()} participant
                        {survey.participantCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    {survey.category && (
                      <span className="badge badge-published shrink-0 capitalize text-[10px]">
                        {survey.category}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
