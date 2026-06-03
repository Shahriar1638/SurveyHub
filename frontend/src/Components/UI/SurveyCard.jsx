import { Card } from "./Card";

export function SurveyCard({
  title,
  category,
  participantCount,
  status,
  author,
  actionButton,
  timeAgo,
}) {
  let statusColor = "var(--color-bg-inset)";
  let statusBadge = "badge-draft";
  let statusText = "Draft";

  if (status === "published") {
    statusColor = "var(--color-success)";
    statusBadge = "badge-published";
    statusText = "Published";
  } else if (status === "pending") {
    statusColor = "var(--color-warning)";
    statusBadge = "badge-pending";
    statusText = "Pending";
  }

  return (
    <Card hover className="overflow-hidden flex flex-col h-full relative">
      {status && (
        // use design-system band classes instead of inline styles
        <div className={`absolute top-0 left-0 w-full h-1 survey-card-band ${statusBadge}`} />
      )}

      <div className="p-5 flex-1 flex flex-col">
        {category && (
          <div className="mb-2">
            <span className="badge" style={{ backgroundColor: "var(--color-bg-subtle)", color: "var(--color-text-secondary)" }}>{category}</span>
          </div>
        )}

        <h3 className="type-heading-sm line-clamp-2 mb-2 text-[--color-text-primary]">
          {title}
        </h3>

        <div className="mt-auto pt-3 flex items-center text-[--color-text-tertiary] type-meta">
          <span>{participantCount} responses</span>
          {timeAgo && (
            <>
              <span className="mx-2">•</span>
              <span>{timeAgo}</span>
            </>
          )}
        </div>
      </div>

      {(author || actionButton) && (
        <div className="px-5 pb-5 flex justify-between items-center border-t border-[--color-border] mt-auto pt-4">
          <div className="flex items-center gap-2">
            {author && (
              <>
                <div className="w-6 h-6 rounded-full bg-[--color-bg-subtle] overflow-hidden">
                  {author.avatar && (
                    <img
                      src={author.avatar}
                      alt={author.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <span className="text-sm font-[--font-ui] font-medium text-[--color-text-secondary]">
                  {author.name}
                </span>
              </>
            )}
          </div>
          {actionButton && <div>{actionButton}</div>}
        </div>
      )}
    </Card>
  );
}
