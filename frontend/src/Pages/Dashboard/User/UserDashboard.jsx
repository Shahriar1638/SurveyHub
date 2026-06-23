import { useContext } from "react";
import { Link, useLocation } from "react-router";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import { motion } from "motion/react";
import { AuthContext } from "../../../Firebase_AuthProvider/AuthProvider";
import useProfile from "../../../Hooks/useProfile";
import { PageTransition } from "../../../Components/UI/PageTransition";

const headerVariants = {
  hidden: { opacity: 0, y: -8 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

export default function UserDashboard({ children }) {
  const { user } = useContext(AuthContext);
  const { data: profile } = useProfile();
  const location = useLocation();
  const activeSection = location.pathname.split("/").pop();

  const firstName = (profile?.name || user?.displayName || "Member").split(" ")[0];

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
              backgroundColor: "var(--color-bg-subtle)",
              color: "var(--color-text-secondary)",
              border: "1px solid var(--color-border)",
            }}
          >
            Member Dashboard
          </span>

          {/* Title */}
          <h1
            className="font-heading font-bold text-[28px] leading-tight tracking-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            Hey, {firstName}!
          </h1>

          {/* Subtitle */}
          <p
            className="mt-1.5 text-sm leading-relaxed max-w-lg"
            style={{ color: "var(--color-text-secondary)", fontFamily: "var(--font-body)" }}
          >
            Track your participation, rewards, and support tickets — all in one place.
          </p>
        </div>

        {activeSection === "overview" && (
          <Link
            to="/dashboard/participation"
            className="btn btn-primary btn-md flex items-center gap-2 shrink-0 self-start sm:self-end"
          >
            <ClipboardDocumentListIcon className="w-4 h-4" />
            View History
          </Link>
        )}
      </motion.div>

      {/* ── Divider ── */}
      <div className="mb-8 h-px" style={{ backgroundColor: "var(--color-border)" }} />

      {children}
    </PageTransition>
  );
}
