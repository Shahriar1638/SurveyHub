"use no memo";

import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { motion, AnimatePresence } from "motion/react";
import { useAdminReports } from "../../../../Hooks/useDashboardAdmin";
import { SortHeader } from "./ModerationShared";

const STATUS_STYLES = {
  pending: "bg-[--color-warning]/10 text-[--color-warning] border-[--color-warning]/20",
  investigating: "bg-[--color-error]/10 text-[--color-error] border-[--color-error]/20",
  resolved: "bg-[--color-success]/10 text-[--color-success] border-[--color-success]/20",
  dismissed: "bg-[--color-bg-inset] text-[--color-text-tertiary] border-[--color-border]",
};

const TYPE_STYLES = {
  survey: "bg-[--color-accent]/10 text-[--color-accent] border-[--color-accent]/20",
  blog: "bg-[--color-accent]/10 text-[--color-accent] border-[--color-accent]/20",
  comment: "bg-[--color-info]/10 text-[--color-info] border-[--color-info]/20",
  reply: "bg-[--color-accent]/10 text-[--color-accent] border-[--color-accent]/20",
};

function getReportType(r) {
  if (r.type) return r.type;
  if (r.surveyId) return "survey";
  if (r.blogId && r.commentId && r.replyId) return "reply";
  if (r.blogId && r.commentId) return "comment";
  if (r.blogId) return "blog";
  return "survey";
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize border ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}
    >
      {status}
    </span>
  );
}

function TypeBadge({ type }) {
  if (!type) return <span className="type-meta text-[--color-text-tertiary]">—</span>;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize border ${TYPE_STYLES[type] || TYPE_STYLES.survey}`}
    >
      {type}
    </span>
  );
}

export default function ReportsTable({ statusFilter, typeFilter, search, sort, onOpenPanel }) {
  const { data, isPending } = useAdminReports({
    status: statusFilter === "all" ? undefined : statusFilter,
    type: typeFilter === "all" ? undefined : typeFilter,
    search,
    sort,
    limit: 50,
  });

  const reports = useMemo(() => data?.data || data?.reports || [], [data]);
  const sorting = useMemo(() => {
    if (sort === "oldest") return [{ id: "createdAt", desc: false }];
    return [{ id: "createdAt", desc: true }];
  }, [sort]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "reporterEmail",
        header: "Reporter",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[--color-bg-inset] flex items-center justify-center shrink-0">
              <span className="type-meta text-[--color-text-secondary] font-semibold">
                {(row.original.reporterName || row.original.reporterEmail || "?")[0].toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="type-body-sm text-[--color-text-primary] truncate">
                {row.original.reporterName || row.original.reporterEmail}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "type",
        header: "Type",
        cell: ({ row }) => <TypeBadge type={getReportType(row.original)} />,
      },
      {
        id: "target",
        header: "Target",
        cell: ({ row }) => {
          const r = row.original;
          const title = r.survey?.title || r.blog?.title || "—";
          return (
            <span className="type-body-sm text-[--color-text-primary] truncate block max-w-[180px]">
              {title}
            </span>
          );
        },
      },
      {
        accessorKey: "reportReason",
        header: "Reason",
        cell: ({ getValue }) => (
          <span className="badge badge-rejected">{getValue() || "—"}</span>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => <SortHeader column={column} label="Status" />,
        cell: ({ getValue }) => <StatusBadge status={getValue()} />,
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => <SortHeader column={column} label="Date" />,
        cell: ({ getValue }) => (
          <span className="type-meta text-[--color-text-tertiary] font-[--font-mono]">
            {new Date(getValue()).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: reports,
    columns,
    state: { sorting },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="spinner" />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="type-body-sm text-[--color-text-secondary]">No reports found.</p>
      </div>
    );
  }

  return (
    <div className="border border-[--color-border] rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-[--color-border] bg-[--color-bg-subtle]">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left type-label-sm text-[--color-text-tertiary] font-semibold"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
                <th className="px-4 py-3 w-12" />
              </tr>
            ))}
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {table.getRowModel().rows.map((row) => (
                <motion.tr
                  key={row.original._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  className="border-b border-[--color-border] last:border-0 hover:bg-[--color-bg-subtle] transition-colors cursor-pointer"
                  onClick={() => onOpenPanel(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenPanel(row.original);
                      }}
                      className="p-1.5 rounded-lg hover:bg-[--color-bg-inset] text-[--color-text-tertiary] hover:text-[--color-text-secondary] transition-colors"
                      title="View report"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
