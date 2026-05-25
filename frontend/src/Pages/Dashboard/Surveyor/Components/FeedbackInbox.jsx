import { motion } from "motion/react";
import { InboxIcon } from "@heroicons/react/24/outline";

// ── Motion variants ──────────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

export default function FeedbackInbox() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h2 className="type-heading-lg text-[--color-text-primary]">Feedback Inbox</h2>
        <p className="type-body-sm text-[--color-text-secondary] mt-1">
          Messages from Admins regarding your survey approvals and general inquiries.
        </p>
      </motion.div>
      <motion.div variants={item} className="empty-state">
        <div className="empty-state-icon">
          <InboxIcon className="w-7 h-7" />
        </div>
        <p className="type-heading-sm text-[--color-text-primary] mt-2">No messages</p>
        <p className="type-body-sm text-[--color-text-secondary] mt-1">
          You'll see feedback from admins here when it arrives.
        </p>
      </motion.div>
    </motion.div>
  );
}
