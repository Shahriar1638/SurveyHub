/* eslint-disable no-unused-vars */
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useBlogReply } from "../../Hooks/useBlogs";
import { RoleBadge, Avatar } from "../../Components/UI/BlogCard";
import ReportModal from "../../Components/UI/ReportModal";

// ── Reply item ───────────────────────────────────────────────────────────────
export function ReplyItem({ reply, blogId, commentId, user }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex gap-2.5 pt-3"
    >
      <Avatar author={reply.author} size="7" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="type-label-sm text-[--color-text-primary]">
            {reply.author?.name || reply.userEmail}
          </span>
          <RoleBadge role={reply.author?.role} />
          <span className="type-meta text-[--color-text-tertiary] font-[--font-mono]">
            {new Date(reply.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
        <p className="type-body-sm text-[--color-text-secondary] leading-relaxed">
          {reply.text}
        </p>

        {/* Reply actions */}
        {user && user.email !== reply.userEmail && (
          <div className="flex items-center gap-3 mt-1.5">
            <ReportModal url={`/api/blogs/${blogId}/comments/${commentId}/replies/${reply._id}/report`} title="Report Reply">
              <span className="type-meta text-[--color-text-tertiary] hover:text-[--color-error] transition-colors flex items-center gap-1 cursor-pointer">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
                Report
              </span>
            </ReportModal>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Comment item with folded replies ─────────────────────────────────────────
export function CommentItem({ comment, blogId, user, userRole, onReplyAdded }) {
  const [repliesOpen, setRepliesOpen] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const replyMutation = useBlogReply(blogId);

  const handleReply = async () => {
    if (!replyText.trim() || replyMutation.isPending) return;
    setSubmitting(true);
    try {
      const newReply = await replyMutation.mutateAsync({
        commentId: comment._id,
        userEmail: user.email,
        text: replyText.trim(),
      });
      onReplyAdded(comment._id, newReply);
      setReplyText("");
      setShowReplyBox(false);
      setRepliesOpen(true);
    } catch (e) {
      console.error("Reply failed", e);
    } finally {
      setSubmitting(false);
    }
  };

  const replyCount = comment.replies?.length || 0;

  return (
    <div className="py-4 border-b border-[--color-border] last:border-0">
      {/* Comment author */}
      <div className="flex gap-3">
        <Avatar author={comment.author} size="8" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="type-label-sm text-[--color-text-primary]">
              {comment.author?.name || comment.userEmail}
            </span>
            <RoleBadge role={comment.author?.role} />
            <span className="type-meta text-[--color-text-tertiary] font-[--font-mono]">
              {new Date(comment.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <p className="type-body-sm text-[--color-text-secondary] leading-relaxed">
            {comment.text}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-2">
            {user && (
              <button
                onClick={() => setShowReplyBox((v) => !v)}
                className="type-meta text-[--color-text-tertiary] hover:text-[--color-surveyor-dark] transition-colors flex items-center gap-1"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                  />
                </svg>
                Reply
              </button>
            )}
            {user && user.email !== comment.userEmail && (
              <ReportModal url={`/api/blogs/${blogId}/comments/${comment._id}/report`} title="Report Comment">
                <span className="type-meta text-[--color-text-tertiary] hover:text-[--color-error] transition-colors flex items-center gap-1 cursor-pointer">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                  Report
                </span>
              </ReportModal>
            )}
            {replyCount > 0 && (
              <button
                onClick={() => setRepliesOpen((v) => !v)}
                className={`type-meta flex items-center gap-1 transition-colors ${repliesOpen ? "text-[--color-surveyor-dark]" : "text-[--color-text-tertiary]"}`}
              >
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${repliesOpen ? "rotate-90" : ""}`}
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
                {replyCount} {replyCount === 1 ? "reply" : "replies"}
              </button>
            )}
          </div>

          {/* Reply input */}
          <AnimatePresence>
            {showReplyBox && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 flex gap-2 items-start overflow-hidden"
              >
                <textarea
                  rows={2}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply…"
                  className="form-input resize-none flex-1 text-sm"
                />
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    onClick={handleReply}
                    disabled={submitting || !replyText.trim()}
                    className="btn btn-sm px-3 py-1.5 text-xs font-semibold text-white rounded-lg disabled:opacity-50 bg-[--color-surveyor-dark]"
                  >
                    {submitting ? "…" : "Post"}
                  </button>
                  <button
                    onClick={() => {
                      setShowReplyBox(false);
                      setReplyText("");
                    }}
                    className="btn btn-ghost btn-sm text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Replies list */}
          <AnimatePresence>
            {repliesOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 pl-4 border-l-2 border-[--color-border] overflow-hidden"
              >
                {(comment.replies || []).map((reply) => (
                  <ReplyItem key={reply._id} reply={reply} blogId={blogId} commentId={comment._id} user={user} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
