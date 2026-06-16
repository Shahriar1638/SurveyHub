import { useForm } from "react-hook-form";
import useProfile from "../../../Hooks/useProfile";
import { useUpdateProfile, useToggleAutoAIInsight } from "../../../Hooks/useProfileData";
import { useGeminiUsage } from "../../../Hooks/useGeminiUsage";
import { LoadingSpinner } from "../../../Components/UI/LoadingSpinner";
import { motion } from "motion/react";
import Swal from "sweetalert2";

const fields = [
  { label: "Display Name", name: "name", type: "text", required: true },
  { label: "Occupation", name: "occupation", type: "text" },
  { label: "Location", name: "location", type: "text" },
  { label: "Avatar URL", name: "avatar", type: "url", placeholder: "https://example.com/avatar.jpg" },
];

const socialFields = [
  { label: "Twitter / X", name: "twitter", placeholder: "https://twitter.com/yourhandle" },
  { label: "LinkedIn", name: "linkedin", placeholder: "https://linkedin.com/in/yourprofile" },
  { label: "Website", name: "website", placeholder: "https://yoursite.com" },
];

export default function ProfileSettings() {
  const { data: profile, isPending } = useProfile();
  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile();
  const { mutate: toggleAutoAI, isPending: isToggling } = useToggleAutoAIInsight();
  const { data: geminiUsage } = useGeminiUsage();

  const { register, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      name: "",
      bio: "",
      occupation: "",
      location: "",
      avatar: "",
      twitter: "",
      linkedin: "",
      website: "",
    },
    values: {
      name: profile?.name || "",
      bio: profile?.bio || "",
      occupation: profile?.occupation || "",
      location: profile?.location || "",
      avatar: profile?.avatar || "",
      twitter: profile?.socialLinks?.twitter || "",
      linkedin: profile?.socialLinks?.linkedin || "",
      website: profile?.socialLinks?.website || "",
    },
  });

  const onSubmit = (data) => {
    const payload = {
      name: data.name,
      bio: data.bio,
      occupation: data.occupation,
      location: data.location,
      avatar: data.avatar,
      socialLinks: {
        twitter: data.twitter || "",
        linkedin: data.linkedin || "",
        website: data.website || "",
      },
    };

    updateProfile(payload, {
      onSuccess: () => {
        Swal.fire({
          icon: "success",
          title: "Saved",
          text: "Your profile has been updated.",
          timer: 1500,
          showConfirmButton: false,
          background: "var(--color-bg-surface)",
          color: "var(--color-text-primary)",
        });
      },
      onError: () => {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Something went wrong. Please try again.",
          background: "var(--color-bg-surface)",
          color: "var(--color-text-primary)",
        });
      },
    });
  };

  if (isPending) return <LoadingSpinner />;

  const handleAutoAIToggle = () => {
    toggleAutoAI(undefined, {
      onSuccess: (data) => {
        Swal.fire({
          icon: "success",
          title: data.autoAIInsight ? "Auto AI Enabled" : "Auto AI Disabled",
          text: data.autoAIInsight
            ? "AI insights will auto-generate when your surveys expire."
            : "Auto generation has been turned off for all surveys.",
          timer: 2000,
          showConfirmButton: false,
          background: "var(--color-bg-surface)",
          color: "var(--color-text-primary)",
        });
      },
      onError: () => {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to update auto AI insight setting.",
          background: "var(--color-bg-surface)",
          color: "var(--color-text-primary)",
        });
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="card p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="type-heading-md text-[--color-text-primary]">Profile Settings</h2>
          <p className="type-body-sm text-[--color-text-secondary] mt-1">
            Manage your public profile information.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* Basic fields */}
          {fields.map(({ label, name, type, required, placeholder }) => (
            <div key={name}>
              <label className="form-label mb-1 block">
                {label}
                {required && <span className="text-[--color-error] ml-0.5">*</span>}
              </label>
              <input
                type={type}
                {...register(name, required ? { required: "Required" } : {})}
                placeholder={placeholder}
                className="form-input"
              />
            </div>
          ))}

          {/* Bio */}
          <div>
            <label className="form-label mb-1 block">Bio</label>
            <textarea
              {...register("bio")}
              rows={3}
              maxLength={500}
              placeholder="Tell us about yourself..."
              className="form-input resize-none"
            />
            <p className="type-body-sm text-[--color-text-tertiary] mt-1">
              {String(watch("bio") || "").length}/500
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-[--color-border] pt-5">
            <p className="type-label-sm text-[--color-text-primary] mb-3">Social Links</p>
          </div>

          {socialFields.map(({ label, name, placeholder }) => (
            <div key={name}>
              <label className="form-label mb-1 block">{label}</label>
              <input
                type="url"
                {...register(name)}
                placeholder={placeholder}
                className="form-input"
              />
            </div>
          ))}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[--color-border]">
            <button
              type="button"
              onClick={() => reset()}
              className="btn btn-secondary btn-sm"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-primary btn-sm text-white"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* ── Auto AI Insight Toggle ── */}
      <div className="card p-6 sm:p-8 mt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="type-heading-sm text-[--color-text-primary]">Auto AI Insights</h3>
            <p className="type-body-sm text-[--color-text-secondary] mt-1">
              When enabled, AI insights will automatically generate for all your surveys when they expire.
            </p>
          </div>
          <button
            onClick={handleAutoAIToggle}
            disabled={isToggling}
            className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[--color-surveyor] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: profile?.autoAIInsight ? "var(--color-surveyor)" : "var(--color-bg-inset)",
            }}
          >
            <span
              className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out"
              style={{
                transform: profile?.autoAIInsight ? "translateX(20px)" : "translateX(0)",
              }}
            />
          </button>
        </div>
      </div>

      {/* ── Gemini Free Tier Info (surveyor only) ── */}
      {profile?.role === "surveyor" && (
        <div className="card p-6 sm:p-8 mt-6">
          <h3 className="type-heading-sm text-[--color-text-primary] mb-4">AI Content Moderation</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[--color-success-light] text-[--color-success]">
                Gemini Free Tier
              </span>
            </div>
            <div className="type-body-sm text-[--color-text-secondary] space-y-2">
              <p>Your surveys and blogs are moderated using Google Gemini 2.0 Flash (free tier).</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                <div className="p-3 rounded-lg bg-[--color-bg-subtle]">
                  <p className="type-meta text-[--color-text-tertiary] uppercase tracking-wider">Requests / Day</p>
                  <p className="type-heading-sm text-[--color-text-primary] mt-1">1,500</p>
                </div>
                <div className="p-3 rounded-lg bg-[--color-bg-subtle]">
                  <p className="type-meta text-[--color-text-tertiary] uppercase tracking-wider">Tokens / Minute</p>
                  <p className="type-heading-sm text-[--color-text-primary] mt-1">1,000,000</p>
                </div>
                <div className="p-3 rounded-lg bg-[--color-bg-subtle]">
                  <p className="type-meta text-[--color-text-tertiary] uppercase tracking-wider">Requests Today</p>
                  <p className="type-heading-sm text-[--color-text-primary] mt-1">{geminiUsage?.requests || 0}</p>
                </div>
              </div>
              <p className="type-meta text-[--color-text-tertiary] mt-2">
                Free tier does not expire and requires no credit card. If the AI is at capacity, your content will be saved as a draft for later review.
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
