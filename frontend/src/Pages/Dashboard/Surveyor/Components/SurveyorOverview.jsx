/* eslint-disable no-unused-vars */
import { motion } from "motion/react";
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
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

// ── Mock response trend data (until real analytics endpoint exists) ──────────
const mockTrendData = [
  { day: "Mon", responses: 12 },
  { day: "Tue", responses: 19 },
  { day: "Wed", responses: 8 },
  { day: "Thu", responses: 25 },
  { day: "Fri", responses: 32 },
  { day: "Sat", responses: 18 },
  { day: "Sun", responses: 22 },
];

export default function SurveyorOverview() {
  const { data, isLoading, isError } = useDashboardSurveyor();
  const { data: profile } = useProfile();

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <div className="text-center py-12"><p className="type-body-sm text-[--color-error]">Failed to load dashboard.</p></div>;

  const kpis = data?.kpis || {};

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* KPI Row */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Responses"
          value={kpis.totalResponses?.toLocaleString() || "0"}
          icon={ChartBarIcon}
          roleAccent="surveyor"
        />
        <StatCard
          title="Active Surveys"
          value={kpis.activeSurveys?.toString() || "0"}
          icon={ClipboardDocumentListIcon}
          roleAccent="surveyor"
        />
        <StatCard
          title="Completion Rate"
          value={kpis.avgCompletionRate ? `${kpis.avgCompletionRate}%` : "—"}
          icon={CheckCircleIcon}
          roleAccent="surveyor"
        />
        <StatCard
          title="New Responses (7d)"
          value={kpis.newResponses7d?.toString() || "0"}
          icon={ArrowTrendingUpIcon}
          roleAccent="surveyor"
        />
      </motion.div>

      {/* Response Trend Chart */}
      <motion.div variants={item} className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="type-heading-sm text-[--color-text-primary]">Response Trend</h3>
          <span className="type-meta text-[--color-text-tertiary]">Last 7 days</span>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockTrendData}>
              <defs>
                <linearGradient id="surveyorGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2D9FCF" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#2D9FCF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12, fontFamily: "var(--font-mono)", fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fontFamily: "var(--font-mono)", fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                }}
              />
              <Area
                type="monotone"
                dataKey="responses"
                stroke="#2D9FCF"
                strokeWidth={2}
                fill="url(#surveyorGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </motion.div>
  );
}
