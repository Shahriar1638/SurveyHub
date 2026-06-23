/* eslint-disable no-unused-vars */
import { motion } from "motion/react";
import {
  UsersIcon,
  ChartBarSquareIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
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

export default function AdminOverview() {
  const { data: overview, isLoading, isError } = useAdminOverview();

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <div className="text-center py-12"><p className="type-body-sm text-[--color-error]">Failed to load admin overview.</p></div>;

  const health = overview?.health || {};
  const modStats = overview?.moderationStats || {};
  const revenueData = overview?.revenueByMonth || [];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Platform Health KPIs */}
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

      {/* Revenue Chart */}
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
                formatter={(v) => [`$${v}`, "Revenue"]}
              />
              <Bar dataKey="revenue" fill="url(#adminBarGrad)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Moderation Stats Row */}
      <motion.div variants={item}>
        <h3 className="type-heading-sm text-[--color-text-primary] mb-4">System Moderation Stats</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Reports Resolved", value: modStats.reportsResolved || 0 },
            { label: "Surveys Reviewed", value: modStats.surveysReviewed || 0 },
            { label: "Users Moderated", value: modStats.usersModerated || 0 },
            { label: "Total Actions", value: modStats.totalActions || 0 },
          ].map((stat) => (
            <div key={stat.label} className="card p-4 text-center">
              <p className="type-meta text-[--color-text-tertiary] mb-1">{stat.label}</p>
              <p className="font-[--font-mono] text-2xl font-medium text-[--color-text-primary]">
                {stat.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Pending reports alert */}
      {(overview?.pendingReports > 0 || overview?.investigatingReports > 0) && (
        <motion.div variants={item} className="admin-notice-banner">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5" style={{ color: "var(--color-error)" }} />
            <p className="type-body-sm font-medium" style={{ color: "var(--color-error)" }}>
              {overview.pendingReports} pending and {overview.investigatingReports} investigating reports require attention.
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
