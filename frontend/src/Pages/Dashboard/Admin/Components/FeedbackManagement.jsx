import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/outline";
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from "@tanstack/react-table";
import { useAdminFeedback } from "../../../../Hooks/useDashboardAdmin";
import { LoadingSpinner } from "../../../../Components/UI/LoadingSpinner";

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
      <span className="badge badge-draft text-[10px] capitalize">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("comment", {
    header: "Comment", cell: (info) => (
      <span className="type-body-sm text-[--color-text-primary] line-clamp-2 max-w-75">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor((row) => row.userEmail || "Anonymous", {
    id: "user", header: "User", cell: (info) => (
      <span className="type-meta text-[--color-text-secondary] truncate block max-w-40">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Status", cell: (info) => (
      <span className={`badge text-[10px] ${
        info.getValue() === "open" ? "badge-pending"
          : info.getValue() === "resolved" ? "badge-published" : "badge-draft"
      }`}>{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor(
    (row) => new Date(row.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    { id: "date", header: "Date", cell: (info) => (
      <span className="type-meta text-[--color-text-tertiary] whitespace-nowrap">{info.getValue()}</span>
    )},
  ),
];

export default function FeedbackManagement() {
  const [statusFilter, setStatusFilter] = useState("");
  const { data: feedbackData, isLoading, isError } = useAdminFeedback({ status: statusFilter || undefined });
  const items = useMemo(() => feedbackData?.data || [], [feedbackData]);

  if (isError) return <div className="text-center py-12"><p className="type-body-sm text-[--color-error]">Failed to load feedback.</p></div>;

  const table = useReactTable({ data: items, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h2 className="type-heading-lg text-[--color-text-primary]">Feedback Management</h2>
        <p className="type-body-sm text-[--color-text-secondary] mt-1">
          Support tickets and feedback submitted by users.
        </p>
      </motion.div>

      {/* Filter */}
      <motion.div variants={item} className="flex gap-2 flex-wrap">
        {["", "open", "reviewing", "resolved", "dismissed"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`btn btn-sm capitalize ${statusFilter === s ? "btn-primary" : "btn-secondary"}`}
          >
            {s || "All"}
          </button>
        ))}
      </motion.div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-[--color-bg-inset] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <motion.div variants={item} className="empty-state">
          <div className="empty-state-icon">
            <ChatBubbleLeftEllipsisIcon className="w-7 h-7" />
          </div>
          <p className="type-heading-sm text-[--color-text-primary] mt-2">No feedback tickets</p>
          <p className="type-body-sm text-[--color-text-secondary] mt-1">
            All caught up!
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
    </motion.div>
  );
}
