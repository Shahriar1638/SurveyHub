import { useCallback, useRef } from "react";

export default function CheckboxQuestion({ question, value, onChange, disabled }) {
  const selectedValues = Array.isArray(value) ? value : [];
  const selectedRef = useRef(selectedValues);
  selectedRef.current = selectedValues;

  const toggle = useCallback(
    (opt) => {
      const next = selectedRef.current.includes(opt)
        ? selectedRef.current.filter((v) => v !== opt)
        : [...selectedRef.current, opt];
      onChange(question.id, next);
    },
    [question.id, onChange]
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
                ? "bg-visitor-light border-visitor"
                : "border-border hover:border-border-strong hover:bg-bg-subtle"
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
                isSelected ? "bg-visitor border-visitor" : "border-text-tertiary bg-transparent"
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

            <span className="type-body-sm text-text-primary">{opt}</span>
          </label>
        );
      })}
    </div>
  );
}
