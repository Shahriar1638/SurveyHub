/* eslint-disable no-unused-vars */
import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  PlusIcon,
  PencilSquareIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useMyBlogs, useDeleteBlog, useAppealBlog } from "../../../../Hooks/useBlogsMutation";
import { BlogCard, BlogCardSkeleton } from "../../../../Components/UI/BlogCard";
import { LoadingSpinner } from "../../../../Components/UI/LoadingSpinner";
import Swal from "sweetalert2";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "title_asc", label: "Title A–Z" },
  { value: "title_desc", label: "Title Z–A" },
  { value: "updated", label: "Recently Updated" },
];

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "active", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "pending_review", label: "Pending" },
  { value: "rejected", label: "Rejected" },
  { value: "banned", label: "Banned" },
];

const STATUS_BADGE = {
  active: "badge badge-published",
  draft: "badge badge-draft",
  pending_review: "badge badge-pending",
  rejected: "badge badge-rejected",
  banned: "badge badge-banned",
};

function BlogModerationBanner({ blogs }) {
  const [appealId, setAppealId] = useState(null);
  const [appealMsg, setAppealMsg] = useState("");
  const appealMutation = useAppealBlog();

  const issues = useMemo(
    () => blogs.filter((b) => ["rejected", "pending_review"].includes(b.status)),
    [blogs]
  );

  if (issues.length === 0) return null;

  const handleAppeal = (id) => {
    if (!appealMsg.trim()) return;
    appealMutation.mutate(
      { id, message: appealMsg },
      { onSuccess: () => { setAppealId(null); setAppealMsg(""); } }
    );
  };

  return (
    <div className="mb-6">
      <p className="type-meta-sm text-[--color-error] tracking-widest uppercase mb-2">
        Content Review
      </p>
      {issues.map((b) => (
        <div
          key={b._id}
          className={`card p-4 border-l-4 mb-3 ${
            b.status === "rejected"
              ? "border-l-[--color-error]"
              : "border-l-[--color-warning]"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="type-label-sm text-[--color-text-primary]">{b.title}</p>
              <p className="type-meta text-[--color-text-tertiary] mt-0.5 font-[--font-mono]">
                {b.status === "rejected" ? "Rejected" : "Pending Review"} ·{" "}
                {new Date(b.updatedAt || b.createdAt).toLocaleDateString()}
              </p>
              {b.moderation?.reason && (
                <p className="type-body-sm text-[--color-error] mt-1">
                  Reason: {b.moderation.reason}
                </p>
              )}
              {b.moderation?.appeal && (
                <p className="type-body-sm text-[--color-text-tertiary] mt-1 italic">
                  Appeal: &ldquo;{b.moderation.appeal.message}&rdquo;
                </p>
              )}
            </div>
            {b.status === "rejected" && !b.moderation?.appeal && (
              <div className="shrink-0">
                {appealId === b._id ? (
                  <div className="flex flex-col gap-2 min-w-[200px]">
                    <textarea
                      value={appealMsg}
                      onChange={(e) => setAppealMsg(e.target.value)}
                      placeholder="Why should this be approved?"
                      className="input-field text-sm min-h-[60px]"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAppeal(b._id)}
                        disabled={appealMutation.isPending}
                        className="btn btn-xs btn-surveyor"
                      >
                        {appealMutation.isPending ? "..." : "Submit"}
                      </button>
                      <button onClick={() => { setAppealId(null); setAppealMsg(""); }} className="btn btn-xs btn-ghost">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAppealId(b._id)}
                    className="btn btn-xs btn-outline text-[--color-error] border-[--color-error] hover:bg-[--color-error]/10"
                  >
                    Appeal
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BlogStudio() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const { data: blogs = [], isLoading, isError } = useMyBlogs({ sort, search, status: statusFilter });
  const deleteMutation = useDeleteBlog();

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="type-heading-lg text-[--color-text-primary]">Blog Studio</h2>
        <button onClick={() => navigate("/dashboard/create-blog")} className="btn btn-surveyor btn-sm flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          New Blog Post
        </button>
      </div>

      {/* Moderation banner — show rejected/pending from full list */}
      <BlogModerationBanner blogs={blogs} />

      {/* Search + Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-50 max-w-md">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--color-text-tertiary]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="    Search blogs..."
            className="form-input pl-9 pr-3 py-2 w-full text-sm"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <XMarkIcon className="w-4 h-4 text-[--color-text-tertiary] hover:text-[--color-text-primary]" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="form-input pl-9 pr-3 py-2 text-sm appearance-none cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ArrowsUpDownIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--color-text-tertiary] pointer-events-none" />
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            showFilters || statusFilter !== "all"
              ? "bg-[--color-surveyor] text-white"
              : "bg-[--color-bg-subtle] text-[--color-text-secondary] hover:bg-[--color-bg-inset]"
          }`}
        >
          <FunnelIcon className="w-4 h-4" />
          Filter
          {statusFilter !== "all" && (
            <span className="ml-1 w-5 h-5 rounded-full bg-white/20 text-xs flex items-center justify-center">1</span>
          )}
        </button>
      </div>

      {/* Status filter chips */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 flex-wrap pb-2">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ${
                    statusFilter === f.value
                      ? "bg-[--color-surveyor] text-white shadow-sm"
                      : "bg-[--color-bg-subtle] text-[--color-text-secondary] hover:bg-[--color-bg-inset]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blog feed */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <BlogCardSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <p className="type-body-sm text-[--color-error]">Failed to load blogs.</p>
        </div>
      ) : blogs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="empty-state"
        >
          <div className="empty-state-icon">
            <PencilSquareIcon className="w-7 h-7" />
          </div>
          <p className="type-heading-sm text-[--color-text-primary] mt-2">No blog posts yet</p>
          <p className="type-body-sm text-[--color-text-secondary] mt-1">
            Convert your survey insights into engaging blog posts.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {blogs.map((blog, idx) => (
            <BlogCard
              key={blog._id}
              blog={blog}
              index={idx}
              onEdit={(b) => navigate(`/dashboard/create-blog?id=${b._id}`)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
