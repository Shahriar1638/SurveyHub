import { useState, useContext, useMemo } from "react";
import { Link, useNavigate, Outlet, NavLink, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { AuthContext } from "../Firebase_AuthProvider/AuthProvider";
import useProfile from "../Hooks/useProfile";
import { useGeminiUsage } from "../Hooks/useGeminiUsage";
import logo from "../assets/logo.svg";

import {
  HomeIcon,
  ShieldCheckIcon,
  ClipboardDocumentListIcon,
  MegaphoneIcon,
  ChatBubbleLeftEllipsisIcon,
  ArrowLeftStartOnRectangleIcon,
  ArrowLeftIcon,
  BeakerIcon,
  PencilSquareIcon,
  InboxIcon,
  Bars3Icon,
  DocumentMagnifyingGlassIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

// ── Sidebar nav definitions ──────────────────────────────────────────────────
const ADMIN_NAV = [
  { group: "OVERVIEW", items: [
    { name: "Overview", icon: HomeIcon, id: "overview" },
  ]},
  { group: "MANAGEMENT", items: [
    { name: "Moderation", icon: ShieldCheckIcon, id: "moderation" },
    { name: "All Reports", icon: ExclamationTriangleIcon, id: "reports" },
    { name: "Audit Logs", icon: DocumentMagnifyingGlassIcon, id: "audit-logs" },
    { name: "Broadcasts", icon: MegaphoneIcon, id: "broadcasts" },
    { name: "Feedback", icon: ChatBubbleLeftEllipsisIcon, id: "feedback" },
  ]},
  { group: "PROFILE", items: [
    { name: "My Profile", icon: UserCircleIcon, id: "my-profile" },
    { name: "Profile Settings", icon: Cog6ToothIcon, id: "profile-settings" },
  ]},
];

const SURVEYOR_NAV = [
  { group: "OVERVIEW", items: [
    { name: "Overview", icon: HomeIcon, id: "overview" },
  ]},
  { group: "WORKSPACE", items: [
    { name: "My Surveys", icon: ClipboardDocumentListIcon, id: "surveys" },
    { name: "AI Analytics", icon: BeakerIcon, id: "analytics" },
    { name: "Blog Studio", icon: PencilSquareIcon, id: "blog-studio" },
    { name: "Feedback Inbox", icon: InboxIcon, id: "feedback-inbox" },
    { name: "My Reports", icon: ExclamationTriangleIcon, id: "reports" },
    { name: "Recycle Bin", icon: TrashIcon, id: "recycle-bin" },
  ]},
  { group: "PROFILE", items: [
    { name: "My Profile", icon: UserCircleIcon, id: "my-profile" },
    { name: "Profile Settings", icon: Cog6ToothIcon, id: "profile-settings" },
  ]},
];

const USER_NAV = [
  { group: "OVERVIEW", items: [
    { name: "Overview", icon: HomeIcon, id: "overview" },
  ]},
  { group: "MY ACTIVITY", items: [
    { name: "Participation", icon: ClipboardDocumentListIcon, id: "participation" },
    { name: "Report Status", icon: ShieldCheckIcon, id: "reports" },
    { name: "Support Tickets", icon: ChatBubbleLeftEllipsisIcon, id: "support" },
  ]},
  { group: "PROFILE", items: [
    { name: "My Profile", icon: UserCircleIcon, id: "my-profile" },
    { name: "Profile Settings", icon: Cog6ToothIcon, id: "profile-settings" },
  ]},
];

// ── Nav item ─────────────────────────────────────────────────────────────────
function NavItem({ item, role, onNav }) {
  const Icon = item.icon;
  const isAdmin = role === "admin";

  return (
    <NavLink
      to={item.id}
      end={item.id === "overview"}
      onClick={onNav}
      className={({ isActive }) =>
        `group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium font-[--font-ui] transition-all duration-200 ease-[var(--ease-out-expo)] select-none ${
          isActive
            ? ""
            : "text-[--color-text-secondary] hover:text-[--color-text-primary] hover:bg-[--color-bg-subtle]"
        }`
      }
      style={({ isActive }) => {
        if (!isActive) return undefined;
        return isAdmin
          ? { backgroundColor: "var(--color-primary)", color: "white" }
          : {
              backgroundColor: "var(--color-accent-light)",
              color: "var(--color-accent-dark)",
            };
      }}
    >
      {({ isActive }) => (
        <>
          {/* Active indicator strip */}
          {isActive && !isAdmin && (
            <motion.div
              layoutId="nav-active-strip"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
              style={{ backgroundColor: "var(--color-accent)" }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            />
          )}

          {/* Icon container */}
          <motion.div
            className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
            style={
              isActive
                ? {
                    backgroundColor: isAdmin
                      ? "rgba(255,255,255,0.12)"
                      : "var(--color-accent)",
                    color: "white",
                  }
                : { color: "var(--color-text-tertiary)" }
            }
            whileHover={!isActive ? { scale: 1.08 } : {}}
            transition={{ duration: 0.15 }}
          >
            <Icon className="w-[15px] h-[15px]" />
          </motion.div>

          <span className="truncate flex-1">{item.name}</span>

          {/* Active dot */}
          {isActive && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{
                backgroundColor: isAdmin ? "rgba(255,255,255,0.5)" : "var(--color-accent)",
              }}
            />
          )}
        </>
      )}
    </NavLink>
  );
}

// ── AI Powered badge ──────────────────────────────────────────────────────────
function AiPoweredBadge() {
  const { data: usage, isLoading } = useGeminiUsage();
  if (isLoading || !usage) return null;
  const { providers } = usage;

  return (
    <div className="mx-3 mb-3 p-3 rounded-lg border relative overflow-hidden"
      style={{
        backgroundColor: "var(--color-bg-subtle)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_3s_infinite] pointer-events-none" />

      <div className="flex items-center gap-2 mb-2 relative">
        <SparklesIcon className="w-5 h-5 text-[--color-primary] animate-[pulse_2s_ease-in-out_infinite] flex-shrink-0" />
        <span className="text-[10px] font-semibold font-[--font-ui] text-[--color-text-tertiary] uppercase tracking-[0.12em]">
          AI Powered
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 relative">
        {providers?.geminiKeys > 0 && (
          <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded font-medium"
            style={{ backgroundColor: "var(--color-bg-inset)", color: "var(--color-text-tertiary)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-[pulse_1.5s_ease-in-out_infinite]" />
            Gemini
          </span>
        )}
        {providers?.openRouter && (
          <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded font-medium"
            style={{ backgroundColor: "var(--color-bg-inset)", color: "var(--color-text-tertiary)" }}
            title={providers.openRouterModel}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] animate-[pulse_1.5s_ease-in-out_0.3s_infinite]" />
            OpenRouter
          </span>
        )}
        {providers?.openZen && (
          <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded font-medium"
            style={{ backgroundColor: "var(--color-bg-inset)", color: "var(--color-text-tertiary)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)] animate-[pulse_1.5s_ease-in-out_0.6s_infinite]" />
            OpenCode Zen
          </span>
        )}
      </div>

      {usage.requests > 0 && (
        <p className="text-[10px] font-[--font-mono] text-[--color-text-tertiary] mt-2 relative">
          {usage.requests} call{usage.requests !== 1 ? "s" : ""} today
        </p>
      )}
    </div>
  );
}

// ── Sidebar content ───────────────────────────────────────────────────────────
function SidebarContent({ user, profile, role, navGroups, navigate, onNav, logOut }) {
  const avatarInitial = (profile?.name || user?.displayName || user?.email || "?")[0].toUpperCase();

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Brand strip — navy, mirrors public navbar ── */}
      <div
        className="shrink-0 flex items-center gap-3 px-5 h-[60px]"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        <Link to="/" className="flex items-center gap-3 group/logo" onClick={onNav}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 overflow-hidden"
            style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
          >
            <img src={logo} alt="SurveyHub" className="h-4.5 w-4.5 object-contain" />
          </div>
          <span className="text-white font-heading font-bold text-[15px] tracking-tight">
            SurveyHub
          </span>
        </Link>
      </div>

      {/* ── User identity card ── */}
      <div className="shrink-0 px-3 pt-4 pb-3">
        <div
          className="flex items-center gap-3 p-3 rounded-xl border"
          style={{
            backgroundColor: "var(--color-bg-subtle)",
            borderColor: "var(--color-border)",
          }}
        >
          {/* Avatar */}
          {profile?.avatar || user?.photoURL ? (
            <img
              src={profile?.avatar || user?.photoURL}
              alt=""
              className="w-9 h-9 rounded-full object-cover shrink-0"
              style={{ boxShadow: "0 0 0 2px var(--color-accent), 0 0 0 4px var(--color-accent-light)" }}
            />
          ) : (
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold text-white shrink-0"
              style={{
                backgroundColor: "var(--color-accent)",
                boxShadow: "0 0 0 2px white, 0 0 0 4px var(--color-accent-light)",
              }}
            >
              {avatarInitial}
            </div>
          )}

          {/* Name + role */}
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold font-[--font-ui] text-[--color-text-primary] truncate leading-tight">
              {profile?.name || user?.displayName || "User"}
            </p>
            <span
              className="inline-block mt-0.5 text-[10px] font-bold font-[--font-ui] uppercase tracking-wide px-2 py-0.5 rounded-full"
              style={
                role === "admin"
                  ? { backgroundColor: "var(--color-primary)", color: "white" }
                  : role === "surveyor"
                    ? { backgroundColor: "var(--color-accent-light)", color: "var(--color-accent-dark)" }
                    : { backgroundColor: "var(--color-bg-inset)", color: "var(--color-text-secondary)" }
              }
            >
              {role || "member"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="mx-4 h-px shrink-0" style={{ backgroundColor: "var(--color-border)" }} />

      {/* ── Nav groups (scrollable) ── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-5 scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group.group}>
            <p className="px-3 mb-1.5 text-[10px] font-bold font-[--font-ui] uppercase tracking-[0.12em]"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              {group.group}
            </p>
            <div className="space-y-0.5">
              {group.items.map((navItem) => (
                <NavItem
                  key={navItem.id}
                  item={navItem}
                  role={role}
                  onNav={onNav}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ── AI powered widget ── */}
      <AiPoweredBadge />

      {/* ── Bottom dock ── */}
      <div className="shrink-0">
        <div className="mx-4 h-px" style={{ backgroundColor: "var(--color-border)" }} />
        <div className="px-2 py-3 space-y-0.5">
          <button
            onClick={() => { navigate("/"); onNav?.(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium font-[--font-ui] transition-all duration-200 group"
            style={{ color: "var(--color-text-secondary)" }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--color-bg-subtle)"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
          >
            <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 group-hover:-translate-x-0.5 transition-transform duration-200"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              <ArrowLeftIcon className="w-[15px] h-[15px]" />
            </div>
            Back to Site
          </button>
          <button
            onClick={() => logOut()}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium font-[--font-ui] transition-all duration-200 group cursor-pointer"
            style={{ color: "var(--color-text-secondary)" }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = "var(--color-error-light)";
              e.currentTarget.style.color = "var(--color-error)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--color-text-secondary)";
            }}
          >
            <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0">
              <ArrowLeftStartOnRectangleIcon className="w-[15px] h-[15px]" />
            </div>
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page transition wrapper ────────────────────────────────────────────────────
const pageVariants = {
  initial: { opacity: 0, y: 10 },
  enter:   { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.18, ease: [0.4, 0, 1, 1] } },
};

// ── Main layout ───────────────────────────────────────────────────────────────
export default function DashboardLayout() {
  const { user, logOut } = useContext(AuthContext);
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const role = profile?.role;

  const navGroups = useMemo(() => {
    if (role === "admin") return ADMIN_NAV;
    if (role === "surveyor") return SURVEYOR_NAV;
    if (role === "user") return USER_NAV;
    return [];
  }, [role]);

  const sidebarProps = { user, profile, role, navGroups, navigate, logOut };

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "var(--color-bg-base)" }}>

      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside
        className="hidden lg:flex w-64 flex-col shrink-0"
        style={{
          backgroundColor: "var(--color-bg-surface)",
          borderRight: "1px solid var(--color-border)",
          boxShadow: "4px 0 16px -8px rgba(0,0,0,0.06)",
        }}
      >
        <SidebarContent {...sidebarProps} onNav={undefined} />
      </aside>

      {/* ── Mobile sidebar overlay ──────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 lg:hidden"
              style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)" }}
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-0 top-0 h-full w-64 z-50 flex flex-col lg:hidden"
              style={{
                backgroundColor: "var(--color-bg-surface)",
                boxShadow: "8px 0 32px -8px rgba(0,0,0,0.18)",
              }}
            >
              {/* Close button */}
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                style={{ backgroundColor: "rgba(255,255,255,0.12)", color: "white" }}
              >
                <XMarkIcon className="w-4 h-4" />
              </button>

              <SidebarContent
                {...sidebarProps}
                onNav={() => setMobileOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main column ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile topbar — navy strip matching sidebar brand */}
        <div
          className="lg:hidden shrink-0 flex items-center justify-between h-[60px] px-4"
          style={{
            backgroundColor: "var(--color-primary)",
            boxShadow: "0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: "rgba(255,255,255,0.8)" }}
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: "rgba(255,255,255,0.12)" }}
            >
              <img src={logo} alt="" className="h-4 w-4 object-contain" />
            </div>
            <span className="text-white font-heading font-bold text-[14px] tracking-tight">
              SurveyHub
            </span>
          </div>
          {/* User avatar pill */}
          {profile?.avatar || user?.photoURL ? (
            <img
              src={profile?.avatar || user?.photoURL}
              alt=""
              className="w-8 h-8 rounded-full object-cover shrink-0"
              style={{ boxShadow: "0 0 0 2px rgba(255,255,255,0.3)" }}
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white shrink-0"
              style={{ backgroundColor: "var(--color-accent)" }}
            >
              {(profile?.name || user?.displayName || user?.email || "?")[0].toUpperCase()}
            </div>
          )}
        </div>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="enter"
              exit="exit"
              className="h-full"
            >
              <div className="container-app mx-auto px-4 lg:px-8 py-6 lg:py-8">
                <Outlet />
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
