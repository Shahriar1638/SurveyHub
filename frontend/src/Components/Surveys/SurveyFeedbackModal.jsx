import { motion, AnimatePresence } from "motion/react";
import { useSurveyFeedback } from "../../Hooks/useMySurveys";

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? "text-[--color-warning]" : "text-[--color-border]"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function SurveyFeedbackModal({ surveyId, surveyTitle, isOpen, onClose }) {
  const { data, isLoading } = useSurveyFeedback(isOpen ? surveyId : null);

  const feedbacks = data?.feedbacks || [];
  const avgRating = data?.avgRating;
  const total = data?.total || 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
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
                  <h3 className="type-heading-sm text-[--color-text-primary]">Feedback</h3>
                  <p className="type-meta text-[--color-text-tertiary] mt-0.5 line-clamp-1">{surveyTitle}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 rounded-full text-[--color-text-tertiary] hover:bg-[--color-bg-inset] hover:text-[--color-text-primary] transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Stats bar */}
              {total > 0 && (
                <div className="px-6 py-3 border-b border-[--color-border] bg-[--color-bg-subtle] flex items-center gap-6 shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="type-label-sm text-[--color-text-secondary]">Avg Rating</span>
                    <span className="type-body-sm text-[--color-text-primary] font-semibold">{avgRating ?? "—"}</span>
                    {avgRating && <StarRating rating={Math.round(avgRating)} />}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="type-label-sm text-[--color-text-secondary]">Total</span>
                    <span className="type-body-sm text-[--color-text-primary] font-semibold">{total}</span>
                  </div>
                </div>
              )}

              {/* Feedback list */}
              <div className="card-body px-6 py-4 overflow-y-auto flex-1 min-h-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <span className="spinner" />
                  </div>
                ) : feedbacks.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-10 h-10 text-[--color-text-tertiary] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    <p className="type-body-sm text-[--color-text-secondary]">No feedback yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {feedbacks.map((fb) => (
                      <div
                        key={fb._id}
                        className="p-4 rounded-xl border border-[--color-border] bg-[--color-bg-subtle]"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <StarRating rating={fb.rating || 0} />
                            <span className="type-meta text-[--color-text-tertiary]">
                              {fb.userEmail || "Anonymous"}
                            </span>
                          </div>
                          <span className="type-meta text-[--color-text-tertiary] font-[--font-mono]">
                            {new Date(fb.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <p className="type-body-sm text-[--color-text-primary]">{fb.comment}</p>
                        {fb.suggestions && (
                          <p className="type-body-sm text-[--color-text-secondary] mt-2 italic">
                            Suggestion: {fb.suggestions}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="card-footer border-t border-[--color-border] px-6 py-3 flex justify-end shrink-0">
                <button onClick={onClose} className="btn btn-secondary btn-sm">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
