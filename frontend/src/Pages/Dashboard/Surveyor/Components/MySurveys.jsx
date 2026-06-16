"use no memo";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  ClipboardDocumentListIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from "@tanstack/react-table";
import { useMySurveys, useToggleAIInsight } from "../../../../Hooks/useMySurveys";
import { useDeleteSurvey } from "../../../../Hooks/useSurveysMutation";
import { LoadingSpinner } from "../../../../Components/UI/LoadingSpinner";
import Swal from "sweetalert2";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    published: "badge-published",
    draft: "badge-draft",
    pending_review: "badge-pending",
    rejected: "badge-rejected",
    expired: "badge-pending",
    banned: "badge-rejected",
  };
  const labels = {
    pending_review: "Pending Review",
  };
  return (
    <span className={`badge ${map[status] || "badge-draft"}`}>
      {labels[status] || status}
    </span>
  );
}

// ── Sort button ──────────────────────────────────────────────────────────────
function SortButton({ field, label, sortConfig, onSort }) {
  const active = sortConfig.field === field;
  const dir = active ? sortConfig.order : null;
  return (
    <button
      onClick={() => onSort(field)}
      className={`inline-flex items-center gap-1 text-left ${active ? "text-[--color-surveyor]" : "text-[--color-text-secondary]"}`}
    >
      {label}
      {active ? (
        dir === "asc" ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />
      ) : null}
    </button>
  );
}

const columnHelper = createColumnHelper();

export default function MySurveys() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ field: "createdAt", order: "desc" });

  const { data: surveys, isLoading, isError } = useMySurveys({
    status: statusFilter === "all" ? undefined : statusFilter,
    search: debouncedSearch || undefined,
    sort: sortConfig.field,
    order: sortConfig.order,
  });

  const toggleAI = useToggleAIInsight();
  const deleteSurvey = useDeleteSurvey();

  // Debounce search
  const handleSearch = (val) => {
    setSearch(val);
    // Simple debounce via timeout ref would be better, but for now:
    clearTimeout(window.__searchTimer);
    window.__searchTimer = setTimeout(() => setDebouncedSearch(val), 350);
  };

  const handleSort = (field) => {
    setSortConfig((prev) => ({
      field,
      order: prev.field === field && prev.order === "desc" ? "asc" : "desc",
    }));
  };

  const handleToggleAI = (survey) => {
    const next = !survey.aiInsight?.enabled;
    Swal.fire({
      title: next ? "Enable AI Insights?" : "Disable AI Insights?",
      text: next
        ? "AI insights will be generated automatically when the deadline expires."
        : "AI insights will not be generated for this survey.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#5BBCEA",
      confirmButtonText: next ? "Enable" : "Disable",
    }).then((result) => {
      if (result.isConfirmed) {
        toggleAI.mutate({ id: survey._id, enabled: next });
      }
    });
  };

  const handleDelete = (survey) => {
    Swal.fire({
      title: "Move to Recycle Bin?",
      text: `"${survey.title}" will be moved to the recycle bin. You can restore it later.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DC2626",
      confirmButtonText: "Delete",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteSurvey.mutate(survey._id, {
          onSuccess: () => {
            Swal.fire({ title: "Moved!", text: "Survey moved to recycle bin.", icon: "success", timer: 1500, showConfirmButton: false });
          },
        });
      }
    });
  };

  const columns = useMemo(() => [
    columnHelper.accessor("title", {
      header: "Title",
      cell: (info) => (
        <span className="type-label-sm text-[--color-text-primary] line-clamp-1 max-w-[240px] block">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => <StatusBadge status={info.getValue()} />,
    }),
    columnHelper.accessor("category", {
      header: "Category",
      cell: (info) => (
        <span className="type-meta text-[--color-text-tertiary]">
          {info.getValue() || "—"}
        </span>
      ),
    }),
    columnHelper.accessor((row) => row.participantCount ?? 0, {
      id: "responses",
      header: () => <SortButton field="responses" label="Responses" sortConfig={sortConfig} onSort={handleSort} />,
      cell: (info) => (
        <span className="type-meta text-[--color-text-primary] font-[--font-mono]">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("deadline", {
      header: () => <SortButton field="deadline" label="Deadline" sortConfig={sortConfig} onSort={handleSort} />,
      cell: (info) => {
        const val = info.getValue();
        if (!val) return <span className="type-meta text-[--color-text-tertiary]">—</span>;
        const d = new Date(val);
        const isPast = d < new Date();
        return (
          <span className={`type-meta font-[--font-mono] ${isPast ? "text-[--color-text-tertiary]" : "text-[--color-text-primary]"}`}>
            {d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        );
      },
    }),
    columnHelper.accessor("createdAt", {
      header: () => <SortButton field="createdAt" label="Created" sortConfig={sortConfig} onSort={handleSort} />,
      cell: (info) => (
        <span className="type-meta text-[--color-text-tertiary] font-[--font-mono]">
          {new Date(info.getValue()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      ),
    }),
    columnHelper.accessor("aiInsight", {
      header: "AI",
      cell: (info) => {
        const ai = info.getValue();
        const enabled = ai?.enabled;
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleAI(info.row.original);
            }}
            title={enabled ? "AI insight enabled — click to disable" : "AI insight disabled — click to enable"}
            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none"
            style={{ backgroundColor: enabled ? "#16A34A" : "#DC2626" }}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                enabled ? "translate-x-[22px]" : "translate-x-[4px]"
              }`}
            />
          </button>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span className="text-right block">Actions</span>,
      cell: ({ row }) => {
        const survey = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            {["draft", "banned", "rejected", "pending"].includes(survey.status) && (
              <button
                title="Edit"
                onClick={() => navigate(`/dashboard/create-survey?id=${survey._id}`)}
                className="p-1.5 rounded-md hover:bg-[--color-bg-subtle] text-[--color-text-secondary] hover:text-[--color-text-primary] transition-colors"
              >
                <PencilSquareIcon className="w-4 h-4" />
              </button>
            )}
            <button
              title="Delete"
              onClick={() => handleDelete(survey)}
              className="p-1.5 rounded-md hover:bg-[--color-admin-light] text-[--color-text-secondary] hover:text-[--color-admin] transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        );
      },
    }),
  ], [sortConfig]);

  const table = useReactTable({
    data: surveys || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const statuses = [
    { value: "all", label: "All" },
    { value: "published", label: "Published" },
    { value: "draft", label: "Draft" },
    { value: "pending_review", label: "Pending" },
    { value: "rejected", label: "Rejected" },
    { value: "expired", label: "Expired" },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <h2 className="type-heading-lg text-[--color-text-primary]">My Surveys</h2>
        <button
          onClick={() => navigate("/dashboard/create-survey")}
          className="btn btn-surveyor btn-sm flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          Create Survey
        </button>
      </motion.div>

      {/* Filters + Search */}
      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Status tabs */}
        <div className="flex gap-1 bg-[--color-bg-inset] rounded-lg p-1 flex-wrap">
          {statuses.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                statusFilter === s.value
                  ? "bg-[--color-bg-surface] text-[--color-text-primary] shadow-sm"
                  : "text-[--color-text-secondary] hover:text-[--color-text-primary]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--color-text-tertiary]" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by title or description..."
            className="input-field pl-9 py-2 w-full text-sm"
          />
        </div>
      </motion.div>

      {/* Table */}
      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <div className="text-center py-12">
          <p className="type-body-sm text-[--color-error]">Failed to load surveys.</p>
        </div>
      ) : (surveys || []).length === 0 ? (
        <motion.div variants={item} className="empty-state">
          <div className="empty-state-icon">
            <ClipboardDocumentListIcon className="w-7 h-7" />
          </div>
          <p className="type-heading-sm text-[--color-text-primary] mt-2">No surveys found</p>
          <p className="type-body-sm text-[--color-text-secondary] mt-1">
            {statusFilter !== "all" || debouncedSearch
              ? "Try adjusting your filters or search."
              : "Create your first survey to get started."}
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
                <tr key={row.id} className="hover:bg-[--color-bg-subtle] transition-colors">
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
