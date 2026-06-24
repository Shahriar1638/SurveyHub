import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeftIcon, ExclamationTriangleIcon, XMarkIcon, EyeIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { useCreateBlog, useUpdateBlog, useBlogForEdit } from "../../../../Hooks/useBlogsMutation";
import useDashboardSurveyor from "../../../../Hooks/useDashboardSurveyor";
import { PageTransition } from "../../../../Components/UI/PageTransition";
import { LoadingSpinner } from "../../../../Components/UI/LoadingSpinner";
import MarkdownRenderer from "../../../../Components/UI/MarkdownRenderer";
import Swal from "sweetalert2";

export default function CreateBlog() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const { data } = useDashboardSurveyor();
  const createMutation = useCreateBlog();
  const updateMutation = useUpdateBlog();
  const { data: editBlog, isLoading: isLoadingEdit } = useBlogForEdit(editId);

  const publishedSurveys = data?.publishedSurveys || [];

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [surveyId, setSurveyId] = useState("");
  const [moderationInfo, setModerationInfo] = useState(null);
  const [showModerationModal, setShowModerationModal] = useState(false);
  const [savedBlogId, setSavedBlogId] = useState(null);
  const [editorTab, setEditorTab] = useState("write");

  // Load existing blog data when editing
  useEffect(() => {
    if (editBlog) {
      setTitle(editBlog.title || "");
      setContent(editBlog.content || "");
      setSurveyId(editBlog.surveyId || "");
      // Load moderation info if rejected
      if (editBlog.moderation?.decision === 'rejected') {
        setModerationInfo(editBlog.moderation);
      }
    }
  }, [editBlog]);

  const canPublish = title.trim() && content.trim();

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      Swal.fire({ icon: "warning", title: "Title required", text: "Please enter a blog title.", confirmButtonColor: "var(--color-accent)" });
      return;
    }
    try {
      const payload = { title, content, surveyId: surveyId || undefined };
      const useId = editId || savedBlogId;
      let res;
      if (useId) {
        res = await updateMutation.mutateAsync({ id: useId, ...payload });
      } else {
        res = await createMutation.mutateAsync(payload);
        // Track the new blog's ID so subsequent saves update instead of create
        if (res?.data?._id) {
          setSavedBlogId(res.data._id);
        }
      }
      Swal.fire({ icon: "success", title: "Draft Saved", timer: 2000, showConfirmButton: false, position: "top-end", toast: true, background: "var(--color-bg-surface)", color: "var(--color-text-primary)" });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Save Failed", text: err?.response?.data?.message || "Could not save draft.", confirmButtonColor: "var(--color-error)" });
    }
  };

  const handlePublish = async () => {
    if (!canPublish) return;
    const result = await Swal.fire({
      title: "Publish Blog Post?",
      html: `<p>You're about to publish <strong>${title}</strong>.</p>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Publish",
      cancelButtonText: "Cancel",
      confirmButtonColor: "var(--color-accent)",
    });
    if (!result.isConfirmed) return;

    try {
      const payload = { title, content, surveyId: surveyId || undefined, status: "active" };
      const useId = editId || savedBlogId;
      let res;
      if (useId) {
        res = await updateMutation.mutateAsync({ id: useId, ...payload });
      } else {
        res = await createMutation.mutateAsync(payload);
      }
      // Rejected by moderation — saved as rejected, show warning
      if (res?.moderation?.decision === 'rejected') {
        setModerationInfo(res.moderation);
        Swal.fire({ icon: "warning", title: "Content Rejected", text: res.moderation.message || "Your blog was flagged by AI moderation. Saved as rejected.", confirmButtonColor: "var(--color-accent)" });
      } else {
        Swal.fire({ icon: "success", title: "Blog Published!", timer: 2000, showConfirmButton: false, position: "top-end", toast: true, background: "var(--color-bg-surface)", color: "var(--color-text-primary)" });
        navigate("/dashboard/blog-studio");
      }
    } catch (err) {
      // 429 — quota exhausted, saved as draft
      if (err?.response?.status === 429) {
        Swal.fire({ icon: "warning", title: "AI limit reached", text: "Try again after 24 hours. Blog saved as draft.", timer: 4000, showConfirmButton: false, position: "top-end", toast: true, background: "var(--color-bg-surface)", color: "var(--color-text-primary)" });
        navigate("/dashboard/blog-studio");
      } else {
        Swal.fire({ icon: "error", title: "Publish Failed", text: err?.response?.data?.message || "Could not publish blog.", confirmButtonColor: "var(--color-error)" });
      }
    }
  };

  if (isLoadingEdit) {
    return (
      <PageTransition>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <LoadingSpinner />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto py-8 px-4 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-[--color-bg-subtle] text-[--color-text-secondary] hover:text-[--color-text-primary] transition-colors">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="type-heading-xl text-[--color-text-primary]">{editId ? "Edit Blog Post" : "Create Blog Post"}</h1>
            <p className="type-body-sm text-[--color-text-secondary] mt-1">Share insights from your surveys with the community.</p>
          </div>
          {moderationInfo && (
            <button
              onClick={() => setShowModerationModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[--color-warning] bg-[--color-warning-light] hover:brightness-95 transition-all shrink-0"
              title="View moderation message"
            >
              <ExclamationTriangleIcon className="w-4 h-4" />
              AI Flagged
            </button>
          )}
        </div>

        {/* Form */}
        <div className="card p-6 flex flex-col gap-5">
          <div>
            <label className="form-label">Title <span className="text-[--color-error]">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Blog post title"
              className="form-input"
            />
          </div>

          <div>
            <label className="form-label">Linked Survey</label>
            <select
              value={surveyId}
              onChange={(e) => setSurveyId(e.target.value)}
              className="form-input"
            >
              <option value="">None (standalone post)</option>
              {publishedSurveys.map((s) => (
                <option key={s._id} value={s._id}>{s.title}</option>
              ))}
            </select>
            <p className="form-helper">Optionally link this blog to one of your published surveys.</p>
          </div>

          <div>
            <label className="form-label">Content <span className="text-[--color-error]">*</span></label>
            {/* Editor tabs */}
            <div className="flex items-center gap-1 border border-b-0 border-[--color-border] rounded-t-lg bg-[--color-bg-inset] px-2 py-1">
              <button
                onClick={() => setEditorTab("write")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  editorTab === "write"
                    ? "bg-[--color-bg-surface] text-[--color-text-primary] shadow-sm"
                    : "text-[--color-text-secondary] hover:text-[--color-text-primary]"
                }`}
              >
                <PencilSquareIcon className="w-3.5 h-3.5" />
                Write
              </button>
              <button
                onClick={() => setEditorTab("preview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  editorTab === "preview"
                    ? "bg-[--color-bg-surface] text-[--color-text-primary] shadow-sm"
                    : "text-[--color-text-secondary] hover:text-[--color-text-primary]"
                }`}
              >
                <EyeIcon className="w-3.5 h-3.5" />
                Preview
              </button>
            </div>
            {/* Editor body */}
            <div className="border border-[--color-border] rounded-b-lg rounded-t-none">
              {editorTab === "write" ? (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your blog post in Markdown...

# Heading 1
## Heading 2

**Bold text** and *italic text*

- Bullet list
1. Numbered list

> Blockquote

`inline code`

[Link text](https://example.com)"
                  rows={16}
                  className="w-full p-4 text-sm font-[--font-mono] text-[--color-text-primary] bg-transparent border-0 outline-none resize-y min-h-[300px] placeholder:text-[--color-text-tertiary]/50"
                />
              ) : (
                <div className="p-4 min-h-[300px]">
                  {content ? (
                    <MarkdownRenderer content={content} />
                  ) : (
                    <p className="text-sm text-[--color-text-tertiary] italic">Nothing to preview. Start writing in the Write tab.</p>
                  )}
                </div>
              )}
            </div>
            <p className="form-helper">
              {content.length.toLocaleString()} characters · Supports **bold**, *italic*, headings, lists, code blocks, links, and more
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-6">
          <button onClick={() => navigate(-1)} className="btn btn-secondary btn-md">
            Cancel
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={createMutation.isPending || updateMutation.isPending}
              className="btn btn-secondary btn-md flex items-center gap-2 disabled:opacity-50"
            >
              {(createMutation.isPending || updateMutation.isPending) ? (
                <>
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-[--color-text-tertiary]/30 border-t-[--color-text-primary] rounded-full block" />
                  Saving…
                </>
              ) : (
                "Save Draft"
              )}
            </button>
            <button
              onClick={handlePublish}
              disabled={!canPublish || createMutation.isPending || updateMutation.isPending}
              className="btn btn-primary btn-md text-white flex items-center gap-2 disabled:opacity-50 relative overflow-hidden"
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-[shimmer_1.5s_infinite]" />
              )}
              {createMutation.isPending || updateMutation.isPending ? "Publishing..." : "Publish"}
            </button>
          </div>
        </div>
      </div>

      {/* Moderation Rejection Modal */}
      <AnimatePresence>
        {showModerationModal && moderationInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModerationModal(false)} />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 rounded-2xl shadow-[--shadow-xl] w-full max-w-md border border-[--color-warning]/30"
              style={{ backgroundColor: "#FFFFFF" }}
            >
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[--color-border]">
                <div className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-[--color-warning]" />
                  <h3 className="type-heading-sm text-[--color-text-primary]">AI Moderation Flag</h3>
                </div>
                <button onClick={() => setShowModerationModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[--color-bg-subtle] transition-colors">
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
              <div className="px-6 py-5">
                <p className="type-body-sm text-[--color-text-secondary] mb-4">
                  Your blog was flagged by AI content moderation and saved as <strong className="text-[--color-warning]">rejected</strong>. Fix the issues below and try publishing again.
                </p>
                <div className="p-4 rounded-xl bg-[--color-bg-subtle] border border-[--color-border] mb-4">
                  <p className="type-label-sm text-[--color-text-primary] mb-1">Reason</p>
                  <p className="type-body-sm text-[--color-text-secondary]">{moderationInfo.reason}</p>
                </div>
                {moderationInfo.flaggedCategories?.length > 0 && (
                  <div>
                    <p className="type-label-sm text-[--color-text-primary] mb-2">Flagged Categories</p>
                    <div className="flex flex-wrap gap-1.5">
                      {moderationInfo.flaggedCategories.map((cat, i) => (
                        <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[--color-warning-light] text-[--color-warning]">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end px-6 py-4 border-t border-[--color-border]">
                <button onClick={() => setShowModerationModal(false)} className="btn btn-secondary btn-sm">Got it</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
