export default function ShortAnswer({ question, value, onChange, disabled }) {
  return (
    <input
      type="text"
      disabled={disabled}
      placeholder="Your answer…"
      value={value || ""}
      onChange={(e) => onChange(question.id, e.target.value)}
      className="form-input w-full"
    />
  );
}
