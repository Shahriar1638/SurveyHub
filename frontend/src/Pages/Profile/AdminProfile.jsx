/* eslint-disable no-unused-vars */
import { motion } from "motion/react";
import { Card, CardBody } from "../../Components/UI/Card";
import { StatCard } from "../../Components/UI/StatCard";

// ── Stat icons ────────────────────────────────────────────────────────────────
const ShieldIcon = (p) => (
  <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
    />
  </svg>
);
const ClipIcon = (p) => (
  <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
    />
  </svg>
);
const UserIcon = (p) => (
  <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
    />
  </svg>
);
const ListIcon = (p) => (
  <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
    />
  </svg>
);

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function AdminProfile({ profile, stats, statsLoading, theme }) {
  const modStats = stats?.moderationStats ?? {};

  const reportsResolved = modStats.reportsResolved ?? 0;
  const surveysReviewed = modStats.surveysReviewed ?? 0;
  const usersModerated = modStats.usersModerated ?? 0;
  const totalActions = modStats.totalActions ?? 0;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6"
    >
      {/* ── Moderation Stats ── */}
      <motion.div variants={fadeUp}>
        <h2 className="type-heading-sm text-[--color-text-primary] mb-4">
          Moderation Overview
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="card h-28 animate-pulse bg-[--color-bg-subtle]"
              />
            ))
          ) : (
            <>
              <StatCard
                title="Reports Resolved"
                value={reportsResolved}
                icon={ShieldIcon}
                roleAccent="admin"
              />
              <StatCard
                title="Surveys Reviewed"
                value={surveysReviewed}
                icon={ClipIcon}
                roleAccent="admin"
              />
              <StatCard
                title="Users Moderated"
                value={usersModerated}
                icon={UserIcon}
                roleAccent="admin"
              />
              <StatCard
                title="Total Actions"
                value={totalActions}
                icon={ListIcon}
                roleAccent="admin"
              />
            </>
          )}
        </div>
      </motion.div>

      {/* ── Recent Actions (placeholder until AuditLog model is built) ── */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardBody className="p-5">
            <h3 className="type-heading-sm text-[--color-text-primary] mb-4">
              Recent Actions
            </h3>
            <div className="flex flex-col gap-3">
              {[
                {
                  action: "Resolved a flagged report",
                  time: "2 hours ago",
                  type: "report",
                },
                {
                  action: "Banned a user for violations",
                  time: "5 hours ago",
                  type: "user",
                },
                {
                  action: "Approved a pending survey",
                  time: "Yesterday",
                  type: "survey",
                },
                {
                  action: "Reviewed 3 moderation queue items",
                  time: "2 days ago",
                  type: "report",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2.5 border-b border-[--color-border] last:border-0"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "var(--color-admin-light)" }}
                  >
                    {item.type === "report" && (
                      <ShieldIcon
                        className="w-4 h-4"
                        style={{ color: "var(--color-admin)" }}
                      />
                    )}
                    {item.type === "user" && (
                      <UserIcon
                        className="w-4 h-4"
                        style={{ color: "var(--color-admin)" }}
                      />
                    )}
                    {item.type === "survey" && (
                      <ClipIcon
                        className="w-4 h-4"
                        style={{ color: "var(--color-admin)" }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="type-body-sm font-medium text-[--color-text-primary]">
                      {item.action}
                    </p>
                  </div>
                  <span className="type-meta text-[--color-text-tertiary] shrink-0 font-[--font-mono]">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
            <p className="type-body-sm text-[--color-text-tertiary] mt-4 text-center italic">
              Full audit log coming soon — powered by an AuditLog model.
            </p>
          </CardBody>
        </Card>
      </motion.div>

      {/* ── Broadcast History ── */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardBody className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="type-heading-sm text-[--color-text-primary]">
                Broadcast History
              </h3>
              <button
                className="btn btn-sm text-white"
                style={{ background: "var(--color-admin)" }}
              >
                + New Broadcast
              </button>
            </div>
            <div className="empty-state py-10">
              <div className="empty-state-icon">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46"
                  />
                </svg>
              </div>
              <p className="type-body-sm text-[--color-text-tertiary] max-w-xs mt-2">
                No broadcasts sent yet. Use this to send platform-wide community
                announcements.
              </p>
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </motion.div>
  );
}
