import { useContext, useRef, useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import {
  PlusIcon,
  BeakerIcon,
  PencilSquareIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
  ChatBubbleLeftEllipsisIcon,
} from "@heroicons/react/24/outline";
import { AuthContext } from "../../Firebase_AuthProvider/AuthProvider";
import useAxiosSecure from "../../Hooks/useAxiosSecure";
import { StatCard } from "../../Components/UI/StatCard";
import { PageTransition } from "../../Components/UI/PageTransition";
import { useAppealSurvey } from "../../Hooks/useSurveysMutation";

// ── Motion variants ──────────────────────────────────────────────────────────
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] } },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

// ── Moderation Banner ─────────────────────────────────────────────────────────
function ModerationBanner({ rejectedSurveys }) {
  const [appealId, setAppealId] = useState(null);
  const [appealMsg, setAppealMsg] = useState("");
  const appealMutation = useAppealSurvey();

  if (!rejectedSurveys || rejectedSurveys.length === 0) return null;

  const handleAppeal = (id) => {
    if (!appealMsg.trim()) return;
    appealMutation.mutate(
      { id, message: appealMsg },
      { onSuccess: () => { setAppealId(null); setAppealMsg(""); } }
    );
  };

  return (
    <section className="py-8" style={{ backgroundColor: "var(--color-error-light)" }}>
      <div className="container-app mx-auto">
        <div className="flex items-center gap-2.5 mb-5">
          <ExclamationCircleIcon className="w-5 h-5 shrink-0" style={{ color: "var(--color-error)" }} />
          <h2 className="font-heading font-bold text-lg" style={{ color: "var(--color-error)" }}>
            {rejectedSurveys.length} Survey{rejectedSurveys.length !== 1 ? "s" : ""} Need Attention
          </h2>
        </div>
        <div className="flex flex-col gap-3">
          {rejectedSurveys.map((s) => (
            <div
              key={s._id}
              className="rounded-xl bg-white p-5 border-l-4 flex items-start justify-between gap-4"
              style={{ borderLeftColor: "var(--color-error)", borderColor: "var(--color-border)" }}
            >
              <div className="min-w-0">
                <p className="font-semibold text-sm" style={{ color: "var(--color-text-primary)" }}>{s.title}</p>
                <p className="text-xs font-[--font-mono] mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                  {s.status === "rejected" ? "Rejected" : "Pending Review"} ·{" "}
                  {new Date(s.updatedAt || s.createdAt).toLocaleDateString()}
                </p>
                {s.moderation?.reason && (
                  <p className="text-xs mt-2" style={{ color: "var(--color-error)" }}>
                    Reason: {s.moderation.reason}
                  </p>
                )}
                {s.moderation?.appeal && (
                  <p className="text-xs mt-1 italic" style={{ color: "var(--color-text-tertiary)" }}>
                    Appeal submitted: "{s.moderation.appeal.message}"
                  </p>
                )}
              </div>
              {s.status === "rejected" && !s.moderation?.appeal && (
                <div className="shrink-0">
                  {appealId === s._id ? (
                    <div className="flex flex-col gap-2 min-w-[240px]">
                      <textarea
                        value={appealMsg}
                        onChange={(e) => setAppealMsg(e.target.value)}
                        placeholder="Explain why this should be approved..."
                        className="input-field text-sm min-h-[72px]"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleAppeal(s._id)} disabled={appealMutation.isPending} className="btn btn-sm btn-primary">
                          {appealMutation.isPending ? "Submitting…" : "Submit Appeal"}
                        </button>
                        <button onClick={() => { setAppealId(null); setAppealMsg(""); }} className="btn btn-sm btn-ghost">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAppealId(s._id)}
                      className="btn btn-sm"
                      style={{ border: "1px solid var(--color-error)", color: "var(--color-error)", backgroundColor: "transparent" }}
                    >
                      Appeal
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Survey Slider ─────────────────────────────────────────────────────────────
function ActiveSurveySlider({ surveys }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent((i) => (i + 1) % surveys.length), [surveys.length]);
  const prev = useCallback(() => setCurrent((i) => (i - 1 + surveys.length) % surveys.length), [surveys.length]);

  useEffect(() => {
    if (paused || surveys.length <= 1) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [paused, next, surveys.length]);

  if (surveys.length === 0) return null;
  const survey = surveys[current];

  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background */}
      <div className="absolute inset-0" style={{ backgroundColor: "var(--color-primary)" }}>
        {survey.image && (
          <img src={survey.image} alt="" className="w-full h-full object-cover opacity-30" />
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(11,48,86,0.95) 0%, rgba(11,48,86,0.75) 100%)" }} />
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={survey._id}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative p-8"
        >
          {survey.category && (
            <span className="inline-block mb-3 text-[11px] font-bold font-[--font-ui] uppercase tracking-[0.18em] px-2.5 py-1 rounded-full"
              style={{ backgroundColor: "var(--color-accent)", color: "white" }}
            >
              {survey.category}
            </span>
          )}
          <h3 className="font-heading font-bold text-xl text-white leading-snug mb-2 max-w-xs">
            {survey.title}
          </h3>
          {survey.description && (
            <p className="text-sm text-white/65 line-clamp-2 mb-5 max-w-sm">
              {survey.description}
            </p>
          )}
          <div className="flex items-center gap-4">
            <Link to="/dashboard/surveys" className="btn btn-primary btn-sm">
              View Details
            </Link>
            <span className="text-xs font-[--font-mono] text-white/50">
              {survey.participantCount ?? 0} responses
            </span>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      {surveys.length > 1 && (
        <div className="absolute bottom-4 right-6 flex items-center gap-2">
          <button onClick={prev} className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "white" }}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          {surveys.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === current ? "20px" : "6px",
                height: "6px",
                backgroundColor: i === current ? "var(--color-accent)" : "rgba(255,255,255,0.35)",
              }}
            />
          ))}
          <button onClick={next} className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "white" }}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <PageTransition>
      <div className="animate-pulse">
        <div className="h-72" style={{ backgroundColor: "var(--color-bg-subtle)" }} />
        <div className="container-app mx-auto py-10 space-y-8">
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 rounded-xl" style={{ backgroundColor: "var(--color-bg-inset)" }} />)}
          </div>
          <div className="h-64 rounded-xl" style={{ backgroundColor: "var(--color-bg-inset)" }} />
        </div>
      </div>
    </PageTransition>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function SurveyorHome() {
  const { user } = useContext(AuthContext);
  const axiosSecure = useAxiosSecure();

  const { data, isPending, error } = useQuery({
    queryKey: ["home", "surveyor", user?.uid],
    enabled: Boolean(user?.uid),
    queryFn: async () => {
      const uid = user?.uid || "";
      const res = await axiosSecure.get(`/api/homepages/surveyor${uid ? `?surveyorId=${uid}` : ""}`);
      return res.data;
    },
  });

  if (isPending) return <Skeleton />;
  if (error)
    return (
      <PageTransition>
        <div className="container-app mx-auto py-24 text-center">
          <p className="text-sm" style={{ color: "var(--color-error)" }}>{error.message || "Failed to load"}</p>
        </div>
      </PageTransition>
    );

  const payload = data?.data || {};
  const kpis = payload.kpis || {};
  const activeSurveys = payload.publishedSurveys || [];
  const drafts = payload.draftSurveys || [];
  const rejectedSurveys = payload.rejectedSurveys || [];
  const blogActivity = payload.recentBlogActivity || [];
  const firstName = (user?.displayName || "").split(" ")[0] || "there";
  const greeting = getGreeting();

  return (
    <PageTransition>

      {/* ══════════════════════════════════════════════════
          HERO — Personal welcome, navy + orange
      ══════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: "var(--color-primary)" }} className="relative overflow-hidden">
        {/* Subtle geometric decoration */}
        <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
          {/* Large soft glow circle top-right */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-[0.07]"
            style={{ background: "radial-gradient(circle, var(--color-accent) 0%, transparent 70%)" }} />
          {/* Small accent circle bottom-left */}
          <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full opacity-[0.05]"
            style={{ background: "radial-gradient(circle, #5BBCEA 0%, transparent 70%)" }} />
          {/* Grid dots */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        <div className="relative container-app mx-auto px-6 py-14 lg:py-18">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10"
          >
            {/* Left — greeting + CTAs */}
            <motion.div variants={item} className="max-w-lg">
              <span
                className="inline-block mb-4 text-[11px] font-bold font-[--font-ui] uppercase tracking-[0.18em] px-3 py-1 rounded-full"
                style={{ backgroundColor: "var(--color-accent-light)", color: "var(--color-accent-dark)" }}
              >
                Surveyor Workspace
              </span>
              <h1 className="font-heading font-bold text-4xl lg:text-5xl text-white leading-tight mb-3">
                {greeting},<br />
                <span style={{ color: "var(--color-accent)" }}>{firstName}!</span>
              </h1>
              <p className="text-base text-white/65 leading-relaxed mb-8 max-w-md">
                Your surveys are live, your data is growing — let's turn those responses into stories that matter.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/dashboard/create-survey" className="btn btn-primary btn-lg flex items-center gap-2">
                  <PlusIcon className="w-4 h-4" />
                  New Survey
                </Link>
                <Link
                  to="/dashboard/analytics"
                  className="btn btn-lg flex items-center gap-2"
                  style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  <BeakerIcon className="w-4 h-4" />
                  AI Analytics
                </Link>
              </div>
            </motion.div>

            {/* Right — summary card + slider */}
            <motion.div variants={item} className="lg:w-[380px] w-full shrink-0 flex flex-col gap-4">
              {/* Stats summary */}
              <div
                className="rounded-2xl p-5 grid grid-cols-3 gap-4"
                style={{ backgroundColor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                {[
                  { label: "Responses", value: kpis.totalResponses ?? 0 },
                  { label: "Active", value: kpis.activeSurveys ?? 0 },
                  { label: "Drafts", value: drafts.length },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center">
                    <p className="font-[--font-mono] text-2xl font-bold text-white">{value.toLocaleString()}</p>
                    <p className="text-[11px] font-[--font-ui] uppercase tracking-wider mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Active survey card slider */}
              {activeSurveys.length > 0 && (
                <ActiveSurveySlider surveys={activeSurveys} />
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Moderation alerts ── */}
      <ModerationBanner rejectedSurveys={rejectedSurveys} />

      {/* ══════════════════════════════════════════════════
          SECTION 2 — KPI Cards
      ══════════════════════════════════════════════════ */}
      <section className="py-14" style={{ backgroundColor: "var(--color-bg-subtle)" }}>
        <div className="container-app mx-auto">
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <motion.div variants={item} className="mb-8">
              <p className="text-[11px] font-bold font-[--font-ui] uppercase tracking-[0.16em] mb-2" style={{ color: "var(--color-text-tertiary)" }}>
                Your Performance
              </p>
              <h2 className="font-heading font-bold text-2xl" style={{ color: "var(--color-text-primary)" }}>
                At a Glance
              </h2>
              <p className="text-sm mt-1 max-w-sm" style={{ color: "var(--color-text-secondary)" }}>
                Everything you need to track how your surveys are doing.
              </p>
            </motion.div>

            <motion.div variants={item} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Responses"
                value={(kpis.totalResponses ?? 0).toLocaleString()}
                icon={ChartBarIcon}
              />
              <StatCard
                title="Active Surveys"
                value={kpis.activeSurveys ?? 0}
                icon={ClipboardDocumentListIcon}
              />
              <StatCard
                title="Avg Completion"
                value={`${kpis.avgCompletionRate ?? 0}%`}
                icon={CheckCircleIcon}
              />
              <StatCard
                title="New (7 days)"
                value={kpis.newResponsesLast7Days ?? 0}
                icon={ArrowTrendingUpIcon}
                delta="+12%"
                deltaType="positive"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 3 — Quick Actions (3-col card grid)
      ══════════════════════════════════════════════════ */}
      <section className="py-14" style={{ backgroundColor: "var(--color-bg-surface)" }}>
        <div className="container-app mx-auto">
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <motion.div variants={item} className="mb-8">
              <p className="text-[11px] font-bold font-[--font-ui] uppercase tracking-[0.16em] mb-2" style={{ color: "var(--color-text-tertiary)" }}>
                Jump Right In
              </p>
              <h2 className="font-heading font-bold text-2xl" style={{ color: "var(--color-text-primary)" }}>
                Quick Actions
              </h2>
            </motion.div>

            <motion.div variants={container} className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: PlusIcon,
                  label: "Create Survey",
                  desc: "Build a dynamic survey with MCQ, scale, and paragraph questions. Launch in minutes.",
                  to: "/dashboard/create-survey",
                },
                {
                  icon: BeakerIcon,
                  label: "AI Analytics Lab",
                  desc: "Let Gemini analyse your response data and surface the themes that matter most.",
                  to: "/dashboard/analytics",
                },
                {
                  icon: PencilSquareIcon,
                  label: "Write Insight Blog",
                  desc: "Turn survey findings into a compelling AI-generated insight post for your audience.",
                  to: "/dashboard/blog-studio",
                },
              ].map((action, i) => (
                <motion.div key={action.label} variants={item}>
                  <Link
                    to={action.to}
                    className="group flex flex-col gap-5 p-6 rounded-xl border bg-white h-full transition-all duration-200"
                    style={{ borderColor: "var(--color-border)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = "0 8px 24px -6px rgba(0,0,0,0.10)";
                      e.currentTarget.style.borderColor = "var(--color-accent-light)";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
                      e.currentTarget.style.borderColor = "var(--color-border)";
                    }}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110"
                      style={{ backgroundColor: "var(--color-accent-light)" }}
                    >
                      <action.icon className="w-5 h-5" style={{ color: "var(--color-accent-dark)" }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm mb-1.5" style={{ color: "var(--color-text-primary)" }}>
                        {action.label}
                      </p>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                        {action.desc}
                      </p>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-semibold font-[--font-ui] mt-auto group-hover:gap-2 transition-all duration-200"
                      style={{ color: "var(--color-accent)" }}>
                      Get started <ArrowRightIcon className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 4 — Drafts + Blog Activity (2-col)
      ══════════════════════════════════════════════════ */}
      <section className="py-14" style={{ backgroundColor: "var(--color-bg-subtle)" }}>
        <div className="container-app mx-auto grid gap-10 lg:grid-cols-2">

          {/* ── Drafts ── */}
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <motion.div variants={item} className="flex items-end justify-between mb-6">
              <div>
                <p className="text-[11px] font-bold font-[--font-ui] uppercase tracking-[0.16em] mb-1.5" style={{ color: "var(--color-text-tertiary)" }}>
                  In Progress
                </p>
                <h2 className="font-heading font-bold text-xl" style={{ color: "var(--color-text-primary)" }}>Drafts</h2>
                <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                  Almost there — publish to start collecting responses.
                </p>
              </div>
              {drafts.length > 0 && (
                <span
                  className="text-[11px] font-bold font-[--font-mono] px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: "var(--color-accent-light)", color: "var(--color-accent-dark)" }}
                >
                  {drafts.length}
                </span>
              )}
            </motion.div>

            {drafts.length > 0 ? (
              <motion.div variants={container} className="flex flex-col gap-3">
                {drafts.slice(0, 4).map((d) => (
                  <motion.div
                    key={d._id}
                    variants={item}
                    className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white border transition-shadow duration-200 hover:shadow-md"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>{d.title}</p>
                      <p className="text-xs font-[--font-mono] mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                        {d.questions?.length ?? 0} questions · {new Date(d.updatedAt || d.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Link to={`/surveys/${d._id}/edit`} className="btn btn-primary btn-sm shrink-0">
                      Pay & Publish
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 rounded-xl bg-white border text-center"
                style={{ borderColor: "var(--color-border)" }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                  style={{ backgroundColor: "var(--color-accent-light)" }}>
                  <CheckCircleIcon className="w-6 h-6" style={{ color: "var(--color-accent)" }} />
                </div>
                <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>All caught up!</p>
                <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>No drafts saved.</p>
              </div>
            )}
          </motion.div>

          {/* ── Blog Activity ── */}
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <motion.div variants={item} className="mb-6">
              <p className="text-[11px] font-bold font-[--font-ui] uppercase tracking-[0.16em] mb-1.5" style={{ color: "var(--color-text-tertiary)" }}>
                Community
              </p>
              <h2 className="font-heading font-bold text-xl" style={{ color: "var(--color-text-primary)" }}>Blog Reactions</h2>
              <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
                See how people engage with your published insight posts.
              </p>
            </motion.div>

            {blogActivity.length > 0 ? (
              <motion.div variants={container} className="flex flex-col gap-3">
                {blogActivity.slice(0, 4).map((a) => (
                  <motion.div
                    key={a._id}
                    variants={item}
                    className="flex items-start gap-3 p-4 rounded-xl bg-white border"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-white"
                      style={{ backgroundColor: "var(--color-accent)" }}
                    >
                      {(a.userEmail || "U")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm leading-snug line-clamp-2" style={{ color: "var(--color-text-primary)" }}>
                        {a.comment}
                      </p>
                      <p className="text-xs font-[--font-mono] mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                        {a.userEmail?.split("@")[0]} · "{a.blogTitle}" ·{" "}
                        {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ""}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 rounded-xl bg-white border text-center"
                style={{ borderColor: "var(--color-border)" }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                  style={{ backgroundColor: "var(--color-accent-light)" }}>
                  <ChatBubbleLeftEllipsisIcon className="w-6 h-6" style={{ color: "var(--color-accent)" }} />
                </div>
                <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>No activity yet</p>
                <p className="text-xs mt-1 max-w-[200px]" style={{ color: "var(--color-text-tertiary)" }}>
                  Publish an insight post to start the conversation.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 5 — Tips & Resources (new section)
      ══════════════════════════════════════════════════ */}
      <section className="py-14" style={{ backgroundColor: "var(--color-bg-surface)" }}>
        <div className="container-app mx-auto">
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <motion.div variants={item} className="mb-8">
              <p className="text-[11px] font-bold font-[--font-ui] uppercase tracking-[0.16em] mb-2" style={{ color: "var(--color-text-tertiary)" }}>
                Power Your Work
              </p>
              <h2 className="font-heading font-bold text-2xl" style={{ color: "var(--color-text-primary)" }}>
                Surveyor Toolkit
              </h2>
            </motion.div>
            <motion.div variants={container} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Craft Better Questions",
                  desc: "Use a mix of MCQ, linear scale, and open-ended to get richer, more actionable data.",
                  icon: "✏️",
                  link: "/dashboard/create-survey",
                  linkLabel: "Build a survey",
                },
                {
                  title: "Publish Your Findings",
                  desc: "Turn your response data into an AI-powered blog post your audience will actually read.",
                  icon: "📝",
                  link: "/dashboard/blog-studio",
                  linkLabel: "Open Blog Studio",
                },
                {
                  title: "Monitor in Real Time",
                  desc: "Track response rates, completion trends, and audience segments from AI Analytics.",
                  icon: "📊",
                  link: "/dashboard/analytics",
                  linkLabel: "View analytics",
                },
              ].map((tip) => (
                <motion.div
                  key={tip.title}
                  variants={item}
                  className="p-5 rounded-xl border"
                  style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg-subtle)" }}
                >
                  <span className="text-2xl mb-3 block">{tip.icon}</span>
                  <p className="font-semibold text-sm mb-1.5" style={{ color: "var(--color-text-primary)" }}>{tip.title}</p>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--color-text-secondary)" }}>{tip.desc}</p>
                  <Link
                    to={tip.link}
                    className="text-xs font-semibold font-[--font-ui] flex items-center gap-1 hover:gap-2 transition-all duration-200"
                    style={{ color: "var(--color-accent)" }}
                  >
                    {tip.linkLabel} <ArrowRightIcon className="w-3 h-3" />
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 6 — CTA Banner (bottom)
      ══════════════════════════════════════════════════ */}
      <section className="py-16" style={{ backgroundColor: "var(--color-primary)" }}>
        <div className="container-app mx-auto">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex flex-col lg:flex-row items-center justify-between gap-8"
          >
            <motion.div variants={item} className="max-w-lg">
              <h2 className="font-heading font-bold text-3xl text-white leading-tight mb-3">
                Every Response Tells a Story
              </h2>
              <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
                You're building something meaningful. Keep creating, keep analysing — your next insight could change the conversation.
              </p>
            </motion.div>
            <motion.div variants={item} className="flex flex-wrap gap-3 shrink-0">
              <Link to="/dashboard/analytics" className="btn btn-primary btn-lg flex items-center gap-2">
                <BeakerIcon className="w-4 h-4" />
                Run AI Analysis
              </Link>
              <Link
                to="/pricing"
                className="btn btn-lg"
                style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)" }}
              >
                Manage Plan
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

    </PageTransition>
  );
}
