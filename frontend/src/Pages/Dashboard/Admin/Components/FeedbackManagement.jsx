"use no memo";

import { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChatBubbleLeftEllipsisIcon,
} from "@heroicons/react/24/outline";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { useAdminFeedback } from "../../../../Hooks/useDashboardAdmin";
import FeedbackSidePanel from "../FeedbackSidePanel";

const columnHelper = createColumnHelper();

const STATUS_STYLES = {
  open: "bg-[--color-warning]/10 text-[--color-warning] border-[--color-warning]/20",
  reviewing: "bg-[--color-error]/10 text-[--color-error] border-[--color-error]/20",
  resolved: "bg-[--color-success]/10 text-[--color-success] border-[--color-success]/20",
  dismissed: "bg-[--color-bg-inset] text-[--color-text-tertiary] border-[--color-border]",
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize border ${STATUS_STYLES[status] || STATUS_STYLES.open}`}
    >
      {status}
    </span>
  );
}

export default function FeedbackManagement() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState(null);

  const { data: feedbackData, isPending } = useAdminFeedback({
    status: statusFilter === "all" ? undefined : statusFilter,
  });
  const items = useMemo(() => feedbackData?.data || [], [feedbackData]);

  const handleRowClick = useCallback((ticket) => {
    setSelectedTicket(ticket);
  }, []);

  const columns = useMemo(
    () => [
      columnHelper.accessor(
        (row) => row.feedbackType?.replace("_", " ") || "general",
        {
          id: "type",
          header: "Type",
          cell: (info) => (
            <span className="badge badge-draft text-[10px] capitalize leading-none">
              {info.getValue()}
            </span>
          ),
        }
      ),
      columnHelper.accessor("comment", {
        header: "Comment",
        cell: (info) => (
          <span className="type-body-sm text-[--color-text-primary] line-clamp-2 max-w-[280px]">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor((row) => row.userEmail || "Anonymous", {
        id: "user",
        header: "User",
        cell: (info) => (
          <span className="type-meta text-[--color-text-secondary] truncate block max-w-[160px]">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => <StatusBadge status={info.getValue()} />,
      }),
      columnHelper.display({
        id: "adminResponse",
        header: "Admin Response",
        cell: ({ row }) => {
          const ticket = row.original;
          return ticket.adminResponse?.message ? (
            <span className="type-body-sm text-[--color-success] line-clamp-1 max-w-[180px]">
              {ticket.adminResponse.message}
            </span>
          ) : (
            <span className="type-meta text-[--color-text-tertiary] italic">None yet</span>
          );
        },
      }),
      columnHelper.accessor(
        (row) =>
          new Date(row.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
        {
          id: "date",
          header: "Date",
          cell: (info) => (
            <span className="type-meta text-[--color-text-tertiary] whitespace-nowrap">
              {info.getValue()}
            </span>
          ),
        }
      ),
    ],
    []
  );

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
      }}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div
        variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
      >
        <h2 className="type-heading-lg text-[--color-text-primary]">
          Feedback Management
        </h2>
        <p className="type-body-sm text-[--color-text-secondary] mt-1">
          Support tickets and feedback submitted by users. Click a row to respond.
        </p>
      </motion.div>

      {/* Toolbar */}
      <motion.div
        variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
        className="flex items-center gap-3"
      >
        <div className="flex items-center gap-1.5">
          {["all", "open", "reviewing", "resolved", "dismissed"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                statusFilter === s
                  ? "bg-[--color-error] text-white"
                  : "bg-[--color-bg-inset] text-[--color-text-secondary] hover:text-[--color-text-primary] hover:bg-[--color-bg-subtle]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </motion.div>

      {isPending ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 bg-[--color-bg-inset] rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <motion.div
          variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
          className="empty-state"
        >
          <div className="empty-state-icon">
            <ChatBubbleLeftEllipsisIcon className="w-7 h-7" />
          </div>
          <p className="type-heading-sm text-[--color-text-primary] mt-2">
            No feedback tickets
          </p>
          <p className="type-body-sm text-[--color-text-secondary] mt-1">
            All caught up!
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
          className="border border-[--color-border] rounded-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr
                    key={hg.id}
                    className="border-b border-[--color-border] bg-[--color-bg-subtle]"
                  >
                    {hg.headers.map((h) => (
                      <th
                        key={h.id}
                        className="px-4 py-3 text-left type-label-sm text-[--color-text-tertiary] font-semibold"
                      >
                        {h.isPlaceholder
                          ? null
                          : flexRender(h.column.columnDef.header, h.getContext())}
                      </th>
                    ))}
                    <th className="px-4 py-3 w-12" />
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[--color-border] last:border-0 hover:bg-[--color-bg-subtle] transition-colors cursor-pointer"
                    onClick={() => handleRowClick(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(row.original);
                        }}
                        className="p-1.5 rounded-lg hover:bg-[--color-bg-inset] text-[--color-text-tertiary] hover:text-[--color-text-secondary] transition-colors"
                        title="View ticket"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Side panel */}
      <AnimatePresence>
        {selectedTicket && (
          <FeedbackSidePanel
            key={selectedTicket._id}
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
