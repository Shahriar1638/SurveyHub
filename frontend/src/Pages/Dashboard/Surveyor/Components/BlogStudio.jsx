import { motion } from "motion/react";
import {
  PlusIcon,
  PencilSquareIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";

// ── Motion variants ──────────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

export default function BlogStudio({ data }) {
  const blogs = data?.recentBlogActivity || [];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <h2 className="type-heading-lg text-[--color-text-primary]">Blog Studio</h2>
        <button className="btn btn-surveyor btn-sm flex items-center gap-2">
          <PlusIcon className="w-4 h-4" />
          New Blog Post
        </button>
      </motion.div>

      {blogs.length === 0 ? (
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
