import { Card, CardBody } from "./Card";

export function StatCard({
  title,
  value,
  delta,
  deltaType = "positive", // positive, negative, neutral
  icon: Icon,
  roleAccent = "surveyor", // surveyor, admin, user, visitor
}) {
  const accentLight = `var(--color-${roleAccent}-light)`;
  const accentDark = `var(--color-${roleAccent}-dark)`;

  return (
    <Card hover className="h-full">
      <CardBody className="flex flex-col gap-3 p-5 h-full justify-between">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium font-[--font-ui] text-[--color-text-secondary]">
            {title}
          </span>
          {Icon && (
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: accentLight }}
            >
              <Icon className="w-5 h-5" style={{ color: accentDark }} />
            </div>
          )}
        </div>

        {/* JetBrains Mono is used for the number as per DESIGN_v2.md */}
        <div className="font-[--font-mono] text-3xl font-medium text-[--color-text-primary]">
          {value}
        </div>

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
