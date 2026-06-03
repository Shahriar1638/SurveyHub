import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import useAxiosPublic from "../../Hooks/useAxiosPublic";
import { SurveyCard } from "../../Components/UI/SurveyCard";

gsap.registerPlugin(ScrollTrigger);

const STAT_FALLBACKS = {
  totalPublishedSurveys: 12847,
  totalResponses: 2100000,
  totalInsightPosts: 4300,
  activeSurveyors: 340000,
};

// ── Animated counter helper ────────────────────────────────────
function CountUp({ end, duration = 2 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        let start = 0;
        const step = end / (duration * 60);
        const tick = () => {
          start += step;
          if (start >= end) {
            setCount(end);
            return;
          }
          setCount(Math.floor(start));
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{count.toLocaleString()}</span>;
}

// ── Skeleton loader ────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="container-marketing mx-auto py-24">
      <div className="animate-pulse space-y-8">
        <div className="h-12 w-3/4 bg-[--color-bg-inset] rounded-xl" />
        <div className="h-6 w-1/2 bg-[--color-bg-inset] rounded-lg" />
        <div className="grid grid-cols-3 gap-4 mt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-[--color-bg-inset] rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function GuestHome() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const heroRef = useRef(null);
  const axiosPublic = useAxiosPublic();

  // Fetch
  useEffect(() => {
    let mounted = true;
    axiosPublic
      .get("/api/homepages/guest")
      .then((r) => {
        if (mounted) setData(r.data);
      })
      .catch((e) => {
        if (mounted) setError(e.message || "Failed to load");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [axiosPublic]);

  // GSAP hero entrance
  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (prefersReduced || !heroRef.current) return;
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-eyebrow", { opacity: 0, y: 20, duration: 0.5 })
        .from(".hero-title", { opacity: 0, y: 30, duration: 0.7 }, "-=0.2")
        .from(".hero-subtitle", { opacity: 0, y: 20, duration: 0.5 }, "-=0.4")
        .from(
          ".hero-cta",
          { opacity: 0, y: 16, duration: 0.4, stagger: 0.1 },
          "-=0.3",
        );
    },
    { scope: heroRef },
  );

  if (loading) return <Skeleton />;
  if (error)
    return (
      <div className="container-marketing mx-auto py-24 text-center">
        <p className="type-body-base text-[--color-error]">{error}</p>
      </div>
    );

  const stats = data?.data?.stats || {};
  const featured = data?.data?.featuredSurveys || [];
  const insight = data?.data?.aiInsightSpotlight || null;

  return (
    <>
      {/* ══════════════════════════════════════════════════
          SECTION 1 — Hero
      ══════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="min-h-[85vh] flex flex-col items-center justify-center text-center py-24 container-marketing mx-auto"
      >
        <span className="hero-eyebrow inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold font-[--font-ui] tracking-widest uppercase bg-[--color-surveyor-light] text-[--color-surveyor-dark] mb-6">
          AI-Powered Survey Platform
        </span>
        <h1 className="hero-title type-display-xl text-[--color-text-primary] max-w-4xl mb-5">
          Turn Survey Responses into
          <br />
          <span className="text-[--color-visitor]">AI-Powered Stories</span>
        </h1>
        <p className="hero-subtitle type-body-lg text-[--color-text-secondary] max-w-2xl mb-8">
          Create surveys, collect responses, and publish AI-generated insights —
          all in one platform trusted by thousands of researchers and creators.
        </p>
        <div className="hero-cta flex flex-wrap gap-4 justify-center mb-4">
          <Link to="/sign-up" className="btn btn-primary btn-lg">
            Get Started Free
          </Link>
          <Link to="/surveys" className="btn btn-secondary btn-lg">
            Explore Surveys →
          </Link>
        </div>
        <p className="hero-cta type-meta text-[--color-text-tertiary]">
          Free to join · No credit card required
        </p>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 2 — Live Platform Stats Bar
      ══════════════════════════════════════════════════ */}
      <section className="bg-[--color-navy] py-10">
        <div className="container-marketing mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            {
              label: "Surveys Published",
              value: stats.totalPublishedSurveys ?? STAT_FALLBACKS.totalPublishedSurveys,
            },
            {
              label: "Responses Collected",
              value: stats.totalResponses ?? STAT_FALLBACKS.totalResponses,
            },
            {
              label: "Insights Generated",
              value: stats.totalInsightPosts ?? STAT_FALLBACKS.totalInsightPosts,
            },
            {
              label: "Active Surveyors",
              value: stats.activeSurveyors ?? STAT_FALLBACKS.activeSurveyors,
            },
          ].map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-1">
              <div className="font-[--font-mono] text-3xl font-medium text-white">
                <CountUp end={value} />
              </div>
              <div className="type-body-sm text-white/60">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 3 — Featured Surveys
      ══════════════════════════════════════════════════ */}
      <section className="py-20 container-marketing mx-auto">
        <div className="mb-10">
          <p className="type-meta-sm text-[--color-text-tertiary] tracking-widest uppercase mb-2">
            Trending Now
          </p>
          <h2 className="type-heading-lg text-[--color-text-primary]">
            Featured Surveys
          </h2>
          <p className="type-body-base text-[--color-text-secondary] mt-2 max-w-xl">
            Browse what the community is talking about. Sign in to participate
            and unlock AI insights.
          </p>
        </div>

        {featured.length > 0 ? (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.slice(0, 6).map((s) => (
                <div key={s._id}>
                  <div className="relative group">
                    <SurveyCard
                      title={s.title}
                      category={s.category}
                      participantCount={s.participantCount}
                      status={s.status}
                    />
                    {/* Guest overlay */}
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      {s.status === "expired" ? (
                        <span className="type-body-sm text-[--color-error] font-semibold">Expired</span>
                      ) : (
                        <Link to="/login" className="btn btn-primary btn-sm">
                          Login to participate
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link to="/surveys" className="btn btn-secondary btn-md">
                View All Surveys →
              </Link>
            </div>
          </>
        ) : (
          <div className="empty-state py-16">
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="type-heading-sm">No featured surveys yet</h3>
            <p className="type-body-sm text-[--color-text-secondary] mt-1">
              Check back soon!
            </p>
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 4 — How It Works
      ══════════════════════════════════════════════════ */}
      <section className="py-20 bg-[--color-bg-subtle]">
        <div className="container-marketing mx-auto">
          <div className="text-center mb-12">
            <p className="type-meta-sm text-[--color-text-tertiary] tracking-widest uppercase mb-2">
              Simple Process
            </p>
            <h2 className="type-heading-lg text-[--color-text-primary]">
              How It Works
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-px border-t-2 border-dashed border-[--color-border-strong]" />

            {[
              {
                num: "01",
                icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
                title: "Create Survey",
                body: "Build dynamic surveys with MCQ, linear scale, paragraph questions and more.",
              },
              {
                num: "02",
                icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
                title: "Collect Responses",
                body: "Share with your audience and watch real-time responses roll in from your community.",
              },
              {
                num: "03",
                icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
                title: "AI Generates Insights",
                body: "Gemini AI analyses your data and drafts a rich Insight Blog post ready to publish.",
              },
            ].map((step) => (
              <div
                key={step.num}
                className="step-item flex flex-col items-center text-center"
                
              >
                <div className="w-16 h-16 rounded-full bg-[--color-navy] flex items-center justify-center mb-5 relative z-10">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d={step.icon}
                    />
                  </svg>
                </div>
                <span className="type-meta text-[--color-text-tertiary] mb-1">
                  {step.num}
                </span>
                <h3 className="type-heading-sm text-[--color-text-primary] mb-2">
                  {step.title}
                </h3>
                <p className="type-body-sm text-[--color-text-secondary] max-w-xs">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 5 — AI Insight Spotlight
      ══════════════════════════════════════════════════ */}
      <section className="py-20 container-marketing mx-auto">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Left text */}
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold font-[--font-ui] tracking-widest uppercase bg-[--color-visitor-light] text-[--color-visitor-dark] mb-5">
              AI Insight Spotlight
            </span>
            <h2 className="type-heading-lg text-[--color-text-primary] mb-4">
              Real Data. Real Stories.
              <br />
              Real Intelligence.
            </h2>
            <p className="type-body-base text-[--color-text-secondary] mb-6">
              Every published survey can become a rich AI-generated insight
              blog. Our Gemini integration analyses sentiment, themes, and
              trends — turning raw responses into compelling narratives.
            </p>
            <Link to="/login" className="btn btn-primary btn-md">
              Unlock Full AI Analysis
            </Link>
          </div>

          {/* Right — insight card preview */}
          <div className="relative">
            <div className="card p-6 relative overflow-hidden">
              {insight ? (
                <>
                  <div className="badge badge-surveyor mb-3">AI Analysis</div>
                  <h3 className="type-heading-sm text-[--color-text-primary] mb-2">
                    {insight.title}
                  </h3>
                  <p className="type-body-sm text-[--color-text-secondary] leading-relaxed">
                    {insight.content?.slice(0, 180)}...
                  </p>
                  {/* Gradient blur gate */}
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-white to-transparent" />
                </>
              ) : (
                <div className="py-10 text-center">
                  <div className="w-14 h-14 rounded-xl bg-[--color-bg-subtle] flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-7 h-7 text-[--color-text-tertiary]"
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
                  <p className="type-body-sm text-[--color-text-secondary]">
                    No spotlight available yet.
                  </p>
                </div>
              )}
            </div>
            <div className="absolute -inset-1 bg-linear-to-tr from-[--color-surveyor-light] to-transparent rounded-2xl -z-10" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 6 — Pricing Snapshot
      ══════════════════════════════════════════════════ */}
      <section className="py-20 bg-[--color-bg-subtle]">
        <div className="container-marketing mx-auto">
          <div className="text-center mb-12">
            <h2 className="type-heading-lg text-[--color-text-primary]">
              Simple, Transparent Pricing
            </h2>
            <p className="type-body-base text-[--color-text-secondary] mt-2">
              Start free, upgrade when you're ready to create.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 max-w-2xl mx-auto">
            {/* Free */}
            <div className="card p-8">
              <div className="badge badge-visitor mb-4">Free</div>
              <div className="font-[--font-mono] text-4xl font-medium text-[--color-text-primary] mb-1">
                $0
              </div>
              <p className="type-body-sm text-[--color-text-secondary] mb-6">
                Forever free for participants
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Browse all published surveys",
                  "Participate & vote",
                  "Read AI Insight Blogs",
                  "Community reactions & comments",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 type-body-sm">
                    <svg
                      className="w-4 h-4 text-[--color-success] shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/sign-up"
                className="btn btn-secondary btn-md w-full justify-center"
              >
                Get Started Free
              </Link>
            </div>

            {/* Surveyor */}
            <div
              className="card p-8 border-2 border-[--color-surveyor]"
              style={{ boxShadow: "var(--shadow-lg)" }}
            >
              <div className="badge badge-surveyor mb-4">Surveyor</div>
              <div className="font-[--font-mono] text-4xl font-medium text-[--color-text-primary] mb-1">
                Premium
              </div>
              <p className="type-body-sm text-[--color-text-secondary] mb-6">
                For researchers & creators
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Everything in Free",
                  "Create unlimited surveys",
                  "AI Analytics Lab (Gemini)",
                  "Publish AI Insight Blogs",
                  "Subscription payment per survey",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 type-body-sm">
                    <svg
                      className="w-4 h-4 text-[--color-surveyor-dark] shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/pricing"
                className="btn btn-surveyor btn-md w-full justify-center"
              >
                See Full Pricing →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          SECTION 7 — Final CTA Banner
      ══════════════════════════════════════════════════ */}
      <section
        className="py-20 text-center"
        style={{ backgroundColor: "var(--color-navy)" }}
      >
        <div className="container-marketing mx-auto">
          <h2 className="type-display-lg text-white mb-4">
            Start Collecting Insights Today
          </h2>
          <p className="type-body-lg text-white/70 max-w-xl mx-auto mb-8">
            Join thousands of surveyors already using AI to turn their data into
            stories that matter.
          </p>
          <Link
            to="/sign-up"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-[--color-navy] font-semibold font-[--font-ui] text-base hover:bg-[--color-bg-subtle] transition-colors duration-150"
          >
            Create Free Account →
          </Link>
        </div>
      </section>
    </>
  );
}
