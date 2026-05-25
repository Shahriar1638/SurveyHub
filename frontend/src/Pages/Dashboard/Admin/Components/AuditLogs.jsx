/* eslint-disable no-unused-vars */
import { motion } from "motion/react";
import { DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useAuditLogs } from "../../../../Hooks/useDashboardAdmin";

// ── Motion variants ──────────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

export default function AuditLogs() {
  const { data: logData, isLoading } = useAuditLogs({ limit: 30 });
  const logs = logData?.data || [];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h2 className="type-heading-lg text-[--color-text-primary]">Audit Logs</h2>
        <p className="type-body-sm text-[--color-text-secondary] mt-1">
          Immutable log of all administrative actions.
        </p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-[--color-bg-inset] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <motion.div variants={item} className="empty-state">
          <div className="empty-state-icon">
            <DocumentMagnifyingGlassIcon className="w-7 h-7" />
          </div>
          <p className="type-heading-sm text-[--color-text-primary] mt-2">No audit logs</p>
          <p className="type-body-sm text-[--color-text-secondary] mt-1">
            Actions will be logged here as they occur.
          </p>
        </motion.div>
      ) : (
        <motion.div variants={item} className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={log._id || i}>
                  <td>
                    <span className="type-meta text-[--color-text-tertiary] whitespace-nowrap">
                      {new Date(log.timestamp || log.createdAt).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </td>
                  <td>
                    <span className="type-body-sm text-[--color-text-primary] truncate block max-w-[180px]">
                      {log.actor?.email || "System"}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-draft text-[10px]">{log.action}</span>
                  </td>
                  <td>
                    <span className="type-body-sm text-[--color-text-secondary]">
                      {log.resource || "—"}
                    </span>
                  </td>
                  <td>
                    <span className="type-meta text-[--color-text-tertiary] truncate block max-w-[200px]">
                      {log.detail ? JSON.stringify(log.detail) : "—"}
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
