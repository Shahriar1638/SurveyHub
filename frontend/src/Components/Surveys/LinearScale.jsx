export default function LinearScale({ question, value, onChange, disabled }) {
  const rawMin = parseInt(question.options?.[0]) || 1;
  const rawMax = parseInt(question.options?.[1]) || 5;
  const min = Math.max(Math.min(rawMin, 10), 1);
  const max = Math.max(Math.min(rawMax, 10), min + 1);
  const labelMin = question.options?.[2] || "Not at all";
  const labelMax = question.options?.[3] || "Extremely";
  const items = question.options?.slice(4) || [];

  // scaleLabels: { "1": "Poor", "2": "Average", ... } — custom column labels
  const scaleLabels = question.scaleLabels || {};
  const hasScaleLabels = Object.keys(scaleLabels).length > 0;

  const isMatrix = items.length > 0;
  const ratings = Array.from({ length: max - min + 1 }, (_, i) => i + min);

  // Matrix mode — value is an object { itemIndex: rating }
  if (isMatrix) {
    const matrixValue = value || {};

    const handleItemClick = (itemIdx, rating) => {
      const next = { ...matrixValue, [itemIdx]: rating };
      onChange(question.id, next);
    };

    return (
      <div className="space-y-3 overflow-x-auto">
        {/* Header row — ratings with optional labels */}
        <div className="flex items-end gap-0 min-w-max">
          <div className="w-40 shrink-0" />
          {ratings.map((n) => (
            <div key={n} className="w-14 text-center">
              <div className="type-meta text-[--color-text-tertiary] font-[--font-mono]">
                {n}
              </div>
              {hasScaleLabels && scaleLabels[String(n)] && (
                <div className="type-meta text-[--color-text-secondary] text-[10px] leading-tight mt-0.5">
                  {scaleLabels[String(n)]}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Labels row */}
        <div className="flex items-center gap-0 min-w-max">
          <div className="w-40 shrink-0" />
          <div className="flex-1 flex justify-between px-1">
            <span className="type-meta text-[--color-text-tertiary]">{labelMin}</span>
            <span className="type-meta text-[--color-text-tertiary]">{labelMax}</span>
          </div>
        </div>

        {/* Item rows */}
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-0 min-w-max">
            <div className="w-40 shrink-0 type-body-sm text-[--color-text-primary] pr-3 truncate" title={item}>
              {item}
            </div>
            {ratings.map((n) => (
              <button
                key={n}
                type="button"
                disabled={disabled}
                onClick={() => handleItemClick(idx, n)}
                className={`w-14 h-10 rounded-lg text-sm font-semibold border-2 transition-all duration-150 mx-0.5 ${
                  matrixValue[idx] === n
                    ? "bg-accent border-accent text-white"
                    : "border-border text-text-secondary hover:border-accent hover:bg-accent-light"
                } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {hasScaleLabels && scaleLabels[String(n)] ? scaleLabels[String(n)] : n}
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Simple mode — single value
  return (
    <div className="space-y-3">
      <div className="flex justify-between type-meta text-[--color-text-tertiary]">
        <span>{labelMin}</span>
        <span>{labelMax}</span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {ratings.map((n) => (
          <div key={n} className="flex flex-col items-center gap-1">
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange(question.id, n)}
              className={`w-10 h-10 rounded-lg text-sm font-semibold border-2 transition-all duration-150 ${
                value === n
                  ? "bg-accent border-accent text-white"
                  : "border-border text-text-secondary hover:border-accent hover:bg-accent-light"
              } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {hasScaleLabels && scaleLabels[String(n)] ? scaleLabels[String(n)] : n}
            </button>
            {hasScaleLabels && scaleLabels[String(n)] && (
              <span className="type-meta text-[--color-text-tertiary] text-[10px] leading-tight text-center">
                {scaleLabels[String(n)]}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
