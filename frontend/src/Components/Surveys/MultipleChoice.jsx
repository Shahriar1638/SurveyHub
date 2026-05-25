export default function MultipleChoice({ question, value, onChange, disabled }) {
  const name = `mc-${question.id}`;
  return (
    <div className="flex flex-col gap-2">
      {question.options.map((opt) => (
        <label
          key={opt}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-150 cursor-pointer select-none ${
            value === opt
              ? "bg-[--color-visitor-light] border-[--color-visitor]"
              : "border-[--color-border] hover:border-[--color-border-strong] hover:bg-[--color-bg-subtle]"
          } ${disabled ? "opacity-60 pointer-events-none" : ""}`}
        >
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={() => !disabled && onChange(question.id, opt)}
            className="sr-only"
            aria-checked={value === opt}
          />

          <span
            className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
              value === opt ? "border-[--color-visitor] bg-[--color-visitor]" : "border-[--color-border-strong] bg-transparent"
            }`}
          >
            {value === opt && <span className="w-2 h-2 rounded-full bg-white" />}
          </span>

          <span className="type-body-sm text-[--color-text-primary]">{opt}</span>
        </label>
      ))}
    </div>
  );
}
