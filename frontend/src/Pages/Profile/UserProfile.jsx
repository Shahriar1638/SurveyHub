import { Link } from "react-router";
import { motion } from "motion/react";
import { Card, CardBody } from "../../Components/UI/Card";
import { StatCard } from "../../Components/UI/StatCard";

// ── Stat icons ────────────────────────────────────────────────────────────────
const CheckIcon   = (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ChatIcon    = (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>;
const SparkleIcon = (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>;

const stagger = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
};

export default function UserProfile({ profile, stats, statsLoading, theme }) {
  const surveysCompleted   = stats?.surveysCompleted   ?? "—";
  const questionsAnswered  = stats?.questionsAnswered  ?? "—";
  const insightsInfluenced = stats?.insightsInfluenced ?? "—";
  const recentSurveys      = stats?.recentSurveys      ?? [];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-6">

      {/* ── Impact Dashboard ── */}
      <motion.div variants={fadeUp}>
        <h2 className="type-heading-sm text-[--color-text-primary] mb-4">Your Impact</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {statsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card h-28 animate-pulse bg-[--color-bg-subtle]" />
            ))
          ) : (
            <>
              <StatCard title="Surveys Completed"   value={surveysCompleted}   icon={CheckIcon}   roleAccent="user" />
              <StatCard title="Questions Answered"  value={questionsAnswered}  icon={ChatIcon}    roleAccent="user" />
              <StatCard title="Insights Influenced" value={insightsInfluenced} icon={SparkleIcon} roleAccent="user" />
            </>
          )}
        </div>
      </motion.div>

      {/* ── Topic Cloud ── */}
      {profile?.preferences?.length > 0 && (
        <motion.div variants={fadeUp}>
          <Card>
            <CardBody className="p-5">
              <h3 className="type-heading-sm text-[--color-text-primary] mb-3">Your Topics</h3>
              <div className="flex flex-wrap gap-2">
                {profile.preferences.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full type-body-sm font-medium"
                    style={{ background: theme.light, color: theme.dark }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}

      {/* ── Recent Participation ── */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardBody className="p-5">
            <h3 className="type-heading-sm text-[--color-text-primary] mb-4">Recent Participation</h3>
            {statsLoading ? (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 animate-pulse bg-[--color-bg-subtle] rounded-lg" />
                ))}
              </div>
            ) : recentSurveys.length === 0 ? (
              <div className="text-center py-8">
                <p className="type-body-sm text-[--color-text-tertiary]">You haven't participated in any surveys yet.</p>
                <Link to="/surveys" className="btn btn-sm btn-primary text-white mt-4 inline-block" style={{ background: "var(--color-user)" }}>
                  Explore Surveys
                </Link>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-[--color-border]">
                {recentSurveys.map((survey) => (
                  <div key={survey._id} className="flex items-center justify-between py-3">
                    <div className="min-w-0">
                      <p className="type-body-sm font-medium text-[--color-text-primary] truncate">{survey.title}</p>
                      <p className="type-meta text-[--color-text-tertiary]">{survey.category}</p>
                    </div>
                    {survey.status === "expired" ? (
                      <Link
                        to={`/surveys/${survey._id}`}
                        className="btn btn-sm btn-secondary text-xs shrink-0 ml-3"
                      >
                        View Results
                      </Link>
                    ) : (
                      <span
                        className="px-2 py-0.5 rounded-full type-meta font-semibold shrink-0 ml-3"
                        style={{ background: "var(--color-success-light)", color: "var(--color-success)" }}
                      >
                        Active
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>

      {/* ── Reward Progress (Teaser) ── */}
      <motion.div variants={fadeUp}>
        <div
          className="card p-6 text-center flex flex-col items-center gap-3"
          style={{ background: `linear-gradient(135deg, ${theme.light} 0%, white 100%)` }}
        >
          <div className="text-3xl">🚀</div>
          <h3 className="type-heading-sm text-[--color-text-primary]">Your influence is growing!</h3>
          <p className="type-body-sm text-[--color-text-secondary] max-w-md">
            We're forging exclusive badges and appreciation rewards for our most dedicated contributors.
            Stay active — your participation history is being tracked and will unlock premium perks soon!
          </p>
          <span
            className="px-3 py-1 rounded-full type-meta font-semibold"
            style={{ background: theme.light, color: theme.dark }}
          >
            ✨ Coming Soon
          </span>
        </div>
      </motion.div>

    </motion.div>
  );
}
