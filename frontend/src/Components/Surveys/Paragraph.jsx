export default function Paragraph({ question, value, onChange, disabled }) {
  return (
    <textarea
      rows={4}
      disabled={disabled}
      placeholder="Your answer…"
      value={value || ""}
      onChange={(e) => onChange(question.id, e.target.value)}
      className="form-input resize-none w-full"
    />
  );
}
