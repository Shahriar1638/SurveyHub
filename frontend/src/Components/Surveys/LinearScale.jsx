export default function LinearScale({ question, value, onChange, disabled, labelMin = "Not at all", labelMax = "Extremely" }) {
  const min = parseInt(question.options?.[0]) || 1;
  const max = parseInt(question.options?.[1]) || 5;
  return (
    <div className="space-y-3">
      <div className="flex justify-between type-meta text-[--color-text-tertiary]">
        <span>{labelMin}</span>
        <span>{labelMax}</span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: max - min + 1 }, (_, i) => i + min).map((n) => (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => onChange(question.id, n)}
            className={`w-10 h-10 rounded-lg text-sm font-semibold border-2 transition-all duration-150 ${
              value === n
                ? "bg-[--color-visitor] border-[--color-visitor] text-white"
                : "border-[--color-border] text-[--color-text-secondary] hover:border-[--color-visitor] hover:bg-[--color-visitor-light]"
            } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
