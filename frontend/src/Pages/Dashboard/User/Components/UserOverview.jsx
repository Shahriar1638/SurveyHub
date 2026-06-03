import { Link } from "react-router";
import { motion } from "motion/react";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  InboxIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { StatCard } from "../../../../Components/UI/StatCard";
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
  const { data: overview } = useUserOverview();
  const { data: profile } = useProfile();
  const stats = overview || {};

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* KPI Row */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Surveys Taken"
          value={stats.totalSurveysTaken?.toLocaleString() || "0"}
          icon={ChartBarIcon}
          roleAccent="user"
        />
        <StatCard
          title="Rewards Earned"
          value={`${stats.totalRewardsEarned?.toLocaleString() || "0"} pts`}
          icon={CurrencyDollarIcon}
          roleAccent="user"
        />
        <StatCard
          title="Pending Tickets"
          value={stats.pendingSupportTickets?.toString() || "0"}
          icon={InboxIcon}
          roleAccent="user"
        />
        <StatCard
          title="Resolved Reports"
          value={stats.resolvedReports?.toString() || "0"}
          icon={CheckCircleIcon}
          roleAccent="user"
        />
      </motion.div>

      {/* Welcome Card & Fast Actions */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6 bg-linear-to-br from-[--color-user-light] to-white border-[--color-user-light] relative overflow-hidden flex flex-col justify-between min-h-[220px]">
          <div>
            <h3 className="type-heading-md text-[--color-user-dark] font-bold">Your SurveyHub Experience</h3>
            <p className="type-body-sm text-[--color-text-secondary] mt-2 max-w-md">
              Every completed survey awards you points based on length. Use your points to redeem premium benefits, get early access to features, and shape the future of products.
            </p>
          </div>
          <div className="flex items-center gap-4 mt-6">
            <Link to="/dashboard/participation" className="btn btn-user btn-sm font-semibold text-white">
              Check Participation Ledger
            </Link>
            <Link to="/dashboard/support" className="btn btn-secondary btn-sm">
              Get Support
            </Link>
          </div>
        </div>

        {/* Dynamic Sidebar card */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <h4 className="type-label-sm text-[--color-text-primary]">Account Health</h4>
            <p className="type-body-sm text-[--color-text-secondary] mt-1">
              Your account is active and in good standing. Keep answering surveys responsibly.
            </p>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-[--color-border] pt-4">
            <div>
              <span className="type-meta text-[--color-text-tertiary] block">Status</span>
              <span className="badge badge-published text-[10px] mt-1 capitalize">
                {profile?.status || "active"}
              </span>
            </div>
            <div>
              <span className="type-meta text-[--color-text-tertiary] block">Member Since</span>
              <span className="type-label-sm text-[--color-text-primary] mt-1 block">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—"}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
