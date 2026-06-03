import { useNavigate } from "react-router";
import { useMemo } from "react";
import { motion } from "motion/react";

// ── Role badge ──────────────────────────────────────────────────────────────
export function RoleBadge({ role }) {
  if (role === "surveyor") {
    return (
      <span
        title="Verified Surveyor"
        className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
        style={{ backgroundColor: "var(--color-surveyor-light)", color: "var(--color-surveyor-dark)" }}
      >
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Surveyor
      </span>
    );
  }
  if (role === "admin") {
    return (
      <span
        title="Platform Admin"
        className="inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
        style={{ backgroundColor: "var(--color-admin-light)", color: "var(--color-admin)" }}
      >
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Admin
      </span>
    );
  }
  return null;
}

// ── Author avatar ───────────────────────────────────────────────────────────
export function Avatar({ author, size = 9 }) {
  const initials = (author?.name || author?.email || "?")[0].toUpperCase();
  const roleColor =
    author?.role === "admin"
      ? "var(--color-admin)"
      : author?.role === "surveyor"
      ? "var(--color-surveyor-dark)"
      : "var(--color-user)";
  const SIZE_MAP = {
    7: "w-7 h-7",
    8: "w-8 h-8",
    9: "w-9 h-9",
    10: "w-10 h-10",
  };
  const sizeClass = SIZE_MAP[size] || "w-9 h-9";

  if (author?.avatar || author?.photoURL) {
    return (
      <img
        src={author.avatar || author.photoURL}
        alt={author.name || author.email}
        className={`${sizeClass} rounded-full object-cover ring-2 ring-[--color-border] shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0`}
      style={{ backgroundColor: roleColor }}
    >
      {initials}
    </div>
  );
}

// ── Reaction bar (read-only in feed, interactive in detail) ─────────────────
const REACTIONS = [
  { type: "like", emoji: "👍", label: "Like" },
  { type: "insightful", emoji: "💡", label: "Insightful" },
  { type: "interesting", emoji: "🤔", label: "Interesting" },
  { type: "funny", emoji: "😄", label: "Funny" },
  { type: "disagree", emoji: "👎", label: "Disagree" },
];

export function ReactionBar({ counts, userReaction, onReact, readonly = false }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {REACTIONS.map(({ type, emoji, label }) => {
        const count = counts?.[type] || 0;
        const isActive = userReaction === type;
        return (
          <button
            key={type}
            disabled={readonly}
            onClick={() => !readonly && onReact?.(type)}
            title={label}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150 ${
              readonly ? "cursor-default" : "cursor-pointer hover:scale-105 active:scale-95"
            } ${isActive ? "ring-2" : ""}`}
            style={{
              backgroundColor: isActive ? "var(--color-visitor-light)" : "var(--color-bg-subtle)",
              color: isActive ? "var(--color-visitor-dark)" : "var(--color-text-secondary)",
              ringColor: isActive ? "var(--color-visitor)" : "transparent",
              border: isActive ? "1px solid var(--color-visitor)" : "1px solid var(--color-border)",
            }}
          >
            <span>{emoji}</span>
            {count > 0 && <span className="font-[--font-mono]">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}

// ── Blog card (feed item) ───────────────────────────────────────────────────
export function BlogCard({ blog, index }) {
  const navigate = useNavigate();
  const totalReactions = useMemo(
    () => Object.values(blog.reactionCounts || {}).reduce((s, v) => s + v, 0),
    [blog.reactionCounts]
  );
  const readTime = useMemo(
    () => Math.max(1, Math.ceil((blog.content || "").length / 1200)),
    [blog.content]
  );
  const excerpt = useMemo(
    () => (blog.content || "").replace(/<[^>]+>/g, "").slice(0, 220),
    [blog.content]
  );

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="card p-6 hover:shadow-[--shadow-md] transition-shadow duration-200 cursor-pointer group"
      onClick={() => navigate(`/blogs/${blog._id}`)}
    >
      {/* Author row */}
      <div className="flex items-center gap-3 mb-4">
        <Avatar author={blog.surveyor} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="type-label-sm text-[--color-text-primary] truncate">
              {blog.surveyor?.name || blog.surveyorEmail}
            </span>
            <RoleBadge role={blog.surveyor?.role} />
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="type-meta text-[--color-text-tertiary] font-[--font-mono]">
              {new Date(blog.createdAt).toLocaleDateString("en-US", {
                month: "short", day: "numeric", year: "numeric",
              })}
            </span>
            <span className="text-[--color-border-strong]">·</span>
            <span className="type-meta text-[--color-text-tertiary]">{readTime} min read</span>
          </div>
        </div>
      </div>

      {/* Title & excerpt */}
      <h2 className="type-heading-sm text-[--color-text-primary] mb-2 group-hover:text-[--color-visitor] transition-colors line-clamp-2">
        {blog.title}
      </h2>
      <p className="type-body-sm text-[--color-text-secondary] line-clamp-3 mb-4">
        {excerpt}
        {(blog.content || "").length > 220 ? "…" : ""}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-[--color-border]" onClick={e => e.stopPropagation()}>
        <ReactionBar counts={blog.reactionCounts} readonly />
        <div className="flex items-center gap-3">
          {totalReactions > 0 && (
            <span className="type-meta text-[--color-text-tertiary]">
              {totalReactions} reaction{totalReactions !== 1 ? "s" : ""}
            </span>
          )}
          <span className="type-meta text-[--color-text-tertiary] flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {blog.commentCount ?? 0}
          </span>
        </div>
      </div>
    </motion.article>
  );
}

// ── Skeleton card ───────────────────────────────────────────────────────────
export function BlogCardSkeleton() {
  return (
    <div className="card p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-full bg-[--color-bg-inset] shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 w-28 bg-[--color-bg-inset] rounded" />
          <div className="h-3 w-20 bg-[--color-bg-inset] rounded" />
        </div>
      </div>
      <div className="h-5 w-3/4 bg-[--color-bg-inset] rounded mb-2" />
      <div className="space-y-1.5 mb-4">
        <div className="h-3.5 w-full bg-[--color-bg-inset] rounded" />
        <div className="h-3.5 w-5/6 bg-[--color-bg-inset] rounded" />
        <div className="h-3.5 w-4/6 bg-[--color-bg-inset] rounded" />
      </div>
      <div className="flex gap-2 pt-3 border-t border-[--color-border]">
        {[80, 90, 70, 85, 75].map(w => (
          <div key={w} className="h-6 rounded-full bg-[--color-bg-inset]" style={{ width: w }} />
        ))}
      </div>
    </div>
  );
}
