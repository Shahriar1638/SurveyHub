export default function MultipleChoice({ question, value, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-2">
      {question.options.map((opt) => (
        <div
          key={opt}
          onClick={() => !disabled && onChange(question.id, opt)}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all duration-150 ${
            value === opt
              ? "border-[--color-visitor] bg-[--color-visitor-light]"
              : "border-[--color-border] hover:border-[--color-border-strong] hover:bg-[--color-bg-subtle]"
          } ${disabled ? "opacity-60 pointer-events-none" : ""}`}
        >
          <div
            className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
              value === opt
                ? "border-[--color-visitor]"
                : "border-[--color-border-strong]"
            }`}
          >
            {value === opt && (
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: "var(--color-visitor)" }}
              />
            )}
          </div>
          <span className="type-body-sm text-[--color-text-primary]">
            {opt}
          </span>
        </div>
      ))}
    </div>
  );
}
