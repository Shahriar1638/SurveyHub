/* eslint-disable no-unused-vars */
import { useState, useContext, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { AuthContext } from "../../Firebase_AuthProvider/AuthProvider";
import useAxiosPublic from "../../Hooks/useAxiosPublic";
import useProfile from "../../Hooks/useProfile";
import { useBlogDetail, useBlogReact, useBlogComment } from "../../Hooks/useBlogs";
import { Avatar } from "../../Components/UI/BlogCard";
import { PageTransition } from "../../Components/UI/PageTransition";
import ReportModal from "../../Components/UI/ReportModal";
import { CommentItem } from "./BlogCommentReply";
import BlogCards from "./BlogCards";

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
  useEffect(() => {
    if (!blog) return;
    setLocalComments(blog.comments || []);
    setLocalCounts(blog.reactionCounts || {});
    if (user?.email) {
      const type = ["like", "insightful", "interesting", "funny", "disagree"].find(
        (t) => blog.reactions?.[t]?.includes(user.email),
      );
      setUserReaction(type || null);
    }
  }, [blog, user?.email]);

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
        <BlogCards
          blog={blog}
          readTime={readTime}
          counts={counts}
          userReaction={userReaction}
          canInteract={canInteract}
          reactMutationPending={reactMutation.isPending}
          onReact={async (type) => {
            const res = await reactMutation.mutateAsync({
              userEmail: user.email,
              reactionType: type,
            });
            setLocalCounts(res);
            setUserReaction(res.userReaction);
          }}
        />

        {/* Report blog */}
        {canInteract && user.email !== blog.surveyorEmail && (
          <div className="mb-8">
            <ReportModal url={`/api/blogs/${id}/report`} title="Report Blog">
              <button className="btn btn-secondary btn-sm text-[--color-error] hover:bg-[--color-error-light] border-[--color-error]/20">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
                Report Blog
              </button>
            </ReportModal>
          </div>
        )}

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
                    style={{ backgroundColor: "var(--color-visitor)" }}
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
                className="btn btn-primary btn-sm shrink-0"
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
