import { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  PlusIcon,
  TrashIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";
import { AuthContext } from "../../../Firebase_AuthProvider/AuthProvider";
import { useCreateSurvey } from "../../../Hooks/useSurveysMutation";
import { PageTransition } from "../../../Components/UI/PageTransition";
import Swal from "sweetalert2";

const QUESTION_TYPES = [
  { value: "short_answer", label: "Short Answer" },
  { value: "paragraph", label: "Paragraph" },
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "checkbox", label: "Checkbox" },
  { value: "linear_scale", label: "Linear Scale" },
];

const CATEGORIES = [
  "Technology", "Health", "Education", "Market Research",
  "Customer Satisfaction", "Employee Engagement", "Social Science",
  "Product Feedback", "Other",
];

function emptyQuestion() {
  return {
    id: crypto.randomUUID(),
    label: "",
    type: "short_answer",
    options: [],
    required: false,
  };
}

// ── Question Editor Modal ────────────────────────────────────────────────────
function QuestionEditor({ question, onSave, onCancel }) {
  const [label, setLabel] = useState(question.label);
  const [type, setType] = useState(question.type);
  const [options, setOptions] = useState(question.options.length > 0 ? [...question.options] : [""]);
  const [required, setRequired] = useState(question.required);

  const needsOptions = type === "multiple_choice" || type === "checkbox";

  const handleAddOption = () => setOptions([...options, ""]);
  const handleRemoveOption = (idx) => setOptions(options.filter((_, i) => i !== idx));
  const handleOptionChange = (idx, val) => {
    const next = [...options];
    next[idx] = val;
    setOptions(next);
  };

  const handleSave = () => {
    if (!label.trim()) return;
    onSave({
      ...question,
      label: label.trim(),
      type,
      options: needsOptions ? options.filter((o) => o.trim()) : [],
      required,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 bg-[--color-bg-surface] rounded-2xl shadow-[--shadow-xl] w-full max-w-lg max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[--color-border]">
          <h3 className="type-heading-sm text-[--color-text-primary]">Edit Question</h3>
          <button onClick={onCancel} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[--color-bg-subtle] transition-colors">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex flex-col gap-4">
          <div>
            <label className="form-label">Question Text <span className="text-[--color-error]">*</span></label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. How satisfied are you with our service?"
              className="form-input"
              autoFocus
            />
          </div>

          <div>
            <label className="form-label">Question Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="form-input">
              {QUESTION_TYPES.map((qt) => (
                <option key={qt.value} value={qt.value}>{qt.label}</option>
              ))}
            </select>
          </div>

          {needsOptions && (
            <div>
              <label className="form-label">Options</label>
              <div className="flex flex-col gap-2">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Option ${idx + 1}`}
                      className="form-input flex-1"
                    />
                    {options.length > 1 && (
                      <button onClick={() => handleRemoveOption(idx)} className="p-1.5 rounded-md hover:bg-[--color-admin-light] text-[--color-text-tertiary] hover:text-[--color-admin] transition-colors">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={handleAddOption} className="mt-2 text-xs font-medium text-[--color-surveyor] hover:text-[--color-surveyor-dark] flex items-center gap-1 transition-colors">
                <PlusIcon className="w-3.5 h-3.5" />
                Add Option
              </button>
            </div>
          )}

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={required}
              onChange={(e) => setRequired(e.target.checked)}
              className="w-4 h-4 rounded border-[--color-border] text-[--color-surveyor] focus:ring-[--color-surveyor]/30"
            />
            <span className="type-body-sm text-[--color-text-primary]">Required</span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[--color-border]">
          <button onClick={onCancel} className="btn btn-secondary btn-sm">Cancel</button>
          <button onClick={handleSave} disabled={!label.trim()} className="btn btn-surveyor btn-sm text-white disabled:opacity-50">
            Save Question
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Question Preview (right panel) ───────────────────────────────────────────
function QuestionPreview({ question, index }) {
  return (
    <div className="question-card">
      <div className="flex items-start gap-2 mb-3">
        <span className="type-meta text-[--color-text-tertiary] font-[--font-mono] shrink-0 mt-0.5">
          Q{index + 1}
        </span>
        <div className="flex-1">
          <p className="type-body-base font-medium text-[--color-text-primary] leading-snug">
            {question.label || <span className="italic text-[--color-text-tertiary]">Untitled question</span>}
            {question.required && <span className="text-[--color-error] ml-1">*</span>}
          </p>
          <span className="type-meta text-[--color-text-tertiary] mt-1 block capitalize">
            {question.type.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {(question.type === "multiple_choice" || question.type === "checkbox") && question.options.length > 0 && (
        <div className="ml-6 flex flex-col gap-2 mt-3">
          {question.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-${question.type === "checkbox" ? "md" : "full"} border border-[--color-border-strong] shrink-0`} />
              <span className="type-body-sm text-[--color-text-secondary]">{opt}</span>
            </div>
          ))}
        </div>
      )}

      {question.type === "linear_scale" && (
        <div className="ml-6 flex items-center gap-2 mt-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="w-9 h-9 rounded-lg border border-[--color-border] flex items-center justify-center text-sm font-medium text-[--color-text-tertiary]">
              {n}
            </div>
          ))}
        </div>
      )}

      {(question.type === "short_answer" || question.type === "paragraph") && (
        <div className="ml-6 mt-3">
          <div className={`w-full ${question.type === "paragraph" ? "h-20" : "h-10"} rounded-lg border border-[--color-border] bg-[--color-bg-inset]`} />
        </div>
      )}
    </div>
  );
}

// ── Main CreateSurvey ────────────────────────────────────────────────────────
export default function CreateSurvey() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const createMutation = useCreateSurvey();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [useCase, setUseCase] = useState("");
  const [category, setCategory] = useState("");
  const [deadline, setDeadline] = useState("");
  const [image, setImage] = useState("");
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [savedIndicator, setSavedIndicator] = useState(false);

  const canPublish = title.trim() && deadline && questions.length > 0 && questions.every((q) => q.label.trim());

  // Ctrl+S / Cmd+S
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSaveDraft();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [title, description, useCase, category, deadline, image, questions]);

  const showSavedIndicator = useCallback(() => {
    setSavedIndicator(true);
    setTimeout(() => setSavedIndicator(false), 2500);
  }, []);

  const buildPayload = useCallback((status) => ({
    title,
    description: description || undefined,
    useCase: useCase || undefined,
    category: category || undefined,
    deadline,
    image: image || undefined,
    questions: questions.map(({ id, label, type, options, required }) => ({
      id, label, type, options, required,
    })),
    status,
  }), [title, description, useCase, category, deadline, image, questions]);

  const handleSaveDraft = useCallback(async () => {
    if (!title.trim()) {
      Swal.fire({ icon: "warning", title: "Title required", text: "Please enter a survey title before saving.", confirmButtonColor: "var(--color-surveyor)" });
      return;
    }
    if (!deadline) {
      Swal.fire({ icon: "warning", title: "Deadline required", text: "Please set a deadline before saving.", confirmButtonColor: "var(--color-surveyor)" });
      return;
    }
    try {
      await createMutation.mutateAsync(buildPayload("draft"));
      showSavedIndicator();
      Swal.fire({ icon: "success", title: "Draft Saved", timer: 2000, showConfirmButton: false, position: "top-end", toast: true, background: "var(--color-bg-surface)", color: "var(--color-text-primary)" });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Save Failed", text: err?.response?.data?.message || "Could not save draft.", confirmButtonColor: "var(--color-admin)" });
    }
  }, [title, deadline, buildPayload, createMutation, showSavedIndicator]);

  const handlePublish = useCallback(async () => {
    if (!canPublish) return;
    const result = await Swal.fire({
      title: "Publish Survey?",
      html: `<p>You're about to publish <strong>${title}</strong> with ${questions.length} question${questions.length > 1 ? "s" : ""}.</p>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Publish",
      cancelButtonText: "Cancel",
      confirmButtonColor: "var(--color-surveyor)",
    });
    if (!result.isConfirmed) return;

    try {
      await createMutation.mutateAsync(buildPayload("published"));
      Swal.fire({ icon: "success", title: "Survey Published!", timer: 2000, showConfirmButton: false, position: "top-end", toast: true, background: "var(--color-bg-surface)", color: "var(--color-text-primary)" });
      navigate("/dashboard/surveys");
    } catch (err) {
      Swal.fire({ icon: "error", title: "Publish Failed", text: err?.response?.data?.message || "Could not publish survey.", confirmButtonColor: "var(--color-admin)" });
    }
  }, [canPublish, title, questions, buildPayload, createMutation, navigate]);

  const handleAddQuestion = () => {
    setEditingQuestion(emptyQuestion());
  };

  const handleEditQuestion = (idx) => {
    setEditingQuestion({ ...questions[idx], _idx: idx });
  };

  const handleSaveQuestion = (q) => {
    if (editingQuestion._idx !== undefined) {
      const next = [...questions];
      next[editingQuestion._idx] = { ...q };
      setQuestions(next);
    } else {
      setQuestions([...questions, q]);
    }
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (idx) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleMoveQuestion = (idx, dir) => {
    const next = [...questions];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setQuestions(next);
  };

  return (
    <PageTransition>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* ── Left Panel ── */}
        <div className="w-80 border-r border-[--color-border] bg-[--color-bg-surface] flex flex-col shrink-0">
          <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
            {/* Meta fields */}
            <div className="flex flex-col gap-4">
              <div>
                <label className="form-label">Title <span className="text-[--color-error]">*</span></label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Survey title" className="form-input" />
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description (optional)" rows={3} className="form-input resize-none" />
              </div>
              <div>
                <label className="form-label">Use Case</label>
                <input type="text" value={useCase} onChange={(e) => setUseCase(e.target.value)} placeholder="Max 20 words" className="form-input" />
                <p className="form-helper">{useCase ? useCase.trim().split(/\s+/).length : 0}/20 words</p>
              </div>
              <div>
                <label className="form-label">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-input">
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Deadline <span className="text-[--color-error]">*</span></label>
                <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="form-input" />
              </div>
              <div>
                <label className="form-label">Cover Image URL</label>
                <input type="url" value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://..." className="form-input" />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[--color-border]" />

            {/* Question List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="type-label-sm text-[--color-text-primary]">Questions ({questions.length})</h3>
              </div>
              <div className="flex flex-col gap-2">
                {questions.map((q, idx) => (
                  <motion.div
                    key={q.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center gap-2 p-3 rounded-lg border border-[--color-border] bg-white hover:shadow-[--shadow-sm] transition-shadow group cursor-pointer"
                    onClick={() => handleEditQuestion(idx)}
                  >
                    <span className="type-meta text-[--color-text-tertiary] font-[--font-mono] shrink-0">
                      {idx + 1}.
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="type-body-sm text-[--color-text-primary] truncate">
                        {q.label || <span className="italic text-[--color-text-tertiary]">Untitled</span>}
                      </p>
                      <p className="type-meta text-[--color-text-tertiary] capitalize">{q.type.replace(/_/g, " ")}</p>
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={(e) => { e.stopPropagation(); handleMoveQuestion(idx, -1); }} className="p-1 rounded hover:bg-[--color-bg-subtle] text-[--color-text-tertiary]" disabled={idx === 0}>
                        <ArrowUpIcon className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleMoveQuestion(idx, 1); }} className="p-1 rounded hover:bg-[--color-bg-subtle] text-[--color-text-tertiary]" disabled={idx === questions.length - 1}>
                        <ArrowDownIcon className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteQuestion(idx); }} className="p-1 rounded hover:bg-[--color-admin-light] text-[--color-text-tertiary] hover:text-[--color-admin]">
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
              <button onClick={handleAddQuestion} className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-[--color-surveyor] text-[--color-surveyor] text-sm font-medium hover:bg-[--color-surveyor-light] transition-colors">
                <PlusIcon className="w-4 h-4" />
                Add Question
              </button>
            </div>
          </div>
        </div>

        {/* ── Right Panel (Preview) ── */}
        <div className="flex-1 flex flex-col bg-[--color-bg-base]">
          {/* Preview header */}
          <div className="px-8 py-4 border-b border-[--color-border] bg-[--color-bg-surface]">
            <div className="flex items-center justify-between">
              <h2 className="type-heading-sm text-[--color-text-primary]">Live Preview</h2>
              <AnimatePresence>
                {savedIndicator && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-[--color-success] bg-[--color-success-light]"
                  >
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                    Draft saved
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Preview content */}
          <div className="flex-1 overflow-y-auto px-8 py-8">
            <div className="max-w-2xl mx-auto">
              {title && (
                <h1 className="type-heading-xl text-[--color-text-primary] mb-2">{title}</h1>
              )}
              {description && (
                <p className="type-body-base text-[--color-text-secondary] mb-4">{description}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {category && <span className="badge badge-surveyor">{category}</span>}
                {deadline && <span className="badge bg-[--color-bg-inset] text-[--color-text-secondary]">Due {deadline}</span>}
              </div>

              {questions.length === 0 ? (
                <div className="text-center py-16">
                  <p className="type-body-sm text-[--color-text-tertiary]">Add questions to see a preview here.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {questions.map((q, idx) => (
                    <QuestionPreview key={q.id} question={q} index={idx} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom action bar */}
          <div className="px-8 py-4 border-t border-[--color-border] bg-[--color-bg-surface] flex items-center justify-between">
            <button
              onClick={handleSaveDraft}
              disabled={createMutation.isPending}
              className="btn btn-secondary btn-md flex items-center gap-2 disabled:opacity-50"
            >
              {createMutation.isPending ? (
                <>
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-[--color-text-tertiary]/30 border-t-[--color-text-primary] rounded-full block" />
                  Saving…
                </>
              ) : (
                <>
                  Save Draft
                  <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono border border-[--color-border] text-[--color-text-tertiary]">Ctrl+S</kbd>
                </>
              )}
            </button>
            <button
              onClick={handlePublish}
              disabled={!canPublish || createMutation.isPending}
              className="btn btn-surveyor btn-md text-white flex items-center gap-2 disabled:opacity-50"
            >
              Publish Survey
            </button>
          </div>
        </div>

        {/* Question Editor Modal */}
        <AnimatePresence>
          {editingQuestion && (
            <QuestionEditor
              question={editingQuestion}
              onSave={handleSaveQuestion}
              onCancel={() => setEditingQuestion(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
