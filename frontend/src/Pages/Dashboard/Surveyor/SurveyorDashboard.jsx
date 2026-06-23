import { useContext } from "react";
import { Link, useLocation } from "react-router";
import { PlusIcon } from "@heroicons/react/24/outline";
import { motion } from "motion/react";
import { AuthContext } from "../../../Firebase_AuthProvider/AuthProvider";
import useProfile from "../../../Hooks/useProfile";
import { PageTransition } from "../../../Components/UI/PageTransition";

const headerVariants = {
  hidden: { opacity: 0, y: -8 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

export default function SurveyorDashboard({ children }) {
  const { user } = useContext(AuthContext);
  const { data: profile } = useProfile();
  const location = useLocation();
  const activeSection = location.pathname.split("/").pop();

  const firstName = (profile?.name || user?.displayName || "Surveyor").split(" ")[0];

  return (
    <PageTransition>
      {/* ── Page header ── */}
      <motion.div
        variants={headerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8"
      >
        <div>
          {/* Eyebrow */}
          <span
            className="inline-block mb-2.5 text-[11px] font-bold font-[--font-ui] uppercase tracking-[0.16em] px-2.5 py-1 rounded-full"
            style={{
              backgroundColor: "var(--color-accent-light)",
              color: "var(--color-accent-dark)",
            }}
          >
            Surveyor Workspace
          </span>

          {/* Title */}
          <h1 className="font-heading font-bold text-[28px] leading-tight tracking-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            Good to see you, {firstName}.
          </h1>

          {/* Subtitle */}
          <p className="mt-1.5 text-sm leading-relaxed max-w-lg"
            style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-body)" }}
          >
            Here's your insight cockpit — surveys, analytics, and audience data in one place.
          </p>
        </div>

        {activeSection === "overview" && (
          <Link
            to="/dashboard/create-survey"
            className="btn btn-primary btn-md flex items-center gap-2 shrink-0 self-start sm:self-end"
          >
            <PlusIcon className="w-4 h-4" />
            New Survey
          </Link>
        )}
      </motion.div>

      {/* ── Divider ── */}
      <div className="mb-8 h-px" style={{ backgroundColor: "var(--color-border)" }} />

      {children}
    </PageTransition>
  );
}
