import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useForm } from "react-hook-form";
import { useSubmitSurveyFeedback } from "../../Hooks/useSurveyDetail";

export default function SurveyFeedback({ surveyId }) {
  const [isOpen, setIsOpen] = useState(false);
  const submitMutation = useSubmitSurveyFeedback(surveyId);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState,
  } = useForm({
    defaultValues: { rating: 5, comment: "", suggestions: "" },
  });
  const rating = watch("rating");

  const onSubmit = async (values) => {
    if (!values.comment?.trim()) {
      setError("comment", { type: "validate", message: "Please provide a comment." });
      return;
    }
    try {
      await submitMutation.mutateAsync(values);
      reset();
      setIsOpen(false);
    } catch (err) {
      // attach to form error - keep simple for now
      console.error("Feedback submit failed", err);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn btn-secondary btn-sm">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
        Give Feedback
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="card w-full max-w-md max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="card-header border-b border-[--color-border] px-6 py-4 flex items-center justify-between">
                  <h3 className="type-heading-sm text-[--color-text-primary]">Survey Feedback</h3>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-full text-[--color-text-tertiary] hover:bg-[--color-bg-inset] hover:text-[--color-text-primary] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="card-body px-6 py-4">
                  {submitMutation.isSuccess ? (
                    <div className="text-center py-6">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-[--color-success-light]">
                        <svg className="w-8 h-8 text-[--color-success]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h4 className="type-heading-sm text-[--color-text-primary] mb-2">Thank You!</h4>
                      <p className="type-body-sm text-[--color-text-secondary]">
                        Your feedback has been submitted successfully and will help surveyors improve.
                      </p>
                      <button onClick={() => setIsOpen(false)} className="btn btn-primary w-full mt-6">
                        Close
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      {formState.errors?.root && (
                        <div className="p-3 rounded bg-[--color-error-light] text-[--color-error] text-sm">
                          {formState.errors.root.message}
                        </div>
                      )}

                      <div>
                        <label className="form-label">Rating</label>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setValue("rating", star, { shouldDirty: true })}
                              className={`p-1 transition-colors ${star <= Number(rating || 5) ? "text-[--color-warning]" : "text-[--color-border]"}`}
                            >
                              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </button>
                          ))}
                        </div>
                        <p className="form-helper">How clear and well-structured was this survey?</p>
                      </div>
                      <input type="hidden" {...register("rating", { valueAsNumber: true })} />

                      <div>
                        <label className="form-label">Comment <span className="text-[--color-error]">*</span></label>
                          <textarea
                            {...register('comment', { required: 'Please provide a comment.' })}
                            className="form-input min-h-25 resize-y"
                            placeholder="Share your thoughts on the survey..."
                          />
                        {formState.errors.comment && <p className="text-[--color-error] text-sm">{formState.errors.comment.message}</p>}
                      </div>

                      <div>
                        <label className="form-label">Suggestions (Optional)</label>
                        <textarea {...register('suggestions')} className="form-input min-h-20 resize-y" placeholder="Any suggestions for improvement?" />
                      </div>

                      <div className="pt-4 border-t border-[--color-border] flex items-center justify-end gap-3">
                        <button type="button" onClick={() => setIsOpen(false)} className="btn btn-secondary">Cancel</button>
                        <button type="submit" disabled={submitMutation.isPending} className="btn btn-primary">
                          {submitMutation.isPending ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
