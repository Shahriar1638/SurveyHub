import { useState } from "react";
import { motion } from "motion/react";
import {
  XMarkIcon,
  ChatBubbleLeftEllipsisIcon,
  CheckCircleIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { useUpdateFeedback } from "../../../Hooks/useDashboardAdmin";

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "reviewing", label: "Reviewing" },
  { value: "resolved", label: "Resolved" },
  { value: "dismissed", label: "Dismissed" },
];

const TYPE_LABELS = {
  bug: "Technical Bug",
  feature_request: "Feature Request",
  general: "General Inquiry",
  complaint: "Complaint",
};

export default function FeedbackSidePanel({ ticket, onClose }) {
  const [status, setStatus] = useState(ticket?.status || "open");
  const [message, setMessage] = useState("");
  const updateFeedback = useUpdateFeedback();

  if (!ticket) return null;

  const handleSubmit = async () => {
    if (!message.trim() || updateFeedback.isPending) return;
    try {
      await updateFeedback.mutateAsync({
        feedbackId: ticket._id,
        status,
        adminResponse: { message: message.trim() },
      });
      setMessage("");
      onClose();
    } catch (e) {
      console.error("Failed to update feedback:", e);
    }
  };

  const hasExistingResponse = !!ticket.adminResponse?.message;

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
            <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-[--color-error]" />
            <h3 className="type-heading-sm text-[--color-text-primary]">
              Support Ticket
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
        <div className="side-panel-body space-y-5">
          {/* Ticket info */}
          <div className="space-y-3">
            <div>
              <label className="form-label">From</label>
              <p className="type-body-sm text-[--color-text-primary]">
                {ticket.userEmail || "Anonymous"}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div>
                <label className="form-label">Type</label>
                <span className="badge badge-draft text-[10px] capitalize">
                  {TYPE_LABELS[ticket.feedbackType] || ticket.feedbackType}
                </span>
              </div>
              {ticket.affectedPage && (
                <div>
                  <label className="form-label">Page</label>
                  <span className="type-body-sm text-[--color-text-secondary]">
                    {ticket.affectedPage}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="form-label">Submitted</label>
              <p className="type-meta text-[--color-text-tertiary]">
                {new Date(ticket.createdAt).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>

            <div>
              <label className="form-label">Message</label>
              <div className="p-3 bg-[--color-bg-subtle] rounded-lg border border-[--color-border]">
                <p className="type-body-sm text-[--color-text-primary] whitespace-pre-wrap">
                  {ticket.comment}
                </p>
              </div>
            </div>

            {/* Attachments */}
            {ticket.attachments?.length > 0 && (
              <div>
                <label className="form-label">Attachments</label>
                <div className="flex flex-wrap gap-2">
                  {ticket.attachments.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[--color-error] underline hover:no-underline"
                    >
                      Screenshot {i + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <hr />

          {/* Previous admin response */}
          {hasExistingResponse && (
            <div className="p-4 bg-[--color-error-light]/30 border border-[--color-error-light] rounded-lg">
              <div className="flex items-center gap-2 mb-1.5">
                <CheckCircleIcon className="w-4 h-4 text-[--color-error]" />
                <span className="type-label-sm text-[--color-error] font-bold">Previous Admin Response</span>
              </div>
              <p className="type-body-sm text-[--color-text-primary] italic">
                &ldquo;{ticket.adminResponse.message}&rdquo;
              </p>
              {ticket.adminResponse.respondedAt && (
                <p className="type-meta text-[--color-text-tertiary] mt-2">
                  Responded on {new Date(ticket.adminResponse.respondedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              )}
            </div>
          )}

          {/* Status selector */}
          <div>
            <label className="form-label">Set Status</label>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStatus(s.value)}
                  className={`btn btn-sm capitalize ${
                    status === s.value ? "btn-primary" : "btn-secondary"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Admin reply */}
          <div>
            <label className="form-label">
              {hasExistingResponse ? "Update Response" : "Admin Response"}
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your response to the user…"
              className="form-input resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="side-panel-footer">
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!message.trim() || updateFeedback.isPending}
            className="btn btn-sm font-semibold text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center gap-1.5"
            style={{ backgroundColor: "var(--color-error)" }}
          >
            {updateFeedback.isPending ? (
              <span className="flex items-center gap-2">
                <span className="spinner" style={{ width: 14, height: 14 }} />
                Sending…
              </span>
            ) : (
              <>
                <PaperAirplaneIcon className="w-4 h-4 -rotate-45" />
                Send Response
              </>
            )}
          </button>
        </div>
      </motion.div>
    </>
  );
}
