import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  UserCircleIcon,
  MapPinIcon,
  BriefcaseIcon,
  PencilSquareIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import useProfile from "../../../Hooks/useProfile";

const ROLE_CLASS = {
  user: { light: "bg-[--color-user-light]", dark: "text-[--color-user-dark]", accent: "var(--color-user)" },
  surveyor: { light: "bg-[--color-surveyor-light]", dark: "text-[--color-surveyor-dark]", accent: "var(--color-surveyor)" },
  admin: { light: "bg-[--color-admin-light]", dark: "text-[--color-admin-dark]", accent: "var(--color-admin)" },
};

const PLAN_LABELS = { free: "Free", starter: "Starter", growth: "Growth", pro: "Pro", enterprise: "Enterprise" };

// ── Info Row ──────────────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-[--color-bg-subtle] flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-[--color-text-tertiary]" />
      </div>
      <div className="min-w-0">
        <p className="type-meta text-[--color-text-tertiary]">{label}</p>
        <p className="type-body-sm text-[--color-text-primary] mt-0.5 wrap-break-word">{value}</p>
      </div>
    </div>
  );
}

// ── Social Link Row ───────────────────────────────────────────────────────────
function SocialLinkRow({ href, icon, label }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-[--color-bg-subtle] transition-colors group"
    >
      <span className="shrink-0">{icon}</span>
      <span className="type-body-sm text-[--color-text-secondary] group-hover:text-[--color-text-primary] truncate">{label}</span>
    </a>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function MyProfile() {
  const navigate = useNavigate();
  const { profile, role } = useProfile();

  const rc = ROLE_CLASS[role] || ROLE_CLASS.user;

  const hasSocialLinks =
    profile?.socialLinks?.twitter ||
    profile?.socialLinks?.linkedin ||
    profile?.socialLinks?.website;

  return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-6"
      >
        {/* ── Header Card ── */}
        <div className="card p-0 overflow-hidden">
          {/* Role accent bar */}
          <div className="h-1.5" style={{ backgroundColor: rc.accent }} />

          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Avatar */}
              <div
                className={`w-24 h-24 rounded-full border-4 border-[--color-bg-surface] shadow-[--shadow-md] overflow-hidden flex items-center justify-center text-white text-3xl font-bold shrink-0`}
                style={!profile?.avatar ? { backgroundColor: rc.accent } : undefined}
              >
                {profile?.avatar ? (
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  (profile?.name || "?")[0].toUpperCase()
                )}
              </div>

              {/* Name + meta */}
              <div className="flex-1 text-center sm:text-left min-w-0">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h1 className="type-heading-lg text-[--color-text-primary]">{profile?.name || "---"}</h1>
                  <span className={`type-meta px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${rc.light} ${rc.dark}`}>
                    {role}
                  </span>
                  {profile?.status === "banned" && (
                    <span className="type-meta px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide bg-[--color-admin-light] text-[--color-admin]">
                      Banned
                    </span>
                  )}
                </div>

                <p className="type-body-sm text-[--color-text-secondary] mt-1">{profile?.email}</p>

                {(profile?.occupation || profile?.location) && (
                  <div className="flex items-center justify-center sm:justify-start gap-3 mt-2 text-[--color-text-tertiary]">
                    {profile.occupation && (
                      <span className="type-body-sm flex items-center gap-1">
                        <BriefcaseIcon className="w-3.5 h-3.5" /> {profile.occupation}
                      </span>
                    )}
                    {profile.location && (
                      <span className="type-body-sm flex items-center gap-1">
                        <MapPinIcon className="w-3.5 h-3.5" /> {profile.location}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Edit button */}
              <button onClick={() => navigate("/dashboard/profile-settings")} className="btn btn-secondary btn-sm shrink-0">
                <PencilSquareIcon className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column — Bio + Details */}
          <div className="lg:col-span-2 space-y-6">

            {/* Bio */}
            <div className="card p-6">
              <h3 className="type-heading-sm text-[--color-text-primary] mb-3">About</h3>
              {profile?.bio ? (
                <p className="type-body-base text-[--color-text-secondary] leading-relaxed whitespace-pre-line">{profile.bio}</p>
              ) : (
                <p className="type-body-sm text-[--color-text-tertiary] italic">No bio added yet.</p>
              )}
            </div>

            {/* Details */}
            <div className="card p-6">
              <h3 className="type-heading-sm text-[--color-text-primary] mb-4">Details</h3>
              <div className="flex flex-col gap-4">
                <InfoRow icon={UserCircleIcon} label="Display Name" value={profile?.name} />
                <InfoRow icon={BriefcaseIcon} label="Occupation" value={profile?.occupation} />
                <InfoRow icon={MapPinIcon} label="Location" value={profile?.location} />
              </div>
            </div>
          </div>

          {/* Right column — Social + Subscription */}
          <div className="space-y-6">

            {/* Social Links */}
            <div className="card p-6">
              <h3 className="type-heading-sm text-[--color-text-primary] mb-3">Social Links</h3>
              {hasSocialLinks ? (
                <div className="flex flex-col gap-1">
                  <SocialLinkRow
                    href={profile.socialLinks.twitter}
                    label="Twitter / X"
                    icon={
                      <svg className="w-4 h-4 text-[--color-text-tertiary]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    }
                  />
                  <SocialLinkRow
                    href={profile.socialLinks.linkedin}
                    label="LinkedIn"
                    icon={
                      <svg className="w-4 h-4 text-[--color-text-tertiary]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    }
                  />
                  <SocialLinkRow
                    href={profile.socialLinks.website}
                    label="Website"
                    icon={
                      <svg className="w-4 h-4 text-[--color-text-tertiary]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    }
                  />
                </div>
              ) : (
                <p className="type-body-sm text-[--color-text-tertiary] italic">No social links added.</p>
              )}
            </div>

            {/* Subscription */}
            <div className="card p-6">
              <h3 className="type-heading-sm text-[--color-text-primary] mb-3">Subscription</h3>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[--color-bg-subtle]/60">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${rc.accent}18` }}>
                  <CheckCircleIcon className="w-5 h-5" style={{ color: rc.accent }} />
                </div>
                <div>
                  <p className="type-label-sm text-[--color-text-primary]">
                    {PLAN_LABELS[profile?.subscription?.plan] || "Free"} Plan
                  </p>
                  <p className="type-meta text-[--color-text-tertiary] capitalize">
                    {profile?.subscription?.status || "inactive"}
                  </p>
                </div>
              </div>
            </div>

            {/* Member since */}
            <div className="card p-6">
              <h3 className="type-heading-sm text-[--color-text-primary] mb-3">Account</h3>
              <div className="type-body-sm text-[--color-text-secondary]">
                <p>Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "---"}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
  );
}
