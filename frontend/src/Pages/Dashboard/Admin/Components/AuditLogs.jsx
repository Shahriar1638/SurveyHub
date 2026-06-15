/* eslint-disable react-hooks/incompatible-library */
/* eslint-disable react-hooks/rules-of-hooks */
"use no memo";
/* eslint-disable no-unused-vars */
import { useMemo } from "react";
import { motion } from "motion/react";
import { DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from "@tanstack/react-table";
import { useAuditLogs } from "../../../../Hooks/useDashboardAdmin";
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
  columnHelper.accessor(
    (row) => new Date(row.timestamp || row.createdAt).toLocaleString("en-US", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    }),
    { id: "timestamp", header: "Timestamp", cell: (info) => (
      <span className="type-meta text-[--color-text-tertiary] whitespace-nowrap">{info.getValue()}</span>
    )},
  ),
  columnHelper.accessor((row) => row.actor?.email || "System", {
    id: "actor", header: "Actor", cell: (info) => (
      <span className="type-body-sm text-[--color-text-primary] truncate block max-w-45">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("action", {
    header: "Action", cell: (info) => (
      <span className="badge badge-draft text-[10px]">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor((row) => row.resource || "—", {
    id: "resource", header: "Resource", cell: (info) => (
      <span className="type-body-sm text-[--color-text-secondary]">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor((row) => row.detail ? JSON.stringify(row.detail) : "—", {
    id: "details", header: "Details", cell: (info) => (
      <span className="type-meta text-[--color-text-tertiary] truncate block max-w-50">{info.getValue()}</span>
    ),
  }),
];

export default function AuditLogs() {
  const { data: logData, isLoading, isError } = useAuditLogs({ limit: 30 });
  const logs = useMemo(() => logData?.data || [], [logData]);

  if (isError) return <div className="text-center py-12"><p className="type-body-sm text-[--color-error]">Failed to load audit logs.</p></div>;

  const table = useReactTable({ data: logs, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h2 className="type-heading-lg text-[--color-text-primary]">Audit Logs</h2>
        <p className="type-body-sm text-[--color-text-secondary] mt-1">
          Immutable log of all administrative actions.
        </p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-[--color-bg-inset] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <motion.div variants={item} className="empty-state">
          <div className="empty-state-icon">
            <DocumentMagnifyingGlassIcon className="w-7 h-7" />
          </div>
          <p className="type-heading-sm text-[--color-text-primary] mt-2">No audit logs</p>
          <p className="type-body-sm text-[--color-text-secondary] mt-1">
            Actions will be logged here as they occur.
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
