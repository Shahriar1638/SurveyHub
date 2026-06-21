"use no memo";
import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  ClipboardDocumentListIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from "@tanstack/react-table";
import { useMyBlogs, useDeleteBlog, useAppealBlog } from "../../../../Hooks/useBlogsMutation";
import { LoadingSpinner } from "../../../../Components/UI/LoadingSpinner";
import Swal from "sweetalert2";

// ── Animations ───────────────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const row = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

// ── Status badge ─────────────────────────────────────────────────────────────
const STATUS_MAP = {
  active: "badge-published",
  draft: "badge-draft",
  pending_review: "badge-pending",
  rejected: "badge-rejected",
  banned: "badge-banned",
};
const STATUS_LABELS = {
  active: "Published",
  pending_review: "Pending Review",
};

function StatusBadge({ status }) {
  return (
    <span className={`badge ${STATUS_MAP[status] || "badge-draft"}`}>
      {STATUS_LABELS[status] || status}
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

// ── Status filter chips ──────────────────────────────────────────────────────
const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "pending_review", label: "Pending" },
  { value: "rejected", label: "Rejected" },
  { value: "banned", label: "Banned" },
];

// ── Table columns ────────────────────────────────────────────────────────────
const columnHelper = createColumnHelper();

export default function BlogStudio() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ field: "createdAt", order: "desc" });
  const [moderationModal, setModerationModal] = useState({ open: false, blog: null });
  const [appealModal, setAppealModal] = useState({ open: false, blog: null });
  const [appealMsg, setAppealMsg] = useState("");

  const { data: blogs = [], isLoading, isError } = useMyBlogs({
    sort: sortConfig.field === "createdAt" ? "newest" : sortConfig.field === "updatedAt" ? "updated" : sortConfig.field === "title" ? (sortConfig.order === "asc" ? "title_asc" : "title_desc") : sortConfig.field === "deadline" ? "newest" : "newest",
    search: debouncedSearch || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  });
  const deleteMutation = useDeleteBlog();
  const appealMutation = useAppealBlog();

  // Debounce search
  const searchTimerRef = useRef(null);
  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => setDebouncedSearch(val), 350);
  };

  const handleSort = (field) => {
    setSortConfig((prev) => ({
      field,
      order: prev.field === field && prev.order === "desc" ? "asc" : "desc",
    }));
  };

  const handleDelete = (blog) => {
    Swal.fire({
      title: "Delete Blog?",
      html: `<p>Are you sure you want to delete "<strong>${blog.title}</strong>"?</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "var(--color-admin)",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(blog._id, {
          onSuccess: () => Swal.fire({ icon: "success", title: "Deleted", timer: 1500, showConfirmButton: false }),
        });
      }
    });
  };

  const handleAppeal = () => {
    if (!appealMsg.trim() || !appealModal.blog) return;
    appealMutation.mutate(
      { id: appealModal.blog._id, message: appealMsg },
      { onSuccess: () => { setAppealModal({ open: false, blog: null }); setAppealMsg(""); } }
    );
  };

  const canEdit = (status) => ["draft", "banned", "rejected", "pending_review"].includes(status);

  const columns = useMemo(() => [
    columnHelper.accessor("title", {
      header: "Title",
      cell: (info) => (
        <span className="type-label-sm text-[--color-text-primary] line-clamp-1 max-w-[260px] block">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => <StatusBadge status={info.getValue()} />,
    }),
    columnHelper.accessor("createdAt", {
      header: () => <SortButton field="createdAt" label="Created" sortConfig={sortConfig} onSort={handleSort} />,
      cell: (info) => (
        <span className="type-meta text-[--color-text-tertiary] font-[--font-mono]">
          {new Date(info.getValue()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      ),
    }),
    columnHelper.accessor("updatedAt", {
      header: () => <SortButton field="updatedAt" label="Updated" sortConfig={sortConfig} onSort={handleSort} />,
      cell: (info) => {
        const val = info.getValue();
        if (!val) return <span className="type-meta text-[--color-text-tertiary]">—</span>;
        return (
          <span className="type-meta text-[--color-text-tertiary] font-[--font-mono]">
            {new Date(val).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span className="text-right block">Actions</span>,
      cell: ({ row }) => {
        const blog = row.original;
        const hasModeration = !!blog.moderation?.reason;
        const isRejected = blog.status === "rejected";
        const hasAppeal = !!blog.moderation?.appeal;
        const canAppeal = isRejected && !hasAppeal;

        return (
          <div className="flex items-center justify-end gap-1">
            {/* AI Moderation button */}
            <button
              title={hasModeration ? "View AI Moderation" : "No AI moderation data"}
              onClick={() => hasModeration && setModerationModal({ open: true, blog })}
              className={`p-1.5 rounded-md transition-colors ${
                hasModeration
                  ? "hover:bg-[--color-bg-subtle] text-[--color-text-secondary] hover:text-[--color-warning]"
                  : "text-[--color-border] cursor-not-allowed"
              }`}
            >
              <ExclamationTriangleIcon className="w-4 h-4" />
            </button>

            {/* Appeal button — only for AI-rejected without appeal */}
            {canAppeal && (
              <button
                title="Appeal rejection"
                onClick={() => { setAppealModal({ open: true, blog }); setAppealMsg(""); }}
                className="p-1.5 rounded-md hover:bg-[--color-bg-subtle] text-[--color-text-secondary] hover:text-[--color-error] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19H18.93c1.1 0 1.95-.9 1.95-2 0-1.1-.85-2-1.95-2H5.07c-1.1 0-1.95.9-1.95 2 0 1.1.85 2 1.95 2z" />
                </svg>
              </button>
            )}

            {/* Edit button */}
            {canEdit(blog.status) && (
              <button
                title="Edit"
                onClick={() => navigate(`/dashboard/create-blog?id=${blog._id}`)}
                className="p-1.5 rounded-md hover:bg-[--color-bg-subtle] text-[--color-text-secondary] hover:text-[--color-text-primary] transition-colors"
              >
                <PencilSquareIcon className="w-4 h-4" />
              </button>
            )}

            {/* Delete button */}
            <button
              title="Delete"
              onClick={() => handleDelete(blog)}
              className="p-1.5 rounded-md hover:bg-[--color-admin-light] text-[--color-text-secondary] hover:text-[--color-admin] transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        );
      },
    }),
  ], [sortConfig]); // eslint-disable-next-line react-hooks/exhaustive-deps

  const table = useReactTable({
    data: blogs,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={row} className="flex items-center justify-between">
        <h2 className="type-heading-lg text-[--color-text-primary]">Blog Studio</h2>
        <button
          onClick={() => navigate("/dashboard/create-blog")}
          className="btn btn-surveyor btn-sm flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          New Blog Post
        </button>
      </motion.div>

      {/* Filters + Search */}
      <motion.div variants={row} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Status tabs */}
        <div className="flex gap-1 bg-[--color-bg-inset] rounded-lg p-1 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                statusFilter === f.value
                  ? "bg-[--color-bg-surface] text-[--color-text-primary] shadow-sm"
                  : "text-[--color-text-secondary] hover:text-[--color-text-primary]"
              }`}
            >
              {f.label}
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
            placeholder="Search by title..."
            className="input-field pl-9 py-2 w-full text-sm"
          />
        </div>
      </motion.div>

      {/* Table */}
      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <div className="text-center py-12">
          <p className="type-body-sm text-[--color-error]">Failed to load blogs.</p>
        </div>
      ) : blogs.length === 0 ? (
        <motion.div variants={row} className="empty-state">
          <div className="empty-state-icon">
            <ClipboardDocumentListIcon className="w-7 h-7" />
          </div>
          <p className="type-heading-sm text-[--color-text-primary] mt-2">No blog posts yet</p>
          <p className="type-body-sm text-[--color-text-secondary] mt-1">
            {statusFilter !== "all" || debouncedSearch
              ? "Try adjusting your filters or search."
              : "Convert your survey insights into engaging blog posts."}
          </p>
        </motion.div>
      ) : (
        <motion.div variants={row} className="table-wrapper">
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
              {table.getRowModel().rows.map((tableRow) => (
                <tr key={tableRow.id} className="hover:bg-[--color-bg-subtle] transition-colors">
                  {tableRow.getVisibleCells().map((cell) => (
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

      {/* Moderation Message Modal */}
      <AnimatePresence>
        {moderationModal.open && moderationModal.blog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setModerationModal({ open: false, blog: null })}
          >
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="card w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="card-header border-b border-[--color-border] px-6 py-4 flex items-center justify-between">
                <h3 className="type-heading-sm text-[--color-text-primary]">AI Moderation</h3>
                <button
                  onClick={() => setModerationModal({ open: false, blog: null })}
                  className="p-1 rounded-full text-[--color-text-tertiary] hover:bg-[--color-bg-inset] hover:text-[--color-text-primary] transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="card-body px-6 py-4 space-y-4">
                <div>
                  <p className="type-label-sm text-[--color-text-secondary]">Status</p>
                  <p className="type-body-sm text-[--color-text-primary] capitalize">
                    {moderationModal.blog.moderation?.decision || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="type-label-sm text-[--color-text-secondary]">Reason</p>
                  <p className="type-body-sm text-[--color-text-primary]">
                    {moderationModal.blog.moderation?.reason || "No reason provided."}
                  </p>
                </div>
                {moderationModal.blog.moderation?.flaggedCategories?.length > 0 && (
                  <div>
                    <p className="type-label-sm text-[--color-text-secondary]">Flagged Categories</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {moderationModal.blog.moderation.flaggedCategories.map((cat, i) => (
                        <span key={i} className="badge badge-rejected text-xs">{cat}</span>
                      ))}
                    </div>
                  </div>
                )}
                {moderationModal.blog.moderation?.appeal && (
                  <div>
                    <p className="type-label-sm text-[--color-text-secondary]">Appeal</p>
                    <p className="type-body-sm text-[--color-text-tertiary] italic">
                      &ldquo;{moderationModal.blog.moderation.appeal.message}&rdquo;
                    </p>
                  </div>
                )}
              </div>
              <div className="card-footer border-t border-[--color-border] px-6 py-3 flex justify-end">
                <button
                  onClick={() => setModerationModal({ open: false, blog: null })}
                  className="btn btn-secondary btn-sm"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Appeal Modal */}
        {appealModal.open && appealModal.blog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => { setAppealModal({ open: false, blog: null }); setAppealMsg(""); }}
          >
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="card w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="card-header border-b border-[--color-border] px-6 py-4 flex items-center justify-between">
                <h3 className="type-heading-sm text-[--color-text-primary]">Appeal Rejection</h3>
                <button
                  onClick={() => { setAppealModal({ open: false, blog: null }); setAppealMsg(""); }}
                  className="p-1 rounded-full text-[--color-text-tertiary] hover:bg-[--color-bg-inset] hover:text-[--color-text-primary] transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="card-body px-6 py-4 space-y-4">
                <p className="type-body-sm text-[--color-text-secondary]">
                  Explain why &ldquo;{appealModal.blog.title}&rdquo; should be approved.
                </p>
                <textarea
                  value={appealMsg}
                  onChange={(e) => setAppealMsg(e.target.value)}
                  placeholder="Write your appeal message..."
                  className="form-input min-h-[100px] resize-y"
                  autoFocus
                />
              </div>
              <div className="card-footer border-t border-[--color-border] px-6 py-3 flex items-center justify-end gap-3">
                <button
                  onClick={() => { setAppealModal({ open: false, blog: null }); setAppealMsg(""); }}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAppeal}
                  disabled={appealMutation.isPending || !appealMsg.trim()}
                  className="btn btn-surveyor btn-sm"
                >
                  {appealMutation.isPending ? "Submitting..." : "Submit Appeal"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
