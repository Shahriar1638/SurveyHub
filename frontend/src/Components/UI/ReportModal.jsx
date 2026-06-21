import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useForm } from "react-hook-form";
import useAxiosSecure from "../../Hooks/useAxiosSecure";

const REPORT_REASONS = ["Spam", "Hate Speech", "Inappropriate Content", "Other"];

export default function ReportModal({ children, url, title = "Report", onSuccess }) {
  const [isOpen, setIsOpen] = useState(false);
  const axiosSecure = useAxiosSecure();
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { reportReason: "Spam", details: "" },
  });

  const onSubmit = async (values) => {
    setIsPending(true);
    setError(null);
    try {
      await axiosSecure.post(url, {
        reportReason: values.reportReason,
        details: values.details || undefined,
      });
      setIsSuccess(true);
      reset();
      onSuccess?.();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit report.");
    } finally {
      setIsPending(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsSuccess(false);
    setError(null);
    reset();
  };

  return (
    <>
      <span onClick={() => setIsOpen(true)} className="cursor-pointer">
        {children}
      </span>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
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
                <h3 className="type-heading-sm text-[--color-text-primary]">{title}</h3>
                <button
                  onClick={handleClose}
                  className="p-1 rounded-full text-[--color-text-tertiary] hover:bg-[--color-bg-inset] hover:text-[--color-text-primary] transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="card-body px-6 py-4">
                {isSuccess ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-[--color-success-light]">
                      <svg className="w-8 h-8 text-[--color-success]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h4 className="type-heading-sm text-[--color-text-primary] mb-2">Report Submitted</h4>
                    <p className="type-body-sm text-[--color-text-secondary]">
                      Thank you for helping keep our community safe. Our team will review this.
                    </p>
                    <button onClick={handleClose} className="btn btn-primary w-full mt-6">
                      Close
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {error && (
                      <div className="p-3 rounded bg-[--color-error-light] text-[--color-error] text-sm">
                        {error}
                      </div>
                    )}

                    <div>
                      <label className="form-label">Reason <span className="text-[--color-error]">*</span></label>
                      <select {...register("reportReason", { required: "Please select a reason." })} className="form-input">
                        {REPORT_REASONS.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                      {errors.reportReason && <p className="text-[--color-error] text-sm">{errors.reportReason.message}</p>}
                    </div>

                    <div>
                      <label className="form-label">Details (Optional)</label>
                      <textarea
                        {...register("details")}
                        className="form-input min-h-20 resize-y"
                        placeholder="Provide any additional context..."
                      />
                    </div>

                    <div className="pt-4 border-t border-[--color-border] flex items-center justify-end gap-3">
                      <button type="button" onClick={handleClose} className="btn btn-secondary">Cancel</button>
                      <button type="submit" disabled={isPending} className="btn bg-[--color-error] text-white hover:bg-[--color-error]/90">
                        {isPending ? "Submitting..." : "Submit Report"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
