import { useState, useContext } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { AuthContext } from "../../Firebase_AuthProvider/AuthProvider";
import useProfile from "../../Hooks/useProfile";
import { PageTransition } from "../../Components/UI/PageTransition";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const PACKAGES = [
  {
    id: "starter",
    credits: 20,
    price: 19,
    label: "Starter Pack",
    description: "Perfect for dipping your toes in — create a few surveys and get a feel for the platform.",
    perCredit: "0.95",
    color: "var(--color-visitor)",
    colorLight: "var(--color-visitor-light)",
    colorDark: "var(--color-visitor-dark)",
    highlight: false,
    features: [
      "20 survey credits",
      "Create up to 4 surveys",
      "AI analysis on responses",
      "Credits never expire",
      "Instant surveyor access",
    ],
  },
  {
    id: "growth",
    credits: 50,
    price: 39,
    label: "Growth Pack",
    description: "For active researchers who need a steady stream of surveys running concurrently.",
    perCredit: "0.78",
    color: "var(--color-surveyor-dark)",
    colorLight: "var(--color-surveyor-light)",
    colorDark: "var(--color-surveyor-dark)",
    highlight: false,
    features: [
      "50 survey credits",
      "Create up to 10 surveys",
      "AI analysis on responses",
      "Credits never expire",
      "Priority email support",
    ],
  },
  {
    id: "pro",
    credits: 110,
    price: 79,
    label: "Pro Pack",
    description: "Best value for professionals running multiple campaigns and deeper analytics needs.",
    perCredit: "0.72",
    color: "var(--color-user)",
    colorLight: "var(--color-user-light)",
    colorDark: "var(--color-user-dark)",
    highlight: true,
    badge: "BEST VALUE",
    features: [
      "110 survey credits",
      "Create up to 22 surveys",
      "AI analysis on responses",
      "Credits never expire",
      "Priority support + blog tools",
    ],
  },
  {
    id: "enterprise",
    credits: 250,
    price: 159,
    label: "Enterprise Pack",
    description: "For power users, agencies, and teams running high-volume research campaigns.",
    perCredit: "0.64",
    color: "var(--color-admin)",
    colorLight: "var(--color-admin-light)",
    colorDark: "var(--color-admin-dark)",
    highlight: false,
    features: [
      "250 survey credits",
      "Create up to 50 surveys",
      "Unlimited AI analysis",
      "Credits never expire",
      "Dedicated support channel",
    ],
  },
];

export default function PricingPage() {
  const { user } = useContext(AuthContext);
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState("");

  const userId = profile?._id;

  const handlePurchase = async (packageId) => {
    if (!user) {
      navigate("/login");
      return;
    }
    setError("");
    setLoadingId(packageId);
    try {
      const { data } = await axios.post(`${API}/api/payments/create-checkout-session`, {
        packageId,
        userId,
      });
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        setError("Could not start checkout. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoadingId(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.15 },
    },
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[--color-bg-base] pb-24">
        {/* ── Header ── */}
        <div className="text-center pt-16 pb-12 px-4">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest mb-4"
            style={{
              backgroundColor: "var(--color-surveyor-light)",
              color: "var(--color-surveyor-dark)",
            }}
          >
            Credit-Based Pricing
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="type-heading-xl text-[--color-text-primary] mb-4"
          >
            Buy Credits, Build Surveys
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.16 }}
            className="type-body-base text-[--color-text-secondary] max-w-xl mx-auto"
          >
            Credits never expire. Use{" "}
            <span className="font-semibold text-[--color-text-primary]">5 credits</span> to
            publish a survey and{" "}
            <span className="font-semibold text-[--color-text-primary]">2 credits</span> per
            AI-analyzed response. Purchase once, use forever.
          </motion.p>
        </div>

        {/* ── How credits work ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.24 }}
          className="max-w-2xl mx-auto px-4 mb-12"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: "📋", label: "Publish Survey", cost: "5 credits" },
              { icon: "🤖", label: "AI Per Response", cost: "2 credits" },
              { icon: "♾️", label: "No Expiry", cost: "ever" },
              { icon: "💳", label: "One-time Payment", cost: "no subs" },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-white border border-[--color-border] rounded-xl p-3 text-center"
              >
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="type-body-sm font-medium text-[--color-text-primary]">
                  {item.label}
                </div>
                <div className="type-meta text-[--color-text-tertiary]">{item.cost}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Error banner ── */}
        {error && (
          <div className="max-w-5xl mx-auto px-4 mb-6">
            <div className="bg-[--color-error-light] border border-[--color-error] text-[--color-error] px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          </div>
        )}

        {/* ── Pricing Cards ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {PACKAGES.map((pkg) => (
            <motion.div
              key={pkg.id}
              variants={cardVariants}
              className="relative bg-white border rounded-2xl flex flex-col overflow-hidden transition-shadow duration-250 hover:shadow-[--shadow-lg]"
              style={{
                borderColor: pkg.highlight ? pkg.color : "var(--color-border)",
                boxShadow: pkg.highlight
                  ? `0 0 0 2px ${pkg.color}, var(--shadow-md)`
                  : undefined,
              }}
            >
              {/* Best value badge */}
              {pkg.badge && (
                <div
                  className="absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white rounded-bl-xl rounded-tr-xl"
                  style={{ backgroundColor: pkg.color }}
                >
                  {pkg.badge}
                </div>
              )}

              {/* Top color accent bar */}
              <div className="h-1.5 w-full" style={{ backgroundColor: pkg.color }} />

              {/* Card body */}
              <div className="p-6 flex flex-col flex-1">
                {/* Label */}
                <span
                  className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 w-fit"
                  style={{
                    backgroundColor: pkg.colorLight,
                    color: pkg.colorDark,
                  }}
                >
                  {pkg.label}
                </span>

                {/* Price */}
                <div className="mb-1 flex items-end gap-1">
                  <span className="font-[--font-mono] text-4xl font-bold text-[--color-text-primary]">
                    ${pkg.price}
                  </span>
                  <span className="type-meta text-[--color-text-tertiary] mb-1.5">one-time</span>
                </div>

                {/* Credits */}
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg mb-4 w-fit"
                  style={{ backgroundColor: pkg.colorLight }}
                >
                  <span
                    className="font-[--font-mono] text-xl font-bold"
                    style={{ color: pkg.color }}
                  >
                    {pkg.credits}
                  </span>
                  <span className="type-body-sm font-medium" style={{ color: pkg.colorDark }}>
                    credits
                  </span>
                  <span className="type-meta text-[--color-text-tertiary]">
                    (${pkg.perCredit}/ea)
                  </span>
                </div>

                {/* Description */}
                <p className="type-body-sm text-[--color-text-secondary] mb-5 flex-1">
                  {pkg.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <svg
                        className="w-4 h-4 shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        style={{ color: pkg.color }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="type-body-sm text-[--color-text-secondary]">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  id={`buy-${pkg.id}`}
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={loadingId !== null}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold font-[--font-ui] text-white transition-all duration-150 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: loadingId === pkg.id ? pkg.colorDark : pkg.color,
                  }}
                >
                  {loadingId === pkg.id ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Redirecting…
                    </>
                  ) : (
                    <>
                      {!user ? "Sign in to Buy" : `Get ${pkg.credits} Credits`}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Trust footer ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="text-center mt-12 flex flex-col items-center gap-2"
        >
          <div className="flex items-center gap-2 text-[--color-text-tertiary] type-meta">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            Payments secured by Stripe · No recurring charges
          </div>
          <p className="type-meta text-[--color-text-tertiary]">
            Credits are non-expiring. Refund policy available on request.
          </p>
        </motion.div>
      </div>
    </PageTransition>
  );
}
