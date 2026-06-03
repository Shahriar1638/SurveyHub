import { useContext, useRef, useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
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
        <div className="h-72 bg-[--color-bg-subtle]" />
        <div className="container-app mx-auto py-10 space-y-8">
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-[--color-bg-inset] rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 bg-[--color-bg-inset] rounded-xl" />
            ))}
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
  const heroRef = useRef(null);

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

  // GSAP hero entrance
  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (prefersReduced || !heroRef.current) return;
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".uh-eyebrow", { opacity: 0, y: 16, duration: 0.45 })
        .from(".uh-title", { opacity: 0, y: 24, duration: 0.6 }, "-=0.2")
        .from(".uh-subtitle", { opacity: 0, y: 16, duration: 0.45 }, "-=0.35")
        .from(
          ".uh-cta",
          { opacity: 0, y: 12, duration: 0.35, stagger: 0.1 },
          "-=0.25",
        );
    },
    { scope: heroRef, dependencies: [isPending] },
  );

  if (isPending) return <Skeleton />;
  if (error)
    return (
      <PageTransition className="container-app mx-auto py-24 text-center">
        <p className="type-body-base text-[--color-error]">
          {error.message || "Failed to load"}
        </p>
      </PageTransition>
    );

  const payload = data?.data || {};
  const activity = payload.activitySummary || {};
  const surveys = payload.recommendedSurveys || [];
  const trending = payload.trendingSurveys || [];
  const blogs = payload.newInsightBlogs || [];
  const name = user?.displayName || payload.user?.name || "";

  return (
    <PageTransition>

      {/* ══════════════════════════════════════════════════
          SECTION 1 — Hero Banner
      ══════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-[--color-user] min-h-[320px] flex items-center"
        style={{ background: "linear-gradient(135deg, #C45D18 0%, #F67724 50%, #F9A36A 100%)" }}
      >
        {/* Abstract background image */}
        <img
          src="/user-hero.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-20 select-none pointer-events-none"
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(196,93,24,0.85) 0%, rgba(246,119,36,0.6) 60%, transparent 100%)",
          }}
        />

        <div className="relative container-app mx-auto py-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
          {/* Left text */}
          <div className="max-w-xl">
            <span className="uh-eyebrow inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold font-[--font-ui] tracking-widest uppercase bg-white/20 text-white mb-5">
              Member Dashboard
            </span>
            <h1 className="uh-title type-display-lg text-white mb-3">
              {getGreeting()}{name ? `, ${name}` : ""}! 👋
            </h1>
            <p className="uh-subtitle type-body-lg text-white/80 max-w-lg mb-6">
              Discover surveys that match your interests, share your voice, and
              unlock AI-powered insights from the community.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/surveys" className="uh-cta btn btn-lg"
                style={{ background: "white", color: "var(--color-user-dark)" }}>
                Browse Surveys →
              </Link>
              <Link to="/insights" className="uh-cta btn btn-lg"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.3)",
                }}>
                Read AI Insights
              </Link>
            </div>
          </div>

          {/* Right — streak + activity snapshot */}
          <div className="uh-cta shrink-0 flex flex-col gap-3 min-w-[200px]">
            {activity.streakDays > 0 && (
              <div
                className="rounded-xl px-5 py-4 flex items-center gap-3"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.25)",
                }}
              >
                <span className="text-2xl" aria-hidden="true">🔥</span>
                <div>
                  <p className="type-label-sm text-white font-[--font-mono]">
                    {activity.streakDays}-day streak
                  </p>
                  <p className="type-meta text-white/60">Keep it up!</p>
                </div>
              </div>
            )}
            <div
              className="rounded-xl px-5 py-4"
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <p className="type-meta-sm text-white/50 tracking-widest uppercase mb-1">
                This month
              </p>
              <p className="font-[--font-mono] text-2xl font-medium text-white">
                {activity.surveysParticipated ?? 0}
              </p>
              <p className="type-meta text-white/60">surveys taken</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 2 — Activity Stats
      ══════════════════════════════════════════════════ */}
      <section className="bg-[--color-bg-subtle] py-16">
        <div className="container-app mx-auto">
          <div className="mb-8">
            <p className="type-meta-sm text-[--color-text-tertiary] tracking-widest uppercase mb-2">
              Your Impact
            </p>
            <h2 className="type-heading-lg text-[--color-text-primary]">
              Activity Overview
            </h2>
            <p className="type-body-sm text-[--color-text-secondary] mt-1 max-w-md">
              Every response you submit helps researchers understand the world a
              little better. Here&apos;s your contribution so far.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <StatCard
              title="Surveys Participated"
              value={activity.surveysParticipated ?? 0}
              roleAccent="user"
            />
            <StatCard
              title="Responses This Month"
              value={activity.responsesThisMonth ?? 0}
              roleAccent="user"
            />
            <StatCard
              title="Insights Unlocked"
              value={activity.insightsUnlocked ?? 0}
              roleAccent="user"
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 3 — Recommended Surveys ("For You")
      ══════════════════════════════════════════════════ */}
      <section className="py-20 bg-[--color-bg-surface]">
        <div className="container-app mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="type-meta-sm text-[--color-text-tertiary] tracking-widest uppercase mb-2">
                Personalised
              </p>
              <h2 className="type-heading-lg text-[--color-text-primary]">
                For You
              </h2>
              <p className="type-body-sm text-[--color-text-secondary] mt-1 max-w-md">
                Surveys handpicked based on your interests and past
                participation. Dive in and make your voice heard!
              </p>
            </div>
            <Link to="/surveys" className="btn btn-secondary btn-md">
              Browse All →
            </Link>
          </div>

          {surveys.length > 0 ? (
            <motion.div
              variants={listVariants}
              initial="hidden"
              animate="show"
              className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {surveys.slice(0, 6).map((s) => (
                <motion.div key={s._id} variants={itemVariants}>
                  <SurveyCard
                    title={s.title}
                    category={s.category}
                    participantCount={s.participantCount}
                    status={s.status}
                    actionButton={
                      s.status === "expired" ? (
                        <span className="type-body-sm text-[--color-error] font-semibold">Expired</span>
                      ) : (
                        <Link to={`/surveys/${s._id}`} className="btn btn-primary btn-sm">
                          Take Survey
                        </Link>
                      )
                    }
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="empty-state py-20">
              <div className="empty-state-icon">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="type-heading-sm mt-4">No recommendations yet</h3>
              <p className="type-body-sm text-[--color-text-secondary] mt-2 max-w-xs">
                Update your preferences to see surveys tailored just for you.
              </p>
              <Link to="/profile" className="btn btn-secondary btn-md mt-5">
                Update Preferences
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 4 — Trending This Week
      ══════════════════════════════════════════════════ */}
      {trending.length > 0 && (
        <section className="py-20 bg-[--color-bg-subtle]">
          <div className="container-app mx-auto">
            <div className="mb-10">
              <p className="type-meta-sm text-[--color-text-tertiary] tracking-widest uppercase mb-2">
                Hot Right Now
              </p>
              <h2 className="type-heading-lg text-[--color-text-primary]">
                Trending This Week
              </h2>
              <p className="type-body-sm text-[--color-text-secondary] mt-1 max-w-md">
                These surveys are getting a lot of attention from the community.
                Don&apos;t miss out — add your voice!
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {trending.slice(0, 3).map((s, i) => (
                <motion.div
                  key={s._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.35 }}
                >
                  <SurveyCard
                    title={s.title}
                    category={s.category}
                    participantCount={s.participantCount}
                    status={s.status}
                    actionButton={
                      s.status === "expired" ? (
                        <span className="type-body-sm text-[--color-error] font-semibold">Expired</span>
                      ) : (
                        <Link to={`/surveys/${s._id}`} className="btn btn-primary btn-sm">
                          Take Survey
                        </Link>
                      )
                    }
                  />
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
        <section className="py-20 bg-[--color-bg-surface]">
          <div className="container-app mx-auto">
            <div className="mb-10">
              <p className="type-meta-sm text-[--color-text-tertiary] tracking-widest uppercase mb-2">
                AI-Generated
              </p>
              <h2 className="type-heading-lg text-[--color-text-primary]">
                Latest Insights
              </h2>
              <p className="type-body-sm text-[--color-text-secondary] mt-1 max-w-md">
                Surveyors have been busy — here are the freshest AI-powered
                insight posts from the community.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {blogs.slice(0, 4).map((b) => (
                <Link
                  key={b._id}
                  to={`/insights/${b._id}`}
                  className="card card-hover p-6 flex gap-5 items-start group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[--color-surveyor-light] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
                    <svg
                      className="w-6 h-6 text-[--color-surveyor-dark]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <h3 className="type-label-lg text-[--color-text-primary] line-clamp-2 mb-1">
                      {b.title}
                    </h3>
                    <p className="type-meta text-[--color-text-tertiary] font-[--font-mono]">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </p>
                    <p className="type-meta-sm text-[--color-surveyor-dark] tracking-widest uppercase mt-2">
                      Read insight →
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════
          SECTION 6 — "Become a Surveyor" Upgrade Banner
      ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {!upgradeDismissed && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, height: 0, overflow: "hidden" }}
            className="relative overflow-hidden py-20"
            style={{
              background:
                "linear-gradient(135deg, var(--color-navy) 0%, #2A3F66 100%)",
            }}
          >
            {/* Decorative abstract image */}
            <img
              src="/user-hero.png"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover opacity-10 select-none pointer-events-none"
            />
            <div className="relative container-app mx-auto text-center flex flex-col items-center gap-5">
              <span className="badge badge-surveyor">Become a Surveyor</span>
              <h2 className="type-display-lg text-white max-w-lg">
                Want to Create Your Own Surveys?
              </h2>
              <p className="type-body-lg text-white/70 max-w-md">
                Unlock AI analytics, publish insight blogs, and build a real
                following as a Surveyor. Your data, your story.
              </p>
              <div className="flex flex-wrap gap-4 justify-center mt-2">
                <Link to="/pricing" className="btn btn-surveyor btn-lg">
                  Become a Surveyor →
                </Link>
                <button
                  onClick={() => setUpgradeDismissed(true)}
                  className="btn btn-lg"
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    color: "rgba(255,255,255,0.6)",
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  Maybe later
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

    </PageTransition>
  );
}
