export default function CheckboxQuestion({
  question,
  value,
  onChange,
  disabled,
}) {
  const selectedValues = Array.isArray(value) ? value : [];

  const toggle = (opt) => {
    const next = selectedValues.includes(opt)
      ? selectedValues.filter((v) => v !== opt)
      : [...selectedValues, opt];
    onChange(question.id, next);
  };

  return (
    <div className="flex flex-col gap-2">
      {question.options.map((opt) => {
        const isSelected = selectedValues.includes(opt);
        return (
          <div
            key={opt}
            onClick={() => !disabled && toggle(opt)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all duration-150 ${
              isSelected
                ? ""
                : "border-[--color-border] hover:border-[--color-border-strong] hover:bg-[--color-bg-subtle]"
            } ${disabled ? "opacity-60 pointer-events-none" : ""}`}
            style={
              isSelected
                ? {
                    borderColor: "var(--color-visitor)",
                    backgroundColor: "var(--color-visitor-light)",
                  }
                : {}
            }
          >
            <div
              className="w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-all duration-150"
              style={
                isSelected
                  ? {
                      backgroundColor: "var(--color-visitor)",
                      borderColor: "var(--color-visitor)",
                    }
                  : {
                      borderColor: "var(--color-border-strong)",
                    }
              }
            >
              {isSelected && (
                <svg
                  className="w-2.5 h-2.5 text-white animate-scale-in"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            <span className="type-body-sm text-[--color-text-primary]">
              {opt}
            </span>
          </div>
        );
      })}
    </div>
  );
}
