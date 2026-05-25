import { useCallback } from "react";

export default function CheckboxQuestion({ question, value, onChange, disabled }) {
  const selectedValues = Array.isArray(value) ? value : [];

  const toggle = useCallback(
    (opt) => {
      const next = selectedValues.includes(opt)
        ? selectedValues.filter((v) => v !== opt)
        : [...selectedValues, opt];
      onChange(question.id, next);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [question.id, onChange, JSON.stringify(selectedValues)]
  );

  return (
    <div className="flex flex-col gap-2">
      {question.options.map((opt) => {
        const isSelected = selectedValues.includes(opt);
        return (
          <label
            key={opt}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-150 cursor-pointer select-none ${
              isSelected
                ? "bg-[--color-visitor-light] border-[--color-visitor]"
                : "border-[--color-border] hover:border-[--color-border-strong] hover:bg-[--color-bg-subtle]"
            } ${disabled ? "opacity-60 pointer-events-none" : ""}`}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => !disabled && toggle(opt)}
              className="sr-only"
              aria-checked={isSelected}
            />

            <span
              className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-all duration-150 ${
                isSelected ? "bg-[--color-visitor] border-[--color-visitor]" : "border-[--color-border-strong] bg-transparent"
              }`}
            >
              {isSelected && (
                <svg
                  className="w-2.5 h-2.5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>

            <span className="type-body-sm text-[--color-text-primary]">{opt}</span>
          </label>
        );
      })}
    </div>
  );
}
