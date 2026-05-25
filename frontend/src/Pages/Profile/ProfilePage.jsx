/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router";
import useProfile from "../../Hooks/useProfile";
import { useProfileStats, useUpdateProfile } from "../../Hooks/useProfileData";
import UserProfile from "./UserProfile";
import SurveyorProfile from "./SurveyorProfile";
import AdminProfile from "./AdminProfile";

// ── Role theme map ────────────────────────────────────────────────────────────
const ROLE_THEME = {
  user: {
    accent: "var(--color-user)",
    light: "var(--color-user-light)",
    dark: "var(--color-user-dark)",
  },
  surveyor: {
    accent: "var(--color-surveyor)",
    light: "var(--color-surveyor-light)",
    dark: "var(--color-surveyor-dark)",
  },
  admin: {
    accent: "var(--color-admin)",
    light: "var(--color-admin-light)",
    dark: "var(--color-admin-dark)",
  },
};

// Map to Tailwind arbitrary value classes for tokens
const ROLE_CLASS = {
  user: { light: 'bg-[--color-user-light]', dark: 'text-[--color-user-dark]', accent: 'bg-[--color-user]' },
  surveyor: { light: 'bg-[--color-surveyor-light]', dark: 'text-[--color-surveyor-dark]', accent: 'bg-[--color-surveyor]' },
  admin: { light: 'bg-[--color-admin-light]', dark: 'text-[--color-admin-dark]', accent: 'bg-[--color-admin]' },
};

// ── Default cover gradient if none uploaded ───────────────────────────────────
const ROLE_COVER_GRADIENT = {
  user: "linear-gradient(135deg, #FEF0E6 0%, #F67724 60%, #C45D18 100%)",
  surveyor: "linear-gradient(135deg, #EAF6FD 0%, #5BBDEA 60%, #2D9FCF 100%)",
  admin: "linear-gradient(135deg, #FDECEA 0%, #DB3725 60%, #B02D1E 100%)",
};

// ── EditModal (shared) ────────────────────────────────────────────────────────
function EditModal({ profile, onClose, onSave, isSaving }) {
  // Use React Hook Form for better validation and performance
  const defaults = {
    name: profile?.name || "",
    bio: profile?.bio || "",
    location: profile?.location || "",
    occupation: profile?.occupation || "",
    avatar: profile?.avatar || "",
    coverPhoto: profile?.coverPhoto || "",
    twitter: profile?.socialLinks?.twitter || "",
    linkedin: profile?.socialLinks?.linkedin || "",
    website: profile?.socialLinks?.website || "",
  };

  const { register, handleSubmit, setValue, watch } = useForm({ defaultValues: defaults });

  const submit = (d) => {
    const payload = {
      ...d,
      socialLinks: {
        twitter: d.twitter || undefined,
        linkedin: d.linkedin || undefined,
        website: d.website || undefined,
      },
    };
    onSave(payload);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <motion.div
        className="relative z-10 bg-[--color-bg-surface] rounded-2xl shadow-[--shadow-xl] w-full max-w-lg max-h-[90vh] flex flex-col"
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[--color-border]">
          <h2 className="type-heading-sm text-[--color-text-primary]">
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[--color-bg-subtle] transition-colors"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 flex flex-col gap-4">
          <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
            {[
              { label: "Name", name: "name", type: "text" },
              { label: "Location", name: "location", type: "text" },
              { label: "Occupation", name: "occupation", type: "text" },
              { label: "Avatar URL", name: "avatar", type: "text" },
              { label: "Cover Photo URL", name: "coverPhoto", type: "text" },
            ].map(({ label, name, type }) => (
              <div key={name}>
                <label className="form-label mb-1 block">{label}</label>
                <input type={type} {...register(name)} className="form-input" />
              </div>
            ))}

            <div>
              <label className="form-label mb-1 block">Bio</label>
              <textarea {...register('bio')} rows={3} maxLength={500} className="form-input resize-none" />
              <p className="type-body-sm text-[--color-text-tertiary] mt-1">
                {String(watch('bio') || '').length}/500
              </p>
            </div>

          <div className="border-t border-[--color-border] pt-4">
            <p className="form-label mb-2">Social Links</p>
            {[
              { label: 'Twitter / X', name: 'twitter', placeholder: 'https://twitter.com/...' },
              { label: 'LinkedIn', name: 'linkedin', placeholder: 'https://linkedin.com/in/...' },
              { label: 'Website', name: 'website', placeholder: 'https://yoursite.com' },
            ].map(({ label, name, placeholder }) => (
              <div key={name} className="mb-3">
                <label className="type-body-sm text-[--color-text-secondary] mb-1 block">{label}</label>
                <input type="url" {...register(name)} placeholder={placeholder} className="form-input" />
              </div>
            ))}
          </div>
        </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[--color-border]">
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Cancel
          </button>
          <button
            onClick={handleSubmit(submit)}
            disabled={isSaving}
            className={`btn btn-primary btn-sm text-white ${ROLE_CLASS[profile?.role || 'user']?.accent || ''}`}
          >
            {isSaving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Shared Profile Hero ───────────────────────────────────────────────────────
function ProfileHero({ profile, theme, onEdit }) {
  const coverBg = profile?.coverPhoto
    ? `url(${profile.coverPhoto}) center/cover no-repeat`
    : ROLE_COVER_GRADIENT[profile?.role] || ROLE_COVER_GRADIENT.user;

  const initials = (profile?.name || "?")[0].toUpperCase();

  return (
    <div className="relative">
      {/* Cover photo */}
      <div
        className="w-full h-40 sm:h-52 rounded-xl"
        style={{ background: coverBg }}
      />

      {/* Avatar + edit button row */}
          <div className="flex items-end justify-between px-6 -mt-12 sm:-mt-14">
        {/* Avatar */}
        <div
          className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-[--color-bg-surface] shadow-[--shadow-md] overflow-hidden flex items-center justify-center text-white text-3xl font-bold shrink-0 ${profile?.avatar ? '' : (ROLE_CLASS[profile?.role || 'user']?.accent || '')}`}
        >
          {profile?.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          ) : (
            initials
          )}
        </div>

        {/* Edit profile button */}
        <button onClick={onEdit} className="btn btn-secondary btn-sm mb-2">
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
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Edit Profile
        </button>
      </div>

      {/* Identity block */}
      <div className="px-6 pt-3 pb-5">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="type-heading-lg text-[--color-text-primary]">
            {profile?.name || "—"}
          </h1>
          {/* Role pill */}
          <span
            className={`type-meta px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${ROLE_CLASS[profile?.role || 'user']?.light || ''} ${ROLE_CLASS[profile?.role || 'user']?.dark || ''}`}
          >
            {profile?.role}
          </span>
        </div>

        {(profile?.occupation || profile?.location) && (
          <p className="type-body-sm text-[--color-text-secondary] mt-0.5">
            {[profile.occupation, profile.location].filter(Boolean).join(" · ")}
          </p>
        )}

        {profile?.bio && (
          <p className="type-body-sm text-[--color-text-secondary] mt-2 max-w-2xl leading-relaxed">
            {profile.bio}
          </p>
        )}

        {/* Social links */}
        {(profile?.socialLinks?.twitter ||
          profile?.socialLinks?.linkedin ||
          profile?.socialLinks?.website) && (
          <div className="flex items-center gap-4 mt-3">
            {profile.socialLinks.twitter && (
              <a
                href={profile.socialLinks.twitter}
                target="_blank"
                rel="noreferrer"
                className="type-body-sm text-[--color-text-tertiary] hover:text-[--color-text-primary] transition-colors flex items-center gap-1"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Twitter
              </a>
            )}
            {profile.socialLinks.linkedin && (
              <a
                href={profile.socialLinks.linkedin}
                target="_blank"
                rel="noreferrer"
                className="type-body-sm text-[--color-text-tertiary] hover:text-[--color-text-primary] transition-colors flex items-center gap-1"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                LinkedIn
              </a>
            )}
            {profile.socialLinks.website && (
              <a
                href={profile.socialLinks.website}
                target="_blank"
                rel="noreferrer"
                className="type-body-sm text-[--color-text-tertiary] hover:text-[--color-text-primary] transition-colors flex items-center gap-1"
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
                    strokeWidth={1.5}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                Website
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-52 bg-[--color-bg-subtle] rounded-xl" />
      <div className="px-6 -mt-14 flex items-end justify-between">
        <div className="w-28 h-28 rounded-full bg-[--color-bg-inset] border-4 border-[--color-bg-surface]" />
        <div className="h-8 w-28 bg-[--color-bg-inset] rounded-lg mb-2" />
      </div>
      <div className="px-6 pt-4 flex flex-col gap-2">
        <div className="h-6 w-48 bg-[--color-bg-inset] rounded" />
        <div className="h-4 w-72 bg-[--color-bg-subtle] rounded" />
        <div className="h-4 w-full max-w-md bg-[--color-bg-subtle] rounded" />
      </div>
    </div>
  );
}

// ── Main Profile Page ─────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { data: profile, isPending: profileLoading } = useProfile();
  const { data: stats, isPending: statsLoading } = useProfileStats();
  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile();
  const [editOpen, setEditOpen] = useState(false);

  const role = profile?.role || "user";
  const theme = ROLE_THEME[role] || ROLE_THEME.user;

  const handleSave = (formData) => {
    updateProfile(formData, {
      onSuccess: () => setEditOpen(false),
    });
  };

  if (profileLoading) {
    return (
      <div className="container-marketing py-8">
        <ProfileSkeleton />
      </div>
    );
  }

  return (
    <>
      <div className="bg-[--color-bg-base] min-h-screen pb-16">
        <div className="container-marketing py-8">
          <div className="flex flex-col gap-8">
            {/* ── Shared Hero ── */}
            <div className="card p-0 overflow-hidden">
              <ProfileHero
                profile={profile}
                theme={theme}
                onEdit={() => setEditOpen(true)}
              />
            </div>

            {/* ── Role-specific content ── */}
            {role === "user" && (
              <UserProfile
                profile={profile}
                stats={stats}
                statsLoading={statsLoading}
                theme={theme}
              />
            )}
            {role === "surveyor" && (
              <SurveyorProfile
                profile={profile}
                stats={stats}
                statsLoading={statsLoading}
                theme={theme}
              />
            )}
            {role === "admin" && (
              <AdminProfile
                profile={profile}
                stats={stats}
                statsLoading={statsLoading}
                theme={theme}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Edit Modal ── */}
      <AnimatePresence>
        {editOpen && (
          <EditModal
            profile={profile}
            onClose={() => setEditOpen(false)}
            onSave={handleSave}
            isSaving={isSaving}
          />
        )}
      </AnimatePresence>
    </>
  );
}
