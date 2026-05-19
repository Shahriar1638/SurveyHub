import ShortAnswer from "./ShortAnswer";
import Paragraph from "./Paragraph";
import MultipleChoice from "./MultipleChoice";
import CheckboxQuestion from "./CheckboxQuestion";
import LinearScale from "./LinearScale";

export default function QuestionRenderer({ question, value, onChange, disabled }) {
  const props = { question, value, onChange, disabled };
  switch (question.type) {
    case "short_answer":
      return <ShortAnswer {...props} />;
    case "paragraph":
      return <Paragraph {...props} />;
    case "multiple_choice":
      return <MultipleChoice {...props} />;
    case "checkbox":
      return <CheckboxQuestion {...props} />;
    case "linear_scale":
      return <LinearScale {...props} />;
    default:
      return (
        <p className="type-meta text-[--color-text-tertiary]">
          Unknown question type
        </p>
      );
  }
}
