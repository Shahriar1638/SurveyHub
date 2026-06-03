import { useContext, useRef } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
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
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
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
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-[--color-bg-inset] rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-[--color-bg-inset] rounded-xl" />
            ))}
          </div>
          <div className="h-48 bg-[--color-bg-inset] rounded-xl" />
        </div>
      </div>
    </PageTransition>
  );
}

export default function SurveyorHome() {
  const { user } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure();
  const heroRef = useRef(null);

  const { data, isPending, error } = useQuery({
    queryKey: ["home", "surveyor", user?.uid],
    enabled: Boolean(user?.uid),
    queryFn: async () => {
      const uid = user?.uid || "";
      const response = await axiosSecure.get(
        `/api/homepages/surveyor${uid ? `?surveyorId=${uid}` : ""}`,
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
      tl.from(".sh-eyebrow", { opacity: 0, y: 16, duration: 0.45 })
        .from(".sh-title", { opacity: 0, y: 24, duration: 0.6 }, "-=0.2")
        .from(".sh-subtitle", { opacity: 0, y: 16, duration: 0.45 }, "-=0.35")
        .from(
          ".sh-cta",
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
  const kpis = payload.kpis || {};
  const activeSurveys = payload.activeSurveys || [];
  const aiReady = payload.aiReadyToAnalyze || [];
  const drafts = payload.drafts || [];
  const blogActivity = payload.recentBlogActivity || [];
  const subscription = payload.subscription || null;
  const name = user?.displayName || payload.surveyor?.name || "";

  return (
    <PageTransition>

      {/* ══════════════════════════════════════════════════
          SECTION 1 — Hero Banner
      ══════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-[--color-navy] min-h-[320px] flex items-center"
      >
        {/* Abstract background image */}
        <img
          src="/surveyor-hero.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-20 select-none pointer-events-none"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[--color-navy] via-[--color-navy]/80 to-transparent" />

        <div className="relative container-app mx-auto py-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
          {/* Left text */}
          <div className="max-w-xl">
            <span className="sh-eyebrow inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold font-[--font-ui] tracking-widest uppercase bg-[--color-surveyor-light] text-[--color-surveyor-dark] mb-5">
              Surveyor Workspace
            </span>
            <h1 className="sh-title type-display-lg text-white mb-3">
              {getGreeting()}{name ? `, ${name}` : ""}! 🔵
            </h1>
            <p className="sh-subtitle type-body-lg text-white/70 max-w-lg mb-6">
              Your surveys are live, your data is growing — let's turn those
              responses into stories that matter.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/create-survey"
                className="sh-cta btn btn-surveyor btn-lg"
              >
                + Create New Survey
              </Link>
              <Link
                to="/analytics"
                className="sh-cta btn btn-lg"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.25)",
                }}
              >
                AI Analytics Lab →
              </Link>
            </div>
          </div>

          {/* Right — subscription status card */}
          <div className="sh-cta shrink-0">
            <div
              className="rounded-xl p-5 min-w-[220px]"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <p className="type-meta-sm text-white/50 tracking-widest uppercase mb-2">
                Subscription
              </p>
              {subscription ? (
                <>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-[--color-surveyor]" />
                    <span className="type-label-sm text-[--color-surveyor]">
                      Active
                    </span>
                  </div>
                  <p className="type-meta text-white/60">
                    Renews{" "}
                    {new Date(subscription.renewalDate).toLocaleDateString()}
                  </p>
                </>
              ) : (
                <>
                  <p className="type-label-sm text-white/50 mb-3">
                    No active plan
                  </p>
                  <Link
                    to="/pricing"
                    className="btn btn-surveyor btn-sm w-full justify-center"
                  >
                    Upgrade Plan
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 2 — KPI Row
      ══════════════════════════════════════════════════ */}
      <section className="py-16 bg-[--color-bg-subtle]">
        <div className="container-app mx-auto">
          <div className="mb-8">
            <p className="type-meta-sm text-[--color-text-tertiary] tracking-widest uppercase mb-2">
              Your Performance
            </p>
            <h2 className="type-heading-lg text-[--color-text-primary]">
              At a Glance
            </h2>
            <p className="type-body-sm text-[--color-text-secondary] mt-1 max-w-md">
              Everything you need to track how your surveys are doing, in one
              clear view.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Responses"
              value={kpis.totalResponses ?? 0}
              roleAccent="surveyor"
            />
            <StatCard
              title="Active Surveys"
              value={kpis.activeSurveys ?? 0}
              roleAccent="surveyor"
            />
            <StatCard
              title="Avg Completion"
              value={`${kpis.avgCompletionRate ?? 0}%`}
              roleAccent="surveyor"
            />
            <StatCard
              title="New (7 days)"
              value={kpis.newResponsesLast7Days ?? 0}
              roleAccent="surveyor"
              delta="+12%"
              deltaType="positive"
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 3 — Quick Actions
      ══════════════════════════════════════════════════ */}
      <section className="py-20 bg-[--color-bg-surface]">
        <div className="container-app mx-auto">
          <div className="mb-10">
            <p className="type-meta-sm text-[--color-text-tertiary] tracking-widest uppercase mb-2">
              Jump Right In
            </p>
            <h2 className="type-heading-lg text-[--color-text-primary]">
              Quick Actions
            </h2>
            <p className="type-body-sm text-[--color-text-secondary] mt-1 max-w-md">
              Your most-used tools, one click away. No digging through menus.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: "M12 4v16m8-8H4",
                label: "Create New Survey",
                desc: "Build a dynamic survey with MCQ, scale, and paragraph questions. Launch in minutes.",
                to: "/create-survey",
                accent: "--color-surveyor",
                accentLight: "--color-surveyor-light",
                accentDark: "--color-surveyor-dark",
              },
              {
                icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
                label: "AI Analytics Lab",
                desc: "Let Gemini analyse your response data and surface the themes that matter most.",
                to: "/analytics",
                accent: "--color-visitor",
                accentLight: "--color-visitor-light",
                accentDark: "--color-visitor-dark",
              },
              {
                icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
                label: "Write Insight Blog",
                desc: "Turn your survey findings into a compelling AI-generated insight post for your audience.",
                to: "/blog-management",
                accent: "--color-user",
                accentLight: "--color-user-light",
                accentDark: "--color-user-dark",
              },
            ].map((action, i) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.35 }}
              >
                <Link
                  to={action.to}
                  className="card card-hover p-6 flex flex-col gap-4 h-full group"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                    style={{
                      backgroundColor: `var(${action.accentLight})`,
                    }}
                  >
                    <svg
                      className="w-6 h-6"
                      style={{ color: `var(${action.accentDark})` }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={action.icon}
                      />
                    </svg>
                  </div>
                  <div>
                    <p
                      className="type-label-lg mb-1"
                      style={{ color: `var(${action.accentDark})` }}
                    >
                      {action.label}
                    </p>
                    <p className="type-body-sm text-[--color-text-secondary] leading-relaxed">
                      {action.desc}
                    </p>
                  </div>
                  <span
                    className="type-meta-sm tracking-widest uppercase font-[--font-ui] mt-auto"
                    style={{ color: `var(${action.accent})` }}
                  >
                    Get started →
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 4 — AI Ready Banner (conditional)
      ══════════════════════════════════════════════════ */}
      {aiReady.length > 0 && (
        <section className="py-8 bg-[--color-surveyor-light]">
          <div className="container-app mx-auto">
            <div className="card p-6 border-l-4 border-[--color-surveyor] bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[--color-surveyor-light] flex items-center justify-center shrink-0">
                  <svg
                    className="w-5 h-5 text-[--color-surveyor-dark]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge badge-surveyor">AI Ready</span>
                    <span className="type-body-sm font-semibold text-[--color-surveyor-dark]">
                      {aiReady.length} survey{aiReady.length > 1 ? "s" : ""}{" "}
                      ready for analysis
                    </span>
                  </div>
                  <p className="type-body-sm text-[--color-text-secondary]">
                    &ldquo;{aiReady[0]?.title}&rdquo; has{" "}
                    <strong className="font-[--font-mono]">
                      {aiReady[0]?.responseCount}
                    </strong>{" "}
                    responses — Gemini is ready to surface insights.
                  </p>
                </div>
              </div>
              <Link to="/analytics" className="btn btn-surveyor btn-md shrink-0">
                Open AI Lab →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════
          SECTION 5 — Active Surveys
      ══════════════════════════════════════════════════ */}
      <section className="py-20 bg-[--color-bg-subtle]">
        <div className="container-app mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="type-meta-sm text-[--color-text-tertiary] tracking-widest uppercase mb-2">
                Live Now
              </p>
              <h2 className="type-heading-lg text-[--color-text-primary]">
                Your Active Surveys
              </h2>
              <p className="type-body-sm text-[--color-text-secondary] mt-1 max-w-md">
                These are out in the world collecting responses right now. Keep
                the momentum going!
              </p>
            </div>
            <Link to="/surveys" className="btn btn-secondary btn-md">
              View All →
            </Link>
          </div>
          {activeSurveys.length > 0 ? (
            <motion.div
              variants={listVariants}
              initial="hidden"
              animate="show"
              className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
            >
              {activeSurveys.slice(0, 6).map((s) => (
                <motion.div key={s._id} variants={itemVariants}>
                  <SurveyCard
                    title={s.title}
                    category={s.category}
                    participantCount={s.responseCount}
                    status={s.status}
                    actionButton={
                      s.status === "expired" ? (
                        <span className="type-body-sm text-[--color-text-tertiary] italic">
                          Check dashboard for results
                        </span>
                      ) : (
                        <Link
                          to={`/surveys/${s._id}/edit`}
                          className="btn btn-sm btn-secondary"
                        >
                          Edit
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="type-heading-sm mt-4">No active surveys yet</h3>
              <p className="type-body-sm text-[--color-text-secondary] mt-2 max-w-xs">
                Ready to hear what people think? Create your first survey and
                start collecting real responses.
              </p>
              <Link to="/create-survey" className="btn btn-surveyor btn-md mt-5">
                Create Your First Survey
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 6 — Drafts + Recent Blog Activity (2-col)
      ══════════════════════════════════════════════════ */}
      <section className="py-20 bg-[--color-bg-surface]">
        <div className="container-app mx-auto grid gap-12 lg:grid-cols-2">
          {/* Drafts */}
          <div>
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="type-meta-sm text-[--color-text-tertiary] tracking-widest uppercase mb-2">
                  In Progress
                </p>
                <h2 className="type-heading-md text-[--color-text-primary]">
                  Drafts
                </h2>
                <p className="type-body-sm text-[--color-text-secondary] mt-1">
                  Almost there — publish these to start collecting responses.
                </p>
              </div>
              <span className="badge badge-draft">{drafts.length}</span>
            </div>
            {drafts.length > 0 ? (
              <div className="flex flex-col gap-3">
                {drafts.slice(0, 4).map((d) => (
                  <div
                    key={d._id}
                    className="card p-5 flex items-center justify-between gap-4 hover:shadow-[--shadow-md] transition-shadow duration-250"
                  >
                    <div className="min-w-0">
                      <p className="type-label-sm text-[--color-text-primary] truncate">
                        {d.title}
                      </p>
                      <p className="type-meta text-[--color-text-tertiary] mt-0.5 font-[--font-mono]">
                        {d.questionCount ?? 0} questions ·{" "}
                        {new Date(d.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      to={`/surveys/${d._id}/edit`}
                      className="btn btn-surveyor btn-sm shrink-0"
                    >
                      Pay &amp; Publish
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-10 text-center">
                <p className="type-body-sm text-[--color-text-tertiary]">
                  No drafts saved — you&apos;re all caught up! 🎉
                </p>
              </div>
            )}
          </div>

          {/* Recent Blog Activity */}
          <div>
            <div className="mb-6">
              <p className="type-meta-sm text-[--color-text-tertiary] tracking-widest uppercase mb-2">
                Community
              </p>
              <h2 className="type-heading-md text-[--color-text-primary]">
                Recent Blog Activity
              </h2>
              <p className="type-body-sm text-[--color-text-secondary] mt-1">
                See how people are engaging with your published insight posts.
              </p>
            </div>
            {blogActivity.length > 0 ? (
              <div className="flex flex-col gap-3">
                {blogActivity.slice(0, 4).map((a) => (
                  <div key={a._id} className="card p-5 flex items-start gap-4">
                    <div className="w-9 h-9 rounded-full bg-[--color-surveyor-light] flex items-center justify-center shrink-0 text-sm font-bold text-[--color-surveyor-dark]">
                      {(a.commenterName || "U")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="type-body-sm text-[--color-text-primary] line-clamp-2">
                        {a.comment}
                      </p>
                      <p className="type-meta text-[--color-text-tertiary] mt-1 font-[--font-mono]">
                        {a.commenterName} · &ldquo;{a.blogTitle}&rdquo; ·{" "}
                        {new Date(a.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-10 text-center">
                <p className="type-body-sm text-[--color-text-tertiary]">
                  No blog activity yet. Publish an insight post to get the
                  conversation started!
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 7 — Motivational CTA Banner
      ══════════════════════════════════════════════════ */}
      <section className="py-20 bg-[--color-navy] text-center">
        <div className="container-app mx-auto">
          <h2 className="type-display-lg text-white mb-4">
            Every Response Tells a Story
          </h2>
          <p className="type-body-lg text-white/70 max-w-xl mx-auto mb-8">
            You&apos;re building something meaningful. Keep creating, keep
            analysing — your next insight could change the conversation.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/analytics" className="btn btn-surveyor btn-lg">
              Run AI Analysis →
            </Link>
            <Link
              to="/pricing"
              className="btn btn-lg"
              style={{
                background: "rgba(255,255,255,0.1)",
                color: "white",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              Manage Plan
            </Link>
          </div>
        </div>
      </section>

    </PageTransition>
  );
}
