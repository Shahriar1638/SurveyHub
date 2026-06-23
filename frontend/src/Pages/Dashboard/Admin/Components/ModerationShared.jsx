"use no memo";

import {
  DocumentTextIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";
import { motion } from "motion/react";
import { Link } from "react-router";

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "title", label: "Title A-Z" },
];

export function StatusBadge({ status }) {
  const map = {
    published: "badge-success",
    active: "badge-success",
    draft: "badge bg-[--color-bg-inset] text-[--color-text-secondary]",
    pending_review: "badge-pending",
    rejected: "badge-banned",
    expired: "badge bg-[--color-bg-inset] text-[--color-text-tertiary]",
    banned: "badge-banned",
  };
  return (
    <span className={`badge ${map[status] || "badge bg-[--color-bg-inset] text-[--color-text-secondary]"}`}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}

export function SortHeader({ column, title }) {
  return (
    <button
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="flex items-center gap-1 hover:text-[--color-text-primary] transition-colors"
    >
      {title}
      {column.getIsSorted() === "asc" ? (
        <ArrowUpIcon className="w-3.5 h-3.5" />
      ) : column.getIsSorted() === "desc" ? (
        <ArrowDownIcon className="w-3.5 h-3.5" />
      ) : null}
    </button>
  );
}

export function DetailModal({ item, type, onClose }) {
  if (!item) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 rounded-2xl shadow-[--shadow-xl] w-full max-w-2xl max-h-[85vh] flex flex-col border border-[--color-border]"
        style={{ backgroundColor: "#FFFFFF" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[--color-border]">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              type === "survey" ? "bg-[--color-error-light]" : "bg-[--color-accent-light]"
            }`}>
              <DocumentTextIcon className={`w-5 h-5 ${
                type === "survey" ? "text-[--color-error]" : "text-[--color-accent]"
              }`} />
            </div>
            <div className="min-w-0">
              <h3 className="type-heading-sm text-[--color-text-primary] truncate">{item.title}</h3>
              <p className="type-meta text-[--color-text-tertiary] capitalize">{type}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[--color-bg-subtle] transition-colors shrink-0">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 flex flex-col gap-4">
          {/* Status & Meta */}
          <div className="flex items-center gap-3 flex-wrap">
            <StatusBadge status={item.status} />
            {type === "survey" && item.category && (
              <span className="badge badge-surveyor">{item.category}</span>
            )}
            <span className="type-meta text-[--color-text-tertiary]">
              by {item.surveyorId?.email || item.surveyorEmail}
            </span>
            <span className="type-meta text-[--color-text-tertiary]">
              {new Date(item.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Description / Content */}
          {type === "survey" ? (
            <div>
              <p className="type-label-sm text-[--color-text-primary] mb-1">Description</p>
              <p className="type-body-sm text-[--color-text-secondary]">{item.description || "No description"}</p>
            </div>
          ) : (
            <div>
              <p className="type-label-sm text-[--color-text-primary] mb-1">Content</p>
              <div className="type-body-sm text-[--color-text-secondary] whitespace-pre-wrap bg-[--color-bg-subtle] rounded-xl p-4 max-h-60 overflow-y-auto">
                {item.content}
              </div>
            </div>
          )}

          {/* Questions (survey only) */}
          {type === "survey" && item.questions?.length > 0 && (
            <div>
              <p className="type-label-sm text-[--color-text-primary] mb-2">Questions ({item.questions.length})</p>
              <div className="flex flex-col gap-2">
                {item.questions.map((q, i) => (
                  <div key={q.id || i} className="flex items-start gap-2 p-3 rounded-lg bg-[--color-bg-subtle] border border-[--color-border]">
                    <span className="type-meta text-[--color-text-tertiary] font-[--font-mono] shrink-0">Q{i + 1}</span>
                    <div className="min-w-0">
                      <p className="type-body-sm text-[--color-text-primary]">{q.label}</p>
                      <p className="type-meta text-[--color-text-tertiary] capitalize">{q.type?.replace(/_/g, " ")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Moderation info */}
          {item.moderation?.reason && (
            <div className="p-4 rounded-xl bg-[--color-warning-light] border border-[--color-warning]/20">
              <div className="flex items-center gap-2 mb-1">
                <ExclamationTriangleIcon className="w-4 h-4 text-[--color-warning]" />
                <p className="type-label-sm text-[--color-warning]">AI Moderation</p>
              </div>
              <p className="type-body-sm text-[--color-text-secondary]">{item.moderation.reason}</p>
              {item.moderation.flaggedCategories?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.moderation.flaggedCategories.map((cat, i) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-[--color-warning]/10 text-[--color-warning] font-medium">
                      {cat}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Appeal */}
          {item.moderation?.appeal?.message && (
            <div className="p-4 rounded-xl bg-[--color-bg-subtle] border border-[--color-border]">
              <p className="type-label-sm text-[--color-text-primary] mb-1">Appeal</p>
              <p className="type-body-sm text-[--color-text-secondary] italic">&ldquo;{item.moderation.appeal.message}&rdquo;</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[--color-border]">
          <div className="flex items-center gap-2">
            {type === "survey" ? (
              <Link
                to={`/surveys/${item._id}`}
                target="_blank"
                className="btn btn-secondary btn-sm flex items-center gap-1.5"
              >
                <EyeIcon className="w-3.5 h-3.5" />
                View Full
              </Link>
            ) : (
              <Link
                to={`/blogs/${item._id}`}
                target="_blank"
                className="btn btn-secondary btn-sm flex items-center gap-1.5"
              >
                <EyeIcon className="w-3.5 h-3.5" />
                View Full
              </Link>
            )}
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-sm">Close</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
