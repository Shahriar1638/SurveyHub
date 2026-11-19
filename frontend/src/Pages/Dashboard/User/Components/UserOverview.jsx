import { Link } from "react-router";
import { motion } from "motion/react";
import {
  ChartBarIcon,
  InboxIcon,
  CheckCircleIcon,
  TicketIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { StatCard } from "../../../../Components/UI/StatCard";
import { LoadingSpinner } from "../../../../Components/UI/LoadingSpinner";
import { useUserOverview } from "../../../../Hooks/useDashboardUser";
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

export default function UserOverview() {
  const { data: overview, isLoading, isError } = useUserOverview();
  const { data: profile } = useProfile();

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return (
      <div className="text-center py-12">
        <p className="type-body-sm text-[--color-error]">Failed to load dashboard.</p>
      </div>
    );

  const stats = overview || {};
  const inProgressCount = stats.inProgressSurveys?.length ?? 0;
  const isSurveyor = profile?.role === "surveyor";

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">

      {/* ── KPI Row ────────────────────────────────────────────────────────── */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Surveys Completed"
          value={stats.totalSurveysTaken?.toLocaleString() || "0"}
          icon={ChartBarIcon}
        />
        <StatCard
          title="In-Progress Surveys"
          value={inProgressCount.toString()}
          icon={InboxIcon}
        />
        <StatCard
          title="Pending Tickets"
          value={stats.pendingSupportTickets?.toString() || "0"}
          icon={TicketIcon}
        />
        <StatCard
          title="Resolved Reports"
          value={stats.resolvedReports?.toString() || "0"}
          icon={CheckCircleIcon}
        />
      </motion.div>

      {/* ── In-Progress Surveys feed (if any) ─────────────────────────────── */}
      {Array.isArray(stats.inProgressSurveys) && stats.inProgressSurveys.length > 0 && (
        <motion.div variants={item} className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="type-heading-sm text-[--color-text-primary]">Continue Where You Left Off</h3>
            <Link to="/surveys" className="btn btn-ghost btn-sm">Browse surveys</Link>
          </div>
          <ul className="space-y-3">
            {stats.inProgressSurveys.slice(0, 5).map((survey) => (
              <li key={survey._id}>
                <Link
                  to={`/surveys/${survey._id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-[--color-surface-alt] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="type-label-sm text-[--color-text-primary] truncate font-medium">
                      {survey.title || "Untitled Survey"}
                    </p>
                    {survey.category && (
                      <p className="type-meta text-[--color-text-tertiary] mt-0.5 capitalize">
                        {survey.category}
                      </p>
                    )}
                  </div>
                  <span className="btn btn-ghost btn-sm shrink-0">Resume →</span>
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* ── Welcome / Upgrade CTA + Account Health ────────────────────────── */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Welcome / CTA card */}
        {!isSurveyor ? (
          /* Upgrade CTA for plain users */
          <div
            className="lg:col-span-2 card p-6 relative overflow-hidden flex flex-col justify-between min-h-[220px]"
            style={{
              background: "linear-gradient(to bottom right, var(--color-accent-light, #FEF3E8), white)",
              borderColor: "var(--color-accent-light, #FEF3E8)",
            }}
          >
            <div>
              <span
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full mb-3"
                style={{
                  color: "var(--color-accent, #F57026)",
                  background: "color-mix(in srgb, var(--color-accent, #F57026) 12%, transparent)",
                }}
              >
                <SparklesIcon className="w-3.5 h-3.5" />
                Creator Dashboard
              </span>
              <h3
                className="type-heading-md font-bold"
                style={{ color: "var(--color-accent-dark, #C0501A)" }}
              >
                Want to create surveys?
              </h3>
              <p className="type-body-sm text-[--color-text-secondary] mt-2 max-w-md">
                Purchase any credit pack to unlock the Creator dashboard and start building
                surveys, writing blogs, and gaining AI-powered insights on your audience.
              </p>
            </div>
            <div className="flex items-center gap-4 mt-6 flex-wrap">
              <Link to="/pricing" className="btn btn-primary btn-sm font-semibold">
                View Credit Packs
              </Link>
              <Link to="/dashboard/support" className="btn btn-secondary btn-sm">
                Learn More
              </Link>
            </div>
          </div>
        ) : (
          /* Generic welcome for edge-case surveyor landing here */
          <div
            className="lg:col-span-2 card p-6 relative overflow-hidden flex flex-col justify-between min-h-[220px]"
            style={{
              background: "linear-gradient(to bottom right, var(--color-accent-light, #FEF3E8), white)",
            }}
          >
            <div>
              <h3
                className="type-heading-md font-bold"
                style={{ color: "var(--color-accent-dark, #C0501A)" }}
              >
                Welcome back{profile?.name ? `, ${profile.name}` : ""}!
              </h3>
              <p className="type-body-sm text-[--color-text-secondary] mt-2 max-w-md">
                You&apos;re viewing the participant dashboard. Head over to your Creator dashboard
                to manage surveys and blogs.
              </p>
            </div>
            <div className="flex items-center gap-4 mt-6">
              <Link to="/dashboard/overview" className="btn btn-primary btn-sm">
                Creator Dashboard
              </Link>
            </div>
          </div>
        )}

        {/* Account Health sidebar */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <h4 className="type-label-sm text-[--color-text-primary]">Account Health</h4>
            <p className="type-body-sm text-[--color-text-secondary] mt-1">
              Your account is active and in good standing. Keep answering surveys responsibly.
            </p>
          </div>
          <div className="mt-6 space-y-3 border-t border-[--color-border] pt-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="type-meta text-[--color-text-tertiary] block">Status</span>
                <span className="badge badge-published text-[10px] mt-1 capitalize">
                  {profile?.status || "active"}
                </span>
              </div>
              <div className="text-right">
                <span className="type-meta text-[--color-text-tertiary] block">Member Since</span>
                <span className="type-label-sm text-[--color-text-primary] mt-1 block">
                  {profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </span>
              </div>
            </div>
            <div className="pt-2 border-t border-[--color-border]">
              <span className="type-meta text-[--color-text-tertiary] block mb-1">Surveys Completed</span>
              <span className="font-[--font-mono] text-xl font-semibold text-[--color-text-primary]">
                {stats.totalSurveysTaken?.toLocaleString() || "0"}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
