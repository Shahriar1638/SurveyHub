import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router";
import { motion } from "motion/react";
import { PageTransition } from "../../Components/UI/PageTransition";
import useAxiosSecure from "../../Hooks/useAxiosSecure";

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [details, setDetails] = useState(null);

  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }
    axiosSecure
      .get(`/api/payments/verify-session/${sessionId}`)
      .then(({ data }) => {
        if (data.success) {
          setDetails(data);
          setStatus("success");
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [sessionId, axiosSecure]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-[--color-bg-base] flex items-center justify-center px-4">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4 text-[--color-text-secondary]">
            <svg className="w-10 h-10 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="type-body-base">Verifying your payment…</p>
          </div>
        )}

        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white border border-[--color-border] rounded-2xl shadow-[--shadow-xl] p-10 max-w-md w-full text-center"
          >
            {/* Checkmark */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.15 }}
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: "var(--color-success-light)" }}
            >
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                style={{ color: "var(--color-success)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>

            <h1 className="type-heading-xl text-[--color-text-primary] mb-2">
              Payment Successful!
            </h1>
            <p className="type-body-sm text-[--color-text-secondary] mb-6">
              Your account has been upgraded to{" "}
              <span className="font-semibold" style={{ color: "var(--color-accent-dark)" }}>
                Surveyor
              </span>{" "}
              and your credits have been added.
            </p>

            {details && (
              <div
                className="rounded-xl px-6 py-4 mb-6 text-center"
                style={{ backgroundColor: "var(--color-accent-light)" }}
              >
                <div
                  className="font-[--font-mono] text-4xl font-bold mb-1"
                  style={{ color: "var(--color-accent-dark)" }}
                >
                  +{details.credits ?? 0}
                </div>
                <div className="type-body-sm font-medium" style={{ color: "var(--color-accent-dark)" }}>
                  credits added to your wallet
                </div>
                <div className="type-meta text-[--color-text-tertiary] mt-1">
                  Charged ${details.amount?.toFixed(2) ?? "0.00"} USD
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Link to="/dashboard">
                <button className="btn btn-primary btn-md w-full">
                  Go to My Dashboard
                </button>
              </Link>
              <Link to="/surveys">
                <button className="btn btn-secondary btn-md w-full">
                  Explore Surveys
                </button>
              </Link>
            </div>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white border border-[--color-border] rounded-2xl shadow-[--shadow-lg] p-10 max-w-md w-full text-center"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: "var(--color-error-light)" }}
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                style={{ color: "var(--color-error)" }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="type-heading-md text-[--color-text-primary] mb-2">
              Something went wrong
            </h2>
            <p className="type-body-sm text-[--color-text-secondary] mb-6">
              We couldn't verify your payment. If you were charged, please contact support with your session ID.
            </p>
            <Link to="/pricing">
              <button className="btn btn-secondary btn-md w-full">
                ← Back to Pricing
              </button>
            </Link>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
