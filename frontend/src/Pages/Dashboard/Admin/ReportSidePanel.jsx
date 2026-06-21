import { useState } from "react";
import { motion } from "motion/react";
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  TrashIcon,
  NoSymbolIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useUpdateReport } from "../../../Hooks/useDashboardAdmin";

// ── Action option configs ────────────────────────────────────────────────────
const SURVEY_ACTIONS = [
  { value: "None", label: "No Action", icon: CheckCircleIcon, color: "var(--color-text-secondary)" },
  { value: "Surveyor Warned", label: "Warn Surveyor", icon: ExclamationTriangleIcon, color: "var(--color-warning)" },
  { value: "Survey Deleted", label: "Delete Survey", icon: TrashIcon, color: "var(--color-error)" },
  { value: "Surveyor Banned", label: "Ban Surveyor", icon: NoSymbolIcon, color: "var(--color-admin)" },
];

const BLOG_ACTIONS = [
  { value: "None", label: "No Action", icon: CheckCircleIcon, color: "var(--color-text-secondary)" },
  { value: "Author Warned", label: "Warn Author", icon: ExclamationTriangleIcon, color: "var(--color-warning)" },
  { value: "Blog Deleted", label: "Delete Blog", icon: TrashIcon, color: "var(--color-error)" },
  { value: "Author Banned", label: "Ban Author", icon: NoSymbolIcon, color: "var(--color-admin)" },
];

const COMMENT_ACTIONS = [
  { value: "None", label: "No Action", icon: CheckCircleIcon, color: "var(--color-text-secondary)" },
  { value: "Commenter Warned", label: "Warn Commenter", icon: ExclamationTriangleIcon, color: "var(--color-warning)" },
  { value: "Comment Deleted", label: "Delete Comment", icon: TrashIcon, color: "var(--color-error)" },
  { value: "Commenter Banned", label: "Ban Commenter", icon: NoSymbolIcon, color: "var(--color-admin)" },
];

const REPLY_ACTIONS = [
  { value: "None", label: "No Action", icon: CheckCircleIcon, color: "var(--color-text-secondary)" },
  { value: "Commenter Warned", label: "Warn Commenter", icon: ExclamationTriangleIcon, color: "var(--color-warning)" },
  { value: "Reply Deleted", label: "Delete Reply", icon: TrashIcon, color: "var(--color-error)" },
  { value: "Commenter Banned", label: "Ban Commenter", icon: NoSymbolIcon, color: "var(--color-admin)" },
];

const ACTIONS_BY_TYPE = {
  survey: SURVEY_ACTIONS,
  blog: BLOG_ACTIONS,
  comment: COMMENT_ACTIONS,
  reply: REPLY_ACTIONS,
};

export default function ReportSidePanel({ report, onClose }) {
  const [selectedAction, setSelectedAction] = useState("None");
  const [adminMessage, setAdminMessage] = useState("");
  const [targetStatus, setTargetStatus] = useState("resolved");
  const updateReport = useUpdateReport();

  if (!report) return null;

  const reportType = report.type || report.targetType || (report.survey ? "survey" : report.blog ? "blog" : "comment");
  const actions = ACTIONS_BY_TYPE[reportType] || SURVEY_ACTIONS;

  const targetTitle = report.targetTitle || report.surveyTitle || report.blogTitle || report.commentText?.slice(0, 80) || "—";

  const handleSubmit = async () => {
    if (updateReport.isPending) return;
    try {
      await updateReport.mutateAsync({
        reportId: report._id,
        status: targetStatus,
        actionTaken: selectedAction,
        adminResponse: adminMessage.trim(),
      });
      onClose();
    } catch (e) {
      console.error("Failed to update report:", e);
    }
  };

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="overlay-light"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        className="side-panel"
      >
        {/* Header */}
        <div className="side-panel-header">
          <div className="flex items-center gap-2">
            <ShieldExclamationIcon
              className="w-5 h-5"
              style={{ color: "var(--color-admin)" }}
            />
            <h3 className="type-heading-sm text-[--color-text-primary]">
              Investigate Report
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[--color-bg-subtle] text-[--color-text-secondary] transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="side-panel-body space-y-6">
          {/* Report details */}
          <div className="space-y-4">
            <div>
              <label className="form-label">Reporter</label>
              <p className="type-body-sm text-[--color-text-primary]">
                {report.reporterName || report.reporterEmail}
              </p>
            </div>

            <div>
              <label className="form-label">Report Type</label>
              <span className="badge badge-draft capitalize">{reportType}</span>
            </div>

            <div>
              <label className="form-label">
                {reportType === "survey" ? "Reported Survey" : reportType === "blog" ? "Reported Blog" : reportType === "reply" ? "Reported Reply" : "Reported Comment"}
              </label>
              <p className="type-label-sm text-[--color-text-primary]">
                {targetTitle}
              </p>
            </div>

            <div>
              <label className="form-label">Reason</label>
              <span className="badge badge-rejected">{report.reportReason}</span>
            </div>

            {report.details && (
              <div>
                <label className="form-label">Details</label>
                <p className="type-body-sm text-[--color-text-secondary] bg-[--color-bg-subtle] p-3 rounded-lg">
                  {report.details}
                </p>
              </div>
            )}

            <div>
              <label className="form-label">Reported At</label>
              <p className="type-meta text-[--color-text-tertiary]">
                {new Date(report.createdAt).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>

            <div>
              <label className="form-label">Current Status</label>
              <span
                className={`badge ${
                  report.status === "pending"
                    ? "badge-pending"
                    : report.status === "investigating"
                      ? "badge-draft"
                      : report.status === "resolved"
                        ? "badge-published"
                        : "badge-draft"
                }`}
              >
                {report.status}
              </span>
            </div>
          </div>

          <hr />

          {/* Admin action */}
          <div className="space-y-4">
            <h4 className="type-label-lg text-[--color-text-primary]">Take Action</h4>

            {/* Status selector */}
            <div>
              <label className="form-label">Set Status</label>
              <div className="flex gap-2">
                {["investigating", "resolved", "dismissed"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setTargetStatus(s)}
                    className={`btn btn-sm capitalize ${
                      targetStatus === s
                        ? "btn-primary"
                        : "btn-secondary"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Action type */}
            <div>
              <label className="form-label">Action</label>
              <div className="space-y-1.5">
                {actions.map((action) => {
                  const Icon = action.icon;
                  const isSelected = selectedAction === action.value;
                  return (
                    <button
                      key={action.value}
                      onClick={() => setSelectedAction(action.value)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                        isSelected
                          ? "border-[--color-border-strong] bg-[--color-bg-subtle]"
                          : "border-transparent hover:bg-[--color-bg-subtle]"
                      }`}
                    >
                      <Icon className="w-4 h-4" style={{ color: isSelected ? action.color : undefined }} />
                      <span className={isSelected ? "text-[--color-text-primary]" : "text-[--color-text-secondary]"}>
                        {action.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Admin message */}
            <div>
              <label className="form-label">Admin Response</label>
              <textarea
                rows={3}
                value={adminMessage}
                onChange={(e) => setAdminMessage(e.target.value)}
                placeholder="Explain the action taken…"
                className="form-input resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="side-panel-footer">
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={updateReport.isPending}
            className="btn btn-sm font-semibold text-white px-4 py-2 rounded-lg disabled:opacity-50"
            style={{ backgroundColor: "var(--color-admin)" }}
          >
            {updateReport.isPending ? (
              <span className="flex items-center gap-2">
                <span className="spinner" style={{ width: 14, height: 14 }} />
                Saving…
              </span>
            ) : (
              "Submit Action"
            )}
          </button>
        </div>
      </motion.div>
    </>
  );
}
