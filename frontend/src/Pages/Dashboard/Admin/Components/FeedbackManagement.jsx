/* eslint-disable no-unused-vars */
import { useState } from "react";
import { motion } from "motion/react";
import { ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/outline";
import { useAdminFeedback } from "../../../../Hooks/useDashboardAdmin";

// ── Motion variants ──────────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

export default function FeedbackManagement() {
  const [statusFilter, setStatusFilter] = useState("");
  const { data: feedbackData, isLoading } = useAdminFeedback({ status: statusFilter || undefined });
  const items = feedbackData?.data || [];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h2 className="type-heading-lg text-[--color-text-primary]">Feedback Management</h2>
        <p className="type-body-sm text-[--color-text-secondary] mt-1">
          Support tickets and feedback submitted by users.
        </p>
      </motion.div>

      {/* Filter */}
      <motion.div variants={item} className="flex gap-2 flex-wrap">
        {["", "open", "reviewing", "resolved", "dismissed"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`btn btn-sm capitalize ${statusFilter === s ? "btn-primary" : "btn-secondary"}`}
          >
            {s || "All"}
          </button>
        ))}
      </motion.div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-[--color-bg-inset] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <motion.div variants={item} className="empty-state">
          <div className="empty-state-icon">
            <ChatBubbleLeftEllipsisIcon className="w-7 h-7" />
          </div>
          <p className="type-heading-sm text-[--color-text-primary] mt-2">No feedback tickets</p>
          <p className="type-body-sm text-[--color-text-secondary] mt-1">
            All caught up!
          </p>
        </motion.div>
      ) : (
        <motion.div variants={item} className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Comment</th>
                <th>User</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {items.map((fb) => (
                <tr key={fb._id}>
                  <td>
                    <span className="badge badge-draft text-[10px] capitalize">
                      {fb.feedbackType?.replace("_", " ") || "general"}
                    </span>
                  </td>
                  <td>
                    <span className="type-body-sm text-[--color-text-primary] line-clamp-2 max-w-[300px]">
                      {fb.comment}
                    </span>
                  </td>
                  <td>
                    <span className="type-meta text-[--color-text-secondary] truncate block max-w-[160px]">
                      {fb.userEmail || "Anonymous"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`badge text-[10px] ${
                        fb.status === "open"
                          ? "badge-pending"
                          : fb.status === "resolved"
                            ? "badge-published"
                            : "badge-draft"
                      }`}
                    >
                      {fb.status}
                    </span>
                  </td>
                  <td>
                    <span className="type-meta text-[--color-text-tertiary] whitespace-nowrap">
                      {new Date(fb.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </motion.div>
  );
}
