import { useState, useContext } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AuthContext } from "../../Firebase_AuthProvider/AuthProvider";
import useAxiosPublic from "../../Hooks/useAxiosPublic";

// ── Feedback type config ─────────────────────────────────────────────────────
const FEEDBACK_TYPES = [
  {
    value: "bug",
    label: "Bug Report",
    icon: "🐛",
    description: "Something isn't working correctly",
    color: "var(--color-error)",
    light: "var(--color-error-light)",
  },
  {
    value: "feature_request",
    label: "Feature Request",
    icon: "💡",
    description: "Suggest a new feature or improvement",
    color: "var(--color-warning)",
    light: "var(--color-warning-light)",
  },
  {
    value: "general",
    label: "General Feedback",
    icon: "💬",
    description: "Share your thoughts or experience",
    color: "var(--color-visitor)",
    light: "var(--color-visitor-light)",
  },
  {
    value: "complaint",
    label: "Complaint",
    icon: "🚨",
    description: "Report a serious issue or concern",
    color: "var(--color-admin)",
    light: "var(--color-admin-light)",
  },
];

// ── Affected page options ────────────────────────────────────────────────────
const AFFECTED_PAGES = [
  "Landing Page",
  "Home / Dashboard",
  "Survey Builder",
  "Survey Listing",
  "Profile Page",
  "AI Analytics",
  "Blog / Insights",
  "Pricing Page",
  "Authentication",
  "Other",
];

// ── Toast component ──────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  const colors = {
    success: {
      bar: "var(--color-success)",
      icon: "✓",
      bg: "var(--color-success-light)",
      text: "var(--color-success)",
    },
    error: {
      bar: "var(--color-error)",
      icon: "✕",
      bg: "var(--color-error-light)",
      text: "var(--color-error)",
    },
  };
  const c = colors[type] || colors.success;
  return (
    <motion.div
      initial={{ x: 60, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 60, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-6 right-6 z-9999 flex items-start gap-3 bg-[--color-bg-surface] border border-[--color-border] rounded-xl shadow-[--shadow-lg] min-w-[300px] max-w-[400px] overflow-hidden"
    >
      <div
        className="w-1 self-stretch shrink-0 rounded-l-xl"
        style={{ backgroundColor: c.bar }}
      />
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 mt-3"
        style={{ backgroundColor: c.bg, color: c.text }}
      >
        {c.icon}
      </div>
      <div className="py-3 pr-2 flex-1 min-w-0">
        <p className="type-label-sm text-[--color-text-primary]">
          {type === "success" ? "Feedback Submitted" : "Submission Failed"}
        </p>
        <p className="type-body-sm text-[--color-text-secondary] mt-0.5">
          {message}
        </p>
      </div>
      <button
        onClick={onClose}
        className="p-2 mt-2 mr-2 rounded-lg hover:bg-[--color-bg-subtle] text-[--color-text-tertiary] hover:text-[--color-text-primary] transition-colors self-start shrink-0"
      >
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </motion.div>
  );
}

// ── Upload attachments to imgbb ──────────────────────────────────────────────
async function uploadToImgbb(file) {
  const form = new FormData();
  form.append("image", file);
  const res = await fetch(
    `${import.meta.env.VITE_IMGBB_WEBHOOK_URL}?key=${import.meta.env.VITE_IMGBB_API_KEY}`,
    { method: "POST", body: form },
  );
  const data = await res.json();
  if (!data.success) throw new Error("Image upload failed");
  return data.data.url;
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function FeedbackPage() {
  const { user } = useContext(AuthContext);
  return <FeedbackForm key={user?.email || "anonymous"} />;
}

function FeedbackForm() {
  const { user } = useContext(AuthContext);
  const axiosPublic = useAxiosPublic();

  const [form, setForm] = useState({
    email: user?.email || "",
    feedbackType: "",
    affectedPage: "",
    comment: "",
  });
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const set = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.email?.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      e.email = "Enter a valid email address";
    if (!form.feedbackType) e.feedbackType = "Please select a feedback type";
    if (!form.comment?.trim()) e.comment = "Comment is required";
    else if (form.comment.trim().length < 10)
      e.comment = "Comment must be at least 10 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFileChange = (e) => {
    const picked = Array.from(e.target.files).slice(0, 3 - files.length);
    setFiles((prev) => [...prev, ...picked].slice(0, 3));
  };

  const removeFile = (idx) =>
    setFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      // Upload attachments if any
      let attachmentUrls = [];
      if (files.length > 0) {
        setUploading(true);
        attachmentUrls = await Promise.all(files.map(uploadToImgbb));
        setUploading(false);
      }

      await axiosPublic.post("/api/feedback", {
        userEmail: form.email,
        feedbackType: form.feedbackType,
        affectedPage: form.affectedPage || undefined,
        comment: form.comment,
        attachments: attachmentUrls,
      });

      setSubmitted(true);
      setToast({
        type: "success",
        message: "We'll review your feedback and get back to you soon.",
      });
    } catch {
      setToast({
        type: "error",
        message: "Something went wrong. Please try again.",
      });
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const selectedType = FEEDBACK_TYPES.find(
    (t) => t.value === form.feedbackType,
  );

  // ── Success State ────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="bg-[--color-bg-base] min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="card p-10 max-w-md w-full text-center flex flex-col items-center gap-6"
        >
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
            style={{ backgroundColor: "var(--color-success-light)" }}
          >
            ✓
          </div>
          <div>
            <h1 className="type-heading-md text-[--color-text-primary] mb-2">
              Thank you for your feedback!
            </h1>
            <p className="type-body-sm text-[--color-text-secondary]">
              We've received your message and will review it shortly. Your input
              helps us make SurveyHub better for everyone.
            </p>
          </div>
          <button
            className="btn btn-secondary btn-md"
            onClick={() => {
              setSubmitted(false);
              setForm({
                email: user?.email || "",
                feedbackType: "",
                affectedPage: "",
                comment: "",
              });
              setFiles([]);
              setErrors({});
            }}
          >
            Submit Another
          </button>
        </motion.div>

        <AnimatePresence>
          {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="bg-[--color-bg-base] min-h-screen pb-20">
      {/* ── Page Header ── */}
      <div className="border-b border-[--color-border] bg-[--color-bg-surface]">
        <div className="container-marketing py-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
              style={{
                backgroundColor: "var(--color-visitor-light)",
                color: "var(--color-visitor-dark)",
              }}
            >
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              Feedback &amp; Support
            </div>
            <h1 className="type-heading-xl text-[--color-text-primary]">
              We'd love to hear from you
            </h1>
            <p className="type-body-base text-[--color-text-secondary] mt-2 max-w-2xl">
              Whether you've found a bug, have a great idea, or just want to
              share your experience — your feedback helps shape SurveyHub.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container-marketing py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Form ── */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <form
              onSubmit={handleSubmit}
              noValidate
              className="card p-6 md:p-8 flex flex-col gap-7"
            >
              {/* Email */}
              <div>
                <label htmlFor="feedback-email" className="form-label">
                  Email Address <span className="text-[--color-error]">*</span>
                </label>
                <input
                  id="feedback-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="you@example.com"
                  readOnly={!!user?.email}
                  className={`form-input ${user?.email ? "bg-[--color-bg-subtle] cursor-default" : ""} ${errors.email ? "error" : ""}`}
                />
                {user?.email && (
                  <p className="form-helper mt-1">Using your logged-in email</p>
                )}
                {errors.email && <p className="form-error">{errors.email}</p>}
              </div>

              {/* Feedback Type */}
              <div>
                <label className="form-label">
                  Feedback Type <span className="text-[--color-error]">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                  {FEEDBACK_TYPES.map((type) => {
                    const isSelected = form.feedbackType === type.value;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        id={`feedback-type-${type.value}`}
                        onClick={() => set("feedbackType", type.value)}
                        className="flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-150"
                        style={{
                          borderColor: isSelected
                            ? type.color
                            : "var(--color-border)",
                          backgroundColor: isSelected
                            ? type.light
                            : "var(--color-bg-surface)",
                        }}
                      >
                        <span className="text-xl shrink-0 mt-0.5">
                          {type.icon}
                        </span>
                        <div>
                          <p
                            className="type-label-sm"
                            style={{
                              color: isSelected
                                ? type.color
                                : "var(--color-text-primary)",
                            }}
                          >
                            {type.label}
                          </p>
                          <p className="type-body-sm text-[--color-text-tertiary] mt-0.5">
                            {type.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {errors.feedbackType && (
                  <p className="form-error mt-2">{errors.feedbackType}</p>
                )}
              </div>

              {/* Affected Page (optional) */}
              <div>
                <label htmlFor="feedback-page" className="form-label">
                  Affected Page
                  <span className="type-body-sm text-[--color-text-tertiary] font-normal ml-1">
                    (optional)
                  </span>
                </label>
                <select
                  id="feedback-page"
                  value={form.affectedPage}
                  onChange={(e) => set("affectedPage", e.target.value)}
                  className="form-input"
                >
                  <option value="">Select a page…</option>
                  {AFFECTED_PAGES.map((p) => (
                    <option key={p} value={p.toLowerCase().replace(/ /g, "-")}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Comment */}
              <div>
                <label htmlFor="feedback-comment" className="form-label">
                  Your Comment <span className="text-[--color-error]">*</span>
                </label>
                <textarea
                  id="feedback-comment"
                  rows={5}
                  value={form.comment}
                  onChange={(e) => set("comment", e.target.value)}
                  placeholder={
                    selectedType?.value === "bug"
                      ? "Describe what happened, the steps to reproduce it, and what you expected…"
                      : selectedType?.value === "feature_request"
                        ? "Describe the feature you'd like, how it would work, and why it would be helpful…"
                        : "Share your thoughts, experience, or any concerns…"
                  }
                  className={`form-input resize-none ${errors.comment ? "error" : ""}`}
                />
                <div className="flex items-center justify-between mt-1">
                  {errors.comment ? (
                    <p className="form-error">{errors.comment}</p>
                  ) : (
                    <span className="form-helper">Minimum 10 characters</span>
                  )}
                  <span className="type-meta text-[--color-text-tertiary]">
                    {form.comment.length}
                  </span>
                </div>
              </div>

              {/* Attachments */}
              <div>
                <label className="form-label">
                  Screenshots / Attachments
                  <span className="type-body-sm text-[--color-text-tertiary] font-normal ml-1">
                    (optional, max 3)
                  </span>
                </label>

                {files.length < 3 && (
                  <label
                    htmlFor="feedback-attachments"
                    className="mt-1 flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-[--color-border] rounded-xl cursor-pointer hover:border-[--color-visitor] hover:bg-[--color-visitor-light] transition-all duration-150"
                  >
                    <svg
                      className="w-8 h-8 text-[--color-text-tertiary]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="type-body-sm text-[--color-text-secondary]">
                      Click to upload images
                    </span>
                    <span className="type-body-sm text-[--color-text-tertiary]">
                      PNG, JPG, GIF — up to 10MB each
                    </span>
                    <input
                      id="feedback-attachments"
                      type="file"
                      multiple
                      accept="image/*"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                )}

                {files.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {files.map((file, idx) => (
                      <div
                        key={idx}
                        className="relative group w-24 h-24 rounded-xl overflow-hidden border border-[--color-border] bg-[--color-bg-subtle]"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                          aria-label="Remove attachment"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit */}
              <div className="flex items-center gap-4 pt-2 border-t border-[--color-border]">
                <button
                  type="submit"
                  id="feedback-submit"
                  disabled={submitting}
                  className="btn btn-primary btn-md"
                  style={{ minWidth: 160 }}
                >
                  {uploading ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full block"
                      />
                      Uploading…
                    </>
                  ) : submitting ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 0.8,
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
                      Send Feedback
                    </>
                  )}
                </button>
                <p className="type-body-sm text-[--color-text-tertiary]">
                  We typically respond within 24–48 hours.
                </p>
              </div>
            </form>
          </motion.div>

          {/* ── Sidebar Info ── */}
          <motion.div
            className="flex flex-col gap-5"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Contact card */}
            <div className="card p-6">
              <h2 className="type-heading-sm text-[--color-text-primary] mb-4">
                Other ways to reach us
              </h2>
              <div className="flex flex-col gap-4">
                {[
                  {
                    icon: "📧",
                    label: "Email Support",
                    value: "support@surveyhub.app",
                    href: "mailto:support@surveyhub.app",
                  },
                  {
                    icon: "📖",
                    label: "Documentation",
                    value: "docs.surveyhub.app",
                    href: "#",
                  },
                  {
                    icon: "💬",
                    label: "Community",
                    value: "community.surveyhub.app",
                    href: "#",
                  },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-[--color-bg-subtle] transition-colors"
                  >
                    <span className="text-xl shrink-0">{item.icon}</span>
                    <div>
                      <p className="type-label-sm text-[--color-text-primary]">
                        {item.label}
                      </p>
                      <p className="type-body-sm text-[--color-visitor]">
                        {item.value}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* What happens next */}
            <div className="card p-6">
              <h2 className="type-heading-sm text-[--color-text-primary] mb-4">
                What happens next?
              </h2>
              <div className="flex flex-col gap-4">
                {[
                  { step: "01", text: "We receive and log your feedback" },
                  { step: "02", text: "Our team reviews and prioritizes it" },
                  { step: "03", text: "You get a response within 24–48 hrs" },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <span
                      className="type-meta-sm font-bold px-2 py-0.5 rounded-md shrink-0"
                      style={{
                        backgroundColor: "var(--color-visitor-light)",
                        color: "var(--color-visitor-dark)",
                      }}
                    >
                      {item.step}
                    </span>
                    <p className="type-body-sm text-[--color-text-secondary]">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy notice */}
            <div
              className="rounded-xl p-4 flex gap-3"
              style={{ backgroundColor: "var(--color-bg-subtle)" }}
            >
              <svg
                className="w-5 h-5 text-[--color-text-tertiary] shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <p className="type-body-sm text-[--color-text-secondary]">
                Your feedback is confidential. We only use your email to follow
                up on your submission and will never share it with third
                parties.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
