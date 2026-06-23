"use no memo";
import { motion } from "motion/react";
import {
  ArrowPathIcon,
  TrashIcon,
  InboxIcon,
} from "@heroicons/react/24/outline";
import { useRecycleBin, useRestoreSurvey } from "../../../../Hooks/useMySurveys";
import { useDeleteSurvey } from "../../../../Hooks/useSurveysMutation";
import { LoadingSpinner } from "../../../../Components/UI/LoadingSpinner";
import Swal from "sweetalert2";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

export default function RecycleBin() {
  const { data: surveys, isLoading, isError } = useRecycleBin();
  const restoreSurvey = useRestoreSurvey();
  const deleteSurvey = useDeleteSurvey();

  const handleRestore = (survey) => {
    Swal.fire({
      title: "Restore Survey?",
      text: `"${survey.title}" will be moved back to My Surveys.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#5BBCEA",
      confirmButtonText: "Restore",
    }).then((result) => {
      if (result.isConfirmed) {
        restoreSurvey.mutate(survey._id, {
          onSuccess: () => {
            Swal.fire({ title: "Restored!", text: "Survey restored successfully.", icon: "success", timer: 1500, showConfirmButton: false });
          },
        });
      }
    });
  };

  const handlePermanentDelete = (survey) => {
    Swal.fire({
      title: "Permanently Delete?",
      text: `"${survey.title}" will be permanently deleted. This cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DC2626",
      confirmButtonText: "Delete Forever",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteSurvey.mutate(survey._id, {
          onError: (err) => {
            const msg = err.response?.data?.message || "Failed to delete survey.";
            Swal.fire({ title: "Cannot Delete", text: msg, icon: "error" });
          },
        });
      }
    });
  };

  const canDelete = (survey) => {
    if (survey.status === "expired") return false;
    if (survey.status === "published" && (survey.participantCount || 0) >= 5) return false;
    return true;
  };

  const canRestore = (survey) => survey.status !== "published";

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <div className="text-center py-12"><p className="type-body-sm text-[--color-error]">Failed to load recycle bin.</p></div>;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h2 className="type-heading-lg text-[--color-text-primary]">Recycle Bin</h2>
        <p className="type-body-sm text-[--color-text-secondary] mt-1">
          Deleted surveys are kept here for 30 days before permanent removal.
        </p>
      </motion.div>

      {(surveys || []).length === 0 ? (
        <motion.div variants={item} className="empty-state">
          <div className="empty-state-icon">
            <InboxIcon className="w-7 h-7" />
          </div>
          <p className="type-heading-sm text-[--color-text-primary] mt-2">Recycle bin is empty</p>
          <p className="type-body-sm text-[--color-text-secondary] mt-1">
            Deleted surveys will appear here.
          </p>
        </motion.div>
      ) : (
        <motion.div variants={item} className="space-y-3">
          {surveys.map((survey) => (
            <div
              key={survey._id}
              className="card p-4 flex items-center gap-4 hover:shadow-[--shadow-md] transition-shadow"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-[--color-error-light]">
                <TrashIcon className="w-5 h-5 text-[--color-error]" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="type-label-sm text-[--color-text-primary] truncate">
                  {survey.title}
                </p>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  <span className="type-meta text-[--color-text-tertiary]">
                    {survey.category || "No category"}
                  </span>
                  <span className="type-meta text-[--color-text-tertiary]">
                    {survey.participantCount ?? 0} responses
                  </span>
                  <span className="type-meta text-[--color-text-tertiary]">
                    Deleted {survey.deletedAt ? new Date(survey.deletedAt).toLocaleDateString() : "recently"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {canRestore(survey) ? (
                  <button
                    onClick={() => handleRestore(survey)}
                    disabled={restoreSurvey.isPending}
                    className="btn btn-sm bg-[--color-success-light] text-[--color-success] hover:bg-[--color-success]/20 border-none flex items-center gap-1.5"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                    Restore
                  </button>
                ) : (
                  <span
                    className="btn btn-sm bg-[--color-bg-inset] text-[--color-text-tertiary] border-none cursor-not-allowed flex items-center gap-1.5 opacity-60"
                    title="Published surveys cannot be restored from recycle bin"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                    Restore
                  </span>
                )}
                {canDelete(survey) ? (
                  <button
                    onClick={() => handlePermanentDelete(survey)}
                    disabled={deleteSurvey.isPending}
                    className="btn btn-sm bg-[--color-error-light] text-[--color-error] hover:bg-[--color-error]/20 border-none flex items-center gap-1.5"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete
                  </button>
                ) : (
                  <span
                    className="btn btn-sm bg-[--color-bg-inset] text-[--color-text-tertiary] border-none cursor-not-allowed flex items-center gap-1.5 opacity-60"
                    title={survey.status === "expired"
                      ? "Expired surveys cannot be permanently deleted"
                      : "Published surveys with 5+ responses cannot be permanently deleted"}
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete
                  </span>
                )}
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
