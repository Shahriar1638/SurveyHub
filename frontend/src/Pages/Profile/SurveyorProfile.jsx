import { Link } from "react-router";
import { motion } from "motion/react";
import { Card, CardBody } from "../../Components/UI/Card";
import { StatCard } from "../../Components/UI/StatCard";

// ── Stat icons ────────────────────────────────────────────────────────────────
const ChartIcon  = (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>;
const BlogIcon   = (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" /></svg>;
const UsersIcon  = (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>;

const stagger = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
};

export default function SurveyorProfile({ profile, stats, statsLoading, theme }) {
  const totalResponses  = stats?.totalResponses  ?? "—";
  const blogsPublished  = stats?.blogsPublished  ?? "—";
  const activeSurveys   = stats?.activeSurveys   ?? [];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-6">

      {/* ── Professional KPI Row ── */}
      <motion.div variants={fadeUp}>
        <h2 className="type-heading-sm text-[--color-text-primary] mb-4">Your Dashboard</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card h-28 animate-pulse bg-[--color-bg-subtle]" />
            ))
          ) : (
            <>
              <StatCard title="Total Responses"  value={totalResponses}  icon={ChartIcon}  roleAccent="surveyor" />
              <StatCard title="Blogs Published"  value={blogsPublished}  icon={BlogIcon}   roleAccent="surveyor" />
              <StatCard title="Active Surveys"   value={activeSurveys.length} icon={UsersIcon} roleAccent="surveyor" />
            </>
          )}
        </div>
      </motion.div>

      {/* ── Public Gallery of Surveys ── */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardBody className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="type-heading-sm text-[--color-text-primary]">Published Surveys</h3>
              <Link to="/drafts" className="type-body-sm font-medium hover:underline" style={{ color: theme.dark }}>
                View all →
              </Link>
            </div>

            {statsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-32 animate-pulse bg-[--color-bg-subtle] rounded-xl" />
                ))}
              </div>
            ) : activeSurveys.length === 0 ? (
              <div className="text-center py-10">
                <p className="type-body-sm text-[--color-text-tertiary] mb-3">No published surveys yet.</p>
                <Link to="/drafts" className="btn btn-sm text-white" style={{ background: theme.accent }}>
                  Create a Survey
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeSurveys.map((survey) => (
                  <Link
                    key={survey._id}
                    to={`/surveys/${survey._id}`}
                    className="card card-hover p-4 flex flex-col gap-2 group"
                  >
                    {survey.image && (
                      <img src={survey.image} alt={survey.title} className="w-full h-28 object-cover rounded-lg" />
                    )}
                    <div
                      className="self-start px-2 py-0.5 rounded-full type-meta font-semibold"
                      style={{ background: theme.light, color: theme.dark }}
                    >
                      {survey.category || "General"}
                    </div>
                    <h4 className="type-body-sm font-semibold text-[--color-text-primary] line-clamp-2 group-hover:text-[--color-surveyor-dark] transition-colors">
                      {survey.title}
                    </h4>
                    <p className="type-meta text-[--color-text-tertiary]">
                      {survey.participantCount ?? 0} responses
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>

      {/* ── AI Insight Toggle ── */}
      <motion.div variants={fadeUp}>
        <Card>
          <CardBody className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="type-heading-sm text-[--color-text-primary]">Auto AI Insights</h3>
                <p className="type-body-sm text-[--color-text-secondary] mt-1 max-w-sm">
                  Automatically generate AI-powered insight reports when your survey deadline passes and enough responses are collected.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 mt-1">
                <span className="type-body-sm text-[--color-text-secondary]">
                  {profile?.autoAIInsight ? "Enabled" : "Disabled"}
                </span>
                <div
                  className="relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer"
                  style={{ background: profile?.autoAIInsight ? theme.accent : "var(--color-bg-inset)" }}
                >
                  <div
                    className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200"
                    style={{ transform: profile?.autoAIInsight ? "translateX(22px)" : "translateX(2px)" }}
                  />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

    </motion.div>
  );
}
