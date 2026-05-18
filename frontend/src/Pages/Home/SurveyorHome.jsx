import { useContext, useEffect, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { AuthContext } from "../../Firebase_AuthProvider/AuthProvider";
import useAxiosPublic from "../../Hooks/useAxiosPublic";
import { SurveyCard } from "../../Components/UI/SurveyCard";
import { StatCard } from "../../Components/UI/StatCard";
import { PageTransition } from "../../Components/UI/PageTransition";

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
};

function Skeleton() {
  return (
    <PageTransition>
      <div className="animate-pulse">
        <div className="h-28 bg-[--color-bg-subtle]" />
        <div className="container-app mx-auto py-10 space-y-8">
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-[--color-bg-inset] rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-[--color-bg-inset] rounded-xl" />
            ))}
          </div>
          <div className="h-48 bg-[--color-bg-inset] rounded-xl" />
        </div>
      </div>
    </PageTransition>
  );
}

export default function SurveyorHome() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosPublic = useAxiosPublic();

  useEffect(() => {
    let mounted = true;
    const uid = user?.uid || "";
    axiosPublic
      .get(`/api/homepages/surveyor${uid ? `?surveyorId=${uid}` : ""}`)
      .then((r) => {
        if (mounted) setData(r.data);
      })
      .catch((e) => {
        if (mounted) setError(e.message || "Failed to load");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [axiosPublic, user]);

  if (loading) return <Skeleton />;
  if (error)
    return (
      <PageTransition className="container-app mx-auto py-24 text-center">
        <p className="type-body-base text-[--color-error]">{error}</p>
      </PageTransition>
    );

  const payload = data?.data || {};
  const kpis = payload.kpis || {};
  const activeSurveys = payload.activeSurveys || [];
  const aiReady = payload.aiReadyToAnalyze || [];
  const drafts = payload.drafts || [];
  const blogActivity = payload.recentBlogActivity || [];
  const subscription = payload.subscription || null;
  const name = user?.displayName || payload.surveyor?.name || "";

  return (
    <PageTransition>
      {/* ══════════════════════════════════════════════════
          SECTION 1 — Header + Subscription Status
      ══════════════════════════════════════════════════ */}
      <section className="border-b border-[--color-border] bg-[--color-bg-surface]">
        <div className="container-app mx-auto py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="type-heading-xl text-[--color-text-primary]">
              Welcome back{name ? `, ${name}` : ""} 🔵
            </h1>
            <p className="type-body-sm text-[--color-text-secondary] mt-1">
              Your surveyor workspace
            </p>
          </div>
          <div className="flex items-center gap-3">
            {subscription ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[--color-surveyor-light]">
                <div className="w-2 h-2 rounded-full bg-[--color-surveyor-dark]" />
                <span className="type-meta text-[--color-surveyor-dark] font-medium">
                  Active — renews{" "}
                  {new Date(subscription.renewalDate).toLocaleDateString()}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[--color-bg-subtle]">
                <div className="w-2 h-2 rounded-full bg-[--color-text-tertiary]" />
                <span className="type-meta text-[--color-text-tertiary]">
                  No active subscription
                </span>
              </div>
            )}
            <Link to="/pricing" className="btn btn-secondary btn-sm">
              Manage Plan
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 2 — KPI Row
      ══════════════════════════════════════════════════ */}
      <section className="py-10 bg-[--color-bg-subtle]">
        <div className="container-app mx-auto">
          <p className="type-meta-sm text-[--color-text-tertiary] tracking-widest uppercase mb-4">
            Performance
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Responses"
              value={kpis.totalResponses ?? 0}
              roleAccent="surveyor"
            />
            <StatCard
              title="Active Surveys"
              value={kpis.activeSurveys ?? 0}
              roleAccent="surveyor"
            />
            <StatCard
              title="Avg Completion"
              value={`${kpis.avgCompletionRate ?? 0}%`}
              roleAccent="surveyor"
            />
            <StatCard
              title="New (7 days)"
              value={kpis.newResponsesLast7Days ?? 0}
              roleAccent="surveyor"
              delta="+12%"
              deltaType="positive"
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 3 — Quick Actions
      ══════════════════════════════════════════════════ */}
      <section className="py-14 bg-[--color-bg-surface]">
        <div className="container-app mx-auto">
          <div className="mb-6">
            <p className="type-meta-sm text-[--color-text-tertiary] tracking-widest uppercase mb-1">
              Shortcuts
            </p>
            <h2 className="type-heading-md text-[--color-text-primary]">
              Quick Actions
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: "M12 4v16m8-8H4",
                label: "Create New Survey",
                desc: "Start building a new survey",
                to: "/create-survey",
              },
              {
                icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
                label: "AI Analytics Lab",
                desc: "Generate insights from responses",
                to: "/analytics",
              },
              {
                icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
                label: "Write Insight Blog",
                desc: "Publish AI-generated findings",
                to: "/blog-management",
              },
            ].map((action, i) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.35 }}
              >
                <Link
                  to={action.to}
                  className="card card-hover p-5 flex flex-col gap-3 h-full"
                  style={{ backgroundColor: "var(--color-surveyor-light)" }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: "var(--color-surveyor-dark)" }}
                  >
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={action.icon}
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="type-label-lg text-[--color-surveyor-dark]">
                      {action.label}
                    </p>
                    <p className="type-body-sm text-[--color-text-secondary] mt-0.5">
                      {action.desc}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 4 — AI Ready Banner (conditional)
      ══════════════════════════════════════════════════ */}
      {aiReady.length > 0 && (
        <section className="py-6 bg-[--color-surveyor-light]">
          <div className="container-app mx-auto">
            <div
              className="card p-5 border-l-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              style={{
                borderLeftColor: "var(--color-surveyor)",
                backgroundColor: "white",
              }}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge badge-surveyor">AI Ready</span>
                  <span className="type-body-sm font-medium text-[--color-surveyor-dark]">
                    {aiReady.length} survey{aiReady.length > 1 ? "s" : ""} ready
                    for AI analysis
                  </span>
                </div>
                <p className="type-body-sm text-[--color-text-secondary]">
                  &ldquo;{aiReady[0]?.title}&rdquo; has{" "}
                  <strong className="font-[--font-mono]">
                    {aiReady[0]?.responseCount}
                  </strong>{" "}
                  responses — ready for insights →
                </p>
              </div>
              <Link
                to="/analytics"
                className="btn btn-surveyor btn-sm flex-shrink-0"
              >
                Open AI Lab →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════
          SECTION 5 — Active Surveys
      ══════════════════════════════════════════════════ */}
      <section className="py-14 bg-[--color-bg-subtle]">
        <div className="container-app mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="type-meta-sm text-[--color-text-tertiary] tracking-widest uppercase mb-1">
                Live
              </p>
              <h2 className="type-heading-md text-[--color-text-primary]">
                Your Active Surveys
              </h2>
            </div>
            <Link to="/surveys" className="btn btn-ghost btn-sm">
              View All →
            </Link>
          </div>
          {activeSurveys.length > 0 ? (
            <motion.div
              variants={listVariants}
              initial="hidden"
              animate="show"
              className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
            >
              {activeSurveys.slice(0, 6).map((s) => (
                <motion.div key={s._id} variants={itemVariants}>
                  <SurveyCard
                    title={s.title}
                    category={s.category}
                    participantCount={s.responseCount}
                    status={s.status}
                    actionButton={
                      <Link
                        to={`/surveys/${s._id}/edit`}
                        className="btn btn-sm btn-secondary"
                      >
                        Edit
                      </Link>
                    }
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="empty-state py-16">
              <div className="empty-state-icon">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="type-heading-sm mt-3">No active surveys yet</h3>
              <p className="type-body-sm text-[--color-text-secondary] mt-1 max-w-xs">
                Create your first survey and start collecting responses.
              </p>
              <Link
                to="/create-survey"
                className="btn btn-surveyor btn-sm mt-4"
              >
                Create Survey
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 6 — Drafts + Recent Blog Activity (2-col)
      ══════════════════════════════════════════════════ */}
      <section className="py-14 bg-[--color-bg-surface]">
        <div className="container-app mx-auto grid gap-10 lg:grid-cols-2">
          {/* Drafts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="type-meta-sm text-[--color-text-tertiary] tracking-widest uppercase mb-1">
                  In Progress
                </p>
                <h2 className="type-heading-md text-[--color-text-primary]">
                  Drafts
                </h2>
              </div>
              <span className="badge badge-draft">{drafts.length}</span>
            </div>
            {drafts.length > 0 ? (
              <div className="flex flex-col gap-3">
                {drafts.slice(0, 4).map((d) => (
                  <div
                    key={d._id}
                    className="card p-4 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="type-label-sm text-[--color-text-primary] truncate">
                        {d.title}
                      </p>
                      <p className="type-meta text-[--color-text-tertiary] mt-0.5 font-[--font-mono]">
                        {d.questionCount ?? 0} questions ·{" "}
                        {new Date(d.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      to={`/surveys/${d._id}/edit`}
                      className="btn btn-surveyor btn-sm flex-shrink-0"
                    >
                      Pay &amp; Publish
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-8 text-center">
                <p className="type-body-sm text-[--color-text-tertiary]">
                  No drafts saved.
                </p>
              </div>
            )}
          </div>

          {/* Recent Blog Activity */}
          <div>
            <div className="mb-4">
              <p className="type-meta-sm text-[--color-text-tertiary] tracking-widest uppercase mb-1">
                Community
              </p>
              <h2 className="type-heading-md text-[--color-text-primary]">
                Recent Blog Activity
              </h2>
            </div>
            {blogActivity.length > 0 ? (
              <div className="flex flex-col gap-3">
                {blogActivity.slice(0, 4).map((a) => (
                  <div key={a._id} className="card p-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[--color-bg-subtle] flex items-center justify-center flex-shrink-0 text-sm font-bold text-[--color-text-secondary]">
                      {(a.commenterName || "U")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="type-body-sm text-[--color-text-primary] line-clamp-2">
                        {a.comment}
                      </p>
                      <p className="type-meta text-[--color-text-tertiary] mt-1 font-[--font-mono]">
                        {a.commenterName} · &ldquo;{a.blogTitle}&rdquo; ·{" "}
                        {new Date(a.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-8 text-center">
                <p className="type-body-sm text-[--color-text-tertiary]">
                  No recent blog activity.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
