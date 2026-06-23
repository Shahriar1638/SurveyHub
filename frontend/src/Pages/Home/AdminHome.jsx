import { useContext } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import {
  ShieldCheckIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  DocumentMagnifyingGlassIcon,
  MegaphoneIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { AuthContext } from "../../Firebase_AuthProvider/AuthProvider";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import { StatCard } from "../../Components/UI/StatCard";
import { PageTransition } from "../../Components/UI/PageTransition";

// ── Motion variants ──────────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};
const slideX = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
};

function PriorityBadge({ priority }) {
  const styles = {
    high: { backgroundColor: "var(--color-error-light)", color: "var(--color-error)" },
    medium: { backgroundColor: "#FEF9C3", color: "#92400E" },
    low: { backgroundColor: "var(--color-bg-subtle)", color: "var(--color-text-secondary)" },
  };
  const s = styles[priority] || styles.low;
  return (
    <span className="text-[10px] font-bold font-[--font-ui] uppercase tracking-wide px-2 py-0.5 rounded-full" style={s}>
      {priority || "low"}
    </span>
  );
}

function Skeleton() {
  return (
    <PageTransition>
      <div className="animate-pulse">
        <div className="h-48" style={{ backgroundColor: "var(--color-bg-subtle)" }} />
        <div className="container-app mx-auto py-10 space-y-8">
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-xl" style={{ backgroundColor: "var(--color-bg-inset)" }} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 rounded-xl" style={{ backgroundColor: "var(--color-bg-inset)" }} />
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
      const res = await axiosSecure.get("/api/homepages/admin");
      return res.data;
    },
  });

  if (isPending) return <Skeleton />;
  if (error)
    return (
      <PageTransition>
        <div className="container-app mx-auto py-24 text-center">
          <p className="text-sm" style={{ color: "var(--color-error)" }}>{error.message || "Failed to load"}</p>
        </div>
      </PageTransition>
    );

  const payload = data?.data || {};
  const health = payload.platformHealth || {};
  const reports = payload.moderationFeed || [];
  const approvalQueue = payload.approvalQueue || [];
  const registrations = payload.recentRegistrations || [];
  const systemNotices = payload.systemNotices || [];

  const firstName = (user?.displayName || "Admin").split(" ")[0];
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <PageTransition>

      {/* ══════════════════════════════════════════════════
          HERO — Navy admin header
      ══════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: "var(--color-primary)" }} className="relative overflow-hidden">
        {/* Decoration */}
        <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
          <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full opacity-[0.06]"
            style={{ background: "radial-gradient(circle, #DC2626 0%, transparent 70%)" }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="admin-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#admin-dots)" />
          </svg>
        </div>

        <div className="relative container-app mx-auto px-6 py-12">
          <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <motion.div variants={item}>
              <span
                className="inline-block mb-3 text-[11px] font-bold font-[--font-ui] uppercase tracking-[0.18em] px-3 py-1 rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.75)" }}
              >
                Admin Control Center
              </span>
              <h1 className="font-heading font-bold text-3xl lg:text-4xl text-white leading-tight">
                Welcome back, {firstName}.
              </h1>
              <p className="mt-1.5 text-sm font-[--font-mono]" style={{ color: "rgba(255,255,255,0.4)" }}>
                {today}
              </p>
            </motion.div>

            {/* Live alert badge */}
            {reports.length > 0 && (
              <motion.div variants={item}>
                <Link
                  to="/dashboard/reports"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "var(--color-error)", color: "white" }}
                >
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  {reports.length} pending report{reports.length !== 1 ? "s" : ""}
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </motion.div>
            )}
          </motion.div>

          {/* Quick admin nav bar */}
          <motion.div
            variants={item}
            initial="hidden"
            animate="show"
            className="mt-8 flex flex-wrap gap-2"
          >
            {[
              { icon: ShieldCheckIcon, label: "Moderation", to: "/dashboard/moderation" },
              { icon: ExclamationTriangleIcon, label: "All Reports", to: "/dashboard/reports" },
              { icon: DocumentMagnifyingGlassIcon, label: "Audit Logs", to: "/dashboard/audit-logs" },
              { icon: MegaphoneIcon, label: "Broadcasts", to: "/dashboard/broadcasts" },
              { icon: UsersIcon, label: "User Management", to: "/dashboard/moderation" },
            ].map((nav) => (
              <Link
                key={nav.label}
                to={nav.to}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium font-[--font-ui] transition-all duration-200"
                style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.1)" }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.75)";
                }}
              >
                <nav.icon className="w-4 h-4" />
                {nav.label}
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── System notices ── */}
      {systemNotices.length > 0 && (
        <section className="py-4" style={{ backgroundColor: "var(--color-error-light)" }}>
          <div className="container-app mx-auto flex flex-col gap-2">
            {systemNotices.map((notice, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl border-l-4 bg-white"
                style={{ borderLeftColor: "var(--color-error)", borderColor: "var(--color-border)" }}>
                <ExclamationTriangleIcon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--color-error)" }} />
                <p className="text-sm" style={{ color: "var(--color-error)" }}>{notice.message || notice}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════
          SECTION 2 — Platform Health KPIs
      ══════════════════════════════════════════════════ */}
      <section className="py-12" style={{ backgroundColor: "var(--color-bg-subtle)" }}>
        <div className="container-app mx-auto">
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <motion.div variants={item} className="mb-6">
              <p className="text-[11px] font-bold font-[--font-ui] uppercase tracking-[0.16em] mb-1.5" style={{ color: "var(--color-text-tertiary)" }}>
                Platform Health
              </p>
              <h2 className="font-heading font-bold text-2xl" style={{ color: "var(--color-text-primary)" }}>Live Metrics</h2>
            </motion.div>
            <motion.div variants={item} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Total Users" value={(health.totalUsers ?? 0).toLocaleString()} icon={UsersIcon} />
              <StatCard title="Active Surveyors" value={health.totalSurveyors ?? 0} icon={ShieldCheckIcon} />
              <StatCard
                title="Revenue MTD"
                value={`$${(health.activeRevenue ?? 0).toLocaleString()}`}
                icon={CheckCircleIcon}
              />
              <StatCard
                title="Open Reports"
                value={reports.length}
                icon={ExclamationTriangleIcon}
                delta={reports.length > 5 ? "High volume" : "Normal"}
                deltaType={reports.length > 5 ? "negative" : "positive"}
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 3 — Moderation Queue + Approval Queue
      ══════════════════════════════════════════════════ */}
      <section className="py-14" style={{ backgroundColor: "var(--color-bg-surface)" }}>
        <div className="container-app mx-auto grid gap-10 lg:grid-cols-2">

          {/* Moderation Queue */}
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <motion.div variants={item} className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[11px] font-bold font-[--font-ui] uppercase tracking-[0.16em] mb-1" style={{ color: "var(--color-text-tertiary)" }}>
                  Action Required
                </p>
                <h2 className="font-heading font-bold text-xl" style={{ color: "var(--color-text-primary)" }}>Moderation Queue</h2>
              </div>
              <Link to="/dashboard/moderation" className="btn btn-ghost btn-sm flex items-center gap-1">
                View All <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
            </motion.div>

            {reports.length > 0 ? (
              <motion.div variants={container} className="flex flex-col gap-3">
                {reports.slice(0, 5).map((r) => (
                  <motion.div
                    key={r._id}
                    variants={slideX}
                    className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white border-l-4 border"
                    style={{ borderColor: "var(--color-border)", borderLeftColor: "var(--color-error)" }}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <PriorityBadge priority={r.priority} />
                        <span className="text-sm font-medium truncate" style={{ color: "var(--color-text-primary)" }}>
                          {r.surveyTitle || `Survey #${String(r.surveyId).slice(-6)}`}
                        </span>
                      </div>
                      <p className="text-xs line-clamp-1" style={{ color: "var(--color-text-secondary)" }}>{r.reportReason}</p>
                      <p className="text-xs font-[--font-mono] mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                        {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      to={`/dashboard/moderation`}
                      className="btn btn-ghost btn-sm shrink-0"
                      style={{ border: "1px solid var(--color-border)" }}
                    >
                      Investigate
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div variants={item} className="flex flex-col items-center justify-center py-14 rounded-xl bg-white border text-center"
                style={{ borderColor: "var(--color-border)" }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                  style={{ backgroundColor: "var(--color-accent-light)" }}>
                  <CheckCircleIcon className="w-6 h-6" style={{ color: "var(--color-accent)" }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>Queue is clean</p>
                <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>No pending moderation reports.</p>
              </motion.div>
            )}
          </motion.div>

          {/* Approval Queue */}
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <motion.div variants={item} className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[11px] font-bold font-[--font-ui] uppercase tracking-[0.16em] mb-1" style={{ color: "var(--color-text-tertiary)" }}>
                  Pending Review
                </p>
                <h2 className="font-heading font-bold text-xl" style={{ color: "var(--color-text-primary)" }}>Approval Queue</h2>
              </div>
              <Link to="/dashboard/moderation" className="btn btn-ghost btn-sm flex items-center gap-1">
                View All <ArrowRightIcon className="w-3.5 h-3.5" />
              </Link>
            </motion.div>

            {approvalQueue.length > 0 ? (
              <motion.div variants={container} className="flex flex-col gap-3">
                {approvalQueue.slice(0, 5).map((s) => (
                  <motion.div
                    key={s._id}
                    variants={slideX}
                    className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white border"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--color-text-primary)" }}>{s.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>by {s.surveyorName || "Unknown"}</p>
                      <p className="text-xs font-[--font-mono] mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                        Submitted {new Date(s.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      to="/dashboard/moderation"
                      className="btn btn-sm shrink-0 font-semibold"
                      style={{ backgroundColor: "var(--color-error-light)", color: "var(--color-error)" }}
                    >
                      Review
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div variants={item} className="flex flex-col items-center justify-center py-14 rounded-xl bg-white border text-center"
                style={{ borderColor: "var(--color-border)" }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                  style={{ backgroundColor: "var(--color-accent-light)" }}>
                  <CheckCircleIcon className="w-6 h-6" style={{ color: "var(--color-accent)" }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>All clear</p>
                <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>No surveys pending review.</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 4 — Recent Registrations
      ══════════════════════════════════════════════════ */}
      <section className="py-14" style={{ backgroundColor: "var(--color-bg-subtle)" }}>
        <div className="container-app mx-auto">
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <motion.div variants={item} className="flex items-end justify-between mb-6">
              <div>
                <p className="text-[11px] font-bold font-[--font-ui] uppercase tracking-[0.16em] mb-1.5" style={{ color: "var(--color-text-tertiary)" }}>
                  Latest Users
                </p>
                <h2 className="font-heading font-bold text-xl" style={{ color: "var(--color-text-primary)" }}>Latest Registrations</h2>
              </div>
              {registrations.length > 0 && (
                <span className="text-xs font-[--font-mono] px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: "var(--color-bg-inset)", color: "var(--color-text-tertiary)" }}>
                  {registrations.length} new
                </span>
              )}
            </motion.div>

            {registrations.length > 0 ? (
              <motion.div
                variants={container}
                className="rounded-xl bg-white border overflow-hidden"
                style={{ borderColor: "var(--color-border)" }}
              >
                {registrations.slice(0, 8).map((u, i) => (
                  <motion.div
                    key={u._id || i}
                    variants={slideX}
                    className="flex items-center justify-between px-5 py-3.5 gap-4"
                    style={{
                      borderBottom: i < registrations.length - 1 ? "1px solid var(--color-border)" : "none",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {u.avatar ? (
                        <img src={u.avatar} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
                      ) : (
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ backgroundColor: "var(--color-primary)" }}
                        >
                          {(u.name || u.email || "?")[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{u.name || "—"}</p>
                        <p className="text-xs font-[--font-mono]" style={{ color: "var(--color-text-tertiary)" }}>{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className="text-[10px] font-bold font-[--font-ui] uppercase tracking-wide px-2 py-0.5 rounded-full"
                        style={
                          u.role === "admin"
                            ? { backgroundColor: "var(--color-primary)", color: "white" }
                            : u.role === "surveyor"
                              ? { backgroundColor: "var(--color-accent-light)", color: "var(--color-accent-dark)" }
                              : { backgroundColor: "var(--color-bg-inset)", color: "var(--color-text-secondary)" }
                        }
                      >
                        {u.role || "user"}
                      </span>
                      <span className="text-xs font-[--font-mono]" style={{ color: "var(--color-text-tertiary)" }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div variants={item} className="flex flex-col items-center py-10 text-center">
                <ClockIcon className="w-8 h-8 mb-3" style={{ color: "var(--color-text-tertiary)" }} />
                <p className="text-sm" style={{ color: "var(--color-text-tertiary)" }}>No new registrations recently.</p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 5 — Admin Tools (new)
      ══════════════════════════════════════════════════ */}
      <section className="py-14" style={{ backgroundColor: "var(--color-bg-surface)" }}>
        <div className="container-app mx-auto">
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <motion.div variants={item} className="mb-8">
              <p className="text-[11px] font-bold font-[--font-ui] uppercase tracking-[0.16em] mb-2" style={{ color: "var(--color-text-tertiary)" }}>
                Platform Management
              </p>
              <h2 className="font-heading font-bold text-2xl" style={{ color: "var(--color-text-primary)" }}>Admin Toolkit</h2>
            </motion.div>
            <motion.div variants={container} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: ShieldCheckIcon,
                  label: "Moderation Center",
                  desc: "Review reports, take action on violations, and keep the platform safe.",
                  to: "/dashboard/moderation",
                  color: "var(--color-error)",
                  bg: "var(--color-error-light)",
                },
                {
                  icon: DocumentMagnifyingGlassIcon,
                  label: "Audit Logs",
                  desc: "Full history of all admin actions and platform events for compliance.",
                  to: "/dashboard/audit-logs",
                  color: "var(--color-primary)",
                  bg: "rgba(11,48,86,0.06)",
                },
                {
                  icon: MegaphoneIcon,
                  label: "Broadcasts",
                  desc: "Send platform-wide announcements to all users or specific roles.",
                  to: "/dashboard/broadcasts",
                  color: "var(--color-accent-dark)",
                  bg: "var(--color-accent-light)",
                },
                {
                  icon: UsersIcon,
                  label: "User Feedback",
                  desc: "Read and respond to support tickets and platform feedback submissions.",
                  to: "/dashboard/feedback",
                  color: "var(--color-success)",
                  bg: "var(--color-success-light)",
                },
              ].map((tool) => (
                <motion.div key={tool.label} variants={item}>
                  <Link
                    to={tool.to}
                    className="group flex flex-col gap-4 p-5 rounded-xl border bg-white h-full transition-all duration-200"
                    style={{ borderColor: "var(--color-border)" }}
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = "0 8px 24px -6px rgba(0,0,0,0.10)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                      style={{ backgroundColor: tool.bg }}
                    >
                      <tool.icon className="w-5 h-5" style={{ color: tool.color }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-1" style={{ color: "var(--color-text-primary)" }}>{tool.label}</p>
                      <p className="text-xs leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>{tool.desc}</p>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-semibold font-[--font-ui] mt-auto group-hover:gap-2 transition-all duration-200"
                      style={{ color: tool.color }}>
                      Open <ArrowRightIcon className="w-3 h-3" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

    </PageTransition>
  );
}
