export default function MultipleChoice({ question, value, onChange, disabled }) {
  const name = `mc-${question.id}`;
  return (
    <div className="flex flex-col gap-2">
      {question.options.map((opt) => {
        const isSelected = value === opt;
        return (
          <label
            key={opt}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-150 cursor-pointer select-none ${
              isSelected
                ? "bg-visitor-light border-visitor"
                : "border-border hover:border-border-strong hover:bg-bg-subtle"
            } ${disabled ? "opacity-60 pointer-events-none" : ""}`}
          >
            <input
              type="radio"
              name={name}
              value={opt}
              checked={isSelected}
              onChange={() => !disabled && onChange(question.id, opt)}
              className="sr-only"
              aria-checked={isSelected}
            />

            <span
              className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-150 ${
                isSelected ? "border-visitor bg-visitor" : "border-text-tertiary bg-transparent"
              }`}
            >
              {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
            </span>

            <span className="type-body-sm text-text-primary">{opt}</span>
          </label>
        );
      })}
    </div>
  );
}
