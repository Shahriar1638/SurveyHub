import { Card, CardBody } from "./Card";

/**
 * Stat / KPI Card — DESIGN_Prompt.md §"Stat / KPI Card"
 * Icon container: accent-light bg, accent-dark icon
 * Value: JetBrains Mono, text-3xl
 * Delta: mono font, semantic color
 */
export function StatCard({
  title,
  value,
  delta,
  deltaType = "positive", // "positive" | "negative" | "neutral"
  icon: Icon,
}) {
  return (
    <Card hover className="h-full">
      <CardBody className="flex flex-col gap-3 p-5 h-full justify-between">
        {/* Top row: label + icon */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium font-[--font-ui] text-[--color-text-secondary]">
            {title}
          </span>
          {Icon && (
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "var(--color-accent-light)" }}
            >
              <Icon className="w-5 h-5" style={{ color: "var(--color-accent-dark)" }} />
            </div>
          )}
        </div>

        {/* Value — JetBrains Mono, no exceptions */}
        <div className="font-[--font-mono] text-3xl font-medium text-[--color-text-primary]">
          {value}
        </div>

        {/* Delta row */}
        {delta && (
          <div className="flex items-center gap-1.5 text-xs font-[--font-mono]">
            <span
              className={
                deltaType === "positive"
                  ? "text-[--color-success]"
                  : deltaType === "negative"
                    ? "text-[--color-error]"
                    : "text-[--color-text-tertiary]"
              }
            >
              {delta}
            </span>
            <span className="text-[--color-text-tertiary] font-[--font-ui]">
              vs last period
            </span>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
