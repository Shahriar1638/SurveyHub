import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  PlusIcon,
  PencilSquareIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import useDashboardSurveyor from "../../../../Hooks/useDashboardSurveyor";
import { LoadingSpinner } from "../../../../Components/UI/LoadingSpinner";
import { useAppealBlog } from "../../../../Hooks/useBlogsMutation";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

function BlogModerationBanner({ rejectedBlogs }) {
  const [appealId, setAppealId] = useState(null);
  const [appealMsg, setAppealMsg] = useState("");
  const appealMutation = useAppealBlog();

  if (!rejectedBlogs || rejectedBlogs.length === 0) return null;

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
      {rejectedBlogs.map((b) => (
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
  const { data, isLoading, isError } = useDashboardSurveyor();
  const blogs = data?.recentBlogActivity || [];
  const rejectedBlogs = data?.rejectedBlogs || [];

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <div className="text-center py-12"><p className="type-body-sm text-[--color-error]">Failed to load blog data.</p></div>;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <h2 className="type-heading-lg text-[--color-text-primary]">Blog Studio</h2>
        <button onClick={() => navigate("/dashboard/create-blog")} className="btn btn-surveyor btn-sm flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          New Blog Post
        </button>
      </motion.div>

      <BlogModerationBanner rejectedBlogs={rejectedBlogs} />

      {blogs.length === 0 && rejectedBlogs.length === 0 ? (
        <motion.div variants={item} className="empty-state">
          <div className="empty-state-icon">
            <PencilSquareIcon className="w-7 h-7" />
          </div>
          <p className="type-heading-sm text-[--color-text-primary] mt-2">No blog posts yet</p>
          <p className="type-body-sm text-[--color-text-secondary] mt-1">
            Convert your survey insights into engaging blog posts.
          </p>
        </motion.div>
      ) : (
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {blogs.map((blog) => {
            const totalComments = blog.comments?.length || 0;
            const totalReactions = Object.values(blog.reactions || {}).reduce(
              (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
              0
            );
            return (
              <div
                key={blog._id}
                className="card card-hover p-5 flex flex-col gap-3"
              >
                <h4 className="type-label-sm text-[--color-text-primary] line-clamp-2">
                  {blog.title}
                </h4>
                <div className="flex items-center gap-4 mt-auto">
                  <span className="type-meta text-[--color-text-tertiary] flex items-center gap-1">
                    <ChatBubbleLeftIcon className="w-3.5 h-3.5" />
                    {totalComments}
                  </span>
                  <span className="type-meta text-[--color-text-tertiary] flex items-center gap-1">
                    <HeartIcon className="w-3.5 h-3.5" />
                    {totalReactions}
                  </span>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
