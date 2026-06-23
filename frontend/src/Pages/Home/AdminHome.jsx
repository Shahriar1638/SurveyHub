import { useContext } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "../../Firebase_AuthProvider/AuthProvider";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import { StatCard } from "../../Components/UI/StatCard";
import { Card, CardBody } from "../../Components/UI/Card";
import { PageTransition } from "../../Components/UI/PageTransition";

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};
const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
};

function PriorityBadge({ priority }) {
  const map = {
    high: "badge badge-rejected",
    medium: "badge badge-pending",
    low: "badge badge-draft",
  };
  return <span className={map[priority] || map.low}>{priority || "low"}</span>;
}

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
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 bg-[--color-bg-inset] rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default function AdminHome() {
  const { user } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure();

  const { data, isPending, error } = useQuery({
    queryKey: ["home", "admin"],
    queryFn: async () => {
      const response = await axiosSecure.get("/api/homepages/admin");
      return response.data;
    },
  });

  if (isPending) return <Skeleton />;
  if (error)
    return (
      <PageTransition className="container-app mx-auto py-24 text-center">
        <p className="type-body-base text-[--color-error]">{error.message || "Failed to load"}</p>
      </PageTransition>
    );

  const payload = data?.data || {};
  const health = payload.platformHealth || {};
  const reports = payload.moderationFeed || [];
  const approvalQueue = payload.approvalQueue || [];
  const registrations = payload.recentRegistrations || [];
  const systemNotices = payload.systemNotices || [];

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <PageTransition>
      {/* ══════════════════════════════════════════════════
          SECTION 1 — Page Header
      ══════════════════════════════════════════════════ */}
      <section className="border-b border-[--color-border] bg-[--color-bg-surface]">
        <div className="container-app mx-auto py-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h1 className="type-heading-xl text-[--color-text-primary]">
              Admin Control Center
              <span className="ml-2 align-middle" aria-hidden="true">🔴</span>
            </h1>
            <p className="type-meta text-[--color-text-tertiary] mt-1 font-[--font-mono]">
              {today}
            </p>
          </div>
          {reports.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg type-meta font-medium text-white bg-[--color-error]">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              {reports.length} pending reports
            </span>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 2 — Platform Health KPIs
      ══════════════════════════════════════════════════ */}
      <section className="py-10 bg-[--color-bg-subtle]">
        <div className="container-app mx-auto">
          <p className="type-meta-sm text-[--color-text-tertiary] tracking-widest uppercase mb-4">
            Platform Health
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Users"
              value={health.totalUsers ?? 0}
              roleAccent="admin"
            />
            <StatCard
              title="Active Surveyors"
              value={health.totalSurveyors ?? 0}
              roleAccent="admin"
            />
            <StatCard
              title="Revenue MTD"
              value={`$${(health.activeRevenue ?? 0).toLocaleString()}`}
              roleAccent="admin"
            />
            <StatCard
              title="Open Reports"
              value={reports.length}
              roleAccent="admin"
              delta={reports.length > 5 ? "High volume" : "Normal"}
              deltaType={reports.length > 5 ? "negative" : "positive"}
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 3 — System Notices (conditional)
      ══════════════════════════════════════════════════ */}
      {systemNotices.length > 0 && (
        <section className="py-6 bg-[--color-error-light]">
          <div className="container-app mx-auto flex flex-col gap-2">
            {systemNotices.map((notice, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl border-l-4 border-l-[--color-error] bg-white">
                <svg
                  className="w-4 h-4 mt-0.5 shrink-0 text-[--color-error]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <p className="type-body-sm text-[--color-error]">
                  {notice.message || notice}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════
          SECTION 4 — Moderation Queue + Approval Queue (2-col)
      ══════════════════════════════════════════════════ */}
      <section className="py-14 bg-[--color-bg-surface]">
        <div className="container-app mx-auto grid gap-10 lg:grid-cols-2">
          {/* Moderation Queue */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="type-meta-sm text-[--color-text-tertiary] tracking-widest uppercase mb-1">
                  Action Required
                </p>
                <h2 className="type-heading-md text-[--color-text-primary]">
                  Moderation Queue
                </h2>
              </div>
              <Link to="/moderation" className="btn btn-ghost btn-sm">
                View All →
              </Link>
            </div>
            {reports.length > 0 ? (
              <motion.div
                variants={listVariants}
                initial="hidden"
                animate="show"
                className="flex flex-col gap-3"
              >
                {reports.slice(0, 5).map((r) => (
                  <motion.div key={r._id} variants={itemVariants}>
                    <Card hover className="border-l-4 border-l-[--color-error]">
                      <CardBody className="p-4 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <PriorityBadge priority={r.priority} />
                            <span className="type-label-sm text-[--color-text-primary] truncate">
                              {r.surveyTitle ||
                                `Survey #${String(r.surveyId).slice(-6)}`}
                            </span>
                          </div>
                          <p className="type-body-sm text-[--color-text-secondary] line-clamp-1">
                            {r.reportReason}
                          </p>
                          <p className="type-meta text-[--color-text-tertiary] mt-1 font-[--font-mono]">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Link
                          to={`/moderation/${r._id}`}
                          className="btn btn-ghost btn-sm shrink-0 border border-[--color-border]"
                        >
                          Investigate
                        </Link>
                      </CardBody>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="empty-state py-10 border border-[--color-border] rounded-xl bg-white">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="type-heading-sm mt-3">Queue is clean</h3>
                <p className="type-body-sm text-[--color-text-secondary] mt-1">
                  No pending moderation reports.
                </p>
              </div>
            )}
          </div>

          {/* Approval Queue */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="type-meta-sm text-[--color-text-tertiary] tracking-widest uppercase mb-1">
                  Pending Review
                </p>
                <h2 className="type-heading-md text-[--color-text-primary]">
                  Approval Queue
                </h2>
              </div>
              <Link to="/survey-approval" className="btn btn-ghost btn-sm">
                View All →
              </Link>
            </div>
            {approvalQueue.length > 0 ? (
              <motion.div
                variants={listVariants}
                initial="hidden"
                animate="show"
                className="flex flex-col gap-3"
              >
                {approvalQueue.slice(0, 5).map((s) => (
                  <motion.div key={s._id} variants={itemVariants}>
                    <Card hover>
                      <CardBody className="p-4 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="type-label-sm text-[--color-text-primary] truncate">
                            {s.title}
                          </p>
                          <p className="type-body-sm text-[--color-text-secondary] mt-0.5">
                            by {s.surveyorName || "Unknown"}
                          </p>
                          <p className="type-meta text-[--color-text-tertiary] mt-1 font-[--font-mono]">
                            Submitted{" "}
                            {new Date(s.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Link
                          to={`/survey-approval/${s._id}`}
                          className="btn btn-sm shrink-0 bg-[--color-error-light] text-[--color-error]"
                        >
                          Review
                        </Link>
                      </CardBody>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="empty-state py-10 border border-[--color-border] rounded-xl bg-white">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="type-heading-sm mt-3">All clear</h3>
                <p className="type-body-sm text-[--color-text-secondary] mt-1">
                  No surveys pending review.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 5 — Recent Registrations
      ══════════════════════════════════════════════════ */}
      <section className="py-14 bg-[--color-bg-subtle]">
        <div className="container-app mx-auto">
          <div className="mb-6">
            <p className="type-meta-sm text-[--color-text-tertiary] tracking-widest uppercase mb-1">
              New Members
            </p>
            <h2 className="type-heading-md text-[--color-text-primary]">
              Recent Registrations
            </h2>
          </div>
          {registrations.length > 0 ? (
            <Card>
              <div className="divide-y divide-[--color-border]">
                {registrations.slice(0, 8).map((u, i) => (
                  <motion.div
                    key={u._id || i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between px-5 py-3 gap-4"
                  >
                    <div className="flex items-center gap-3">
                      {u.photoURL ? (
                        <img
                          src={u.photoURL}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-[--color-error]">
                          {(u.name || u.email || "?")[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="type-label-sm text-[--color-text-primary]">
                          {u.name || "—"}
                        </p>
                        <p className="type-meta text-[--color-text-tertiary]">
                          {u.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`badge badge-${u.role || "visitor"}`}>
                        {u.role || "user"}
                      </span>
                      <span className="type-meta text-[--color-text-tertiary] font-[--font-mono]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          ) : (
            <div className="empty-state py-10">
              <h3 className="type-heading-sm">No new registrations today</h3>
            </div>
          )}
        </div>
      </section>
    </PageTransition>
  );
}
