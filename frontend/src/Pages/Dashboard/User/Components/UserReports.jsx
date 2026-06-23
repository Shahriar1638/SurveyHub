import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheckIcon, ChatBubbleLeftIcon, ExclamationTriangleIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { useUserReports } from "../../../../Hooks/useDashboardUser";

// ── Motion variants ──────────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

const TYPE_CONFIG = {
  survey: { label: "Survey", color: "var(--color-accent)" },
  blog: { label: "Blog", color: "var(--color-accent-dark)" },
  comment: { label: "Comment", color: "var(--color-accent)" },
  reply: { label: "Reply", color: "var(--color-accent-dark)" },
};

function StatusBadge({ status }) {
  const map = {
    pending: "badge-pending",
    investigating: "badge-draft",
    resolved: "badge-published",
    dismissed: "badge-draft",
  };
  return (
    <span className={`badge ${map[status] || "badge-draft"} text-[10px]`}>
      {status}
    </span>
  );
}

function TypeBadge({ targetType }) {
  const config = TYPE_CONFIG[targetType] || TYPE_CONFIG.survey;
  return (
    <span
      className="badge text-[9px] capitalize"
      style={{ backgroundColor: `${config.color}15`, color: config.color }}
    >
      {config.label}
    </span>
  );
}

function ReportCard({ report }) {
  const [expanded, setExpanded] = useState(false);
  const hasResponse = !!report.adminResponse?.message;

  return (
    <div className="card p-4 hover:shadow-[--shadow-md] transition-shadow duration-200">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: "var(--color-accent-light)" }}
        >
          <ExclamationTriangleIcon className="w-5 h-5 text-[--color-accent]" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <TypeBadge targetType={report.targetType} />
              <h4 className="type-label-sm text-[--color-text-primary] truncate">
                {report.targetTitle}
              </h4>
            </div>
            <StatusBadge status={report.status} />
          </div>

          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="badge badge-rejected text-[9px] lowercase leading-none">{report.reportReason}</span>
            <span className="type-meta text-[--color-text-tertiary]">
              Reported on {new Date(report.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>

          {report.details && (
            <p className="type-body-sm text-[--color-text-secondary] mt-3 bg-[--color-bg-subtle] p-2.5 rounded-lg border border-[--color-border]">
              <span className="font-semibold text-[--color-text-primary] block mb-0.5">Your Details:</span>
              {report.details}
            </p>
          )}

          {hasResponse && (
            <div className="mt-4 border-t border-[--color-border] pt-3">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1.5 text-xs font-semibold text-[--color-accent-dark] hover:text-[--color-accent] transition-colors"
              >
                {expanded ? (
                  <>
                    <ChevronUpIcon className="w-3.5 h-3.5" />
                    Hide Admin Response
                  </>
                ) : (
                  <>
                    <ChevronDownIcon className="w-3.5 h-3.5" />
                    View Admin Response
                  </>
                )}
              </button>

              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="overflow-hidden mt-3"
                  >
                    <div className="p-4 bg-[--color-error-light]/40 border border-[--color-error-light] rounded-lg">
                      <div className="flex items-center gap-2 mb-1.5">
                        <ChatBubbleLeftIcon className="w-4 h-4 text-[--color-error]" />
                        <span className="type-label-sm text-[--color-error] font-bold">Feedback from Admin</span>
                      </div>
                      <p className="type-body-sm text-[--color-text-primary] italic">
                        &ldquo;{report.adminResponse.message}&rdquo;
                      </p>
                      <div className="flex items-center justify-between gap-4 mt-3 pt-2.5 border-t border-[--color-error-light] text-[10px] text-[--color-text-tertiary] font-medium font-[--font-ui]">
                        <span>Action: <strong className="text-[--color-text-primary]">{report.adminResponse.actionTaken || "None"}</strong></span>
                        <span>Responded on {new Date(report.adminResponse.respondedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UserReports() {
  const { data: reports, isLoading, isError } = useUserReports();
  const list = reports || [];

  if (isError) return <div className="text-center py-12"><p className="type-body-sm text-[--color-error]">Failed to load reports.</p></div>;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h2 className="type-heading-lg text-[--color-text-primary]">Report Status</h2>
        <p className="type-body-sm text-[--color-text-secondary] mt-1">
          Track the status of content you have reported and read admin reviews.
        </p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-[--color-bg-inset] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <motion.div variants={item} className="empty-state">
          <div className="empty-state-icon">
            <ShieldCheckIcon className="w-7 h-7" />
          </div>
          <p className="type-heading-sm text-[--color-text-primary] mt-2">No reported content</p>
          <p className="type-body-sm text-[--color-text-secondary] mt-1">
            You haven&apos;t filed any reports. Thank you for keeping the community safe!
          </p>
        </motion.div>
      ) : (
        <motion.div variants={item} className="space-y-4">
          {list.map((report) => (
            <ReportCard key={report._id} report={report} />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
