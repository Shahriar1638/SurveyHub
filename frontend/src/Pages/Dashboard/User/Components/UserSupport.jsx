/* eslint-disable no-unused-vars */
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChatBubbleLeftEllipsisIcon,
  PlusIcon,
  InboxIcon,
  XMarkIcon,
  QuestionMarkCircleIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from "@tanstack/react-table";
import { useUserSupport, useSubmitSupportTicket } from "../../../../Hooks/useDashboardUser";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";

// ── Motion variants ──────────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

const columnHelper = createColumnHelper();

const columns = [
  columnHelper.accessor((row) => row.feedbackType?.replace("_", " ") || "general", {
    id: "type", header: "Type", cell: (info) => (
      <span className="badge badge-draft text-[10px] capitalize leading-none">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("comment", {
    header: "Inquiry / Comment", cell: (info) => (
      <span className="type-body-sm text-[--color-text-primary] line-clamp-2 max-w-[280px]">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor((row) => row.affectedPage || "—", {
    id: "affectedPage", header: "Affected Page", cell: (info) => (
      <span className="type-meta text-[--color-text-secondary]">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Status", cell: (info) => (
      <span className={`badge text-[9px] capitalize ${
        info.getValue() === "open" ? "badge-pending"
          : info.getValue() === "resolved" ? "badge-published" : "badge-draft"
      }`}>{info.getValue()}</span>
    ),
  }),
  columnHelper.display({
    id: "adminResponse",
    header: () => <span className="text-right block">Admin Response</span>,
    cell: ({ row }) => {
      const ticket = row.original;
      return ticket.adminResponse?.message ? (
        <div className="inline-block text-left max-w-[240px] p-2 bg-[--color-user-light] border border-[--color-user-light]/40 rounded-lg text-xs">
          <span className="type-label-sm text-[--color-user-dark] block font-bold text-[10px] uppercase">Reply from Admin:</span>
          <p className="type-body-sm text-[--color-text-primary] italic mt-0.5 font-[500]">
            "{ticket.adminResponse.message}"
          </p>
        </div>
      ) : (
        <span className="type-meta text-[--color-text-tertiary] italic">Awaiting Response…</span>
      );
    },
  }),
];

export default function UserSupport() {
  const { data: tickets, isLoading } = useUserSupport();
  const submitTicketMutation = useSubmitSupportTicket();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const list = useMemo(() => tickets || [], [tickets]);

  const table = useReactTable({ data: list, columns, getCoreRowModel: getCoreRowModel() });

  const onSubmit = async (data) => {
    try {
      await submitTicketMutation.mutateAsync({
        feedbackType: data.feedbackType,
        affectedPage: data.affectedPage || undefined,
        comment: data.comment,
        userEmail: undefined, // Controlled by auth headers automatically on server
      });
      reset();
      setDrawerOpen(false);
      Swal.fire({
        icon: "success",
        title: "Ticket Submitted",
        text: "Thank you! Our support team will review it shortly.",
        confirmButtonColor: "var(--color-user)",
      });
    } catch (e) {
      console.error(e);
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: "Could not create the ticket. Please try again.",
        confirmButtonColor: "var(--color-admin)",
      });
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 relative">
      <motion.div variants={item} className="flex items-center justify-between gap-4">
        <div>
          <h2 className="type-heading-lg text-[--color-text-primary]">Support Tickets</h2>
          <p className="type-body-sm text-[--color-text-secondary] mt-1">
            Submit general inquiries or report technical bugs and track admin feedback responses.
          </p>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="btn btn-user btn-md font-semibold text-white flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          New Ticket
        </button>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-[--color-bg-inset] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <motion.div variants={item} className="empty-state">
          <div className="empty-state-icon">
            <ChatBubbleLeftEllipsisIcon className="w-7 h-7" />
          </div>
          <p className="type-heading-sm text-[--color-text-primary] mt-2">No support tickets</p>
          <p className="type-body-sm text-[--color-text-secondary] mt-1">
            Need help? Click "New Ticket" to contact support admins.
          </p>
        </motion.div>
      ) : (
        <motion.div variants={item} className="table-wrapper">
          <table className="data-table">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id}>
                      {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Slide-out drawer panel */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="overlay-light"
              onClick={() => setDrawerOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="side-panel"
            >
              <div className="side-panel-header">
                <div className="flex items-center gap-2">
                  <QuestionMarkCircleIcon className="w-5 h-5 text-[--color-user]" />
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
                    {...register("comment", { required: "Description is required", minLength: { value: 10, message: "Should be at least 10 characters long" } })}
                    placeholder="Write details of your problem or support request here…"
                    className={`form-input resize-none ${errors.comment ? "error" : ""}`}
                  />
                  {errors.comment && (
                    <p className="form-error">{errors.comment.message}</p>
                  )}
                </div>

                <div className="mt-auto pt-4 flex items-center justify-end gap-2 border-t border-[--color-border] shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      reset();
                      setDrawerOpen(false);
                    }}
                    className="btn btn-secondary btn-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitTicketMutation.isPending}
                    className="btn btn-user btn-md text-white font-semibold flex items-center gap-1.5 disabled:opacity-50"
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
