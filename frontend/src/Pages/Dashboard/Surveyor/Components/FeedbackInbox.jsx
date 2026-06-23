import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChatBubbleLeftEllipsisIcon,
  PlusIcon,
  InboxIcon,
  XMarkIcon,
  QuestionMarkCircleIcon,
  PaperAirplaneIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { useUserSupport, useSubmitSupportTicket } from "../../../../Hooks/useDashboardUser";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

const STATUS_STYLES = {
  open: "badge-pending",
  reviewing: "badge-draft",
  resolved: "badge-published",
  dismissed: "badge-draft",
};

function TicketCard({ ticket }) {
  const [expanded, setExpanded] = useState(false);
  const hasResponse = !!ticket.adminResponse?.message;

  return (
    <div className="card p-4 hover:shadow-[--shadow-md] transition-shadow duration-200">
      <div className="flex items-start gap-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: "var(--color-accent-light)" }}
        >
          <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-[--color-accent]" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="badge badge-draft text-[10px] capitalize">
                {ticket.feedbackType?.replace("_", " ") || "general"}
              </span>
              {ticket.affectedPage && (
                <span className="type-meta text-[--color-text-tertiary]">
                  {ticket.affectedPage}
                </span>
              )}
            </div>
            <span className={`badge text-[10px] capitalize ${STATUS_STYLES[ticket.status] || "badge-draft"}`}>
              {ticket.status}
            </span>
          </div>

          <p className="type-body-sm text-[--color-text-secondary] mt-2 line-clamp-3">
            {ticket.comment}
          </p>

          <p className="type-meta text-[--color-text-tertiary] mt-2">
            Submitted {new Date(ticket.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>

          {/* Admin response */}
          {hasResponse && (
            <div className="mt-3 border-t border-[--color-border] pt-3">
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
                        <ChatBubbleLeftEllipsisIcon className="w-4 h-4 text-[--color-error]" />
                        <span className="type-label-sm text-[--color-error] font-bold">
                          Response from Admin
                        </span>
                      </div>
                      <p className="type-body-sm text-[--color-text-primary] italic">
                        &ldquo;{ticket.adminResponse.message}&rdquo;
                      </p>
                      {ticket.adminResponse.respondedAt && (
                        <p className="type-meta text-[--color-text-tertiary] mt-2">
                          Responded on{" "}
                          {new Date(ticket.adminResponse.respondedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* No response yet */}
          {!hasResponse && (
            <div className="mt-3 border-t border-[--color-border] pt-3">
              <span className="type-meta text-[--color-text-tertiary] italic">
                Awaiting admin response…
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FeedbackInbox() {
  const { data: tickets, isLoading, isError } = useUserSupport();
  const submitTicketMutation = useSubmitSupportTicket();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const list = useMemo(() => tickets || [], [tickets]);

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="type-body-sm text-[--color-error]">Failed to load feedback.</p>
      </div>
    );
  }

  const onSubmit = async (data) => {
    try {
      await submitTicketMutation.mutateAsync({
        feedbackType: data.feedbackType,
        affectedPage: data.affectedPage || undefined,
        comment: data.comment,
      });
      reset();
      setDrawerOpen(false);
      Swal.fire({
        icon: "success",
        title: "Ticket Submitted",
        text: "Thank you! Our team will review it shortly.",
        confirmButtonColor: "var(--color-accent)",
      });
    } catch (e) {
      console.error(e);
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: "Could not create the ticket. Please try again.",
        confirmButtonColor: "var(--color-error)",
      });
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 relative">
      <motion.div variants={item} className="flex items-center justify-between gap-4">
        <div>
          <h2 className="type-heading-lg text-[--color-text-primary]">Feedback Inbox</h2>
          <p className="type-body-sm text-[--color-text-secondary] mt-1">
            View admin responses to your feedback and support tickets.
          </p>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="btn btn-primary btn-md font-semibold text-white flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          New Ticket
        </button>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-[--color-bg-inset] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <motion.div variants={item} className="empty-state">
          <div className="empty-state-icon">
            <InboxIcon className="w-7 h-7" />
          </div>
          <p className="type-heading-sm text-[--color-text-primary] mt-2">No messages</p>
          <p className="type-body-sm text-[--color-text-secondary] mt-1">
            You&apos;ll see feedback from admins here when it arrives.
          </p>
        </motion.div>
      ) : (
        <motion.div variants={item} className="space-y-4">
          {list.map((ticket) => (
            <TicketCard key={ticket._id} ticket={ticket} />
          ))}
        </motion.div>
      )}

      {/* Slide-out drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="overlay-light"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="side-panel"
            >
              <div className="side-panel-header">
                <div className="flex items-center gap-2">
                  <QuestionMarkCircleIcon className="w-5 h-5 text-[--color-accent]" />
                  <h3 className="type-heading-sm text-[--color-text-primary]">Create Support Ticket</h3>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1 rounded-md hover:bg-[--color-bg-subtle] text-[--color-text-secondary] hover:text-[--color-text-primary] transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="side-panel-body flex flex-col gap-5 overflow-y-auto">
                <div>
                  <label className="form-label">Feedback / Support Type</label>
                  <select
                    {...register("feedbackType", { required: true })}
                    className="form-input capitalize"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="bug">Technical Bug</option>
                    <option value="feature_request">Feature Request</option>
                    <option value="complaint">Complaint</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Affected Area / Page (Optional)</label>
                  <input
                    type="text"
                    {...register("affectedPage")}
                    placeholder="e.g. Dashboard, Survey taking page…"
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Describe Your Inquiry / Issue</label>
                  <textarea
                    rows={6}
                    {...register("comment", {
                      required: "Description is required",
                      minLength: { value: 10, message: "Should be at least 10 characters long" },
                    })}
                    placeholder="Write details of your problem or support request here…"
                    className={`form-input resize-none ${errors.comment ? "error" : ""}`}
                  />
                  {errors.comment && <p className="form-error">{errors.comment.message}</p>}
                </div>

                <div className="mt-auto pt-4 flex items-center justify-end gap-2 border-t border-[--color-border] shrink-0">
                  <button
                    type="button"
                    onClick={() => { reset(); setDrawerOpen(false); }}
                    className="btn btn-secondary btn-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitTicketMutation.isPending}
                    className="btn btn-primary btn-md text-white font-semibold flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {submitTicketMutation.isPending ? (
                      "Submitting…"
                    ) : (
                      <>
                        <PaperAirplaneIcon className="w-4 h-4 -rotate-45" />
                        Submit Ticket
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
