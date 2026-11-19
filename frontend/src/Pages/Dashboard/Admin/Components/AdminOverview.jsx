/* eslint-disable no-unused-vars */
import { Link } from "react-router";
import { motion } from "motion/react";
import {
  UsersIcon,
  ChartBarSquareIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  DocumentMagnifyingGlassIcon,
  ChatBubbleBottomCenterTextIcon,
  ClipboardDocumentCheckIcon,
  FlagIcon,
} from "@heroicons/react/24/outline";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { StatCard } from "../../../../Components/UI/StatCard";
import { LoadingSpinner } from "../../../../Components/UI/LoadingSpinner";
import { useAdminOverview } from "../../../../Hooks/useDashboardAdmin";

// ── Motion variants ──────────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

// ── Status pill sub-component ────────────────────────────────────────────────
function StatusPill({ label }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full type-meta font-medium"
      style={{
        color: "var(--color-success, #16A34A)",
        background: "color-mix(in srgb, var(--color-success, #16A34A) 10%, transparent)",
        border: "1px solid color-mix(in srgb, var(--color-success, #16A34A) 25%, transparent)",
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: "var(--color-success, #16A34A)" }}
      />
      {label}
    </span>
  );
}

// ── Quick action tile sub-component ─────────────────────────────────────────
function QuickActionTile({ to, icon: Icon, label }) {
  return (
    <Link
      to={to}
      className="card p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow text-center"
    >
      <span
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{
          background: "color-mix(in srgb, var(--color-accent) 10%, transparent)",
        }}
      >
        <Icon className="w-5 h-5" style={{ color: "var(--color-accent)" }} />
      </span>
      <span className="type-label-sm text-[--color-text-secondary]">{label}</span>
    </Link>
  );
}

export default function AdminOverview() {
  const { data: overview, isLoading, isError } = useAdminOverview();

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return (
      <div className="text-center py-12">
        <p className="type-body-sm text-[--color-error]">Failed to load admin overview.</p>
      </div>
    );

  const health = overview?.health || {};
  const modStats = overview?.moderationStats || {};
  const revenueData = overview?.revenueByMonth || [];

  // Moderation stat definitions with border colours via CSS vars / fallbacks
  const modStatDefs = [
    {
      label: "Reports Resolved",
      value: modStats.reportsResolved || 0,
      borderColor: "var(--color-success, #16A34A)",
    },
    {
      label: "Surveys Reviewed",
      value: modStats.surveysReviewed || 0,
      borderColor: "var(--color-info, #2563EB)",
    },
    {
      label: "Users Moderated",
      value: modStats.usersModerated || 0,
      borderColor: "var(--color-warning, #F59E0B)",
    },
    {
      label: "Total Actions",
      value: modStats.totalActions || 0,
      borderColor: "var(--color-accent, #F57026)",
    },
  ];

  const hasPendingReports =
    (overview?.pendingReports ?? 0) > 0 || (overview?.investigatingReports ?? 0) > 0;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">

      {/* ── Platform Health KPIs ───────────────────────────────────────────── */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={health.totalUsers?.toLocaleString() || "0"}
          icon={UsersIcon}
        />
        <StatCard
          title="Active Surveyors"
          value={health.activeSurveyors?.toString() || "0"}
          icon={ChartBarSquareIcon}
        />
        <StatCard
          title="Surveys Published (MTD)"
          value={health.surveysPublishedThisMonth?.toString() || "0"}
          icon={ClipboardDocumentListIcon}
        />
        <StatCard
          title="Revenue MTD"
          value={`$${(health.revenueMTD || 0).toLocaleString()}`}
          icon={CurrencyDollarIcon}
        />
      </motion.div>

      {/* ── System Status Row ──────────────────────────────────────────────── */}
      <motion.div variants={item}>
        <h3 className="type-heading-sm text-[--color-text-primary] mb-3">System Status</h3>
        <div className="flex flex-wrap gap-2">
          <StatusPill label="AI Moderation: Active" />
          <StatusPill label="Payment Webhook: Active" />
          <StatusPill label="Survey Expiry Queue: Active" />
        </div>
      </motion.div>

      {/* ── Revenue Chart ──────────────────────────────────────────────────── */}
      <motion.div variants={item} className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="type-heading-sm text-[--color-text-primary]">Revenue Overview</h3>
          <span className="type-meta text-[--color-text-tertiary]">Last 6 months</span>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <defs>
                <linearGradient id="adminBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0B3056" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#0B3056" stopOpacity={0.4} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fontFamily: "var(--font-mono)", fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fontFamily: "var(--font-mono)", fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                }}
                formatter={(v) => [`$${Number(v).toFixed(2)}`, "Revenue"]}
              />
              <Bar dataKey="revenue" fill="url(#adminBarGrad)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ── Moderation Stats Row ───────────────────────────────────────────── */}
      <motion.div variants={item}>
        <h3 className="type-heading-sm text-[--color-text-primary] mb-4">
          System Moderation Stats
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {modStatDefs.map((stat) => (
            <div
              key={stat.label}
              className="card p-4"
              style={{ borderLeftWidth: "4px", borderLeftColor: stat.borderColor }}
            >
              <p className="type-meta text-[--color-text-tertiary] mb-1">{stat.label}</p>
              <p className="font-[--font-mono] text-2xl font-medium text-[--color-text-primary]">
                {stat.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Quick Action Links ─────────────────────────────────────────────── */}
      <motion.div variants={item}>
        <h3 className="type-heading-sm text-[--color-text-primary] mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <QuickActionTile
            to="/dashboard/moderation"
            icon={ShieldCheckIcon}
            label="Review Queue"
          />
          <QuickActionTile
            to="/dashboard/reports"
            icon={FlagIcon}
            label="Reports"
          />
          <QuickActionTile
            to="/dashboard/feedback"
            icon={ChatBubbleBottomCenterTextIcon}
            label="Feedback"
          />
          <QuickActionTile
            to="/dashboard/audit"
            icon={ClipboardDocumentCheckIcon}
            label="Audit Logs"
          />
        </div>
      </motion.div>

      {/* ── Pending Reports Alert Card ─────────────────────────────────────── */}
      {hasPendingReports && (
        <motion.div
          variants={item}
          className="card p-5"
          style={{
            borderColor: "var(--color-error)",
            borderLeftWidth: "4px",
            background: "color-mix(in srgb, var(--color-error) 6%, transparent)",
          }}
        >
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon
              className="w-5 h-5 mt-0.5 shrink-0"
              style={{ color: "var(--color-error)" }}
            />
            <div className="flex-1">
              <p
                className="type-body-sm font-semibold"
                style={{ color: "var(--color-error)" }}
              >
                {overview.pendingReports} pending and {overview.investigatingReports} investigating
                reports require attention.
              </p>
              <p className="type-meta text-[--color-text-secondary] mt-1">
                Review and resolve open reports to keep the platform safe.
              </p>
            </div>
            <Link
              to="/dashboard/reports"
              className="btn btn-ghost btn-sm shrink-0"
              style={{ color: "var(--color-error)" }}
            >
              Go to Reports →
            </Link>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
