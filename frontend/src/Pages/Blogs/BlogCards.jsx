import { Link, useNavigate } from "react-router";
import DOMPurify from "dompurify";
import { RoleBadge, Avatar, ReactionBar } from "../../Components/UI/BlogCard";

export default function BlogCards({
  blog,
  readTime,
  counts,
  userReaction,
  canInteract,
  reactMutationPending,
  onReact,
}) {
  const navigate = useNavigate();

  return (
    <>
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 type-meta text-[--color-text-tertiary] hover:text-[--color-text-primary] transition-colors mb-8 group"
      >
        <svg
          className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Blogs
      </button>

      {/* Author meta */}
      <div className="flex items-center gap-3 mb-6">
        <Avatar author={blog.surveyor} size="10" />
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="type-label-sm text-[--color-text-primary]">
              {blog.surveyor?.name || blog.surveyorEmail}
            </span>
            <RoleBadge role={blog.surveyor?.role} />
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="type-meta text-[--color-text-tertiary] font-[--font-mono]">
              {new Date(blog.createdAt).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <span className="text-[--color-border-strong]">·</span>
            <span className="type-meta text-[--color-text-tertiary]">
              {readTime} min read
            </span>
          </div>
        </div>
      </div>

      {/* Title */}
      <h1 className="type-heading-xl text-[--color-text-primary] mb-6 leading-snug">
        {blog.title}
      </h1>

      {/* Content */}
      <div
        className="prose prose-sm max-w-none type-body-base text-[--color-text-secondary] leading-relaxed whitespace-pre-wrap mb-8"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content || "") }}
      />

      {/* Divider */}
      <div className="border-t border-[--color-border] my-8" />

      {/* Reactions */}
      <div className="mb-8">
        <p className="type-label-sm text-[--color-text-tertiary] mb-3 uppercase tracking-wider">
          React to this post
        </p>
        {canInteract ? (
          <ReactionBar
            counts={counts}
            userReaction={userReaction}
            onReact={onReact}
            disabled={reactMutationPending}
          />
        ) : (
          <div className="flex items-center gap-3">
            <ReactionBar counts={counts} disabled />
            <Link
              to="/login"
              className="type-body-sm text-[--color-visitor] hover:underline"
            >
              Sign in to react
            </Link>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-[--color-border] my-8" />
    </>
  );
}
