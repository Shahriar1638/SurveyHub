/* eslint-disable no-unused-vars */
import { useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { AuthContext } from "../../Firebase_AuthProvider/AuthProvider";
import useAxiosPublic from "../../Hooks/useAxiosPublic";
import useProfile from "../../Hooks/useProfile";
import {
  useBlogDetail,
  useBlogReact,
  useBlogComment,
} from "../../Hooks/useBlogs";
import { RoleBadge, Avatar, ReactionBar } from "../../Components/UI/BlogCard";
import { PageTransition } from "../../Components/UI/PageTransition";

// ── Reply item ───────────────────────────────────────────────────────────────
function ReplyItem({ reply }) {
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
      </div>
    </motion.div>
  );
}

// ── Comment item with folded replies ─────────────────────────────────────────
function CommentItem({ comment, blogId, user, userRole, onReplyAdded }) {
  const [repliesOpen, setRepliesOpen] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const axiosPublic = useAxiosPublic();

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      const res = await axiosPublic.post(
        `/api/blogs/${blogId}/comments/${comment._id}/replies`,
        { userEmail: user.email, text: replyText.trim() },
      );
      onReplyAdded(comment._id, res.data.data);
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
            {replyCount > 0 && (
              <button
                onClick={() => setRepliesOpen((v) => !v)}
                className="type-meta flex items-center gap-1 transition-colors"
                style={{
                  color: repliesOpen
                    ? "var(--color-surveyor-dark)"
                    : "var(--color-text-tertiary)",
                }}
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
                    className="btn btn-sm px-3 py-1.5 text-xs font-semibold text-white rounded-lg disabled:opacity-50"
                    style={{ backgroundColor: "var(--color-surveyor-dark)" }}
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
                {comment.replies.map((reply) => (
                  <ReplyItem key={reply._id} reply={reply} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ── BlogDetailPage ────────────────────────────────────────────────────────────
export default function BlogDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();

  const [commentText, setCommentText] = useState("");
  const [localComments, setLocalComments] = useState(null);
  const [userReaction, setUserReaction] = useState(null);
  const [localCounts, setLocalCounts] = useState(null);

  // ── Fetch blog detail via custom hook ──────────────────────────────────────
  const { data: blog, isLoading, isError, error } = useBlogDetail(id);

  // Sync server data to local interactive states
  if (blog && !localComments) {
    setLocalComments(blog.comments);
    setLocalCounts(blog.reactionCounts);
    if (user?.email) {
      const type = [
        "like",
        "insightful",
        "interesting",
        "funny",
        "disagree",
      ].find((t) => blog.reactions?.[t]?.includes(user.email));
      setUserReaction(type || null);
    }
  }

  // ── React mutation via custom hook ─────────────────────────────────────────
  const reactMutation = useBlogReact(id);

  // ── Post comment via custom hook ───────────────────────────────────────────
  const commentMutation = useBlogComment(id);

  const handlePostComment = async () => {
    if (!commentText.trim() || commentMutation.isPending) return;
    try {
      const newComment = await commentMutation.mutateAsync({
        userEmail: user.email,
        text: commentText.trim(),
      });
      setLocalComments((prev) => [...(prev || []), newComment]);
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["blog", id] });
    } catch (e) {
      console.error("Comment failed", e);
    }
  };

  const handleReplyAdded = (commentId, newReply) => {
    setLocalComments((prev) =>
      (prev || []).map((c) =>
        c._id === commentId
          ? { ...c, replies: [...(c.replies || []), newReply] }
          : c,
      ),
    );
  };

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <PageTransition>
        <div className="container-app mx-auto px-4 py-10 max-w-3xl animate-pulse">
          <div className="h-4 w-20 bg-[--color-bg-inset] rounded mb-8" />
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[--color-bg-inset]" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-28 bg-[--color-bg-inset] rounded" />
              <div className="h-3 w-20 bg-[--color-bg-inset] rounded" />
            </div>
          </div>
          <div className="h-8 w-3/4 bg-[--color-bg-inset] rounded mb-4" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-4 bg-[--color-bg-inset] rounded"
                style={{ width: `${90 - i * 5}%` }}
              />
            ))}
          </div>
        </div>
      </PageTransition>
    );
  }

  if (isError || !blog) {
    return (
      <PageTransition>
        <div className="container-app mx-auto px-4 py-24 max-w-3xl text-center">
          <p className="type-body-base text-[--color-error]">
            {error?.message || "Failed to load blog."}
          </p>
          <button
            onClick={() => navigate("/blogs")}
            className="btn btn-secondary btn-sm mt-4"
          >
            ← Back to Blogs
          </button>
        </div>
      </PageTransition>
    );
  }

  const counts = localCounts || blog.reactionCounts;
  const comments = localComments || blog.comments || [];
  const readTime = Math.max(1, Math.ceil((blog.content || "").length / 1200));
  const canInteract = !!user;

  return (
    <PageTransition>
      <div className="container-app mx-auto px-4 py-10 max-w-3xl">
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
          dangerouslySetInnerHTML={{ __html: blog.content }}
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
              onReact={async (type) => {
                const res = await reactMutation.mutateAsync({
                  userEmail: user.email,
                  reactionType: type,
                });
                setLocalCounts(res);
                setUserReaction(res.userReaction);
              }}
              disabled={reactMutation.isPending}
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

        {/* Comments section */}
        <section>
          <h2 className="type-heading-sm text-[--color-text-primary] mb-6">
            {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
          </h2>

          {/* Comment input */}
          {canInteract ? (
            <div className="flex gap-3 mb-8">
              <Avatar
                author={{
                  name: profile?.name || user.displayName,
                  email: user.email,
                  avatar: profile?.avatar || user.photoURL,
                  role: profile?.role,
                }}
                size="9"
              />
              <div className="flex-1">
                <textarea
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts on this insight…"
                  className="form-input resize-none w-full text-sm"
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handlePostComment}
                    disabled={commentMutation.isPending || !commentText.trim()}
                    className="btn btn-sm font-semibold text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2"
                    style={{ backgroundColor: "var(--color-surveyor-dark)" }}
                  >
                    {commentMutation.isPending ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 0.7,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full block"
                        />
                        Posting…
                      </>
                    ) : (
                      <>
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
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                        Post Comment
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-4 mb-6 flex items-center justify-between gap-3">
              <p className="type-body-sm text-[--color-text-secondary]">
                Sign in to join the conversation.
              </p>
              <Link
                to="/login"
                className="btn btn-primary btn-sm flex-shrink-0"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Comments list */}
          {comments.length === 0 ? (
            <div className="empty-state py-12">
              <div className="empty-state-icon">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <p className="type-body-sm text-[--color-text-secondary] mt-2">
                No comments yet.{" "}
                {canInteract ? "Be the first!" : "Sign in to comment."}
              </p>
            </div>
          ) : (
            <div className="card divide-y divide-[--color-border] overflow-hidden">
              {comments.map((comment) => (
                <div key={comment._id} className="px-5">
                  <CommentItem
                    comment={comment}
                    blogId={id}
                    user={user}
                    userRole={profile?.role}
                    onReplyAdded={handleReplyAdded}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageTransition>
  );
}
