import { useMemo } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  ClipboardDocumentListIcon,
  PlusIcon,
  PencilSquareIcon,
  PauseIcon,
  TrashIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

// ── Motion variants ──────────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    published: "badge-published",
    draft: "badge-draft",
    expired: "badge-pending",
    banned: "badge-rejected",
  };
  return (
    <span className={`badge ${map[status] || "badge-draft"}`}>
      {status}
    </span>
  );
}

// ── AI Status indicator ──────────────────────────────────────────────────────
function AIStatus({ aiInsight }) {
  if (!aiInsight?.enabled) {
    return <span className="type-meta text-[--color-text-tertiary]">Off</span>;
  }
  const statusMap = {
    idle: { label: "Idle", color: "var(--color-text-tertiary)" },
    pending: { label: "Processing…", color: "var(--color-warning)" },
    ready: { label: "Ready", color: "var(--color-success)" },
    failed: { label: "Failed", color: "var(--color-error)" },
  };
  const s = statusMap[aiInsight.status] || statusMap.idle;
  return (
    <span className="type-meta flex items-center gap-1" style={{ color: s.color }}>
      <SparklesIcon className="w-3.5 h-3.5" />
      {s.label}
    </span>
  );
}

export default function MySurveys({ data }) {
  const navigate = useNavigate();
  const allSurveys = useMemo(() => {
    const pub = (data?.publishedSurveys || []).map((s) => ({ ...s, _source: "published" }));
    const draft = (data?.draftSurveys || []).map((s) => ({ ...s, _source: "draft" }));
    return [...pub, ...draft];
  }, [data]);

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <h2 className="type-heading-lg text-[--color-text-primary]">My Surveys</h2>
        <button
          onClick={() => navigate("/surveys")}
          className="btn btn-surveyor btn-sm flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          Create Survey
        </button>
      </motion.div>

      {allSurveys.length === 0 ? (
        <motion.div variants={item} className="empty-state">
          <div className="empty-state-icon">
            <ClipboardDocumentListIcon className="w-7 h-7" />
          </div>
          <p className="type-heading-sm text-[--color-text-primary] mt-2">No surveys yet</p>
          <p className="type-body-sm text-[--color-text-secondary] mt-1">
            Create your first survey to get started.
          </p>
        </motion.div>
      ) : (
        <motion.div variants={item} className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Responses</th>
                <th>AI Insight</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allSurveys.map((survey) => (
                <tr key={survey._id}>
                  <td>
                    <span className="type-label-sm text-[--color-text-primary] line-clamp-1">
                      {survey.title}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={survey.status} />
                  </td>
                  <td>
                    <span className="type-meta text-[--color-text-primary]">
                      {survey.participantCount ?? 0}
                    </span>
                  </td>
                  <td>
                    <AIStatus aiInsight={survey.aiInsight} />
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        title="Edit"
                        className="p-1.5 rounded-md hover:bg-[--color-bg-subtle] text-[--color-text-secondary] hover:text-[--color-text-primary] transition-colors"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      {survey.status === "published" && (
                        <button
                          title="Pause"
                          className="p-1.5 rounded-md hover:bg-[--color-bg-subtle] text-[--color-text-secondary] hover:text-[--color-warning] transition-colors"
                        >
                          <PauseIcon className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        title="Delete"
                        className="p-1.5 rounded-md hover:bg-[--color-admin-light] text-[--color-text-secondary] hover:text-[--color-admin] transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </motion.div>
  );
}
