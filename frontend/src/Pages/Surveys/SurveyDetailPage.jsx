import { useState, useContext, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { AuthContext } from "../../Firebase_AuthProvider/AuthProvider";
import useProfile from "../../Hooks/useProfile";
import {
  useSurveyDetail,
  useMyResponse,
  useSubmitResponse,
} from "../../Hooks/useSurveyDetail";
import { PageTransition } from "../../Components/UI/PageTransition";
import QuestionRenderer from "../../Components/Surveys/QuestionRenderer";
import SurveyFeedback from "../../Components/Surveys/SurveyFeedback";

// ── Helpers ──────────────────────────────────────────────────────────────────
function deadlineDaysLeft(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(dateStr) - today) / 86400000);
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ answered, total }) {
  const pct = total === 0 ? 0 : Math.round((answered / total) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full bg-[--color-bg-inset] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: "var(--color-visitor)" }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <span className="type-meta text-[--color-text-tertiary] font-[--font-mono] w-14 text-right">
        {answered}/{total}
      </span>
    </div>
  );
}

// ── Main SurveyDetailPage ─────────────────────────────────────────────────────
export default function SurveyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { data: profile } = useProfile();

  const userId = profile?._id || null;

  const { data: survey, isLoading, isError } = useSurveyDetail(id);
  const { data: existingResponse, isLoading: responseLoading } = useMyResponse(
    id,
    userId,
  );
  const submitMutation = useSubmitResponse(id);
  const [submitted, setSubmitted] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [answers, setAnswers] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  const isExpired = survey?.status === "expired";
  const daysLeft = survey?.deadline ? deadlineDaysLeft(survey.deadline) : null;
  const answeredCount = Object.keys(answers).length;
  const canRespond = !isExpired && existingResponse?.status !== "submitted";
  const isCreator = profile?._id === survey?.surveyorId;

  const handleChange = useCallback((questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    setValidationErrors(prev => ({ ...prev, [questionId]: null }));
  }, []);

  const handleSubmit = useCallback(async () => {
    const errors = {};
    survey?.questions?.forEach(q => {
      if (q.required && !answers[q.id]) {
        errors[q.id] = true;
      }
    });
    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await submitMutation.mutateAsync({
        userId,
        answers: Object.entries(answers).map(([questionId, value]) => ({
          questionId,
          value,
        })),
        isDraft: false,
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Submit failed:", err);
    }
  }, [answers, survey, userId, submitMutation]);

  const handleSaveDraft = useCallback(async () => {
    try {
      await submitMutation.mutateAsync({
        userId,
        answers: Object.entries(answers).map(([questionId, value]) => ({
          questionId,
          value,
        })),
        isDraft: true,
      });
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2500);
    } catch (err) {
      console.error("Save draft failed:", err);
    }
  }, [answers, userId, submitMutation]);

  // Initialize answers from existing draft
  useEffect(() => {
    if (existingResponse?.answers) {
      const initial = {};
      existingResponse.answers.forEach(a => {
        initial[a.questionId] = a.value;
      });
      setAnswers(initial);
    }
  }, [existingResponse]);

  // Redirect if expired + user participated
  useEffect(() => {
    if (survey && isExpired && existingResponse?.status === "submitted") {
      navigate(`/dashboard/surveys/${id}`, { replace: true });
    }
  }, [survey, isExpired, existingResponse, id, navigate]);

  // ── Success screen ──
  if (submitted) {
    return (
      <PageTransition>
        <div className="container-app mx-auto px-4 py-24 max-w-2xl text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-[--color-success-light]"
          >
            <svg
              className="w-10 h-10 text-[--color-success]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>
          <h1 className="type-heading-xl text-[--color-text-primary] mb-3">
            Response Submitted!
          </h1>
          <p className="type-body-base text-[--color-text-secondary] max-w-md mx-auto mb-8">
            Thank you for participating in <strong>{survey.title}</strong>. Your response has been recorded.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => navigate("/surveys")} className="btn btn-secondary btn-md">
              ← Back to Surveys
            </button>
            <Link
              to="/blogs"
              className="btn btn-primary btn-md bg-[--color-visitor] text-white hover:bg-[--color-visitor-dark]"
            >
              Explore Blogs
            </Link>
          </div>

          {user && (
            <div className="mt-12 pt-8 border-t border-[--color-border] max-w-sm mx-auto">
              <p className="type-body-sm text-[--color-text-secondary] mb-4">
                Have thoughts on this survey? Help the creator improve.
              </p>
              <SurveyFeedback surveyId={survey._id} />
            </div>
          )}
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-[--color-bg-base]">
        <div className="sticky top-16 z-30 bg-[--color-bg-surface] border-b border-[--color-border] shadow-[--shadow-xs]">
          <div className="container-app mx-auto px-4 py-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 type-meta text-[--color-text-tertiary] hover:text-[--color-text-primary] transition-colors shrink-0 group"
              >
                <svg
                  className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Surveys
              </button>
              <div className="flex-1">
                <ProgressBar answered={answeredCount} total={survey.questions.length} />
              </div>
              <span className="type-meta text-[--color-text-tertiary] shrink-0 font-[--font-mono]">
                {Math.round((answeredCount / Math.max(survey.questions.length, 1)) * 100)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[--color-bg-surface] border-b border-[--color-border]">
          {survey.image && (
            <div className="h-52 overflow-hidden">
              <img src={survey.image} alt={survey.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="container-app mx-auto px-4 py-8 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {survey.category && <span className="badge badge-visitor">{survey.category}</span>}
              {isExpired ? (
                <span className="badge bg-[--color-bg-inset] text-[--color-text-secondary]">Expired</span>
              ) : daysLeft !== null && daysLeft <= 4 ? (
                <span className="badge bg-[--color-warning-light] text-[--color-warning]">
                  ⏳ {daysLeft === 0 ? "Ends today" : `${daysLeft}d left`}
                </span>
              ) : (
                <span className="badge bg-[--color-success-light] text-[--color-success]">Active</span>
              )}
              <span className="type-meta text-[--color-text-tertiary] ml-auto">
                {survey.participantCount ?? 0} responses · {survey.questions.length} questions
              </span>
            </div>

            <h1 className="type-heading-xl text-[--color-text-primary] mb-3">
              {survey.title}
            </h1>

            {survey.description && (
              <p className="type-body-base text-[--color-text-secondary] leading-relaxed mb-3">
                {survey.description}
              </p>
            )}

            {survey.useCase && (
              <p className="type-body-sm text-[--color-text-tertiary] italic">
                Use case: {survey.useCase}
              </p>
            )}

            {isExpired && (
              <div className="mt-5 p-4 rounded-lg border bg-[--color-error-light] border-[--color-error]">
                <p className="type-body-sm font-medium text-[--color-error]">
                  {isCreator
                    ? "📊 This survey has ended. Check your dashboard for results."
                    : user
                      ? "📋 This survey has closed. Responses are no longer accepted."
                      : "📋 This survey has closed."}
                </p>
                {!user && (
                  <Link to="/login" className="mt-2 inline-block type-body-sm text-[--color-error] underline font-medium">
                    Login to participate
                  </Link>
                )}
              </div>
            )}
            {!user && !isExpired && (
              <div className="mt-5 p-4 rounded-lg border flex items-center justify-between gap-3 bg-[--color-visitor-light] border-[--color-visitor]">
                <p className="type-body-sm text-[--color-visitor-dark]">
                  Sign in to participate in this survey and save your progress.
                </p>
                <Link
                  to="/login"
                  className="btn btn-sm text-white shrink-0 bg-[--color-visitor] hover:bg-[--color-visitor-dark]"
                >
                  Sign In
                </Link>
              </div>
            )}
            {existingResponse?.status === "draft" && !submitted && (
              <div className="mt-5 p-4 rounded-lg border bg-[--color-warning-light] border-[--color-warning]">
                <p className="type-body-sm text-[--color-warning]">
                  📝 You have a saved draft — your previous answers have been restored.
                </p>
              </div>
            )}
          </div>
        </div>

        {!isExpired && (
        <div className="container-app mx-auto px-4 py-10 max-w-3xl">
          <div className="flex flex-col gap-5">
            {survey.questions.map((question, idx) => {
              const hasError = validationErrors[question.id];
              return (
                <motion.div
                  key={question.id}
                  id={`q-${question.id}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  className={`card p-6 transition-all duration-200 ${hasError ? "ring-2 ring-[--color-error]" : ""}`}
                >
                  <div className="flex items-start gap-2 mb-4">
                    <span className="type-meta text-[--color-text-tertiary] font-[--font-mono] shrink-0 mt-0.5">
                      {idx + 1}.
                    </span>
                    <div className="flex-1">
                      <p className="type-body-base font-semibold text-[--color-text-primary] leading-snug">
                        {question.label}
                        {question.required && <span className="text-[--color-error] ml-1">*</span>}
                      </p>
                      {hasError && <p className="type-meta text-[--color-error] mt-1">This question is required.</p>}
                    </div>
                  </div>

                  <QuestionRenderer
                    question={question}
                    value={answers[question.id]}
                    onChange={handleChange}
                    disabled={!canRespond && !(!user && !isExpired)}
                  />
                </motion.div>
              );
            })}
          </div>

          {user && !isExpired && !submitted && (
            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                className="btn btn-lg font-semibold text-white px-8 py-3 rounded-xl flex items-center gap-2 disabled:opacity-60 transition-all bg-[--color-visitor] hover:bg-[--color-visitor-dark]"
              >
                {submitMutation.isPending ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full block"
                    />
                    Submitting…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    Submit Response
                  </>
                )}
              </button>
            </div>
          )}

          {user && !submitted && (
            <div className="mt-12 pt-8 border-t border-[--color-border] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="type-heading-sm text-[--color-text-primary]">Survey Feedback</h4>
                <p className="type-body-sm text-[--color-text-secondary]">Share your thoughts with the creator without submitting answers.</p>
              </div>
              <SurveyFeedback surveyId={survey._id} />
            </div>
          )}
        </div>
        )}

        <AnimatePresence>
          {user && !isExpired && !submitted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-6 left-6 z-40 flex flex-col items-start gap-2"
            >
              <AnimatePresence>
                {draftSaved && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-white shadow-lg bg-[--color-success]"
                  >
                    ✓ Draft saved
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                onClick={handleSaveDraft}
                disabled={submitMutation.isPending}
                title="Save Draft (Ctrl+S)"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-[--shadow-lg] transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 bg-[--color-bg-surface] border-[1.5px] border-[--color-border-strong] text-[--color-text-primary]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  />
                </svg>
                Save Draft
                <kbd
                  className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono border border-[--color-border] text-[--color-text-tertiary]"
                >
                  Ctrl+S
                </kbd>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
