/* eslint-disable no-unused-vars */
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

  // Local answers state: { [questionId]: value }
  const [answers, setAnswers] = useState({});
  const [draftSaved, setDraftSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Adjust state during render to avoid cascading effect renders and extra commits
  const [prevResponseKey, setPrevResponseKey] = useState(null);
  const responseKey = existingResponse
    ? `${existingResponse._id || "temp"}:${existingResponse.status}`
    : "none";

  if (responseKey !== prevResponseKey) {
    setPrevResponseKey(responseKey);
    if (existingResponse?.answers) {
      const map = {};
      existingResponse.answers.forEach((a) => {
        map[a.questionId] = a.value;
      });
      setAnswers(map);
      setSubmitted(existingResponse.status === "submitted");
    } else {
      setAnswers({});
      setSubmitted(false);
    }
  }

  const handleChange = useCallback((questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setValidationErrors((prev) => ({ ...prev, [questionId]: false }));
    setDraftSaved(false);
  }, []);

  // Build answer payload
  const buildPayload = useCallback(
    (isDraft) => {
      const questions = survey?.questions || [];
      return questions.map((q) => ({
        questionId: q.id,
        label: q.label,
        value: answers[q.id] ?? null,
      }));
    },
    [survey, answers],
  );

  const handleSaveDraft = useCallback(async () => {
    if (!userId || !survey) return;
    try {
      await submitMutation.mutateAsync({
        userId,
        answers: buildPayload(true),
        isDraft: true,
      });
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 3000);
    } catch (e) {
      console.error("Draft save failed", e);
    }
  }, [userId, survey, buildPayload, submitMutation]);

  // Ctrl+S handler
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (!submitted && user) handleSaveDraft();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleSaveDraft, submitted, user]);

  const handleSubmit = async () => {
    if (!userId || !survey) return;

    // Validate required fields
    const errors = {};
    survey.questions.forEach((q) => {
      if (q.required) {
        const val = answers[q.id];
        if (
          val === undefined ||
          val === null ||
          val === "" ||
          (Array.isArray(val) && val.length === 0)
        ) {
          errors[q.id] = true;
        }
      }
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      // Scroll to first error
      const firstId = Object.keys(errors)[0];
      document
        .getElementById(`q-${firstId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    try {
      await submitMutation.mutateAsync({
        userId,
        answers: buildPayload(false),
        isDraft: false,
      });
      setSubmitted(true);
    } catch (e) {
      console.error("Submit failed", e);
    }
  };

  const answeredCount =
    survey?.questions?.filter((q) => {
      const v = answers[q.id];
      return (
        v !== undefined &&
        v !== null &&
        v !== "" &&
        !(Array.isArray(v) && v.length === 0)
      );
    }).length ?? 0;

  // ── Loading ──
  if (isLoading || responseLoading) {
    return (
      <PageTransition>
        <div className="container-app mx-auto px-4 py-10 max-w-3xl animate-pulse">
          <div className="h-4 w-24 bg-[--color-bg-inset] rounded mb-8" />
          <div className="h-8 w-3/4 bg-[--color-bg-inset] rounded mb-4" />
          <div className="h-4 w-1/2 bg-[--color-bg-inset] rounded mb-10" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 mb-4 space-y-3">
              <div className="h-4 w-3/4 bg-[--color-bg-inset] rounded" />
              <div className="h-10 bg-[--color-bg-inset] rounded" />
            </div>
          ))}
        </div>
      </PageTransition>
    );
  }

  if (isError || !survey) {
    return (
      <PageTransition>
        <div className="container-app mx-auto px-4 py-24 max-w-3xl text-center">
          <p className="type-body-base text-[--color-error]">
            Survey not found or unavailable.
          </p>
          <button
            onClick={() => navigate("/surveys")}
            className="btn btn-secondary btn-sm mt-4"
          >
            ← Back to Surveys
          </button>
        </div>
      </PageTransition>
    );
  }

  const isExpired = survey.status === "expired";
  const daysLeft = survey.deadline ? deadlineDaysLeft(survey.deadline) : null;
  const canRespond = user && !submitted && !isExpired;

  // ── Success screen ──
  if (submitted) {
    return (
      <PageTransition>
        <div className="container-app mx-auto px-4 py-24 max-w-2xl text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: "var(--color-success-light)" }}
          >
            <svg
              className="w-10 h-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              style={{ color: "var(--color-success)" }}
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
            Thank you for participating in <strong>{survey.title}</strong>. Your
            response has been recorded.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => navigate("/surveys")}
              className="btn btn-secondary btn-md"
            >
              ← Back to Surveys
            </button>
            <Link
              to="/blogs"
              className="btn btn-primary btn-md"
              style={{ backgroundColor: "var(--color-visitor)" }}
            >
              Explore Blogs
            </Link>
          </div>
          
          {/* Survey Feedback on Success Screen */}
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
        {/* ── Sticky header with progress ── */}
        <div className="sticky top-[64px] z-30 bg-[--color-bg-surface] border-b border-[--color-border] shadow-[--shadow-xs]">
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
                <ProgressBar
                  answered={answeredCount}
                  total={survey.questions.length}
                />
              </div>
              <span className="type-meta text-[--color-text-tertiary] shrink-0 font-[--font-mono]">
                {Math.round(
                  (answeredCount / Math.max(survey.questions.length, 1)) * 100,
                )}
                %
              </span>
            </div>
          </div>
        </div>

        {/* ── Survey hero ── */}
        <div className="bg-[--color-bg-surface] border-b border-[--color-border]">
          {survey.image && (
            <div className="h-52 overflow-hidden">
              <img
                src={survey.image}
                alt={survey.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="container-app mx-auto px-4 py-8 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {survey.category && (
                <span className="badge badge-visitor">{survey.category}</span>
              )}
              {isExpired ? (
                <span
                  className="badge"
                  style={{
                    background: "var(--color-bg-inset)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Expired
                </span>
              ) : daysLeft !== null && daysLeft <= 4 ? (
                <span
                  className="badge"
                  style={{
                    background: "var(--color-warning-light)",
                    color: "var(--color-warning)",
                  }}
                >
                  ⏳ {daysLeft === 0 ? "Ends today" : `${daysLeft}d left`}
                </span>
              ) : (
                <span
                  className="badge"
                  style={{
                    background: "var(--color-success-light)",
                    color: "var(--color-success)",
                  }}
                >
                  Active
                </span>
              )}
              <span className="type-meta text-[--color-text-tertiary] ml-auto">
                {survey.participantCount ?? 0} responses ·{" "}
                {survey.questions.length} questions
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

            {/* Status banners */}
            {isExpired && (
              <div
                className="mt-5 p-4 rounded-lg border"
                style={{
                  background: "var(--color-bg-inset)",
                  borderColor: "var(--color-border-strong)",
                }}
              >
                <p className="type-body-sm text-[--color-text-secondary]">
                  📋 This survey has closed. Responses are no longer accepted.
                </p>
              </div>
            )}
            {!user && !isExpired && (
              <div
                className="mt-5 p-4 rounded-lg border flex items-center justify-between gap-3"
                style={{
                  background: "var(--color-visitor-light)",
                  borderColor: "var(--color-visitor)",
                }}
              >
                <p
                  className="type-body-sm"
                  style={{ color: "var(--color-visitor-dark)" }}
                >
                  Sign in to participate in this survey and save your progress.
                </p>
                <Link
                  to="/login"
                  className="btn btn-sm text-white shrink-0"
                  style={{ backgroundColor: "var(--color-visitor)" }}
                >
                  Sign In
                </Link>
              </div>
            )}
            {existingResponse?.status === "draft" && !submitted && (
              <div
                className="mt-5 p-4 rounded-lg border"
                style={{
                  background: "var(--color-warning-light)",
                  borderColor: "var(--color-warning)",
                }}
              >
                <p
                  className="type-body-sm"
                  style={{ color: "var(--color-warning)" }}
                >
                  📝 You have a saved draft — your previous answers have been
                  restored.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Questions ── */}
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
                  transition={{
                    duration: 0.3,
                    delay: idx * 0.04,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={`card p-6 transition-all duration-200 ${hasError ? "ring-2 ring-[--color-error]" : ""}`}
                >
                  {/* Question label */}
                  <div className="flex items-start gap-2 mb-4">
                    <span className="type-meta text-[--color-text-tertiary] font-[--font-mono] shrink-0 mt-0.5">
                      {idx + 1}.
                    </span>
                    <div className="flex-1">
                      <p className="type-body-base font-semibold text-[--color-text-primary] leading-snug">
                        {question.label}
                        {question.required && (
                          <span className="text-[--color-error] ml-1">*</span>
                        )}
                      </p>
                      {hasError && (
                        <p className="type-meta text-[--color-error] mt-1">
                          This question is required.
                        </p>
                      )}
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

          {/* Submit / guest prompt */}
          {user && !isExpired && !submitted && (
            <div className="mt-8 flex items-center justify-end gap-3">
              <button
                onClick={handleSubmit}
                disabled={submitMutation.isPending}
                className="btn btn-lg font-semibold text-white px-8 py-3 rounded-xl flex items-center gap-2 disabled:opacity-60 transition-all"
                style={{ backgroundColor: "var(--color-visitor)" }}
              >
                {submitMutation.isPending ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 0.7,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full block"
                    />
                    Submitting…
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
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

          {/* Survey Feedback at the bottom (if logged in but not submitted, e.g. just reading or drafting) */}
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

        {/* ── Draft Save FAB (bottom-left) ── */}
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
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-white shadow-lg"
                    style={{ backgroundColor: "var(--color-success)" }}
                  >
                    ✓ Draft saved
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                onClick={handleSaveDraft}
                disabled={submitMutation.isPending}
                title="Save Draft (Ctrl+S)"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-[--shadow-lg] transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
                style={{
                  backgroundColor: "var(--color-bg-surface)",
                  border: "1.5px solid var(--color-border-strong)",
                  color: "var(--color-text-primary)",
                }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  />
                </svg>
                Save Draft
                <kbd
                  className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono border border-[--color-border]"
                  style={{ color: "var(--color-text-tertiary)" }}
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
