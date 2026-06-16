import { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { motion } from "motion/react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { AuthContext } from "../../../../Firebase_AuthProvider/AuthProvider";
import { useCreateBlog, useUpdateBlog, useBlogForEdit } from "../../../../Hooks/useBlogsMutation";
import useDashboardSurveyor from "../../../../Hooks/useDashboardSurveyor";
import { PageTransition } from "../../../../Components/UI/PageTransition";
import { LoadingSpinner } from "../../../../Components/UI/LoadingSpinner";
import Swal from "sweetalert2";

export default function CreateBlog() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const { user } = useContext(AuthContext);
  const { data } = useDashboardSurveyor();
  const createMutation = useCreateBlog();
  const updateMutation = useUpdateBlog();
  const { data: editBlog, isLoading: isLoadingEdit } = useBlogForEdit(editId);

  const publishedSurveys = data?.publishedSurveys || [];

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [surveyId, setSurveyId] = useState("");

  // Load existing blog data when editing
  useEffect(() => {
    if (editBlog) {
      setTitle(editBlog.title || "");
      setContent(editBlog.content || "");
      setSurveyId(editBlog.surveyId || "");
    }
  }, [editBlog]);

  const canPublish = title.trim() && content.trim();

  const handleSaveDraft = async () => {
    if (!title.trim()) {
      Swal.fire({ icon: "warning", title: "Title required", text: "Please enter a blog title.", confirmButtonColor: "var(--color-surveyor)" });
      return;
    }
    try {
      const payload = { title, content, surveyId: surveyId || undefined };
      if (editId) {
        await updateMutation.mutateAsync({ id: editId, ...payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      Swal.fire({ icon: "success", title: "Draft Saved", timer: 2000, showConfirmButton: false, position: "top-end", toast: true, background: "var(--color-bg-surface)", color: "var(--color-text-primary)" });
      navigate("/dashboard/blog-studio");
    } catch (err) {
      Swal.fire({ icon: "error", title: "Save Failed", text: err?.response?.data?.message || "Could not save draft.", confirmButtonColor: "var(--color-admin)" });
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
      confirmButtonColor: "var(--color-surveyor)",
    });
    if (!result.isConfirmed) return;

    try {
      const payload = { title, content, surveyId: surveyId || undefined, status: "active" };
      let result;
      if (editId) {
        result = await updateMutation.mutateAsync({ id: editId, ...payload });
      } else {
        result = await createMutation.mutateAsync(payload);
      }
      // Quota exceeded — saved as draft with friendly message
      if (result?.message) {
        Swal.fire({ icon: "info", title: "Saved as Draft", text: result.message, confirmButtonColor: "var(--color-surveyor)" });
      } else {
        Swal.fire({ icon: "success", title: "Blog Published!", timer: 2000, showConfirmButton: false, position: "top-end", toast: true, background: "var(--color-bg-surface)", color: "var(--color-text-primary)" });
      }
      navigate("/dashboard/blog-studio");
    } catch (err) {
      Swal.fire({ icon: "error", title: "Publish Failed", text: err?.response?.data?.message || "Could not publish blog.", confirmButtonColor: "var(--color-admin)" });
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
          <div>
            <h1 className="type-heading-xl text-[--color-text-primary]">{editId ? "Edit Blog Post" : "Create Blog Post"}</h1>
            <p className="type-body-sm text-[--color-text-secondary] mt-1">Share insights from your surveys with the community.</p>
          </div>
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
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your blog post content here. Markdown is supported."
              rows={16}
              className="form-input resize-y min-h-[300px] font-[--font-mono] text-sm"
            />
            <p className="form-helper">{content.length.toLocaleString()} characters</p>
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
              className="btn btn-surveyor btn-md text-white flex items-center gap-2 disabled:opacity-50"
            >
              Publish
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
