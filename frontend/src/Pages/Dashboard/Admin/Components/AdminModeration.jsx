/* eslint-disable no-unused-vars */
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  CpuChipIcon,
} from "@heroicons/react/24/outline";
import { useAdminReports } from "../../../../Hooks/useDashboardAdmin";
import { LoadingSpinner } from "../../../../Components/UI/LoadingSpinner";
import ReportSidePanel from "../ReportSidePanel";
import ContentModerationQueue from "./ContentModerationQueue";

// ── Motion variants ──────────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

// ── Report status badge ──────────────────────────────────────────────────────
function ReportStatusBadge({ status }) {
  const map = {
    pending: "badge-pending",
    investigating: "badge-draft",
    resolved: "badge-published",
    dismissed: "badge-draft",
  };
  return <span className={`badge ${map[status] || "badge-draft"}`}>{status}</span>;
}

export default function AdminModeration() {
  const [statusFilter, setStatusFilter] = useState("pending");
  const { data: reportData, isLoading, isError } = useAdminReports({ status: statusFilter });
  const [selectedReport, setSelectedReport] = useState(null);

  if (isError) return <div className="text-center py-12"><p className="type-body-sm text-[--color-error]">Failed to load reports.</p></div>;

  const reports = reportData?.data || [];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* AI Content Moderation Queue */}
      <motion.div variants={item}>
        <ContentModerationQueue />
      </motion.div>

      {/* User Reports */}
      <motion.div variants={item}>
        <h2 className="type-heading-lg text-[--color-text-primary]">User Reports</h2>
        <p className="type-body-sm text-[--color-text-secondary] mt-1">
          Prioritized feed of reported surveys and content.
        </p>
      </motion.div>

      {/* Status filter */}
      <motion.div variants={item} className="flex gap-2 flex-wrap">
        {["pending", "investigating", "resolved", "dismissed"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`btn btn-sm capitalize ${statusFilter === s ? "btn-primary" : "btn-secondary"}`}
          >
            {s}
          </button>
        ))}
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-[--color-bg-inset] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <motion.div variants={item} className="empty-state">
          <div className="empty-state-icon">
            <ShieldCheckIcon className="w-7 h-7" />
          </div>
          <p className="type-heading-sm text-[--color-text-primary] mt-2">
            No {statusFilter} reports
          </p>
          <p className="type-body-sm text-[--color-text-secondary] mt-1">
            All clear for now.
          </p>
        </motion.div>
      ) : (
        <motion.div variants={item} className="space-y-3">
          {reports.map((report) => (
            <div
              key={report._id}
              className="card p-4 flex items-center gap-4 hover:shadow-[--shadow-md] transition-shadow"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: "var(--color-admin-light)" }}
              >
                <ExclamationTriangleIcon className="w-5 h-5" style={{ color: "var(--color-admin)" }} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="type-label-sm text-[--color-text-primary] truncate">
                  {report.survey?.title || "Unknown Survey"}
                </p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="badge badge-rejected text-[10px]">{report.reportReason}</span>
                  <span className="type-meta text-[--color-text-tertiary]">
                    by {report.reporterEmail}
                  </span>
                  <span className="type-meta text-[--color-text-tertiary]">
                    {new Date(report.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <ReportStatusBadge status={report.status} />
                <button
                  onClick={() => setSelectedReport(report)}
                  className="btn btn-sm btn-secondary flex items-center gap-1.5"
                >
                  <EyeIcon className="w-3.5 h-3.5" />
                  Investigate
                </button>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Side panel */}
      <AnimatePresence>
        {selectedReport && (
          <ReportSidePanel
            report={selectedReport}
            onClose={() => setSelectedReport(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
