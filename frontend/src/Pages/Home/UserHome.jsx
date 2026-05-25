import { useContext, useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { AuthContext } from "../../Firebase_AuthProvider/AuthProvider";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import { SurveyCard } from "../../Components/UI/SurveyCard";
import { StatCard } from "../../Components/UI/StatCard";
import { PageTransition } from "../../Components/UI/PageTransition";

const listVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function Skeleton() {
  return (
    <PageTransition>
      <div className="animate-pulse">
        <div className="h-28 bg-[--color-bg-subtle]" />
        <div className="container-app mx-auto py-10 space-y-8">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-[--color-bg-inset] rounded-xl" />)}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-40 bg-[--color-bg-inset] rounded-xl" />)}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

export default function UserHome() {
  const { user } = useContext(AuthContext);
  const [upgradeDismissed, setUpgradeDismissed] = useState(false);
  const axiosSecure = useAxiosSecure();

  const { data, isPending, error } = useQuery({
    queryKey: ["home", "user", user?.uid],
    enabled: Boolean(user?.uid),
    queryFn: async () => {
      const uid = user?.uid || "";
      const response = await axiosSecure.get(
        `/api/homepages/user${uid ? `?userId=${uid}` : ""}`,
      );
      return response.data;
    },
  });

  if (isPending) return <Skeleton />;
  if (error) return (
    <PageTransition className="container-app mx-auto py-24 text-center">
      <p className="type-body-base text-[--color-error]">{error.message || "Failed to load"}</p>
    </PageTransition>
  );

  const payload  = data?.data || {};
  const activity = payload.activitySummary || {};
  const surveys  = payload.recommendedSurveys || [];
  const trending = payload.trendingSurveys || [];
  const blogs    = payload.newInsightBlogs || [];
  const name     = user?.displayName || payload.user?.name || "";

  return (
    <PageTransition>

      {/* ══════════════════════════════════════════════════
          SECTION 1 — Greeting Header
      ══════════════════════════════════════════════════ */}
      <section className="border-b border-[--color-border] bg-[--color-bg-surface]">
        <div className="container-app mx-auto py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="type-heading-lg text-[--color-text-primary]">
              {getGreeting()}{name ? `, ${name}` : ""}
              <span className="ml-2 align-middle" aria-hidden="true">👋</span>
            </h1>
            {activity.streakDays > 0 && (
              <p className="type-meta mt-1 text-[--color-user]">
                <span aria-hidden="true">🔥</span> {activity.streakDays}-day participation streak
              </p>
            )}
          </div>
          <p className="type-meta text-[--color-text-tertiary] font-[--font-mono]">
            {activity.surveysParticipated ?? 0} surveys taken this month
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 2 — Activity Stats
      ══════════════════════════════════════════════════ */}
      <section className="bg-[--color-bg-subtle] py-10">
        <div className="container-app mx-auto">
          <p className="type-meta-sm text-[--color-text-tertiary] tracking-widest uppercase mb-4">Your Activity</p>
          <div className="grid gap-5 sm:grid-cols-3">
            <StatCard title="Surveys Participated" value={activity.surveysParticipated ?? 0} roleAccent="user" />
            <StatCard title="Responses This Month"  value={activity.responsesThisMonth ?? 0}  roleAccent="user" />
            <StatCard title="Insights Unlocked"     value={activity.insightsUnlocked ?? 0}    roleAccent="user" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 3 — Recommended Surveys ("For You")
      ══════════════════════════════════════════════════ */}
      <section className="py-14 bg-[--color-bg-surface]">
        <div className="container-app mx-auto">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="type-meta-sm text-[--color-text-tertiary] tracking-widest uppercase mb-1">Personalised</p>
              <h2 className="type-heading-md text-[--color-text-primary]">For You</h2>
            </div>
            <Link to="/surveys" className="btn btn-ghost btn-sm">Browse All →</Link>
          </div>

          {surveys.length > 0 ? (
            <motion.div variants={listVariants} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {surveys.slice(0, 6).map((s) => (
                <motion.div key={s._id} variants={itemVariants}>
                  <SurveyCard
                    title={s.title}
                    category={s.category}
                    participantCount={s.participantCount}
                    status={s.status}
                    actionButton={
                      <Link to={`/surveys/${s._id}`} className="btn btn-primary btn-sm">
                        Take Survey
                      </Link>
                    }
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="empty-state py-16">
              <div className="empty-state-icon">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="type-heading-sm mt-3">No recommendations yet</h3>
              <p className="type-body-sm text-[--color-text-secondary] mt-1 max-w-xs">Update your preferences to see personalised surveys.</p>
              <Link to="/profile" className="btn btn-secondary btn-sm mt-4">Update Preferences</Link>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 4 — Trending This Week
      ══════════════════════════════════════════════════ */}
      {trending.length > 0 && (
        <section className="py-14 bg-[--color-bg-subtle]">
          <div className="container-app mx-auto">
            <div className="mb-6">
              <p className="type-meta-sm text-[--color-text-tertiary] tracking-widest uppercase mb-1">Community</p>
              <h2 className="type-heading-md text-[--color-text-primary]">Trending This Week</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {trending.slice(0, 3).map((s, i) => (
                <motion.div key={s._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1, duration: 0.35 }}>
                  <SurveyCard title={s.title} category={s.category} participantCount={s.participantCount} status={s.status} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════
          SECTION 5 — Latest Insight Blogs
      ══════════════════════════════════════════════════ */}
      {blogs.length > 0 && (
        <section className="py-14 bg-[--color-bg-surface]">
          <div className="container-app mx-auto">
            <div className="mb-6">
              <p className="type-meta-sm text-[--color-text-tertiary] tracking-widest uppercase mb-1">AI-Generated</p>
              <h2 className="type-heading-md text-[--color-text-primary]">Latest Insights</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {blogs.slice(0, 4).map((b) => (
                <Link key={b._id} to={`/insights/${b._id}`} className="card card-hover p-5 flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-lg bg-[--color-surveyor-light] flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-[--color-surveyor-dark]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="type-label-lg text-[--color-text-primary] line-clamp-2">{b.title}</h3>
                    <p className="type-meta text-[--color-text-tertiary] mt-1 font-[--font-mono]">{new Date(b.createdAt).toLocaleDateString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════
          SECTION 6 — Upgrade Banner
      ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {!upgradeDismissed && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0 }}
            className="py-14 bg-[--color-surveyor-light]"
          >
            <div className="container-app mx-auto text-center flex flex-col items-center gap-4">
              <span className="badge badge-surveyor">Become a Surveyor</span>
              <h2 className="type-heading-md text-[--color-text-primary]">Want to create your own surveys?</h2>
              <p className="type-body-base text-[--color-text-secondary] max-w-md">
                Unlock AI analytics, publish insight blogs, and build a following as a Surveyor.
              </p>
              <div className="flex gap-3">
                <Link to="/pricing" className="btn btn-surveyor btn-md">Become a Surveyor →</Link>
                <button onClick={() => setUpgradeDismissed(true)} className="btn btn-ghost btn-md">Dismiss</button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

    </PageTransition>
  );
}
