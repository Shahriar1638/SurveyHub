import { motion } from "motion/react";

/**
 * Stat / KPI Card — DESIGN_Prompt.md §"Stat / KPI Card"
 * Icon container: accent-light bg, accent-dark icon
 * Value: JetBrains Mono, text-3xl
 * Delta: mono font, semantic color
 * Hover: subtle lift + shadow
 */
export function StatCard({
  title,
  value,
  delta,
  deltaType = "positive", // "positive" | "negative" | "neutral"
  icon: Icon,
}) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 8px 24px -6px rgba(0,0,0,0.10)" }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <div
        className="h-full flex flex-col gap-3 p-5 rounded-xl border bg-white"
        style={{
          borderColor: "var(--color-border)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        {/* Top row: label + icon */}
        <div className="flex items-center justify-between">
          <span
            className="text-[13px] font-medium font-[--font-ui]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {title}
          </span>
          {Icon && (
            <motion.div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: "var(--color-accent-light)" }}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.15 }}
            >
              <Icon className="w-5 h-5" style={{ color: "var(--color-accent-dark)" }} />
            </motion.div>
          )}
        </div>

        {/* Value — JetBrains Mono, no exceptions */}
        <div
          className="font-[--font-mono] text-[2rem] font-medium leading-none"
          style={{ color: "var(--color-text-primary)" }}
        >
          {value}
        </div>

        {/* Delta row */}
        {delta && (
          <div className="flex items-center gap-1.5 text-[11px] font-[--font-mono]">
            <span
              style={{
                color:
                  deltaType === "positive"
                    ? "var(--color-success)"
                    : deltaType === "negative"
                      ? "var(--color-error)"
                      : "var(--color-text-tertiary)",
              }}
            >
              {delta}
            </span>
            <span
              className="font-[--font-ui]"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              vs last period
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
