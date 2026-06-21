import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { XMarkIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useAdminModerateSurvey } from "../../../../Hooks/useSurveysMutation";

export default function SurveyReviewModal({ survey, isOpen, onClose }) {
  const [adminNote, setAdminNote] = useState("");
  const [error, setError] = useState("");
  const moderateSurvey = useAdminModerateSurvey();

  if (!survey) return null;

  const handleModerate = (decision) => {
    // Note required on rejection so the surveyor knows what to fix
    if (decision === "rejected" && !adminNote.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }
    setError("");

    moderateSurvey.mutate(
      { id: survey._id, decision, reason: adminNote.trim() || undefined },
      {
        onSuccess: () => {
          setAdminNote("");
          setError("");
          onClose();
        },
      }
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="card w-full max-w-lg max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="card-header border-b border-[--color-border] px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="type-heading-sm text-[--color-text-primary]">Review Survey</h3>
                <p className="type-meta text-[--color-text-tertiary] mt-0.5 line-clamp-1">{survey.title}</p>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-full text-[--color-text-tertiary] hover:bg-[--color-bg-inset] hover:text-[--color-text-primary] transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="card-body px-6 py-4 overflow-y-auto flex-1 min-h-0 space-y-4">
              {/* AI Moderation */}
              {survey.moderation?.reason && (
                <div className="p-4 rounded-xl bg-[--color-warning-light] border border-[--color-warning]/20">
                  <div className="flex items-center gap-2 mb-2">
                    <ExclamationTriangleIcon className="w-4 h-4 text-[--color-warning]" />
                    <p className="type-label-sm text-[--color-warning]">AI Moderation</p>
                  </div>
                  <p className="type-body-sm text-[--color-text-secondary]">{survey.moderation.reason}</p>
                  {survey.moderation.flaggedCategories?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {survey.moderation.flaggedCategories.map((cat, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-[--color-warning]/10 text-[--color-warning] font-medium">
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* User Appeal */}
              {survey.moderation?.appeal?.message && (
                <div className="p-4 rounded-xl bg-[--color-bg-subtle] border border-[--color-border]">
                  <p className="type-label-sm text-[--color-text-primary] mb-1">User Appeal</p>
                  <p className="type-body-sm text-[--color-text-secondary] italic">
                    &ldquo;{survey.moderation.appeal.message}&rdquo;
                  </p>
                  {survey.moderation.appeal.submittedAt && (
                    <p className="type-meta text-[--color-text-tertiary] mt-2">
                      Submitted {new Date(survey.moderation.appeal.submittedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              {/* Admin Note */}
              <div>
                <label className="form-label">
                  Admin Note {error && <span className="text-[--color-error]">*</span>}
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => { setAdminNote(e.target.value); setError(""); }}
                  placeholder="Add a note for the surveyor..."
                  className="form-input min-h-[80px] resize-y"
                />
                {error && <p className="text-[--color-error] text-sm mt-1">{error}</p>}
              </div>
            </div>

            {/* Footer */}
            <div className="card-footer border-t border-[--color-border] px-6 py-4 flex items-center justify-between shrink-0">
              <button onClick={onClose} className="btn btn-secondary btn-sm">
                Cancel
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleModerate("rejected")}
                  disabled={moderateSurvey.isPending}
                  className="btn btn-sm bg-[--color-error-light] text-[--color-error] hover:bg-[--color-error]/20 border-none flex items-center gap-1.5"
                >
                  <XCircleIcon className="w-4 h-4" />
                  {moderateSurvey.isPending ? "Processing..." : "Reject"}
                </button>
                <button
                  onClick={() => handleModerate("approved")}
                  disabled={moderateSurvey.isPending}
                  className="btn btn-sm bg-[--color-success-light] text-[--color-success] hover:bg-[--color-success]/20 border-none flex items-center gap-1.5"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  {moderateSurvey.isPending ? "Processing..." : "Approve"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
