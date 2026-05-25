import { motion } from "motion/react";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { useUserParticipation } from "../../../../Hooks/useDashboardUser";

// ── Motion variants ──────────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

export default function ParticipationLedger() {
  const { data: ledger, isLoading } = useUserParticipation();
  const list = ledger || [];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h2 className="type-heading-lg text-[--color-text-primary]">Participation Ledger</h2>
        <p className="type-body-sm text-[--color-text-secondary] mt-1">
          Detailed audit history of all surveys you've completed and rewards earned.
        </p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-[--color-bg-inset] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <motion.div variants={item} className="empty-state">
          <div className="empty-state-icon">
            <ClipboardDocumentListIcon className="w-7 h-7" />
          </div>
          <p className="type-heading-sm text-[--color-text-primary] mt-2">No surveys completed yet</p>
          <p className="type-body-sm text-[--color-text-secondary] mt-1">
            Browse published surveys to get started and earn rewards!
          </p>
        </motion.div>
      ) : (
        <motion.div variants={item} className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Survey Title</th>
                <th>Category</th>
                <th>Date Taken</th>
                <th>Length</th>
                <th className="text-right">Rewards</th>
              </tr>
            </thead>
            <tbody>
              {list.map((row) => (
                <tr key={row.responseId}>
                  <td>
                    <span className="type-label-sm text-[--color-text-primary] line-clamp-1">
                      {row.surveyTitle}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-draft text-[10px] capitalize">
                      {row.surveyCategory}
                    </span>
                  </td>
                  <td>
                    <span className="type-meta text-[--color-text-secondary]">
                      {new Date(row.submittedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </td>
                  <td>
                    <span className="type-meta text-[--color-text-secondary]">
                      {row.questionsCount} Questions
                    </span>
                  </td>
                  <td className="text-right">
                    <span className="type-label-sm text-[--color-user-dark] font-[--font-mono] font-bold">
                      +{row.rewardPoints} pts
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
