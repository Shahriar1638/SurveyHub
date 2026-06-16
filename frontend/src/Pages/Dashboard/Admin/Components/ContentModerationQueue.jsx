import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import useAxiosSecure from "../../../../Hooks/useAxiosSecure";
import { LoadingSpinner } from "../../../../Components/UI/LoadingSpinner";
import { useAdminModerateSurvey } from "../../../../Hooks/useSurveysMutation";
import { useAdminModerateBlog } from "../../../../Hooks/useBlogsMutation";
import Swal from "sweetalert2";

export default function ContentModerationQueue() {
  const axiosSecure = useAxiosSecure();
  const [tab, setTab] = useState("surveys");
  const moderateSurvey = useAdminModerateSurvey();
  const moderateBlog = useAdminModerateBlog();

  const { data: surveyData, isLoading: loadingSurveys } = useQuery({
    queryKey: ["moderationQueue", "surveys"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/surveys/moderation/queue");
      return res.data?.data || [];
    },
  });

  const { data: blogData, isLoading: loadingBlogs } = useQuery({
    queryKey: ["moderationQueue", "blogs"],
    queryFn: async () => {
      const res = await axiosSecure.get("/api/blogs/moderation/queue");
      return res.data?.data || [];
    },
  });

  const surveys = surveyData || [];
  const blogs = blogData || [];
  const isLoading = tab === "surveys" ? loadingSurveys : loadingBlogs;

  const handleModerate = async (type, id, decision) => {
    const { value: reason } = await Swal.fire({
      title: decision === "approved" ? "Approve Content?" : "Reject Content?",
      input: "text",
      inputPlaceholder: "Optional reason...",
      showCancelButton: true,
      confirmButtonColor: decision === "approved" ? "#22c55e" : "#ef4444",
      confirmButtonText: decision === "approved" ? "Approve" : "Reject",
    });

    if (reason === undefined) return; // User cancelled

    const mutation = type === "survey" ? moderateSurvey : moderateBlog;
    mutation.mutate(
      { id, decision, reason: reason || undefined },
      {
        onSuccess: () => {
          Swal.fire({
            icon: "success",
            title: decision === "approved" ? "Approved" : "Rejected",
            timer: 1500,
            showConfirmButton: false,
          });
        },
      }
    );
  };

  const items = tab === "surveys" ? surveys : blogs;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="type-heading-md text-[--color-text-primary]">
            Content Moderation Queue
          </h3>
          <p className="type-body-sm text-[--color-text-secondary] mt-1">
            Review content flagged by AI before it goes live.
          </p>
        </div>
        <div className="flex gap-1 bg-[--color-bg-inset] rounded-lg p-1">
          {["surveys", "blogs"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? "bg-[--color-bg-surface] text-[--color-text-primary] shadow-sm"
                  : "text-[--color-text-secondary] hover:text-[--color-text-primary]"
              }`}
            >
              {t} ({t === "surveys" ? surveys.length : blogs.length})
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-8">
          <LoadingSpinner />
        </div>
      ) : items.length === 0 ? (
        <div className="card p-10 text-center">
          <DocumentTextIcon className="w-8 h-8 text-[--color-text-tertiary] mx-auto mb-3" />
          <p className="type-heading-sm text-[--color-text-primary]">
            Queue empty
          </p>
          <p className="type-body-sm text-[--color-text-secondary] mt-1">
            No content pending moderation.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item._id}
              className="card p-4 flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-[--color-warning-light]">
                <DocumentTextIcon className="w-5 h-5 text-[--color-warning]" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="type-label-sm text-[--color-text-primary] truncate">
                  {item.title}
                </p>
                <p className="type-body-sm text-[--color-text-secondary] mt-1 line-clamp-2">
                  {tab === "surveys"
                    ? item.description || "No description"
                    : item.content?.slice(0, 150) + "..."}
                </p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="type-meta text-[--color-text-tertiary]">
                    {item.surveyorId?.email || item.surveyorEmail}
                  </span>
                  {item.moderation?.reason && (
                    <span className="type-meta text-[--color-error]">
                      AI: {item.moderation.reason}
                    </span>
                  )}
                  {item.moderation?.appeal && (
                    <span className="type-meta text-[--color-warning] italic">
                      Appeal: &ldquo;{item.moderation.appeal.message}&rdquo;
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleModerate(tab === "surveys" ? "survey" : "blog", item._id, "approved")}
                  disabled={moderateSurvey.isPending || moderateBlog.isPending}
                  className="btn btn-sm bg-[--color-success-light] text-[--color-success] hover:bg-[--color-success]/20 border-none"
                >
                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                  Approve
                </button>
                <button
                  onClick={() => handleModerate(tab === "surveys" ? "survey" : "blog", item._id, "rejected")}
                  disabled={moderateSurvey.isPending || moderateBlog.isPending}
                  className="btn btn-sm bg-[--color-error-light] text-[--color-error] hover:bg-[--color-error]/20 border-none"
                >
                  <XCircleIcon className="w-4 h-4 mr-1" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
